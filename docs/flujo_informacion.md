## Flujo de Información del Sistema

### 1. Flujo de Gestión Geográfica (Estático)

```
CANTÓN → PARROQUIA → PROPIEDAD
```

- El sistema mantiene una estructura geográfica de cantones y parroquias de Bolívar
- Los cantones (Guaranda, Chillanes, San Miguel, etc.) son los datos base geográficos
- Las parroquias dependen de sus cantones respectivos
- Las propiedades se ubicarán siempre dentro de esta estructura geográfica

### 2. Flujo de Registro de Propiedades

```
USUARIO (Agente) → PROPIEDAD → (CANTÓN, PARROQUIA)
```

- Los agentes inmobiliarios crean y gestionan propiedades
- Cada propiedad se vincula a un cantón y parroquia específicos
- Las imágenes y datos se almacenan en formato JSON
- El agente puede actualizar o eliminar sus propiedades registradas

### 3. Flujo de Captación de Clientes

```
CLIENTE → INTERES → PROPIEDAD
         ↓
    USUARIO (Agente)
```

- Los clientes se registran en el sistema con sus datos de contacto
- Cuando un cliente interesa en una propiedad, se crea un registro en INTERES
- Los agentes atienden estos intereses y pueden contactar al cliente
- El estado del interés se actualiza a "atendido" cuando se gestiona

### 4. Flujo de Proceso de Venta

```
CLIENTE → VENTA ← PROPIEDAD
              ↓
         USUARIO (Agente)
```

1. Cliente selecciona una propiedad de su interés
2. El agente registra la venta en el sistema
3. Se captura el precio final de la transacción
4. La propiedad cambia de estado a "vendida"
5. El administrador supervisa y valida la venta completada

### 5. Flujo Completo de Negocio

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  CANTONES   │────▶│  PROPIEDADES │◀────│  AGENTES    │
│  Bolívar    │     │              │     │  (Usuario)  │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  INTERESES  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   CLIENTES  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   VENTAS    │
                    └─────────────┘
```

### 6. Flujo de Búsqueda y Filtrado

```
Solicitud de búsqueda → Filtros (cantón, precio, tipo) → PROPIEDAD
                                          ↓
                               Resultados filtrados → Cliente
```

- Los clientes pueden buscar propiedades por:
  - Cantón/Parroquia (ubicación específica en Bolívar)
  - Rango de precios
  - Tipo de inmueble
- El sistema retorna propiedades disponibles según los criterios

### 7. Flujo de Actualización de Estados

```
Administrador/USUARIO → PROPIEDAD.estado
                              ↓
            disponible → reservada → vendida
                              ↓
                         (Registro en VENTA)
```

- Estado inicial: "disponible"
- Al iniciar negociación: "reservada"
- Al cerrar venta: "vendida"
- Cada cambio de estado genera trazabilidad en el sistema

### 8. Resumen de Entradas y Salidas por Entidad

| Entidad       | Entradas                                | Salidas                                   |
| ------------- | --------------------------------------- | ----------------------------------------- |
| **CANTÓN**    | Nombre del cantón                       | Propiedades, parroquias                   |
| **PARROQUIA** | Nombre, canton_id                       | Propiedades filtradas                     |
| **USUARIO**   | Datos personales, credenciales          | Propiedades, Ventas, Intereses atendidos  |
| **PROPIEDAD** | Datos del inmueble, ubicación, imágenes | Información completa, intereses generados |
| **CLIENTE**   | Datos personales                        | Intereses, Historial de compras           |
| **VENTA**     | Datos de transacción                    | Reportes de ventas, Estadísticas          |
| **INTERES**   | Preferencia del cliente                 | Atención por agente, Conversión a venta   |

### 9. Puntos de Control (Integridad de Datos)

- **Geográfico**: Toda propiedad debe tener cantón y parroquia válidos
- **Ventas**: No puede venderse una propiedad ya vendida
- **Clientes**: Un cliente no puede expresar interés en la misma propiedad dos veces
- **Agentes**: Un agente solo gestiona sus propias propiedades
- **Precios**: El precio de venta debe ser igual o menor al precio registrado