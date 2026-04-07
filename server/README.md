# Servidor API - Sistema de Gestión Inmobiliaria

Backend NestJS para el sistema de gestión de compra y venta de bienes Inmobilarios en la Provincia de Bolívar, Ecuador.

## Descripción

API RESTful desarrollada con NestJS y TypeORM que proporciona servicios para la gestión de propiedades inmobiliarias, incluyendo gestión de usuarios, propiedades, cantones y parroquias de la provincia de Bolívar.

## Tecnologías

- **Framework**: NestJS
- **Lenguaje**: TypeScript
- **Base de datos**: MySQL
- **ORM**: TypeORM
- **Validación**: class-validator, class-transformer

## Estructura del Proyecto

```
src/
├── app.module.ts          # Módulo principal
├── main.ts                # Punto de entrada
├── usuarios/              # Módulo de usuarios
│   └── entities/
├── propiedades/          # Módulo de propiedades
│   └── entities/
├── cantones/              # Módulo de cantones
│   └── entities/
└── parroquias/            # Módulo de parroquias
    └── entities/
```

## Requisitos Previos

- Node.js (v18+)
- MySQL (v8.0+)
- npm o yarn

## Instalación

1. Clonar el repositorio:

```bash
git clone <url-del-repositorio>
cd server
```

1. Instalar dependencias:

```bash
npm install
```

1. Configurar variables de entorno:
   - Editar `src/app.module.ts` para configurar la conexión a la base de datos
   - Por defecto está configurado:
     - Host: localhost
     - Puerto: 3306
     - Usuario: admin
     - Contraseña: admin123
     - Base de datos: inmobiliaria

2. Crear la base de datos MySQL:

```sql
CREATE DATABASE inmobiliaria;
```

1. La aplicación sincroniza automáticamente las entidades con la base de datos (synchronize: true).

## Ejecutar el Proyecto

```bash
# Desarrollo (con watch mode)
npm run start:dev

# Producción
npm run start:prod

# Desarrollo simple
npm run start
```

El servidor estará disponible en `http://localhost:3000`

## Scripts Disponibles

| Comando              | Descripción                              |
| -------------------- | ---------------------------------------- |
| `npm run start`      | Inicia la aplicación                     |
| `npm run start:dev`  | Inicia en modo desarrollo con hot-reload |
| `npm run start:prod` | Inicia en modo producción                |
| `npm run build`      | Compila el proyecto                      |
| `npm run lint`       | Ejecuta el linter                        |
| `npm run test`       | Ejecuta pruebas unitarias                |
| `npm run test:cov`   | Ejecuta pruebas con cobertura            |
| `npm run hurl`       | Ejecuta tests de integración con Hurl    |

## Endpoints

### Quick Start - Prueba los endpoints

Al iniciar la aplicación, los datos de cantones y parroquias de Bolívar se cargan automáticamente. Prueba estos endpoints para explorar la API:

```bash
# Listar todos los cantones
curl http://localhost:3000/cantones

# Obtener un canton específico
curl http://localhost:3000/cantones/201

# Listar todas las parroquias
curl http://localhost:3000/parroquias

# Listar parroquias de un canton (ej: Guaranda = 201)
curl http://localhost:3000/parroquias/canton/201
```

### Endpoints Disponibles

| Método | Ruta                           | Descripción                   |
| ------ | ------------------------------ | ----------------------------- |
| GET    | `/cantones`                    | Lista todos los cantones      |
| GET    | `/cantones/:id`                | Obtiene un canton por ID      |
| GET    | `/parroquias`                  | Lista todas las parroquias    |
| GET    | `/parroquias/:id`              | Obtiene una parroquia por ID  |
| GET    | `/parroquias/canton/:cantonId` | Lista parroquias de un canton |

## Base de Datos

### Entidades

- **Usuario**: Gestión de usuarios del sistema
- **Propiedad**: Información de bienes inmuebles
- **Canton**: Cantones de la provincia de Bolívar
- **Parroquia**: Parroquias dentro de los cantones

## Licencia

MIT
