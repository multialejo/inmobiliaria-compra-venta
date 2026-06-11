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
import { Interes } from '../../intereses/entities/interes.entity';

export enum RolUsuario {
  CLIENTE = 'cliente',
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

  @Column({ length: 20, nullable: true })
  cedula: string;

  @Column({ length: 255, nullable: true })
  direccion: string;

  @Column({ type: 'enum', enum: RolUsuario })
  rol: RolUsuario;

  @Column({ name: 'solicitud_agente', type: 'boolean', default: false })
  solicitudAgente: boolean;

  @Column({ name: 'experiencia_agente', type: 'text', nullable: true })
  experienciaAgente: string;

  @Column({ name: 'licencia_agente', length: 100, nullable: true })
  licenciaAgente: string;

  @Column({ name: 'motivo_agente', type: 'text', nullable: true })
  motivoAgente: string;

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

  @OneToMany(() => Interes, (interes) => interes.cliente)
  intereses: Interes[];
}
