import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import ingestionRoutes from "./routes/ingestion.js";
import analyticsRoutes from "./routes/analytics.js";

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", async (_req, res) => {
  res.status(200).json({
    status: 200,
    message: "Server is running",
  });
});

// API Routes
app.use("/v1/ingestion", ingestionRoutes);
app.use("/v1/analytics", analyticsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
