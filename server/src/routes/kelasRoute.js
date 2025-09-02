import { Router } from "express";
import { getAllKelas } from "../controllers/kelasController.js";

const router = Router();

router.get("/", getAllKelas);

export default router;
