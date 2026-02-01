import prisma from "../config/database.js";
import { MeterTelemetry, IngestionResponse } from "../types/telemetry.js";

export class MeterIngestionService {
  async ingest(data: MeterTelemetry): Promise<IngestionResponse> {
    try {
      const { meterId, kwhConsumedAc, voltage, timestamp } = data;

      // Use transaction to ensure atomicity
      await prisma.$transaction(async (tx) => {
        // Insert into history (append-only)
        await tx.meterHistory.create({
          data: {
            meterId,
            kwhConsumedAc: kwhConsumedAc.toString(),
            voltage: voltage.toString(),
            timestamp: new Date(timestamp),
          },
        });

        // Upsert into current status (atomic update)
        await tx.meterCurrentStatus.upsert({
          where: { meterId },
          update: {
            kwhConsumedAc: kwhConsumedAc.toString(),
            voltage: voltage.toString(),
            lastUpdated: new Date(timestamp),
          },
          create: {
            meterId,
            kwhConsumedAc: kwhConsumedAc.toString(),
            voltage: voltage.toString(),
            lastUpdated: new Date(timestamp),
          },
        });
      });

      return {
        success: true,
        meterId,
        message: "Meter data ingested successfully",
      };
    } catch (error) {
      console.error("Error ingesting meter data:", error);
      throw error;
    }
  }
}

export default new MeterIngestionService();
