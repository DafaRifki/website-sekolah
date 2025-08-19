import { Router } from "express";
import { getAllGuru, getGuruById } from "../controllers/guruController.js";

const router = Router();

router.get("/", getAllGuru);
router.get("/:id", getGuruById);

export default router;
