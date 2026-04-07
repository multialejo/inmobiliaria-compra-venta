# Diagramas UML

## Tabla de Contenidos
1. [Diagrama de Casos de Uso](#1-diagrama-de-casos-de-uso)
2. [Diagrama de Clases](#2-diagrama-de-clases)
3. [Diagramas de Secuencia](#3-diagramas-de-secuencia)
4. [Diagrama de Componentes](#4-diagrama-de-componentes)
5. [Diagrama de Despliegue](#5-diagrama-de-despliegue)
6. [Modelo Cliente-Servidor](#6-modelo-cliente-servidor)

---

## 1. Diagrama de Casos de Uso

```mermaid
flowchart LR
    %% Actors
    cliente((Cliente))
    agente((Agente))
    admin((Administrador))

    subgraph Sistema_Inmobiliario [Sistema]
        %% Use Cases
        buscar(UC-01: Buscar propiedades)
        verDetalle(UC-02: Ver detalle de propiedad)
        registrarInteres(UC-03: Registrar interés)
        registrarse(UC-04: Registrarse como cliente)
        login(UC-05: Iniciar sesión)
        
        registrarProp(UC-06: Registrar propiedad)
        editarProp(UC-07: Editar propiedad)
        eliminarProp(UC-08: Eliminar propiedad)
        registrarCliente(UC-09: Registrar cliente)
        registrarVenta(UC-10: Registrar venta)
        atenderInteres(UC-11: Atender interés)
        
        gestionarUsers(UC-12: Gestionar usuarios)
        verReportes(UC-13: Ver reportes de ventas)
        gestionarEstado(UC-14: Gestionar estado de propiedades)
    end

    %% Cliente Relationships
    cliente --- buscar
    cliente --- verDetalle
    cliente --- registrarInteres
    cliente --- registrarse
    cliente --- login

    %% Agente Relationships
    agente --- buscar
    agente --- verDetalle
    agente --- registrarProp
    agente --- editarProp
    agente --- eliminarProp
    agente --- registrarCliente
    agente --- registrarVenta
    agente --- atenderInteres
    agente --- login

    %% Admin Relationships
    admin --- buscar
    admin --- verDetalle
    admin --- gestionarUsers
    admin --- verReportes
    admin --- gestionarEstado
    admin --- login

    %% Extends / Includes
    registrarVenta -.->|extends| gestionarEstado
    editarProp -.->|extends| verDetalle

```

### Especificación de Casos de Uso

#### UC-01: Buscar Propiedades
| Campo | Descripción |
|-------|-------------|
| Actor | Cliente, Agente, Administrador |
| Precondición | El usuario ha iniciado sesión |
| Flujo principal | 1. Seleccionar filtros (cantón, precio, tipo)<br>2. Hacer clic en "Buscar"<br>3. Ver lista de resultados |
| Postcondición | Se muestra lista de propiedades coincidentes |

#### UC-05: Iniciar Sesión
| Campo | Descripción |
|-------|-------------|
| Actor | Cliente, Agente, Administrador |
| Precondición | El usuario tiene cuenta registrada |
| Flujo principal | 1. Ingresar email y contraseña<br>2. Validar credenciales<br>3. Redirigir según rol |
| Postcondición | Usuario accede al panel correspondiente |

---

## 2. Diagrama de Clases

```mermaid
classDiagram
    class Canton {
        +int id
        +string nombre
        +Parroquia[] parroquias
        +getParroquias() Parroquia[]
    }
    
    class Parroquia {
        +int id
        +int cantonId
        +string nombre
        +Canton canton
        +Propiedad[] propiedades
    }
    
    class Usuario {
        +int id
        +string nombre
        +string email
        +string contrasena
        +string telefono
        +Rol rol
        +Propiedad[] propiedades
        +Venta[] ventas
        +validarCredenciales() boolean
    }
    
    class Propiedad {
        +int id
        +string titulo
        +string descripcion
        +decimal precio
        +TipoInmueble tipoInmueble
        +EstadoPropiedad estado
        +string[] imagenes
        +int superficieM2
        +DateTime fechaRegistro
        +DateTime fechaActualizacion
        +Canton canton
        +Parroquia parroquia
        +Usuario agente
        +Venta venta
        +Interes[] intereses
    }
    
    class Cliente {
        +int id
        +string nombre
        +string cedula
        +string email
        +string telefono
        +string direccion
        +DateTime fechaRegistro
        +Venta[] ventas
        +Interes[] intereses
    }
    
    class Venta {
        +int id
        +decimal precioVenta
        +DateTime fechaVenta
        +EstadoVenta estado
        +string observaciones
        +Propiedad propiedad
        +Cliente cliente
        +Usuario agente
    }
    
    class Interes {
        +int id
        +DateTime fechaInteres
        +EstadoInteres estado
        +Cliente cliente
        +Propiedad propiedad
    }
    
    Canton "1" --> "*" Parroquia : contiene
    Canton "1" --> "*" Propiedad : ubica
    Parroquia "1" --> "*" Propiedad : pertenece
    Usuario "1" --> "*" Propiedad : registra
    Usuario "1" --> "*" Venta : registra
    Cliente "1" --> "*" Venta : realiza
    Cliente "1" --> "*" Interes : registra
    Propiedad "1" --> "1" Venta : es_vendida
    Propiedad "1" --> "*" Interes : genera
```

### Enumeraciones

```typescript
enum Rol {
  AGENTE
  ADMINISTRADOR
}

enum TipoInmueble {
  CASA
  DEPARTAMENTO
  TERRENO
  LOCAL
}

enum EstadoPropiedad {
  DISPONIBLE
  RESERVADA
  VENDIDA
}

enum EstadoVenta {
  PENDIENTE
  COMPLETADA
  CANCELADA
}

enum EstadoInteres {
  ACTIVO
  ATENDIDO
}
```

---

## 3. Diagramas de Secuencia

### 3.1 Registro de Propiedad

```mermaid
sequenceDiagram
    actor Agente
    actor Sistema
    actor BaseDeDatos
    
    Agente->>Sistema: Formulario de registro (datos, ubicación)
    Sistema->>Sistema: Validar campos obligatorios
    Sistema->>BaseDeDatos: Verificar cantón y parroquia existentes
    BaseDeDatos-->>Sistema: Confirmación de ubicación
    Sistema->>BaseDeDatos: INSERT propiedad
    BaseDeDatos-->>Sistema: Propiedad creada (id)
    Sistema-->>Agente: Éxito: "Propiedad registrada"
```

### 3.2 Búsqueda de Propiedades

```mermaid
sequenceDiagram
    actor Cliente
    actor Sistema
    actor BaseDeDatos
    
    Cliente->>Sistema: Filtros (cantón, precio, tipo)
    Sistema->>BaseDeDatos: SELECT propiedades WHERE...
    BaseDeDatos-->>Sistema: Lista de propiedades
    Sistema-->>Cliente: Mostrar resultados
    Cliente->>Sistema: Seleccionar propiedad
    Sistema-->>Cliente: Detalle completo
```

### 3.3 Proceso de Venta

```mermaid
sequenceDiagram
    actor Agente
    actor Sistema
    actor BaseDeDatos
    
    Agente->>Sistema: Registrar venta (propiedad_id, cliente_id, precio)
    Sistema->>BaseDeDatos: Verificar propiedad disponible
    BaseDeDatos-->>Sistema: Estado: disponible
    Sistema->>BaseDeDatos: UPDATE propiedad SET estado='vendida'
    Sistema->>BaseDeDatos: INSERT venta
    Sistema->>BaseDeDatos: UPDATE intereses SET estado='atendido'
    BaseDeDatos-->>Sistema: Venta confirmada
    Sistema-->>Agente: Éxito: "Venta registrada"
```

### 3.4 Registrar Interés

```mermaid
sequenceDiagram
    actor Cliente
    actor Sistema
    actor BaseDeDatos
    
    Cliente->>Sistema: Expresar interés en propiedad
    Sistema->>BaseDeDatos: Verificar no existe interés previo
    BaseDeDatos-->>Sistema: Sin interés previo
    Sistema->>BaseDeDatos: INSERT interes
    BaseDeDatos-->>Sistema: Interés registrado
    Sistema-->>Cliente: Éxito: "Te contactaremos pronto"
```

---

## 4. Diagrama de Componentes

```mermaid
flowchart TB
    %% External Entry Point
    Web[Cliente Web]
    Gateway[API Gateway]

    %% Main Flow
    Web --> Gateway
    Gateway --> Controllers

    subgraph Frontend [Frontend - React]
        direction TB
        Vistas[Vistas]
        Comps[Componentes]
        HTTP[Servicios HTTP]
        State[Gestión de Estado]
        
        Vistas --> Comps
        Comps --> State
        State --> HTTP
    end

    subgraph Backend [Backend - NestJS]
        direction TB
        Modules[Modules]
        Controllers[Controllers]
        Services[Services]
        Repos[Repositories]

        Modules --- Controllers
        Controllers --> Services
        Services --> Repos
    end

    subgraph DB [Base de Datos]
        direction TB
        MySQL[(MySQL 8.0)]
        Tablas[Tablas Relacionales]
        
        MySQL --- Tablas
    end

    %% Cross-Package Connections
    HTTP -.-> Gateway
    Repos --> MySQL

```

---

## 5. Diagrama de Despliegue

```mermaid
flowchart TB
    subgraph Node_Cliente [Servidor: Cliente]
        Nav[Navegador Web]
    end

    subgraph Node_App [Servidor de Aplicación]
        direction TB
        React[Contenedor: React App]
        Nest[Contenedor: NestJS API]
    end

    subgraph Node_Data [Servidor de Datos]
        direction TB
        MySQL[(Contenedor: MySQL)]
        PMA[Contenedor: phpMyAdmin]
    end

    %% Deployment Connections
    Nav -- HTTP/HTTPS --> React
    React -- API Calls --> Nest
    Nest -- TCP/IP --> MySQL
    PMA -.-> MySQL

```

---

## 6. Modelo Cliente-Servidor

```
┌─────────────────┐         HTTP/REST          ┌─────────────────┐
│                 │ ◄────────────────────────► │                 │
│   React SPA     │                            │   NestJS API    │
│   (Puerto 5173) │                            │   (Puerto 3000) │
│                 │                            │                 │
└────────┬────────┘                            └────────┬────────┘
         │                                              │
         │ Axios                                        │ TypeORM
         │                                              │
         ▼                                              ▼
┌─────────────────┐                            ┌─────────────────┐
│  Estado Local   │                            │     MySQL       │
│  (React State)  │                            │   (Puerto 3306) │
└─────────────────┘                            └─────────────────┘
```

---

*Diagramas UML extraídos del documento de Análisis del Sistema de Gestión Inmobiliaria de la Provincia de Bolívar*
