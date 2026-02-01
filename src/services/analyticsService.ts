import prisma from "../config/database.js";
import { VehiclePerformance } from "../types/telemetry.js";

export class AnalyticsService {
  async getVehiclePerformance(
    vehicleId: string,
    startTime: Date | null = null,
    endTime: Date | null = null,
  ): Promise<VehiclePerformance> {
    try {
      // Default to last 24 hours if not specified
      const end = endTime || new Date();
      const start = startTime || new Date(end.getTime() - 24 * 60 * 60 * 1000);

      // Get associated meter ID (if mapping exists)
      const mapping = await prisma.meterVehicleMapping.findFirst({
        where: { vehicleId },
      });

      let totalEnergyConsumedAc = 0;

      // Get AC consumption from meter history (if meter is mapped)
      if (mapping) {
        const acResult = await prisma.meterHistory.aggregate({
          where: {
            meterId: mapping.meterId,
            timestamp: {
              gte: start,
              lte: end,
            },
          },
          _sum: {
            kwhConsumedAc: true,
          },
        });

        totalEnergyConsumedAc = acResult._sum.kwhConsumedAc
          ? parseFloat(acResult._sum.kwhConsumedAc.toString())
          : 0;
      } else {
        console.warn(
          `No meter mapping found for vehicle ${vehicleId}, AC consumption will be 0`,
        );
      }

      // Get DC delivery and battery temperature from vehicle history
      const [dcResult, tempResult] = await Promise.all([
        prisma.vehicleHistory.aggregate({
          where: {
            vehicleId,
            timestamp: {
              gte: start,
              lte: end,
            },
          },
          _sum: {
            kwhDeliveredDc: true,
          },
        }),
        prisma.vehicleHistory.aggregate({
          where: {
            vehicleId,
            timestamp: {
              gte: start,
              lte: end,
            },
          },
          _avg: {
            batteryTemp: true,
          },
        }),
      ]);

      const totalEnergyDeliveredDc = dcResult._sum.kwhDeliveredDc
        ? parseFloat(dcResult._sum.kwhDeliveredDc.toString())
        : 0;
      const averageBatteryTemp = tempResult._avg.batteryTemp
        ? parseFloat(tempResult._avg.batteryTemp.toString())
        : 0;

      // Calculate efficiency ratio (DC/AC)
      const efficiencyRatio =
        totalEnergyConsumedAc > 0
          ? totalEnergyDeliveredDc / totalEnergyConsumedAc
          : 0;

      return {
        vehicleId,
        timeRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
        totalEnergyConsumedAc: Math.round(totalEnergyConsumedAc * 1000) / 1000,
        totalEnergyDeliveredDc:
          Math.round(totalEnergyDeliveredDc * 1000) / 1000,
        efficiencyRatio: Math.round(efficiencyRatio * 10000) / 10000,
        averageBatteryTemp: Math.round(averageBatteryTemp * 100) / 100,
      };
    } catch (error) {
      console.error("Error getting vehicle performance:", error);
      throw error;
    }
  }
}

export default new AnalyticsService();
