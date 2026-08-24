# SOKOZA Setup & Environment Guide

## Prerequisites

- Node.js >= v18 (Tested on v24)
- npm >= v9
- Docker & Docker Compose (Optional for local PostgreSQL)

## Step-by-Step Local Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build Shared Packages**:
   ```bash
   npm run build:packages
   ```

3. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

4. **Run Backend API**:
   ```bash
   npm run dev:api
   # API will be available at http://localhost:3001/api/v1
   ```

5. **Run Web Frontend**:
   ```bash
   npm run dev:web
   # App will be available at http://localhost:3000
   ```
