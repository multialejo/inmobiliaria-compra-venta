import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Propiedad } from '../../propiedades/entities/propiedad.entity';

@Entity('cantones')
export class Canton {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @OneToMany(() => Propiedad, (propiedad) => propiedad.canton)
  propiedades: Propiedad[];
}
