import express, { Request, Response } from "express";
import {
  validateMeterTelemetry,
  validateVehicleTelemetry,
} from "../middleware/validation.js";
import meterIngestionService from "../services/meterIngestionService.js";
import vehicleIngestionService from "../services/vehicleIngestionService.js";
import { MeterTelemetry, VehicleTelemetry } from "../types/telemetry.js";

const router = express.Router();

// POST Route for meter telemetry ingestion
router.post(
  "/meter",
  validateMeterTelemetry,
  async (req: Request, res: Response) => {
    try {
      const data = req.body as MeterTelemetry;
      const result = await meterIngestionService.ingest(data);
      res.status(201).json(result);
    } catch (error) {
      console.error("Meter ingestion error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to ingest meter data",
      });
    }
  },
);

// POST Route for vehicle telemetry ingestion
router.post(
  "/vehicle",
  validateVehicleTelemetry,
  async (req: Request, res: Response) => {
    try {
      const data = req.body as VehicleTelemetry;
      const result = await vehicleIngestionService.ingest(data);
      res.status(201).json(result);
    } catch (error) {
      console.error("Vehicle ingestion error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to ingest vehicle data",
      });
    }
  },
);

export default router;
