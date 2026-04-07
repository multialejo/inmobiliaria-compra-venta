import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Canton } from '../../cantones/entities/canton.entity';
import { Propiedad } from '../../propiedades/entities/propiedad.entity';

@Entity('parroquias')
export class Parroquia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ name: 'canton_id' })
  canton_id: number;

  @ManyToOne(() => Canton, (canton) => canton.propiedades)
  @JoinColumn({ name: 'canton_id' })
  canton: Canton;

  @OneToMany(() => Propiedad, (propiedad) => propiedad.parroquia)
  propiedades: Propiedad[];
}
