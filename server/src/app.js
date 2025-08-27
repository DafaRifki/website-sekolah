import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import siswaRoutes from "./routes/siswaRoute.js";
import guruRoutes from "./routes/guruRoute.js";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import { authenticate, authorizeRoles } from "./middleware/authMiddleware.js";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.get("/api", (req, res) => res.json({ ok: true, message: "API siap" }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);

app.use(
  "/api/user",
  authenticate,
  authorizeRoles("ADMIN", "SISWA", "GURU"),
  userRoutes
);

app.use(
  "/api/siswa",
  authenticate,
  authorizeRoles("ADMIN", "SISWA", "GURU"),
  siswaRoutes
);
app.use("/api/guru", authenticate, authorizeRoles("ADMIN", "GURU"), guruRoutes);

export default app;
