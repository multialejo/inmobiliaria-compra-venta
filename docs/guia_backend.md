# Guía Completa: NestJS + TypeORM para Desarrollo de APIs

## Tabla de Contenidos

1. [Conceptos Fundamentales](#1-conceptos-fundamentales)
2. [Arquitectura de NestJS](#2-arquitectura-de-nestjs)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Trabajando con TypeORM](#4-trabajando-con-typeorm)
5. [Creación de Entidades](#5-creación-de-entidades)
6. [Relaciones entre Entidades](#6-relaciones-entre-entidades)
7. [Módulos, Controladores y Servicios](#7-módulos-controladores-y-servicios)
8. [Operaciones CRUD Completas](#8-operaciones-crud-completas)
9. [Buenas Prácticas y Consideraciones](#9-buenas-prácticas-y-consideraciones)
10. [Flujo de Trabajo para Nuevas Entidades](#10-flujo-de-trabajo-para-nuevas-entidades)

---

## 1. Conceptos Fundamentales

### ¿Qué es NestJS?

NestJS es un framework de Node.js para construir aplicaciones del lado del servidor (backend). Usa TypeScript por defecto y sigue el patrón **Módulo-Controlador-Servicio**.

### ¿Qué es TypeORM?

TypeORM es un ORM (Object-Relational Mapping) que permite trabajar con bases de datos usando objetos JavaScript/TypeScript en lugar de escribir SQL puro.

### ¿Por qué usar ambos juntos?

| Aspecto     | Sin ORM        | Con TypeORM               |
| ----------- | -------------- | ------------------------- |
| Consultas   | SQL puro       | Métodos JavaScript        |
| Relaciones  | JOINs manuales | Decoradores automáticos   |
| Migraciones | Manuales       | Automáticas o controladas |
| Tipado      | Manual/Props   | TypeScript automático     |

### Conceptos Clave de TypeORM

- **Entity (Entidad)**: Representa una tabla en la base de datos
- **Repository**: Repositorio de una entidad específica
- **Connection**: Conexión a la base de datos
- **Migration**: Versionado de cambios en la base de datos

---

## 2. Arquitectura de NestJS

### El Patrón Módulo-Servicio-Controlador

```
┌─────────────────────────────────────────────────────────────┐
│                         MÓDULO                              │
│  (Agrupa funcionalidad relacionada)                        │
│                                                             │
│   ┌─────────────────┐    ┌─────────────────┐              │
│   │  CONTROLADOR    │───▶│    SERVICIO     │              │
│   │  (Rutas/HTTP)   │    │  (Lógica Negocio)              │
│   └─────────────────┘    └────────┬────────┘              │
│                                  │                         │
│                         ┌────────▼────────┐               │
│                         │    REPOSITORIO  │               │
│                         │   (TypeORM)     │               │
│                         └────────┬────────┘               │
│                                  │                         │
│                         ┌────────▼────────┐               │
│                         │   BASE DATOS    │               │
│                         └─────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Responsabilidades de Cada Capa

| Capa            | Responsabilidad                            | Ejemplo                                    |
| --------------- | ------------------------------------------ | ------------------------------------------ |
| **Controlador** | Recibir HTTP requests y devolver responses | `@Get()`, `@Post()`, `@Put()`, `@Delete()` |
| **Servicio**    | Lógica de negocio, validaciones            | `crearUsuario()`, `buscarPorEmail()`       |
| **Repositorio** | Acceso a datos (TypeORM)                   | `find()`, `save()`, `delete()`             |

---

## 3. Estructura del Proyecto

### Estructura Actual de Nuestro Proyecto

```
server/
├── src/
│   ├── main.ts                      # Punto de entrada
│   ├── app.module.ts                # Módulo principal
│   │
│   ├── cantones/                    # Módulo Cantón
│   │   └── entities/
│   │       ├── canton.entity.ts     # Entidad
│   │       └── index.ts             # Exportaciones
│   │
│   ├── parroquias/                  # Módulo Parroquia
│   │   └── entities/
│   │       ├── provincia.entity.ts
│   │       └── index.ts
│   │
│   ├── usuarios/                    # Módulo Usuario
│   │   └── entities/
│   │       ├── usuario.entity.ts
│   │       └── index.ts
│   │
│   └── propiedades/                 # Módulo Propiedad
│       ├── propiedades.module.ts
│       └── entities/
│           ├── propiedad.entity.ts
│           └── index.ts
│
├── test/                            # Pruebas
├── package.json
├── tsconfig.json
└── nest-cli.json
```

### Estructura Completa para un Módulo (Para Uso Futuro)

```
server/src/nombre-entidad/
├── dto/                              # Data Transfer Objects
│   ├── create-nombre-entidad.dto.ts
│   ├── update-nombre-entidad.dto.ts
│   └── index.ts
├── entities/
│   ├── nombre-entidad.entity.ts
│   └── index.ts
├── nombre-entidad.controller.ts     # Controlador
├── nombre-entidad.service.ts         # Servicio
├── nombre-entidad.module.ts          # Módulo
└── nombre-entidad.service.spec.ts    # Pruebas unitarias
```

---

## 4. Trabajando con TypeORM

### Configuración en app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql', // Motor de BD
      host: 'localhost', // Servidor
      port: 3306, // Puerto
      username: 'admin', // Usuario de BD
      password: 'admin123', // Contraseña
      database: 'inmobiliaria', // Nombre de BD
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Entidades a detectar
      synchronize: true, // ⚠️ Solo en desarrollo
      logging: true, // Muestra SQL en consola (desarrollo)
    }),
  ],
})
export class AppModule {}
```

### Opciones Importantes de Configuración

| Opción             | Descripción                           | Valor Recomendado         |
| ------------------ | ------------------------------------- | ------------------------- |
| `synchronize`      | Sincroniza automáticamente el esquema | `true` solo en desarrollo |
| `logging`          | Muestra queries SQL en consola        | `true` en desarrollo      |
| `autoLoadEntities` | Carga entidades automáticamente       | `true`                    |
| `charset`          | Codificación de caracteres            | `utf8mb4` para MySQL      |

---

## 5. Creación de Entidades

### Anatomía de una Entidad

```typescript
import {
  Entity, // Marca la clase como tabla
  PrimaryGeneratedColumn, // ID auto-incremental
  Column, // Columna de la tabla
  CreateDateColumn, // Fecha de creación automática
  UpdateDateColumn, // Fecha de actualización automática
} from 'typeorm';

@Entity('nombre_tabla') // Nombre de la tabla en BD
export class MiEntidad {
  // ============ COLUMNAS BÁSICAS ============

  @PrimaryGeneratedColumn() // ID auto-generado
  id: number;

  @Column({ length: 100 }) // VARCHAR(100)
  nombre: string;

  @Column({ type: 'text' }) // TEXT
  descripcion: string;

  @Column({ type: 'int' }) // INT
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number; // DECIMAL(10,2)

  // ============ COLUMNAS CON VALORES POR DEFECTO ============

  @Column({ default: true })
  activo: boolean;

  @Column({ default: 0 })
  vistas: number;

  // ============ COLUMNAS NULABLES ============

  @Column({ nullable: true })
  telefono: string; // Puede ser NULL

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  // ============ FECHAS AUTOMÁTICAS ============

  @CreateDateColumn()
  fecha_creacion: Date;

  @UpdateDateColumn()
  fecha_actualizacion: Date;
}
```

### Tipos de Datos Comunes en TypeORM

| Decorador                                               | Tipo MySQL   | Uso                   |
| ------------------------------------------------------- | ------------ | --------------------- |
| `@Column({ type: 'int' })`                              | INT          | Números enteros       |
| `@Column({ type: 'decimal', precision: 10, scale: 2 })` | DECIMAL      | Precios, montos       |
| `@Column({ type: 'float' })`                            | FLOAT        | Números con decimales |
| `@Column({ length: 255 })`                              | VARCHAR(255) | Textos cortos         |
| `@Column({ type: 'text' })`                             | TEXT         | Textos largos         |
| `@Column({ type: 'boolean' })`                          | TINYINT      | true/false            |
| `@Column({ type: 'date' })`                             | DATE         | Solo fecha            |
| `@Column({ type: 'datetime' })`                         | DATETIME     | Fecha y hora          |
| `@Column({ type: 'json' })`                             | JSON         | Arrays, objetos       |
| `@Column({ type: 'enum', enum: MiEnum })`               | ENUM         | Valores predefinidos  |

### Ejemplo: Entidad Cliente (del diagrama MER)

```typescript
// src/clientes/entities/cliente.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Venta } from '../../ventas/entities/venta.entity';
import { Interes } from '../../intereses/entities/interes.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ length: 20 })
  cedula: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ length: 255, nullable: true })
  direccion: string;

  @CreateDateColumn({ name: 'fecha_registro' })
  fecha_registro: Date;

  // Relaciones (se explican más adelante)
  @OneToMany(() => Venta, (venta) => venta.cliente)
  ventas: Venta[];

  @OneToMany(() => Interes, (interes) => interes.cliente)
  intereses: Interes[];
}
```

---

## 6. Relaciones entre Entidades

### Tipos de Relaciones en TypeORM

```
                    ┌─────────────┐
                    │    UNO      │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    ┌─────────┐      ┌─────────┐      ┌─────────┐
    │   UNO   │      │   UNO   │      │   MUCHOS│
    │   A     │      │   A     │      │   A     │
    └────┬────┘      └────┬────┘      └────┬────┘
         │                 │                 │
    @OneToOne()       @ManyToOne()      @OneToMany()
         │                 │                 │
         └─────────────────┴─────────────────┘
                           │
                    ┌──────┴──────┐
                    │   MUCHOS    │
                    └─────────────┘
```

### Relación Uno a Muchos (1:N)

**Ejemplo: Cantón tiene muchas Parroquias**

```typescript
// cantón.entity.ts (LADO UNO)
@Entity('cantones')
export class Canton {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  // Un cantón tiene muchas parroquias
  @OneToMany(() => Parroquia, (parroquia) => parroqia.canton)
  parroquias: Parroquia[];
}

// parroqia.entity.ts (LADO MUCHOS)
@Entity('parroquias')
export class Parroquia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ name: 'canton_id' })
  canton_id: number;

  // Muchas parroquias pertenecen a un cantón
  @ManyToOne(() => Canton, (canton) => canton.parroquias)
  @JoinColumn({ name: 'canton_id' })
  canton: Canton;
}
```

### Relación Muchos a Uno (N:1)

**Ejemplo: Propiedad pertenece a un Agente (Usuario)**

```typescript
// usuario.entity.ts
@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nombre: string;

  // Un usuario/agente puede tener muchas propiedades
  @OneToMany(() => Propiedad, (propiedad) => propiedad.agente)
  propiedades: Propiedad[];
}

// propiedad.entity.ts
@Entity('propiedades')
export class Propiedad {
  // ... otras columnas ...

  @Column({ name: 'agente_id' })
  agente_id: number;

  // Muchas propiedades son registradas por un agente
  @ManyToOne(() => Usuario, (usuario) => usuario.propiedades)
  @JoinColumn({ name: 'agente_id' })
  agente: Usuario;
}
```

### Relación Uno a Uno (1:1)

**Ejemplo: Una Propiedad tiene una Venta**

```typescript
// propiedad.entity.ts
@Entity('propiedades')
export class Propiedad {
  // ... otras columnas ...

  // Una propiedad tiene UNA venta (opcional, por eso nullable)
  @OneToOne(() => Venta, (venta) => venta.propiedad)
  venta: Venta;
}

// venta.entity.ts
@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'propiedad_id' })
  propiedad_id: number;

  // Una venta corresponde a UNA propiedad
  @OneToOne(() => Propiedad, (propiedad) => propiedad.venta)
  @JoinColumn({ name: 'propiedad_id' })
  propiedad: Propiedad;
}
```

### Relación Muchos a Muchos (N:N)

**Ejemplo: Propiedades tienen múltiples imágenes (solo en JSON)**

Para N:N reales, se usa `@ManyToMany`:

```typescript
@Entity('propiedades')
export class Propiedad {
  @ManyToMany(() => Caracteristica)
  @JoinTable({
    name: 'propiedad_caracteristica', // Tabla intermedia
    joinColumn: { name: 'propiedad_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'caracteristica_id',
      referencedColumnName: 'id',
    },
  })
  caracteristicas: Caracteristica[];
}
```

### Resumen de Decoradores de Relaciones

| Decorador     | Uso             | Dirección                     |
| ------------- | --------------- | ----------------------------- |
| `@OneToOne`   | Uno a uno       | Bidireccional                 |
| `@OneToMany`  | Uno a muchos    | Lado "uno"                    |
| `@ManyToOne`  | Muchos a uno    | Lado "muchos"                 |
| `@ManyToMany` | Muchos a muchos | Siempre necesita `@JoinTable` |

---

## 7. Módulos, Controladores y Servicios

### 7.1 DTOs (Data Transfer Objects)

Los DTOs definen la forma de los datos que entran y salen de tu API.

```typescript
// src/clientes/dto/create-cliente.dto.ts
export class CreateClienteDto {
  nombre: string;
  cedula: string;
  email: string;
  telefono?: string; // Opcional
  direccion?: string; // Opcional
}

// src/clientes/dto/update-cliente.dto.ts
import { PartialType } from '@nestjs/mapped-types';

export class UpdateClienteDto extends PartialType(CreateClienteDto) {
  // Todos los campos de CreateClienteDto son opcionales
}
```

### 7.2 Módulo

```typescript
// src/clientes/clientes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente])], // Registra el repositorio
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService], // Para usar en otros módulos
})
export class ClientesModule {}
```

### 7.3 Servicio

```typescript
// src/clientes/clientes.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    // Inyección del repositorio de Cliente
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) {}

  // ============ CREATE ============
  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const cliente = this.clienteRepository.create(createClienteDto);
    return await this.clienteRepository.save(cliente);
  }

  // ============ READ ALL ============
  async findAll(): Promise<Cliente[]> {
    return await this.clienteRepository.find();
  }

  // ============ READ ONE ============
  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return cliente;
  }

  // ============ UPDATE ============
  async update(
    id: number,
    updateClienteDto: UpdateClienteDto,
  ): Promise<Cliente> {
    const cliente = await this.findOne(id); // Valida que existe
    Object.assign(cliente, updateClienteDto);
    return await this.clienteRepository.save(cliente);
  }

  // ============ DELETE ============
  async remove(id: number): Promise<void> {
    const cliente = await this.findOne(id); // Valida que existe
    await this.clienteRepository.remove(cliente);
  }

  // ============ CONSULTAS PERSONALIZADAS ============

  // Buscar por email
  async findByEmail(email: string): Promise<Cliente | null> {
    return await this.clienteRepository.findOne({ where: { email } });
  }

  // Buscar por cédula
  async findByCedula(cedula: string): Promise<Cliente | null> {
    return await this.clienteRepository.findOne({ where: { cedula } });
  }

  // Buscar con relaciones (ejemplo)
  async findAllWithRelations(): Promise<Cliente[]> {
    return await this.clienteRepository.find({
      relations: ['ventas', 'intereses'],
    });
  }
}
```

### 7.4 Controlador

```typescript
// src/clientes/clientes.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('clientes') // Ruta base: /clientes
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  // POST /clientes
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  // GET /clientes
  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  // GET /clientes/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  // PATCH /clientes/:id (actualización parcial)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, updateClienteDto);
  }

  // DELETE /clientes/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.remove(id);
  }
}
```

### 7.5 Registro en App Module

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './clientes/entities/cliente.entity';
import { ClientesModule } from './clientes/clientes.module';
import { Propiedad } from './propiedades/entities/propiedad.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // ... configuración ...
    }),
    ClientesModule, // ← Agregar aquí
  ],
})
export class AppModule {}
```

---

## 8. Operaciones CRUD Completas

### Métodos Principales del Repositorio

| Método             | Descripción          | Retorna            |
| ------------------ | -------------------- | ------------------ |
| `save(entity)`     | Crea o actualiza     | Entidad guardada   |
| `find()`           | Busca todos          | Array de entidades |
| `findOne(options)` | Busca uno            | Una entidad o null |
| `findAndCount()`   | Busca y cuenta total | [entidades, total] |
| `remove(entity)`   | Elimina              | Void               |
| `delete(id)`       | Elimina por ID       | DeleteResult       |
| `create(data)`     | Crea instancia       | Nueva entidad      |

### Opciones de Búsqueda en `findOne` y `find`

```typescript
// Busca por ID
await repository.findOne({ where: { id: 1 } });

// Busca por múltiples condiciones
await repository.findOne({
  where: { email: 'test@test.com', activo: true },
});

// Incluye relaciones
await repository.findOne({
  where: { id: 1 },
  relations: ['canton', 'parroquia'],
});

// Ordenamiento
await repository.find({
  order: { fecha_registro: 'DESC' },
  take: 10, // Limita a 10
  skip: 0, // Desde el primero
});

// Solo ciertos campos
await repository.find({
  select: ['id', 'nombre', 'email'],
});
```

### Ejemplo Completo: CRUD de Ventas

```typescript
// src/ventas/dto/create-venta.dto.ts
export class CreateVentaDto {
  propiedad_id: number;
  cliente_id: number;
  agente_id: number;
  precio_venta: number;
  fecha_venta: Date;
  estado: 'pendiente' | 'completada' | 'cancelada';
  observaciones?: string;
}

// src/ventas/ventas.service.ts
@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventaRepository: Repository<Venta>,
  ) {}

  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    const venta = this.ventaRepository.create(createVentaDto);
    return await this.ventaRepository.save(venta);
  }

  async findAll(): Promise<Venta[]> {
    return await this.ventaRepository.find({
      relations: ['propiedad', 'cliente', 'agente'],
    });
  }

  async findOne(id: number): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ['propiedad', 'cliente', 'agente'],
    });
    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }
    return venta;
  }

  async update(id: number, updateVentaDto: UpdateVentaDto): Promise<Venta> {
    const venta = await this.findOne(id);
    Object.assign(venta, updateVentaDto);
    return await this.ventaRepository.save(venta);
  }

  async remove(id: number): Promise<void> {
    const venta = await this.findOne(id);
    await this.ventaRepository.remove(venta);
  }

  // Consulta personalizada: ventas por agente
  async findByAgente(agenteId: number): Promise<Venta[]> {
    return await this.ventaRepository.find({
      where: { agente_id: agenteId },
      relations: ['propiedad', 'cliente'],
    });
  }

  // Consulta personalizada: ventas completadas
  async findCompletadas(): Promise<Venta[]> {
    return await this.ventaRepository.find({
      where: { estado: 'completada' },
      relations: ['propiedad', 'cliente', 'agente'],
    });
  }
}
```

---

## 9. Buenas Prácticas y Consideraciones

### 9.1 Enums en TypeScript y MySQL

```typescript
// Definición del enum
export enum EstadoVenta {
  PENDIENTE = 'pendiente',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
}

