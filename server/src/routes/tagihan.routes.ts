import { Router } from "express";
import { TagihanController } from "../controllers/tagihan.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { validate, validateQuery } from "../middleware/validation.middleware";
import {
  tagihanValidation,
  generateBulkTagihanValidation,
  updateStatusTagihanValidation,
  paginationValidation,
} from "../utils/validation.util";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get outstanding tagihan (belum lunas)
router.get("/outstanding", TagihanController.getOutstanding);

// Get statistics
router.get("/stats", TagihanController.getStats);

// Get by bulan (monthly report)
router.get("/bulan/:bulan", TagihanController.getByBulan);

// Get by siswa
router.get("/siswa/:siswaId", TagihanController.getBySiswa);

// Get all with pagination
router.get("/", validateQuery(paginationValidation), TagihanController.getAll);

// Get by ID (must be after other GET routes to avoid conflict)
router.get("/:id", TagihanController.getById);

// Create single tagihan
router.post("/", validate(tagihanValidation), TagihanController.create);

// Generate bulk tagihan
router.post(
  "/generate-bulk",
  validate(generateBulkTagihanValidation),
  TagihanController.generateBulk
);

// Update status manually
router.put(
  "/:id/status",
  validate(updateStatusTagihanValidation),
  TagihanController.updateStatus
);

// Auto-update status based on pembayaran
router.put("/:id/auto-update-status", TagihanController.autoUpdateStatus);

// Delete tagihan
router.delete("/:id", TagihanController.delete);

export default router;
