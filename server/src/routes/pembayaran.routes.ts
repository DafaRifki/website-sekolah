import { Router } from "express";
import { PembayaranController } from "../controllers/pembayaran.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import {
  pembayaranValidation,
  updatePembayaranValidation,
  paginationValidation,
} from "../utils/validation.util";
import { validateQuery, validate } from "../middleware/validation.middleware";

const router = Router();

// all routes require authentication
router.use(authenticateToken);

// Get stats
router.get("/stats", PembayaranController.getStats);

// Get by date range
router.get(
  "/date-range",
  validateQuery(paginationValidation),
  PembayaranController.getByDateRange
);

// Get by siswa
router.get("/siswa/:siswaId", PembayaranController.getBySiswa);

// Get payment history by tagihan
router.get("/tagihan/:tagihanId", PembayaranController.getByTagihan);

// Get receipt
router.get("/:id/receipt", PembayaranController.getReceipt);

// Get all with pagination
router.get(
  "/",
  validateQuery(paginationValidation),
  PembayaranController.getAll
);

// Get by ID (must be after other GET routes)
router.get("/:id", PembayaranController.getById);

// Create single pembayaran
router.post("/", validate(pembayaranValidation), PembayaranController.create);

// Bulk create pembayaran
router.post("/bulk", PembayaranController.createBulk);

// Update pembayaran
router.put(
  "/:id",
  validate(updatePembayaranValidation),
  PembayaranController.update
);

// Delete pembayaran
router.delete("/:id", PembayaranController.delete);

export default router;
