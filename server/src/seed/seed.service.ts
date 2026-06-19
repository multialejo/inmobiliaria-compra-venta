import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Canton } from '../cantones/entities/canton.entity';
import { Parroquia } from '../parroquias/entities/parroquia.entity';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import { Propiedad, TipoInmueble } from '../propiedades/entities/propiedad.entity';
import bolivarData from './data/bolivar.json';
import usuariosData from './data/usuarios.json';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Canton)
    private cantonRepository: Repository<Canton>,
    @InjectRepository(Parroquia)
    private parroquiaRepository: Repository<Parroquia>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Propiedad)
    private propiedadRepository: Repository<Propiedad>,
  ) {}

  async onModuleInit() {
    const count = await this.cantonRepository.count();
    if (count === 0) {
      await this.seedBolivar();
      await this.seedUsuarios();
    } else {
      console.log('Los datos de Bolívar ya están seedeados');
    }
    await this.seedPropiedades();
  }

  async seedBolivar() {
    for (const [cantonKey, cantonData] of Object.entries(bolivarData)) {
      const canton = this.cantonRepository.create({
        id: parseInt(cantonKey),
        nombre: cantonData.canton,
      });
      await this.cantonRepository.save(canton);

      const parroquias = Object.entries(cantonData.parroquias).map(
        ([key, value]) => ({
          id: parseInt(key),
          nombre: value,
          canton_id: parseInt(cantonKey),
        }),
      );

      for (const parroquia of parroquias) {
        const newParroquia = this.parroquiaRepository.create(parroquia);
        await this.parroquiaRepository.save(newParroquia);
      }

      console.log(
        `Canton ${cantonData.canton} seedeado con ${parroquias.length} parroquias`,
      );
    }
  }

  async seedUsuarios() {
    for (const usuario of usuariosData) {
      const newUsuario = this.usuarioRepository.create({
        nombre: usuario.nombre,
        email: usuario.email,
        contrasena: usuario.contrasena,
        telefono: usuario.telefono,
        cedula: usuario.cedula,
        direccion: usuario.direccion,
        rol:
          usuario.rol === 'administrador'
            ? RolUsuario.ADMINISTRADOR
            : usuario.rol === 'cliente'
              ? RolUsuario.CLIENTE
              : RolUsuario.AGENTE,
      });
      await this.usuarioRepository.save(newUsuario);
    }

    console.log(`Seedeados ${usuariosData.length} usuarios`);
  }

  async seedPropiedades() {
    const count = await this.propiedadRepository.count();
    if (count > 0) return;

    const agentes = await this.usuarioRepository.find({
      where: { rol: RolUsuario.AGENTE },
      order: { email: 'ASC' },
    });

    if (agentes.length === 0) {
      console.log('No hay agentes para asignar propiedades');
      return;
    }

    const agente1 = agentes[0];
    const agente2 = agentes[1] || agentes[0];

    const properties = [
      {
        titulo: 'Hermosa Casa Familiar en Guaranda',
        direccion: 'Av. El Inca y 10 de Agosto, Guaranda',
        descripcion: JSON.stringify({
          texto: 'Hermosa casa familiar con amplio patio, excelente iluminación natural y garaje para 2 vehículos. Ubicada en una zona residencial segura.',
          dormitorios: 4,
          banos: 3,
        }),
        precio: 85000.00,
        tipo_inmueble: TipoInmueble.CASA,
        superficie_m2: 180,
        canton_id: 201,
        parroquia_id: 20101,
        agente_id: agente1.id,
        imagenes: [
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
        ],
      },
      {
        titulo: 'Moderno Departamento Sector Centro',
        direccion: 'García Moreno y Sucre, Guaranda',
        descripcion: JSON.stringify({
          texto: 'Departamento moderno en el tercer piso. Cuenta con acabados de primera, cocina americana y hermosa vista al centro de la ciudad.',
          dormitorios: 2,
          banos: 2,
        }),
        precio: 45000.00,
        tipo_inmueble: TipoInmueble.DEPARTAMENTO,
        superficie_m2: 85,
        canton_id: 201,
        parroquia_id: 20102,
        agente_id: agente1.id,
        imagenes: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
        ],
      },
      {
        titulo: 'Amplio Terreno en San Miguel',
        direccion: 'Sector Las Palmas, San Miguel de Bolívar',
        descripcion: JSON.stringify({
          texto: 'Terreno completamente plano ideal para construcción residencial o proyecto agrícola. Cuenta con acceso a todos los servicios básicos.',
          dormitorios: 0,
          banos: 0,
        }),
        precio: 25000.00,
        tipo_inmueble: TipoInmueble.TERRENO,
        superficie_m2: 500,
        canton_id: 205,
        parroquia_id: 20550,
        agente_id: agente1.id,
        imagenes: [
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
        ],
      },
      {
        titulo: 'Casa de Campo en Chimbo',
        direccion: 'Vía al Santuario, San José de Chimbo',
        descripcion: JSON.stringify({
          texto: 'Hermosa casa rústica de campo rodeada de naturaleza. Cuenta con áreas verdes, árboles frutales y un clima templado ideal para el descanso.',
          dormitorios: 3,
          banos: 2,
        }),
        precio: 65000.00,
        tipo_inmueble: TipoInmueble.CASA,
        superficie_m2: 300,
        canton_id: 203,
        parroquia_id: 20350,
        agente_id: agente2.id,
        imagenes: [
          'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80',
        ],
      },
      {
        titulo: 'Local Comercial en Caluma',
        direccion: 'Av. La Naranja y 24 de Mayo, Caluma',
        descripcion: JSON.stringify({
          texto: 'Excelente local comercial en planta baja, zona de alto tráfico vehicular y peatonal. Ideal para locales comerciales, oficinas o farmacias.',
          dormitorios: 0,
          banos: 1,
        }),
        precio: 35000.00,
        tipo_inmueble: TipoInmueble.LOCAL,
        superficie_m2: 60,
        canton_id: 206,
        parroquia_id: 20650,
        agente_id: agente2.id,
        imagenes: [
          'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=600&q=80',
        ],
      },
      {
        titulo: 'Moderna Oficina Comercial en Guaranda',
        direccion: 'Sucre y 10 de Agosto, Guaranda',
        descripcion: JSON.stringify({
          texto: 'Oficina comercial moderna ubicada en el corazón de la ciudad. Perfecta para consultorios, estudios jurídicos o agencias administrativas. Cuenta con baño privado y excelente iluminación.',
          dormitorios: 0,
          banos: 1,
        }),
        precio: 32000.00,
        tipo_inmueble: TipoInmueble.LOCAL,
        superficie_m2: 45,
        canton_id: 201,
        parroquia_id: 20101,
        agente_id: agente2.id,
        imagenes: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
        ],
      },
      {
        titulo: 'Hacienda Agrícola en Chillanes',
        direccion: 'Vía a Bucay Km 5, Chillanes',
        descripcion: JSON.stringify({
          texto: 'Hermosa hacienda productiva con abundante agua de riego, pastizales de primera y casa de hacienda rústica. Ideal para ganadería y agricultura.',
          dormitorios: 4,
          banos: 2,
        }),
        precio: 120000.00,
        tipo_inmueble: TipoInmueble.TERRENO,
        superficie_m2: 15000,
        canton_id: 202,
        parroquia_id: 20250,
        agente_id: agente2.id,
        imagenes: [
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
        ],
      },
      {
        titulo: 'Hermoso Departamento de Lujo en Guaranda',
        direccion: 'Av. Archidona, Guaranda',
        descripcion: JSON.stringify({
          texto: 'Departamento de lujo con acabados de primera clase. Cuenta con tres habitaciones amplias, balcón panorámico y estacionamiento privado techado.',
          dormitorios: 3,
          banos: 2,
        }),
        precio: 75000.00,
        tipo_inmueble: TipoInmueble.DEPARTAMENTO,
        superficie_m2: 110,
        canton_id: 201,
        parroquia_id: 20102,
        agente_id: agente2.id,
        imagenes: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
        ],
      },
    ];

    for (const prop of properties) {
      const newProp = this.propiedadRepository.create(prop);
      await this.propiedadRepository.save(newProp);
    }

    console.log(`Seedeadas ${properties.length} propiedades`);
  }

  async reset() {
    await this.propiedadRepository.delete({});
    await this.parroquiaRepository.delete({});
    await this.cantonRepository.delete({});
    console.log('Datos de Bolívar eliminados');
    await this.seedBolivar();
    await this.seedUsuarios();
    await this.seedPropiedades();
  }
}
// Force restart seed