// Uso en la entidad
@Column({
  type: 'enum',
  enum: EstadoVenta,
  default: EstadoVenta.PENDIENTE,
})
estado: EstadoVenta;
```

**Nota importante sobre enums en MySQL:** MySQL solo soporta valores enum válidos. Si agregas un nuevo valor al enum en TypeScript pero no lo actualizas en la base de datos,可能会有问题。

### 9.2 Manejo de Fechas

```typescript
@CreateDateColumn()           // Se setea automáticamente al crear
fecha_registro: Date;

@UpdateDateColumn()           // Se actualiza automáticamente
fecha_actualizacion: Date;

@Column({ type: 'datetime' }) // Fecha manual
fecha_venta: Date;
```

### 9.3 Campos Nulos vs Valores por Defecto

```typescript
// Estos son equivalentes en MySQL:
@Column({ nullable: true })
telefono: string | null;

@Column({ default: null })
telefono: string | null;

// Para booleanos, usar default:
@Column({ default: true })
activo: boolean;
```

### 9.4 Índices y约束

```typescript
@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ length: 255, unique: true }) // UNIQUE index
  email: string;

  @Index() // INDEX manual
  @Column({ length: 20 })
  cedula: string;

  @Column({ length: 20 })
  telefono: string;
}
```

### 9.5 Validation con class-validator

Instala las dependencias:

```bash
npm install class-validator class-transformer
```

```typescript
// create-cliente.dto.ts
import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @MinLength(3)
  nombre: string;

  @IsString()
  cedula: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}
