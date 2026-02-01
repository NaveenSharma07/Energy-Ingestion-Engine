import express, { Request, Response } from "express";
import analyticsService from "../services/analyticsService.js";

const router = express.Router();

// Get Route for vehicle performance analytics
router.get("/performance/:vehicleId", async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const { startTime, endTime } = req.query;

    const start = startTime ? new Date(startTime as string) : null;
    const end = endTime ? new Date(endTime as string) : null;

    // Validate dates
    if (startTime && start && isNaN(start.getTime())) {
      res.status(400).json({
        success: false,
        message: "Invalid startTime format. Use ISO8601 timestamp.",
      });
      return;
    }

    if (endTime && end && isNaN(end.getTime())) {
      res.status(400).json({
        success: false,
        message: "Invalid endTime format. Use ISO8601 timestamp.",
      });
      return;
    }

    if (start && end && start >= end) {
      res.status(400).json({
        success: false,
        message: "startTime must be before endTime",
      });
      return;
    }

    const result = await analyticsService.getVehiclePerformance(
      vehicleId,
      start,
      end,
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve analytics",
    });
  }
});

export default router;
