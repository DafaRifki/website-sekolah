import { Router } from "express";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  destroy,
  index,
  show,
  store,
  update,
} from "../controllers/pembayaranController.js";

const router = Router();

// semua route butuh login
router.use(authenticate);

router.get("/", authorizeRoles("ADMIN", "GURU"), index);
router.get("/:id", authorizeRoles("ADMIN", "GURU", "SISWA"), show);
router.post("/", authorizeRoles("ADMIN"), store);
router.put("/:id", authorizeRoles("ADMIN"), update);
router.delete("/:id", authorizeRoles("ADMIN"), destroy);

export default router;
