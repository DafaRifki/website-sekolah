import { Router } from "express";
import {
  createKelas,
  deleteKelas,
  getAllKelas,
  getKelasById,
  updateKelas,
} from "../controllers/kelasController.js";

const router = Router();

router.get("/", getAllKelas);
router.get("/:id", getKelasById);
router.post("/", createKelas);
router.patch("/:id", updateKelas);
router.delete("/:id", deleteKelas);

export default router;
