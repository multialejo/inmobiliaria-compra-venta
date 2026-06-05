# Seguridad — Implementación

## Arquitectura de Seguridad Implementada

```
                    ┌──────────────────────┐
                    │    Cliente React      │
                    │  (Vite, puerto 5173)  │
                    └──────┬───────────────┘
                           │ JWT (Bearer token)
                           │ vía Authorization header
                    ┌──────▼───────────────┐
                    │   Helmet (headers)   │
                    │   CORS restringido   │
                    │   Rate Limiting      │
                    │   ValidationPipe     │
                    │   Cookie-Parser      │
                    └──────┬───────────────┘
                           │
                    ┌──────▼───────────────┐
                    │  JwtAuthGuard        │
                    │  RolesGuard          │
                    │  @Roles() decorator  │
                    └──────┬───────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        Usuarios    Propiedades   Cantones/Parroquias
        (admin)     (admin/agente)   (públicas)
```

## Mitigaciones Implementadas

| Tipo de Ataque | Mitigación Implementada | Archivos |
|---|---|---|
| **Inyección SQL (SQLi)** | TypeORM parametriza queries automáticamente. No se usa SQL raw. El RBAC impide que un agente ejecute acciones de administrador. | `propiedades/propiedades.service.ts`, `usuarios/usuarios.service.ts` |
| **Cross-Site Scripting (XSS)** | `helmet()` configura headers `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`. El backend no renderiza HTML. | `main.ts` |
| **Cross-Site Request Forgery (CSRF)** | `JwtAuthGuard` exige token JWT en cada request. El servidor valida el token antes de ejecutar cualquier acción. Sin cookies de sesión tradicionales, no hay riesgo de envío automático. | `auth/guards/jwt-auth.guard.ts` |
| **Ataques de fuerza bruta** | `ThrottlerModule` limita a 60 requests por minuto globalmente. | `app.module.ts` |

## Autenticación (JWT)

**Endpoint:** `POST /api/auth/login`

```json
// Request
{ "email": "admin@inmobiliaria.com", "contrasena": "admin123" }

// Response
{
  "access_token": "eyJhbGciOi...",
  "usuario": {
    "id": "uuid",
    "nombre": "Admin Principal",
    "email": "admin@inmobiliaria.com",
    "rol": "administrador"
  }
}
```

**Flujo:**
1. Cliente envía email + contraseña → `AuthService.login()`
2. Se busca el usuario por email → `UsuariosService.findByEmail()`
3. Se verifica la contraseña con `bcrypt.compare()`
4. Se firma un JWT con `{ sub, email, rol }` usando `@nestjs/jwt`
5. El cliente almacena el token y lo envía en cada request como `Authorization: Bearer <token>`

**Archivos:** `auth/auth.controller.ts`, `auth/auth.service.ts`, `auth/dto/login.dto.ts`, `auth/strategies/jwt.strategy.ts`

## Autorización (RBAC)

### Roles definidos

| Rol | Permisos |
|---|---|
| `administrador` | CRUD completo sobre propiedades y usuarios |
| `agente` | CRUD solo sobre sus propias propiedades. No puede ver/editar propiedades de otros agentes. No puede eliminar propiedades. |

### Guards aplicados

| Endpoint | Guard | Roles permitidos |
|---|---|---|
| `GET /api/usuarios` | `JwtAuthGuard` + `RolesGuard` | `administrador` |
| `POST /api/propiedades` | `JwtAuthGuard` + `RolesGuard` | `administrador`, `agente` |
| `GET /api/propiedades` | `JwtAuthGuard` + `RolesGuard` | `administrador` (todas), `agente` (solo suyas) |
| `PATCH /api/propiedades/:id` | `JwtAuthGuard` + `RolesGuard` | `administrador` (cualquiera), `agente` (solo suyas) |
| `DELETE /api/propiedades/:id` | `JwtAuthGuard` + `RolesGuard` | `administrador` |
| `GET /api/cantones` | Público | Todos |
| `GET /api/parroquias` | Público | Todos |

**Archivos:** `auth/guards/jwt-auth.guard.ts`, `auth/guards/roles.guard.ts`, `auth/decorators/roles.decorator.ts`, `auth/decorators/current-user.decorator.ts`

## Seguridad en Red

### Helmet (HTTP Headers)

Headers configurados globalmente vía `helmet()`:

| Header | Función |
|---|---|
| `Content-Security-Policy` | Restringe orígenes de scripts, estilos, etc. |
| `X-Content-Type-Options: nosniff` | Evita MIME-type sniffing |
| `X-Frame-Options: SAMEORIGIN` | Previene clickjacking |
| `Strict-Transport-Security` | Fuerza HTTPS (cuando esté habilitado) |

**Archivo:** `main.ts`

### CORS

Restringido al origen del frontend (configurable vía `CORS_ORIGIN` en `.env`):

```typescript
app.enableCors({
  origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:5173'),
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
});
```

### HTTPS (disponible para producción)

Configurable en `.env`:
```
HTTPS_ENABLED=false
SSL_KEY_PATH=./cert/key.pem
SSL_CERT_PATH=./cert/cert.pem
```

### Rate Limiting

- **60 requests por minuto** global (configurable en `app.module.ts`)
- Previene ataques de fuerza bruta en endpoint de login

## Contraseñas

- **Hash:** `bcrypt` con 10 rounds de sal
- Las contraseñas se hashean al seedear (`seed/seed.service.ts`) y al crear usuarios
- Las contraseñas originales en texto plano del seed (`seed/data/usuarios.json`) **nunca** se persisten en BD

## Variables de Entorno (`.env`)

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=admin
DB_PASSWORD=admin123
DB_DATABASE=inmobiliaria
JWT_SECRET=inmobiliaria-secret-key-change-in-production
JWT_EXPIRES_IN=8h
PORT=3000
CORS_ORIGIN=http://localhost:5173
HTTPS_ENABLED=false
```

> `.env` está en `.gitignore` — no se versiona.

## Cliente — Cambios

- **Login screen:** El cliente muestra un formulario de login si no hay token
- **JWT en requests:** Todas las llamadas a la API incluyen `Authorization: Bearer <token>`
- **Logout:** Elimina el token de `localStorage` y limpia el estado
- **UI condicional:** Solo administradores ven botón "Eliminar". El navbar muestra nombre y rol del usuario actual

**Archivo:** `client/src/App.jsx`
