-- CreateTable: Hot Store - Meter Current Status
CREATE TABLE "meter_current_status" (
    "meter_id" VARCHAR(255) NOT NULL,
    "kwh_consumed_ac" DECIMAL(10,3) NOT NULL,
    "voltage" DECIMAL(6,2) NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meter_current_status_pkey" PRIMARY KEY ("meter_id")
);

-- CreateIndex
CREATE INDEX "idx_meter_current_updated" ON "meter_current_status"("last_updated");

-- CreateTable: Hot Store - Vehicle Current Status
CREATE TABLE "vehicle_current_status" (
    "vehicle_id" VARCHAR(255) NOT NULL,
    "soc" DECIMAL(5,2) NOT NULL,
    "kwh_delivered_dc" DECIMAL(10,3) NOT NULL,
    "battery_temp" DECIMAL(5,2) NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_current_status_pkey" PRIMARY KEY ("vehicle_id")
);

-- CreateIndex
CREATE INDEX "idx_vehicle_current_updated" ON "vehicle_current_status"("last_updated");

-- CreateTable: Cold Store - Meter History
CREATE TABLE "meter_history" (
    "id" BIGSERIAL NOT NULL,
    "meter_id" VARCHAR(255) NOT NULL,
    "kwh_consumed_ac" DECIMAL(10,3) NOT NULL,
    "voltage" DECIMAL(6,2) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meter_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_meter_history_meter_time" ON "meter_history"("meter_id", "timestamp" DESC);
CREATE INDEX "idx_meter_history_timestamp" ON "meter_history"("timestamp" DESC);

-- CreateTable: Cold Store - Vehicle History
CREATE TABLE "vehicle_history" (
    "id" BIGSERIAL NOT NULL,
    "vehicle_id" VARCHAR(255) NOT NULL,
    "soc" DECIMAL(5,2) NOT NULL,
    "kwh_delivered_dc" DECIMAL(10,3) NOT NULL,
    "battery_temp" DECIMAL(5,2) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_vehicle_history_vehicle_time" ON "vehicle_history"("vehicle_id", "timestamp" DESC);
CREATE INDEX "idx_vehicle_history_timestamp" ON "vehicle_history"("timestamp" DESC);

-- CreateTable: Meter-Vehicle Mapping
CREATE TABLE "meter_vehicle_mapping" (
    "meter_id" VARCHAR(255) NOT NULL,
    "vehicle_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meter_vehicle_mapping_pkey" PRIMARY KEY ("meter_id")
);

-- CreateIndex
CREATE INDEX "idx_mapping_vehicle" ON "meter_vehicle_mapping"("vehicle_id");
