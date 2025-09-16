import { Router } from "express";
import { getAllPendaftaran } from "../controllers/pendaftaranController.js";

const router = Router();

router.get("/", getAllPendaftaran);

export default router;
