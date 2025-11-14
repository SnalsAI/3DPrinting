#!/bin/bash

# 3D Printing Platform - Setup Script
# This script helps you set up the development environment

echo "🎨 3D Printing Platform Setup"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL 14+ first."
    echo "   Visit: https://www.postgresql.org/download/"
    exit 1
fi

echo "✅ PostgreSQL is installed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env and add your configuration"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✅ Prisma Client generated"
echo ""

# Ask to create database
echo "📊 Database Setup"
echo "-----------------"
read -p "Do you want to create the database now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter database name (default: 3d_printing_platform): " DB_NAME
    DB_NAME=${DB_NAME:-3d_printing_platform}

    echo "Creating database: $DB_NAME"
    createdb $DB_NAME

    if [ $? -eq 0 ]; then
        echo "✅ Database created successfully"

        # Run migrations
        echo "🔄 Running Prisma migrations..."
        npx prisma migrate dev --name init

        if [ $? -eq 0 ]; then
            echo "✅ Migrations completed"

            # Ask to seed database
            read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
            echo ""

            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo "🌱 Seeding database..."
                psql -d $DB_NAME -f prisma/setup.sql
                echo "✅ Database seeded"
            fi
        else
            echo "❌ Migration failed"
        fi
    else
        echo "⚠️  Database creation failed or already exists"
    fi
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npm run db:studio    - Open Prisma Studio"
echo "  npm run db:migrate   - Run database migrations"
echo ""
