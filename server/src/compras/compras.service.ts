import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Compra, EstadoCompra } from './entities/compra.entity';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { Propiedad, EstadoPropiedad } from '../propiedades/entities/propiedad.entity';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private compraRepository: Repository<Compra>,
    @InjectRepository(Propiedad)
    private propiedadRepository: Repository<Propiedad>,
  ) {}

  async create(createCompraDto: CreateCompraDto, clienteId: string) {
    const propiedad = await this.propiedadRepository.findOne({
      where: { id: createCompraDto.propiedad_id },
    });

    if (!propiedad) {
      throw new NotFoundException('Propiedad no encontrada');
    }

    if (propiedad.estado !== EstadoPropiedad.DISPONIBLE) {
      throw new BadRequestException('La propiedad no está disponible para compra');
    }

    // Create purchase record
    const precioAcordado = createCompraDto.precio_acordado || propiedad.precio;
    const compra = this.compraRepository.create({
      ...createCompraDto,
      cliente_id: clienteId,
      precio_acordado: precioAcordado,
      estado: EstadoCompra.PENDIENTE,
    });
    const savedCompra = await this.compraRepository.save(compra);

    // Reserve the property
    propiedad.estado = EstadoPropiedad.RESERVADA;
    await this.propiedadRepository.save(propiedad);

    return savedCompra;
  }

  async findAll(user: { id: string; rol: string }) {
    if (user.rol === 'administrador') {
      return this.compraRepository.find({
        relations: ['cliente', 'propiedad', 'propiedad.agente'],
        order: { fecha_compra: 'DESC' },
      });
    }

    if (user.rol === 'agente') {
      return this.compraRepository.find({
        where: { propiedad: { agente_id: user.id } },
        relations: ['cliente', 'propiedad', 'propiedad.agente'],
        order: { fecha_compra: 'DESC' },
      });
    }

    return [];
  }

  async findMine(clienteId: string) {
    return this.compraRepository.find({
      where: { cliente_id: clienteId },
      relations: ['propiedad', 'propiedad.canton', 'propiedad.parroquia', 'propiedad.agente'],
      order: { fecha_compra: 'DESC' },
    });
  }

  async update(id: string, updateCompraDto: UpdateCompraDto, user: { id: string; rol: string }) {
    const compra = await this.compraRepository.findOne({
      where: { id },
      relations: ['propiedad'],
    });

    if (!compra) {
      throw new NotFoundException(`Compra con ID ${id} no encontrada`);
    }

    // Authorization check: only admin or the property's agent can update
    if (user.rol !== 'administrador' && compra.propiedad.agente_id !== user.id) {
      throw new BadRequestException('No tienes permiso para actualizar esta compra');
    }

    const anteriorEstado = compra.estado;
    Object.assign(compra, updateCompraDto);
    const savedCompra = await this.compraRepository.save(compra);

    // Update property status based on the new purchase status
    if (updateCompraDto.estado && updateCompraDto.estado !== anteriorEstado) {
      const propiedad = compra.propiedad;
      if (updateCompraDto.estado === EstadoCompra.APROBADA) {
        propiedad.estado = EstadoPropiedad.VENDIDA;
      } else if (updateCompraDto.estado === EstadoCompra.CANCELADA) {
        propiedad.estado = EstadoPropiedad.DISPONIBLE;
      } else if (updateCompraDto.estado === EstadoCompra.PENDIENTE) {
        propiedad.estado = EstadoPropiedad.RESERVADA;
      }
      await this.propiedadRepository.save(propiedad);
    }

    return savedCompra;
  }
}
