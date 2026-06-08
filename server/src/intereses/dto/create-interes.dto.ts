import { IsUUID } from 'class-validator';

export class CreateInteresDto {
  @IsUUID()
  propiedad_id: string;
}
