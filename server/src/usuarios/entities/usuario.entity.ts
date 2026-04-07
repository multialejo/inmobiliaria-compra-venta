import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Propiedad } from '../../propiedades/entities/propiedad.entity';

export enum RolUsuario {
  AGENTE = 'agente',
  ADMINISTRADOR = 'administrador',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  contrasena: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'enum', enum: RolUsuario })
  rol: RolUsuario;

  @CreateDateColumn({ name: 'fecha_registro' })
  fecha_registro: Date;

  @OneToMany(() => Propiedad, (propiedad) => propiedad.agente)
  propiedades: Propiedad[];
}
