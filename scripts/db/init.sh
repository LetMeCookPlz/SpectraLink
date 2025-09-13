#!/bin/bash
set -e # Exit on any error

echo "Initializing the database..."

# Import the schema
mysql --ssl-mode=DISABLED --host=$MYSQL_HOST --user=$MYSQL_USER --password=$MYSQL_PASSWORD --database=$MYSQL_DB < ./init.sql

# Check if event scheduler should be enabled for local deployment
if [ "$DB_ENV" = "local" ]; then
    echo "Setting up event scheduler for local deployment..."
    mysql --ssl-mode=DISABLED --host=$MYSQL_HOST --user=$MYSQL_USER --password=$MYSQL_PASSWORD --database=$MYSQL_DB < ./local.sql
fi

echo "Database initialized successfully."