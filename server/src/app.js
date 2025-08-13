import express from "express";
import "dotenv/config";
import cors from "cors";
import siswaRoutes from "./routes/siswaRoute.js";
import guruRoutes from "./routes/guruRoute.js";
import authRoutes from "./routes/authRoute.js";
import { authenticate, authorizeRoles } from "./middleware/authMiddleware.js";

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

app.get("/api", (req, res) => res.json({ ok: true, message: "API siap" }));

app.use("/api/auth", authRoutes);

app.use(
  "/api/siswa",
  authenticate,
  authorizeRoles("ADMIN", "SISWA"),
  siswaRoutes
);
app.use("/api/guru", authenticate, authorizeRoles("ADMIN", "GURU"), guruRoutes);

export default app;