```

En main.ts, habilita validación global:

```typescript
// src/main.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina campos no definidos en DTO
      transform: true, // Transforma tipos automáticamente
    }),
  );
  await app.listen(3000);
}
```

### 9.6 Nombres de Columnas y Propiedades

```typescript
// Buena práctica: nombres claros en DB
@Column({ name: 'fecha_registro' })
fechaRegistro: Date;  // camelCase en TS

// En la API JSON response:
{
  "fechaRegistro": "2024-01-15T10:30:00Z"
}

// En la base de datos MySQL:
fecha_registro (snake_case)
```

### 9.7 Migraciones vs Synchronize

| Aspecto   | `synchronize: true` | Migraciones |
| --------- | ------------------- | ----------- |
| Uso       | **Solo desarrollo** | Producción  |
| Control   | Automático          | Manual      |
| Riesgo    | Puede perder datos  | Seguro      |
| Historial | No                  | Sí          |

Para producción, desactiva synchronize y usa migraciones:

```bash
npm install --save-dev typeorm cli
npx typeorm migration:generate -n MiMigracion
npx typeorm migration:run
```

### 9.8 Loading Relations (Eager vs Lazy)

```typescript
// EAGER: Carga automáticamente (NO recomendado para 1:N)
@OneToMany(() => Parroquia, (p) => p.canton, { eager: true })
parroquias: Parroquia[];

