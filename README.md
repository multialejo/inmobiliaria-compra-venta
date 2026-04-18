# Sistema de Gestion de Compra y Venta de Bienes Inmobilarios en la Provincia de Bolivar.

**Integrantes:**
- Ariel Alejandro Calderón
- Andony Fernando Cortez
- Jonathan Ayme 
- Neicer Jimenez
## Descripción del problema

En la provincia de Bolívar, muchas agencias inmobiliarias gestionan la información de propiedades y clientes de manera manual o mediante herramientas poco integradas, lo que genera desorganización, pérdida de información y retrasos en los procesos de venta.
Además, existe dificultad para mantener actualizada la disponibilidad de los inmuebles en ciudades como Guaranda, así como en otros cantones de la provincia, lo que limita la posibilidad de ofrecer información precisa a los clientes en tiempo real.
También se presentan inconvenientes al momento de realizar búsquedas eficientes de propiedades según criterios como ubicación, precio o tipo de inmueble, afectando la calidad del servicio brindado y la toma de decisiones tanto de agentes como de compradores.
Por esta razón, se identifica la necesidad de desarrollar un sistema que permita centralizar la información inmobiliaria en la provincia de Bolívar, optimizar la gestión de propiedades y mejorar el proceso de venta.



## Objetivo general del aplicativo:

Desarrollar un sistema de gestión de ventas inmobiliarias enfocado en la provincia de Bolívar, que permita administrar propiedades, clientes y procesos de venta de forma eficiente, mejorando la organización de la información y facilitando la atención a los clientes en el contexto local.



## Usuarios beneficiados:

**Agentes inmobiliarios** 
 • Gestionan propiedades de forma organizada 
 • Acceden rápidamente a la información 

**Administradores** 
 • Controlan el estado de los inmuebles 
 • Supervisan las ventas realizadas 

**Clientes** 
 • Buscan propiedades según sus necesidades 
 • Reciben información clara y actualizada



## Funcionalidades Principales (Backlog Inicial)

**Registro y gestión de propiedades en Bolívar**
 • Crear, editar y eliminar inmuebles ubicados en la provincia 
 • Registrar precio, ubicación (cantón, parroquia), descripción e imágenes 

**Gestión de clientes**
 • Registrar clientes interesados de la región 
 • Guardar información de contacto 

**Búsqueda y filtrado de propiedades locales**
 • Filtrar por precio, ubicación (ej: Guaranda u otros cantones) y tipo de inmueble 
 • Mostrar resultados de forma rápida 

**Registro y seguimiento de ventas**
 • Marcar propiedades como disponibles o vendidas 
 • Llevar control del proceso de venta dentro de la provincia



## Planificacion de Sprints (hasta primera funcionalidad)

**Sprint 1:** 

- **Identificación de Requerimientos**: Determinar los datos obligatorios para cada propiedad, tales como precio, ubicación exacta (cantón y parroquia), descripción detallada y gestión de archivos para imágenes.
- **Diseño del MER**: Elaborar el Diagrama Entidad-Relación (MER) para asegurar que la información de las propiedades se relacione correctamente con los agentes y la ubicación geográfica en la provincia.

**Sprint 2:** 

- **Planificación de** **Actividades**: Definir los pasos lógicos que el equipo seguirá en los próximos sprints para completar la funcionalidad.
- **Mejora del diagrama MER:** Realizar ajustes y optimizaciones al diseño inicial del Diagrama Entidad-Relación basándose en las correcciones recibidas, asegurando que todas las entidades y relaciones estén correctamente definidas antes de pasar al modelo lógico.

**Sprint 3:** 

- **Modelo Relacional**: Transformar el MER en un esquema de tablas concreto para MySQL.
- **Normalización**: Aplicar dependencias funcionales para garantizar que la estructura de la base de datos sea eficiente y no contenga datos duplicados.
- **Construcción en MySQL**: Crear la base de datos relacional y definir la tabla de propiedades con sus respectivos campos (precio, ubicación, descripción).

**Sprint 4:** 

- **Configuración de NestJS**: Establecer el proyecto base y la conexión entre el servidor y la base de datos MySQL.
- **Creación de la Lógica de Negocio**: Programar las funciones que permitan al sistema recibir, buscar y procesar la información de las propiedades en la provincia.
- **Endpoints de Propiedades**: Desarrollar los servicios necesarios para que el sistema pueda registrar y consultar los inmuebles de forma rápida.

**Sprint 5:** 

- **Construcción de Vistas en React JS**: Diseñar una interfaz limpia donde el agente pueda ver el listado de propiedades registradas.
- **Formulario de Registro**: Crear un formulario interactivo en React JS para el ingreso de nuevos bienes con validaciones de datos.

**Sprint 6:** 

- **Conexión Cliente-Servidor**: Vincular la interfaz de React con los servicios de NestJS para asegurar que la comunicación sea clara y escalable.
- **Pruebas de Funcionalidad**: Verificar el ciclo completo de gestión de propiedades (crear, editar, eliminar) utilizando datos de cantones como Guaranda para asegurar que el sistema cumple con las necesidades de la provincia.

75965976