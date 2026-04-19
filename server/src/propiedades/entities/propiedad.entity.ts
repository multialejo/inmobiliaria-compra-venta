import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Canton } from '../../cantones/entities/canton.entity';
import { Parroquia } from '../../parroquias/entities/parroquia.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum TipoInmueble {
  CASA = 'casa',
  DEPARTAMENTO = 'departamento',
  TERRENO = 'terreno',
  LOCAL = 'local',
}

export enum EstadoPropiedad {
  DISPONIBLE = 'disponible',
  RESERVADA = 'reservada',
  VENDIDA = 'vendida',
}

@Entity('propiedades')
export class Propiedad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  titulo: string;

  @Column({ length: 255 })
  direccion: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  precio: number;

  @Column({
    type: 'enum',
    enum: TipoInmueble,
  })
  tipo_inmueble: TipoInmueble;

  @Column({
    type: 'enum',
    enum: EstadoPropiedad,
    default: EstadoPropiedad.DISPONIBLE,
  })
  estado: EstadoPropiedad;

  @Column({ type: 'json', nullable: true })
  imagenes: string[];

  @Column({ name: 'superficie_m2', type: 'int' })
  superficie_m2: number;

  @Column({ name: 'canton_id' })
  canton_id: number;

  @ManyToOne(() => Canton, (canton) => canton.propiedades)
  @JoinColumn({ name: 'canton_id' })
  canton: Canton;

  @Column({ name: 'parroquia_id' })
  parroquia_id: number;

  @ManyToOne(() => Parroquia, (p) => p.propiedades)
  @JoinColumn({ name: 'parroquia_id' })
  parroquia: Parroquia;

  @Column({ name: 'agente_id' })
  agente_id: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.propiedades)
  @JoinColumn({ name: 'agente_id' })
  agente: Usuario;

  @CreateDateColumn({ name: 'fecha_registro' })
  fecha_registro: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;
}