// LAZY: Carga cuando se accede (requiere Promise)
@OneToMany(() => Parroquia, (p) => p.canton, { lazy: true })
parroquias: Promise<Parroquia[]>;

// MEJOR APPROACH: Cargar manualmente con relations
await repository.find({ relations: ['parroquias'] });
```

### 9.9 Transacciones

```typescript
async crearVentaConActualizacion(createVentaDto: CreateVentaDto) {
  return await this.dataSource.transaction(async manager => {
    // Crear la venta
    const venta = manager.create(Venta, createVentaDto);
    await manager.save(venta);

    // Actualizar estado de propiedad
    await manager.update(Propiedad, createVentaDto.propiedad_id, {
      estado: EstadoPropiedad.VENDIDA
    });

    return venta;
  });
}
```

### 9.10 Errores Comunes y Soluciones

| Error                               | Causa                         | Solución                               |
| ----------------------------------- | ----------------------------- | -------------------------------------- |
| `Cannot read property of undefined` | Relación mal definida         | Revisar el nombre en la función lambda |
| `Column not found`                  | Nombre de columna incorrecto  | Usar `name` en @Column                 |
| `duplicated column name`            | Dos columnas con mismo nombre | Revisar @Column decorators             |
| `ENUM value no existe`              | Enum desincronizado           | Actualizar base de datos               |
| `Relation not found`                | Relación no existe            | Crear el entity con la relación        |

---

## 10. Flujo de Trabajo para Nuevas Entidades

### Paso a Paso Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE TRABAJO                         │
│              PARA CREAR NUEVA ENTIDAD                       │
└─────────────────────────────────────────────────────────────┘

1️⃣  CREAR ARCHIVOS DE LA ENTIDAD
    │
    ├── src/nueva-entidad/
    │   ├── dto/
    │   │   ├── create-nueva-entidad.dto.ts
    │   │   └── update-nueva-entidad.dto.ts
    │   ├── entities/
    │   │   └── nueva-entidad.entity.ts
    │   ├── nueva-entidad.controller.ts
    │   ├── nueva-entidad.service.ts
    │   ├── nueva-entidad.service.spec.ts
    │   └── nueva-entidad.module.ts

2️⃣  DEFINIR LA ENTIDAD
    │
    └── nueva-entidad.entity.ts
        ├── @Entity('nombre_tabla')
        ├── @PrimaryGeneratedColumn()
        ├── @Column() para cada campo
        ├── Enums si son necesarios
        └── @OneToMany/@ManyToOne/@ManyToMany

3️⃣  CREAR DTOs
    │
    ├── create-nueva-entidad.dto.ts
    │   └── Definir campos obligatorios
    └── update-nueva-entidad.dto.ts
        └── Extender PartialType de create

4️⃣  IMPLEMENTAR SERVICIO
    │
    └── nueva-entidad.service.ts
        ├── CRUD básico (create, findAll, findOne, update, remove)
        ├── Consultas personalizadas si son necesarias
        └── Métodos de negocio específicos

5️⃣  IMPLEMENTAR CONTROLADOR
    │
    └── nueva-entidad.controller.ts
        ├── @Controller('ruta')
        ├── @Get, @Post, @Patch, @Delete
        ├── Validación de parámetros
        └── Documentación con Swagger (opcional)

6️⃣  CONFIGURAR MÓDULO
    │
    └── nueva-entidad.module.ts
        ├── TypeOrmModule.forFeature([NuevaEntidad])
        ├── Providers y Controllers
        └── Exports si se necesita en otros módulos

7️⃣  REGISTRAR EN APP.MODULE
    │
    └── app.module.ts
        └── Importar NuevaEntidadModule

8️⃣  VERIFICAR Y PROBAR
    │
    ├── npm run build (compilación)
    ├── npm run start:dev (iniciar)
    └── Probar endpoints con Postman/Thunder Client
```

