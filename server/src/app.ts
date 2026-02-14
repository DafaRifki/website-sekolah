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
import dashboardGuruRoutes from "./routes/dashboard-guru.routes";
import RaporRoutes from "./routes/rapor.routes";
import GuruMapelRoutes from "./routes/guru-mapel.routes";
import JadwalRoutes from "./routes/jadwal.routes";

const app = express();

// 1. Security & Base Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false, // IZINKAN GAMBAR DILOAD DARI ORIGIN BERBEDA
  }),
);

app.use(
  cors({
    origin:
      ENV.NODE_ENV === "development"
        ? ["http://localhost:3000", "http://localhost:5173"]
        : process.env.FRONTEND_URL?.split(",") || ["http://localhost:3000"],
    credentials: true,
  }),
);

// 2. Logging
if (ENV.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// 3. Static Files (PRIORITAS TINGGI - SEBELUM RATE LIMITER)
// Gunakan path.resolve agar lebih robust
const uploadsPath = path.join(process.cwd(), "uploads");
console.log("📂 Serving static files from:", uploadsPath); // Cek log ini nanti!
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// 4. Rate Limiting (Hanya untuk API, jangan limit gambar)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: ENV.NODE_ENV === "development" ? 1000 : 100,
  message: {
    success: false,
    message: "Terlalu banyak request, coba lagi nanti",
  },
});
// Terapkan limiter HANYA ke routes /api, bukan ke /uploads
app.use("/api", limiter);

// 5. Body Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 6. Health Check
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
    // ...
  });
});

// 7. Routes
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
app.use("/api/dashboard-guru", dashboardGuruRoutes);
app.use("/api/rapor", RaporRoutes);
app.use("/api/guru-mapel", GuruMapelRoutes);
app.use("/api/jadwal", JadwalRoutes);
// 8. Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = ENV.PORT || 5000; // Fallback port

app.listen(PORT, () => {
  console.log("🎓 ================================");
  console.log("🎓  School Management API");
  console.log("🎓 ================================");
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📖 API Info: http://localhost:${PORT}/api`);
  console.log(`📂 Static: http://localhost:${PORT}/uploads`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${ENV.NODE_ENV}`);
  console.log("🎓 ================================");
});

export default app;
