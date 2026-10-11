#!/bin/sh
set -e
cd "$(dirname "$0")"
sh native.sh
cd frontend
exec npm run start
