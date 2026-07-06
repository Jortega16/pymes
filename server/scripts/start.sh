#!/bin/sh
set -e

echo "Running database migrations..."
npm run db:migrate

echo "Running database seed..."
npm run db:seed

echo "Starting API..."
exec npm start
