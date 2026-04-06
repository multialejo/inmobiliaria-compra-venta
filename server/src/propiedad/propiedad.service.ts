// src/propiedad/propiedad.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Propiedad, Prisma } from '../../generated/prisma/client';

@Injectable()
export class PropiedadService {
  constructor(private prisma: PrismaService) {}

  // Create a new property
  async create(data: Prisma.PropiedadCreateInput): Promise<Propiedad> {
    return this.prisma.propiedad.create({ data });
  }

  // Get all properties
  async findAll(): Promise<Propiedad[]> {
    return this.prisma.propiedad.findMany();
  }

  // Get one property by ID
  async findOne(id: number): Promise<Propiedad | null> {
    return this.prisma.propiedad.findUnique({
      where: { id },
    });
  }

  // Update a property
  async update(
    id: number,
    data: Prisma.PropiedadUpdateInput,
  ): Promise<Propiedad> {
    return this.prisma.propiedad.update({
      where: { id },
      data,
    });
  }

  // Delete a property
  async remove(id: number): Promise<Propiedad> {
    return this.prisma.propiedad.delete({
      where: { id },
    });
  }
}
