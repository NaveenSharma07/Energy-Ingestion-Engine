# High-Scale Energy Ingestion Engine

A TypeScript/Node.js-based ingestion engine for processing telemetry data from Smart Meters and EV Fleets, designed to handle 14.4 million records per day (10,000+ devices × 2 streams × 1,440 minutes/day).

**Built with Prisma ORM** for type-safe database operations and automatic migrations.

## 🏗️ Architecture Overview

### System Design

The system implements a **Hot/Cold data separation strategy** to optimize for both real-time operations and historical analytics:

- **Hot Store (Operational)**: Small tables storing current device status for fast dashboard queries
- **Cold Store (Historical)**: Append-only tables for long-term analytics and audit trails

### Data Flow

```
Smart Meters ──┐
               ├──> Ingestion Service ──> Prisma ──> PostgreSQL
EV Vehicles ───┘                          ├── Hot Store (Current Status)
                                          └── Cold Store (Historical Data)
                                                      │
                                                      └──> Analytics Service
```

## 📊 Database Architecture

### Hot Store Tables

**Purpose**: Fast access to current device status without scanning historical data.

- `meter_current_status`: Current meter readings (UPSERT operations)
- `vehicle_current_status`: Current vehicle status (UPSERT operations)

### Cold Store Tables

**Purpose**: Immutable audit trail for long-term analytics.

- `meter_history`: Historical meter readings (INSERT only)
- `vehicle_history`: Historical vehicle readings (INSERT only)

### Key Optimizations

1. **Indexing**: Composite indexes on `(entity_id, timestamp)` for fast range queries
2. **Prisma Connection Pooling**: Automatic connection management
3. **Type Safety**: Full TypeScript types generated from Prisma schema

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- PostgreSQL 15+ (if running locally)

### Quick Start with Docker

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd energy-ingestion-engine
   ```

2. **Start services**

   ```bash
   docker-compose up -d
   ```

   This will:
   - Start PostgreSQL database
   - Run Prisma migrations automatically
   - Build TypeScript and start the Node.js application

3. **Verify health**
   ```bash
   curl http://localhost:3000/health
   ```

### Local Development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   # DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fleet_energy
   ```

3. **Generate Prisma Client**

   ```bash
   npm run db:generate
   ```

4. **Run migrations**

   ```bash
   npm run db:migrate:dev
   ```

5. **Build TypeScript**

   ```bash
   npm run build
   ```

6. **Start the server**
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

## 📡 API Endpoints

### Ingestion Endpoints

#### POST `/v1/ingestion/meter`

Ingests meter telemetry data.

**Request Body:**

```json
{
  "meterId": "meter-001",
  "kwhConsumedAc": 125.5,
  "voltage": 240.0,
  "timestamp": "2024-12-15T10:30:00Z"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "meterId": "meter-001",
  "message": "Meter data ingested successfully"
}
```

#### POST `/v1/ingestion/vehicle`

Ingests vehicle telemetry data.

**Request Body:**

```json
{
  "vehicleId": "vehicle-001",
  "soc": 85.5,
  "kwhDeliveredDc": 45.2,
  "batteryTemp": 28.5,
  "timestamp": "2024-12-15T10:30:00Z"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "vehicleId": "vehicle-001",
  "message": "Vehicle data ingested successfully"
}
```

### Analytics Endpoints

#### GET `/v1/analytics/performance/:vehicleId`

Returns 24-hour performance summary for a vehicle.

**Query Parameters:**

- `startTime` (optional): ISO8601 timestamp (default: 24h ago)
- `endTime` (optional): ISO8601 timestamp (default: now)

**Example:**

```bash
GET /v1/analytics/performance/vehicle-001?startTime=2024-12-14T10:30:00Z&endTime=2024-12-15T10:30:00Z
```

**Response:** `200 OK`

```json
{
  "vehicleId": "vehicle-001",
  "timeRange": {
    "start": "2024-12-14T10:30:00.000Z",
    "end": "2024-12-15T10:30:00.000Z"
  },
  "totalEnergyConsumedAc": 125.5,
  "totalEnergyDeliveredDc": 105.2,
  "efficiencyRatio": 0.8382,
  "averageBatteryTemp": 28.5
}
```

### Health Check

#### GET `/health`

Returns service health status.

**Response:** `200 OK`

```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-12-15T10:30:00.000Z"
}
```

## 🔧 Handling 14.4 Million Records/Day

### Scale Breakdown

- **10,000 devices** × **2 streams** × **1,440 minutes/day** = **28.8M potential records/day**
- **Actual requirement**: 14.4M records/day (one stream per device per minute)
- **Average throughput**: ~167 records/second
- **Peak load**: ~500-1000 records/second (burst traffic)

### Performance Strategies

1. **Prisma Connection Pooling**
   - Automatic connection management
   - Configurable pool size
   - Efficient query batching

2. **Query Optimization**
   - Composite indexes on `(entity_id, timestamp)` for range queries
   - Prisma's optimized query engine
   - No full table scans (verified with EXPLAIN ANALYZE)

3. **Transaction Management**
   - Atomic UPSERT operations for hot store
   - Batch-ready INSERT operations for cold store
   - Prisma transactions ensure data consistency
