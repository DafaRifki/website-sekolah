import { Router } from "express";
import { getAllGuru } from "../controllers/guruController.js";

const router = Router();

router.get("/", getAllGuru);

export default router;
