import prisma from "../config/database.js";
import { VehicleTelemetry, IngestionResponse } from "../types/telemetry.js";

export class VehicleIngestionService {
  async ingest(data: VehicleTelemetry): Promise<IngestionResponse> {
    try {
      const { vehicleId, soc, kwhDeliveredDc, batteryTemp, timestamp } = data;

      // Use transaction to ensure atomicity
      await prisma.$transaction(async (tx) => {
        // Insert into history (append-only)
        await tx.vehicleHistory.create({
          data: {
            vehicleId,
            soc: soc.toString(),
            kwhDeliveredDc: kwhDeliveredDc.toString(),
            batteryTemp: batteryTemp.toString(),
            timestamp: new Date(timestamp),
          },
        });

        // Upsert into current status (atomic update)
        await tx.vehicleCurrentStatus.upsert({
          where: { vehicleId },
          update: {
            soc: soc.toString(),
            kwhDeliveredDc: kwhDeliveredDc.toString(),
            batteryTemp: batteryTemp.toString(),
            lastUpdated: new Date(timestamp),
          },
          create: {
            vehicleId,
            soc: soc.toString(),
            kwhDeliveredDc: kwhDeliveredDc.toString(),
            batteryTemp: batteryTemp.toString(),
            lastUpdated: new Date(timestamp),
          },
        });
      });

      return {
        success: true,
        vehicleId,
        message: "Vehicle data ingested successfully",
      };
    } catch (error) {
      console.error("Error ingesting vehicle data:", error);
      throw error;
    }
  }
}

export default new VehicleIngestionService();