### Checklist Antes de Commit

- [ ] Entidad definida con todos los campos necesarios
- [ ] Enums definidos si hay campos predefinidos
- [ ] Relaciones correctas (ManyToOne, OneToMany, etc.)
- [ ] DTOs creados para create y update
- [ ] Servicio con CRUD básico implementado
- [ ] Controlador con rutas definidas
- [ ] Módulo configurado y exportado
- [ ] Importado en AppModule
- [ ] Build exitoso (`npm run build`)
- [ ] Pruebas unitarias del servicio

---

## Referencias Rápidas

### Comandos Útiles

```bash
# Instalar dependencias de TypeORM
npm install @nestjs/typeorm typeorm mysql2

# Instalar validación
npm install class-validator class-transformer

# Crear recurso completo (genera todo automáticamente)
nest g resource clientes

# Iniciar en modo desarrollo
npm run start:dev

# Build de producción
npm run build

# Iniciar producción
npm run start:prod
```

### Endpoints Típicos por Entidad

| Método | Ruta           | Descripción              |
| ------ | -------------- | ------------------------ |
| POST   | `/entidad`     | Crear nuevo registro     |
| GET    | `/entidad`     | Listar todos             |
| GET    | `/entidad/:id` | Obtener uno por ID       |
| PATCH  | `/entidad/:id` | Actualizar parcialmente  |
| PUT    | `/entidad/:id` | Reemplazar completamente |
| DELETE | `/entidad/:id` | Eliminar                 |

### Decoradores de Controlador Más Comunes

```typescript
@Get(':id')
@Post()
@Put(':id')
@Patch(':id')
@Delete(':id')

@Query()           // Parámetros de query (?filtro=valor)
@Param('id')       // Parámetros de ruta (:id)
@Body()            // Cuerpo de la petición
@Headers()         // Encabezados HTTP
```

---

## Próximos Pasos Recomendados

1. **Autenticación y Autorización**: Implementar JWT con Passport
2. **Documentación API**: Agregar Swagger/OpenAPI
3. **Manejo de Errores Global**: Exception filters
4. **Logging**: Implementar un sistema de logs
5. **Tests E2E**: Pruebas de integración
6. **Docker**: Contenerizar la aplicación
7. **Migraciones**: Configurar sistema de migraciones

---

_Esta guía fue creada para el equipo de desarrollo del Sistema de Gestión Inmobiliaria Bolívar._
