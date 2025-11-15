import { Router } from "express";
import { TarifPembayaranController } from "../controllers/tarif-pembayaran.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { validate, validateQuery } from "../middleware/validation.middleware";
import {
  tarifPembayaranValidation,
  updateTarifPembayaranValidation,
  paginationValidation,
} from "../utils/validation.util";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get jenis list
router.get("/jenis-list", TarifPembayaranController.getJenisList);

// Get stats
router.get("/stats", TarifPembayaranController.getStats);

// Get by tahun ajaran
router.get(
  "/tahun-ajaran/:tahunAjaranId",
  TarifPembayaranController.getByTahunAjaran
);

// Get by jenis
router.get("/jenis/:jenis", TarifPembayaranController.getByJenis);

// Get all with pagination
router.get(
  "/",
  validateQuery(paginationValidation),
  TarifPembayaranController.getAll
);

// Get by ID
router.get("/:id", TarifPembayaranController.getById);

// Create
router.post(
  "/",
  validate(tarifPembayaranValidation),
  TarifPembayaranController.create
);

// Update
router.put(
  "/:id",
  validate(updateTarifPembayaranValidation),
  TarifPembayaranController.update
);

// Delete
router.delete("/:id", TarifPembayaranController.delete);

export default router;
