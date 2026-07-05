# pymes

Marketplace de pymes verificadas en Costa Rica, construido con Angular, Node.js/Express y PostgreSQL.

## Estructura

- `client/`: aplicación Angular.
- `server/`: API Express conectada a PostgreSQL.
- `server/db/schema.sql`: esquema de base de datos.
- `server/db/seed.sql`: datos iniciales.

## Desarrollo local

```bash
npm run install:all
cp server/.env.example server/.env
npm run db:migrate
npm run db:seed
npm run dev
```

URLs por defecto:

- Frontend: `http://localhost:4300`
- API: `http://localhost:4000`

## Credenciales semilla

- Admin: `admin@pymesverificadas.cr` / `Admin123!`
- Cliente: `duena@samocha.cr` / `Cliente123!`
