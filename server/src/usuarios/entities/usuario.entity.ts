import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Propiedad } from '../../propiedades/entities/propiedad.entity';

export enum RolUsuario {
  AGENTE = 'agente',
  ADMINISTRADOR = 'administrador',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @BeforeInsert()
  @BeforeUpdate()
  async hashContrasena() {
    if (this.contrasena && !this.contrasena.startsWith('$2')) {
      this.contrasena = await bcrypt.hash(this.contrasena, 10);
    }
  }

  @OneToMany(() => Propiedad, (propiedad) => propiedad.agente)
  propiedades: Propiedad[];
}
