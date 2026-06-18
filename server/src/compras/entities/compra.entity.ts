import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Propiedad } from '../../propiedades/entities/propiedad.entity';

export enum EstadoCompra {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  CANCELADA = 'cancelada',
}

@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cliente_id' })
  cliente_id: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Usuario;

  @Column({ name: 'propiedad_id' })
  propiedad_id: string;

  @ManyToOne(() => Propiedad)
  @JoinColumn({ name: 'propiedad_id' })
  propiedad: Propiedad;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  precio_acordado: number;

  @Column({ length: 100, nullable: true })
  metodo_pago: string;

  @Column({
    type: 'enum',
    enum: EstadoCompra,
    default: EstadoCompra.PENDIENTE,
  })
  estado: EstadoCompra;

  @CreateDateColumn({ name: 'fecha_compra' })
  fecha_compra: Date;
}
