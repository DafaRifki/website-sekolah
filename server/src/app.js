import express from "express";
import siswaRoutes from "./routes/siswaRoute.js";
import guruRoutes from "./routes/guruRoute.js";
import authRoutes from "./routes/authRoute.js";
import { authenticate, authorizeRoles } from "./middleware/authMiddleware.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, message: "API siap" }));

app.use("/auth", authRoutes);

app.use("/siswa", authenticate, authorizeRoles("ADMIN", "SISWA"), siswaRoutes);
app.use("/guru", authenticate, authorizeRoles("ADMIN", "GURU"), guruRoutes);

export default app;
