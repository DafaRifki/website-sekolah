import { Router } from "express";
import { getAllSiswa } from "../controllers/siswaController.js";

const router = Router();

router.get("/", getAllSiswa);

export default router;
