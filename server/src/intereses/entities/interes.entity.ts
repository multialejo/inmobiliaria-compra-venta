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

export enum EstadoInteres {
  ACTIVO = 'activo',
  ATENDIDO = 'atendido',
}

@Entity('intereses')
export class Interes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cliente_id' })
  cliente_id: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.intereses)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Usuario;

  @Column({ name: 'propiedad_id' })
  propiedad_id: string;

  @ManyToOne(() => Propiedad, (propiedad) => propiedad.intereses)
  @JoinColumn({ name: 'propiedad_id' })
  propiedad: Propiedad;

  @CreateDateColumn({ name: 'fecha_interes' })
  fecha_interes: Date;

  @Column({
    type: 'enum',
    enum: EstadoInteres,
    default: EstadoInteres.ACTIVO,
  })
  estado: EstadoInteres;
}
