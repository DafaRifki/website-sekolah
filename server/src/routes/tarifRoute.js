import { Router } from "express";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
import { getAllTarif } from "../controllers/tarifController.js";

const router = Router();

router.get("/", authenticate, authorizeRoles("ADMIN"), getAllTarif);

export default router;
