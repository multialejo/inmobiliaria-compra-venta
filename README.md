# Sistema de Gestión de Compra y Venta de Bienes Inmuebles - Provincia de Bolívar

<p align="center">
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-v11-E0234E?logo=nestjs">
  <img alt="React" src="https://img.shields.io/badge/React-v19-61DAFB?logo=react">
  <img alt="TypeORM" src="https://img.shields.io/badge/TypeORM-v0.3-E83524?logo=typeorm">
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite">
</p>

**Integrantes:**
- Ariel Alejandro Calderón
- Andony Fernando Cortez
- Jonathan Ayme
- Neicer Jimenez

---

## Tabla de Contenido

- [Descripción del Proyecto](#descripcion-del-proyecto)
- [Stack Tecnológico](#stack-tecnologico)
- [Prerrequisitos](#prerrequisitos)
- [Quick Start](#quick-start)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Variables de Entorno](#variables-de-entorno)
- [Scripts Disponibles](#scripts-disponibles)
- [Endpoints de la API](#endpoints-de-la-api)
- [Usuarios de Prueba](#usuarios-de-prueba)
- [Convenciones del Equipo](#convenciones-del-equipo)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Documentación Relacionada](#documentacion-relacionada)
- [Roadmap](#roadmap)

---

## Descripción del Proyecto

En la provincia de Bolívar, muchas agencias inmobiliarias gestionan la información de propiedades y clientes de manera manual o mediante herramientas poco integradas, lo que genera desorganización, pérdida de información y retrasos en los procesos de venta. Además, existe dificultad para mantener actualizada la disponibilidad de los inmuebles en ciudades como Guaranda, así como en otros cantones de la provincia, lo que limita la posibilidad de ofrecer información precisa a los clientes en tiempo real. También se presentan inconvenientes al momento de realizar búsquedas eficientes de propiedades según criterios como ubicación, precio o tipo de inmueble, afectando la calidad del servicio brindado y la toma de decisiones tanto de agentes como de compradores. Por esta razón, se identifica la necesidad de desarrollar un sistema que permita centralizar la información inmobiliaria en la provincia de Bolívar, optimizar la gestión de propiedades y mejorar el proceso de venta.

## Objetivo general del aplicativo:

Desarrollar un sistema de gestión de ventas inmobiliarias enfocado en la provincia de Bolívar, que permita administrar propiedades, clientes y procesos de venta de forma eficiente, mejorando la organización de la información y facilitando la atención a los clientes en el contexto local.



## Usuarios beneficiados:

**Agentes inmobiliarios** • Gestionan propiedades de forma organizada • Acceden rápidamente a la información

**Administradores** • Controlan el estado de los inmuebles • Supervisan las ventas realizadas

**Clientes** • Buscan propiedades según sus necesidades • Reciben información clara y actualizada



## Funcionalidades Principales (Backlog Inicial)

**Registro y gestión de propiedades en Bolívar** • Crear, editar y eliminar inmuebles ubicados en la provincia • Registrar precio, ubicación (cantón, parroquia), descripción e imágenes

**Autenticación y autorización** • Registro de usuarios (clientes, agentes, administradores) • Gestión de roles y permisos • Inicio de sesión seguro

**Búsqueda y filtrado de propiedades locales** • Filtrar por precio, ubicación (ej: Guaranda u otros cantones) y tipo de inmueble • Mostrar resultados de forma rápida

**Gestión de clientes y seguimiento de ventas** • Registrar clientes interesados de la región • Guardar información de contacto • Marcar propiedades como disponibles o vendidas • Llevar control del proceso de venta dentro de la provincia



## Stack Tecnológico

| Capa | Tecnología | Versión |
| --- | --- | --- |
| **Frontend** | React + Vite | React 19, Vite 8 |
| **Backend** | NestJS | 11 |
| **ORM** | TypeORM | 0.3 |
| **Base de Datos** | MySQL | 8.0 |
| **Autenticación** | JWT + Passport | — |
| **Contenedores** | Docker Compose | — |

> Para más detalle, ver [`docs/tecnologias.md`](docs/tecnologias.md).

---

## Prerrequisitos

- **Node.js** >= 18
- **npm** (se usa npm, no yarn/pnpm)
- **Docker** y **Docker Compose** (para la base de datos MySQL)
- **Git**

---

## Quick Start

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd inmobiliaria-compra-venta
```

### 2. Iniciar la base de datos (MySQL + phpMyAdmin)

```bash
docker compose up -d
```

Esto levanta:
- **MySQL 8.0** en `localhost:3306`
- **phpMyAdmin** en `http://localhost:8080`

### 3. Configurar el backend

```bash
cd server
cp .env.example .env   # Ajustar valores si es necesario
npm install
npm run start:dev       # http://localhost:3000
```

### 4. Configurar el frontend (otra terminal)

```bash
cd client
npm install
npm run dev             # http://localhost:5173
```

> Al iniciar el backend por primera vez, las tablas se crean automáticamente (synchronize: true) y se siembran datos iniciales (cantones, parroquias, usuarios de prueba).

---

## Estructura del Proyecto

```
inmobiliaria-compra-venta/
├── client/                      # Frontend React + Vite (SPA)
│   ├── src/
│   │   ├── main.jsx            # Punto de entrada
│   │   ├── App.jsx             # Componente principal
│   │   ├── App.css             # Estilos globales
│   │   └── assets/             # Recursos estáticos
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── package.json
│
├── server/                      # Backend NestJS + TypeORM (API REST)
│   ├── src/
│   │   ├── main.ts             # Bootstrap (helmet, CORS, ValidationPipe)
│   │   ├── app.module.ts       # Módulo raíz
│   │   ├── auth/               # Autenticación JWT
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── guards/         # jwt-auth.guard, roles.guard
│   │   │   ├── strategies/     # jwt.strategy
│   │   │   └── decorators/     # current-user, roles
│   │   ├── usuarios/           # Módulo de usuarios
│   │   ├── propiedades/        # Módulo de propiedades
│   │   ├── cantones/           # Módulo de cantones (Bolívar)
│   │   ├── parroquias/         # Módulo de parroquias
│   │   └── seed/               # Seed data (cantones, parroquias, usuarios)
│   ├── test/                   # Tests E2E
│   ├── .env                    # Variables de entorno
│   ├── .env.example            # Plantilla de variables de entorno
│   ├── .prettierrc
│   ├── eslint.config.mjs
│   └── package.json
│
├── docs/                        # Documentación técnica
│   ├── guia_backend.md         # Guía completa de NestJS + TypeORM (1131 líneas)
│   ├── diagrama_MER.md         # Modelo Entidad-Relación
│   ├── diagramas_UML.md        # Diagramas UML (casos de uso, clases, secuencia)
│   ├── flujo_informacion.md    # Flujo de información del sistema
│   ├── seguridad.md            # Arquitectura de seguridad
│   └── tecnologias.md          # Stack tecnológico detallado
│
├── docker-compose.yml           # MySQL 8.0 + phpMyAdmin
└── README.md                    # Este archivo
```

---

## Variables de Entorno

Archivo: `server/.env` (usar `server/.env.example` como plantilla).

| Variable | Descripción | Valor por Defecto |
| --- | --- | --- |
| `DB_HOST` | Host de MySQL | `localhost` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_USERNAME` | Usuario de MySQL | `admin` |
| `DB_PASSWORD` | Contraseña de MySQL | `admin123` |
| `DB_DATABASE` | Nombre de la BD | `inmobiliaria` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | `cambiar-en-produccion` |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `8h` |
| `PORT` | Puerto del servidor NestJS | `3000` |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:5173` |
| `HTTPS_ENABLED` | Habilitar HTTPS | `false` |

> **⚠️ Seguridad:** El archivo `.env` no debe committearse. Está en `.gitignore`. Cambiar `JWT_SECRET` en producción.

---

## Scripts Disponibles

### Backend (`server/`)

| Comando | Descripción |
| --- | --- |
| `npm run start:dev` | Inicia en modo desarrollo con hot-reload |
| `npm run start:prod` | Inicia en modo producción |
| `npm run build` | Compila TypeScript a JavaScript |
| `npm run lint` | Ejecuta ESLint con auto-fix |
| `npm run format` | Formatea código con Prettier |
| `npm run test` | Ejecuta pruebas unitarias (Jest) |
| `npm run test:cov` | Ejecuta pruebas con cobertura |
| `npm run test:e2e` | Ejecuta pruebas E2E (supertest) |

### Frontend (`client/`)

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia servidor de desarrollo Vite |
| `npm run build` | Compila para producción |
| `npm run preview` | Vista previa de build producción |
| `npm run lint` | Ejecuta ESLint |

---

## Endpoints de la API

**Base URL:** `http://localhost:3000/api`

### Autenticación

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | No | Iniciar sesión (email + contraseña) |

### Propiedades

| Método | Ruta | Auth | Rol | Descripción |
| --- | --- | --- | --- | --- |
| `GET` | `/api/propiedades` | JWT | admin, agente | Listar propiedades |
| `GET` | `/api/propiedades/:id` | JWT | admin, agente | Obtener propiedad por ID |
| `POST` | `/api/propiedades` | JWT | admin, agente | Crear propiedad |
| `PATCH` | `/api/propiedades/:id` | JWT | admin, agente | Actualizar propiedad |
| `DELETE` | `/api/propiedades/:id` | JWT | admin | Eliminar propiedad |
| `GET` | `/api/propiedades/canton/:cantonId` | JWT | admin, agente | Propiedades por cantón |
| `GET` | `/api/propiedades/parroquia/:parroquiaId` | JWT | admin, agente | Propiedades por parroquia |

### Usuarios

| Método | Ruta | Auth | Rol | Descripción |
| --- | --- | --- | --- | --- |
| `GET` | `/api/usuarios` | JWT | admin | Listar todos los usuarios |

### Cantones y Parroquias (públicos)

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/cantones` | No | Listar cantones de Bolívar |
| `GET` | `/api/cantones/:id` | No | Obtener cantón por ID |
| `GET` | `/api/parroquias` | No | Listar parroquias |
| `GET` | `/api/parroquias/:id` | No | Obtener parroquia por ID |
| `GET` | `/api/parroquias/canton/:cantonId` | No | Parroquias de un cantón |

> Para más detalle, ver [`server/README.md`](server/README.md).



---

## Documentación Relacionada

| Archivo | Contenido |
| --- | --- |
| [`docs/guia_backend.md`](docs/guia_backend.md) | Guía completa de NestJS + TypeORM (entidades, relaciones, DTOs, servicios, controladores, transacciones) |
| [`docs/diagrama_MER.md`](docs/diagrama_MER.md) | Modelo Entidad-Relación con 7 entidades |
| [`docs/diagramas_UML.md`](docs/diagramas_UML.md) | Diagramas UML (casos de uso, clases, secuencia, componentes, despliegue) |
| [`docs/flujo_informacion.md`](docs/flujo_informacion.md) | Flujo de información y procesos de negocio |
| [`docs/seguridad.md`](docs/seguridad.md) | Arquitectura de seguridad (JWT, RBAC, Helmet, CORS, rate limiting) |
| [`docs/tecnologias.md`](docs/tecnologias.md) | Stack tecnológico detallado |
| [`server/README.md`](server/README.md) | Documentación del backend (instalación, endpoints, entidades) |

---

## Roadmap

- [x] Sprint 1-3: Requerimientos, MER, modelo relacional, MySQL
- [x] Sprint 4: Backend NestJS + TypeORM + endpoints de propiedades
- [x] Sprint 5: Frontend React + Vite (vistas y formulario de registro)
- [x] Sprint 6: Conexión cliente-servidor, pruebas de funcionalidad
- [ ] **Módulo de Clientes**: registro, seguimiento de interesados
- [ ] **Módulo de Ventas**: proceso completo de compra-venta
- [ ] **Módulo de Intereses**: clientes interesados en propiedades
- [ ] **Migraciones**: reemplazar `synchronize: true` con migraciones TypeORM
- [ ] **Tests**: aumentar cobertura de tests unitarios y E2E
- [ ] **CI/CD**: integrar GitHub Actions para lint + test automáticos
