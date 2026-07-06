#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "Running database migrations..."
npm run db:migrate

echo "Running database seed..."
if ! npm run db:seed; then
  echo "WARN: seed failed, continuing with API startup"
fi

echo "Starting API on 0.0.0.0:${PORT:-4000}..."
exec npm start
