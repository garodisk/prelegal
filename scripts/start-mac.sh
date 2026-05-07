#!/bin/bash
set -e
docker compose up -d --build
echo "Prelegal started at http://localhost:8000"
