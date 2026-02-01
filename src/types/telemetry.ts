export interface MeterTelemetry {
  meterId: string;
  kwhConsumedAc: number;
  voltage: number;
  timestamp: string;
}

export interface VehicleTelemetry {
  vehicleId: string;
  soc: number;
  kwhDeliveredDc: number;
  batteryTemp: number;
  timestamp: string;
}

export interface IngestionResponse {
  success: boolean;
  meterId?: string;
  vehicleId?: string;
  message: string;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface VehiclePerformance {
  vehicleId: string;
  timeRange: TimeRange;
  totalEnergyConsumedAc: number;
  totalEnergyDeliveredDc: number;
  efficiencyRatio: number;
  averageBatteryTemp: number;
}

export interface HealthStatus {
  status: "healthy" | "unhealthy";
  database: "connected" | "disconnected";
  timestamp: string;
  error?: string;
}
