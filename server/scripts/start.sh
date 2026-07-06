#!/bin/sh

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

API_PORT="${API_PORT:-4000}"

(
  echo "Running database migrations..."
  if npm run db:migrate; then
    echo "Migrations complete."
  else
    echo "ERROR: migrations failed"
    exit 1
  fi

  echo "Running database seed..."
  npm run db:seed || echo "WARN: seed failed"
) &

echo "Starting API on 0.0.0.0:${API_PORT}..."
exec npm start
