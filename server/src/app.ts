import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { ENV } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import tahunAjaranRoutes from "./routes/tahun-ajaran.routes";
import siswaRoutes from "./routes/siswa.routes";
import pendaftaranRoutes from "./routes/pendaftaran.routes";
import guruRoutes from "./routes/guru.routes";
import kelasRoutes from "./routes/kelas.routes";
import mataPelajaranRoutes from "./routes/mata-pelajaran.routes";
import OrangtuaRoutes from "./routes/orangtua.routes";
import nilaiRoutes from "./routes/nilai.routes";
import absensiRoutes from "./routes/absensi.routes";
import tarifPembayaranRoutes from "./routes/tarif-pembayaran.routes";
import tagihanRoutes from "./routes/tagihan.routes";
import pembayaranRoutes from "./routes/pembayaran.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin:
      ENV.NODE_ENV === "development"
        ? ["http://localhost:3000", "http://localhost:5173"]
        : process.env.FRONTEND_URL?.split(",") || ["http://localhost:3000"],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: ENV.NODE_ENV === "development" ? 1000 : 100,
  message: {
    success: false,
    message: "Terlalu banyak request, coba lagi nanti",
  },
});
app.use("/api", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files (untuk upload)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Logging
if (ENV.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "School Management API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: ENV.NODE_ENV,
  });
});

// API Info
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "School Management API",
    version: "1.0.0",
    documentation: "/api/docs", // Nanti untuk Swagger
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      guru: "/api/guru",
      siswa: "/api/siswa",
      user: "/api/users",
      tahunajaran: "/api/tahun-ajaran",
      pendaftaran: "/api/pendaftaran",
      // akan ditambah seiring development
    },
  });
});

// Routes akan ditambahkan di sini
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tahun-ajaran", tahunAjaranRoutes);
app.use("/api/siswa", siswaRoutes);
app.use("/api/pendaftaran", pendaftaranRoutes);
app.use("/api/guru", guruRoutes);
app.use("/api/kelas", kelasRoutes);
app.use("/api/mata-pelajaran", mataPelajaranRoutes);
app.use("/api/orangtua", OrangtuaRoutes);
app.use("/api/nilai", nilaiRoutes);
app.use("/api/absensi", absensiRoutes);
app.use("/api/tarif-pembayaran", tarifPembayaranRoutes);
app.use("/api/tagihan", tagihanRoutes);
app.use("/api/pembayaran", pembayaranRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = ENV.PORT;

app.listen(PORT, () => {
  console.log("🎓 ================================");
  console.log("🎓  School Management API");
  console.log("🎓 ================================");
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📖 API Info: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${ENV.NODE_ENV}`);
  console.log("🎓 ================================");
});

export default app;
