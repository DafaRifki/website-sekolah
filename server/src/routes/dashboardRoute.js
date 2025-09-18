import express from "express";
import {
  getDashboardSiswa,
  getDashboardSummary,
} from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", authenticate, getDashboardSummary);
router.get("/siswa", authenticate, getDashboardSiswa);

export default router;
