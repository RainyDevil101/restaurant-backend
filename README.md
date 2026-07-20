# Subito — Backend

API REST + servidor de tiempo real de **Subito**, un sistema de gestión de pedidos para restaurantes (proyecto de título) que reemplaza la toma de pedidos en papel.

Expone toda la lógica del negocio para tres roles —mesero (M), cajero (C) y administrador (A)—: autenticación, configuración del catálogo (productos, categorías, menús), mesas y áreas, registro de pedidos, consolidación de cuentas y cobros. Cuando un mesero registra un pedido, lo empuja en vivo a la caja vía WebSocket (≤3 s).

## Stack

NestJS (arquitectura hexagonal + CQRS) + TypeScript. Persistencia en **PostgreSQL** con TypeORM. Autenticación JWT, contraseñas/PIN con bcrypt. Tiempo real con Socket.IO. Backups diarios de la BD a almacenamiento externo (S3/Backblaze).

## Requisitos

- Node `>=20`
- pnpm
- Docker (para una base de datos PostgreSQL local desechable)

## Cómo iniciar

```bash
pnpm install
cp .env.example .env                 # ver notas abajo
docker compose up -d                 # PostgreSQL local en :5432 (user/pass/db = subito)
pnpm seed                            # carga datos demo (idempotente)
pnpm start:dev                       # API en http://localhost:3000 (watch mode)
```

En el `.env`, para desarrollo local apunta `DATABASE_URL` a la BD de Docker y usa el driver de backup local:

```
DATABASE_URL=postgres://subito:subito@localhost:5432/subito
JWT_SECRET=<una-cadena-larga-y-aleatoria>
BACKUP_DRIVER=local
```


### Cuentas de prueba (las crea `pnpm seed`)

| Rol | Email | Credencial |
|---|---|---|
| Administrador (dueño) | `admin@subito.cl` | `111111` |
| Cajero | `carlos@subito.cl` | `234567` |
| Mesero | `ana@subito.cl` | `123456` |

## Otros comandos

```bash
pnpm build          # compila a dist/
pnpm start:prod     # corre el build de producción
pnpm test           # tests unitarios (Jest)
pnpm backup:run     # genera un backup de la BD ahora
```

La API corre bajo el prefijo `/api` (p. ej. `POST /api/auth/login`); hay un health check público en `GET /api/health`.
