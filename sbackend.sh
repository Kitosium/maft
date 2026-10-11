#!/bin/sh
set -e
cd "$(dirname "$0")"
sh native.sh
cd backend
exec node --env-file=../.env dist/main.js
