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

## GitHub Actions + Dokploy

El workflow `.github/workflows/deploy.yml` valida el proyecto en cada push o pull request hacia `main`:

- Instala dependencias de root, API y Angular.
- Revisa sintaxis del API con `node --check`.
- Compila Angular.
- Valida `docker-compose.yml`.
- En push a `main`, dispara Dokploy si existe el secret `DOKPLOY_WEBHOOK_URL`.

Para activar el deploy automático desde GitHub Actions:

1. En Dokploy, abra la app del proyecto y copie el Webhook URL de deploy.
2. En GitHub vaya a `Settings` > `Secrets and variables` > `Actions`.
3. Cree un repository secret llamado `DOKPLOY_WEBHOOK_URL`.
4. Pegue el webhook de Dokploy como valor del secret.
5. Haga push a `main`.

Si usa el Auto Deploy nativo de Dokploy conectado a GitHub, el workflow seguirá sirviendo como validación CI antes o durante sus cambios.
