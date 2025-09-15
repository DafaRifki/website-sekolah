import { Router } from "express";
import {
  createTahunAjaran,
  getAllTahunAjaran,
  getTahunAjaranById,
  updateTahunAjaran,
} from "../controllers/tahunAjaranController.js";

const router = Router();

router.get("/", getAllTahunAjaran);
router.get("/:id", getTahunAjaranById);
router.post("/", createTahunAjaran);
router.patch("/:id", updateTahunAjaran);

export default router;
