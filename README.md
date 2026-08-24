# SOKOZA

> **Shop Local. Get It Delivered.**

SOKOZA is a production-oriented local marketplace and delivery platform launched in Juja, Kenya and designed to scale across Kenya and regional markets.

## Core Ecosystem

`CUSTOMERS ↔ BUSINESSES ↔ RIDERS`

- **Customers**: Discover local businesses, browse products, place orders, receive deliveries, and rate experiences.
- **Businesses**: Register storefronts, manage products/inventory, process orders, and handle delivery via business-owned riders or Sokoza platform riders.
- **Riders**: Independent or business-affiliated delivery riders with real-time availability, dispatch matching, and earnings tracking.

## Architecture

Modular Monolith monorepo:

- **Backend (`apps/api`)**: Node.js, TypeScript, NestJS REST API.
- **Database & ORM (`prisma/`)**: PostgreSQL with Prisma ORM.
- **Packages (`packages/`)**: Shared TypeScript types, Zod validation schemas, and environment/system config.

## Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Start infrastructure (if Docker is available):
   ```bash
   docker-compose up -d
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build shared packages & applications:
   ```bash
   npm run build
   ```
5. Run in development mode:
   ```bash
   # API Backend (http://localhost:3001)
   npm run dev:api

   # Web Frontend (http://localhost:3000)
   npm run dev:web
   ```
