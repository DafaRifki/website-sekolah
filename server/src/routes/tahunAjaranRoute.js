import { Router } from "express";
import {
  addManyKelasToTahunAjaran,
  bulkUpdateKelasTahunAjaran,
  createTahunAjaran,
  deleteKelasFromTahunAjaran,
  deleteTahunAjaran,
  getAllTahunAjaran,
  getTahunAjaranById,
  updateTahunAjaran,
} from "../controllers/tahunAjaranController.js";

const router = Router();

router.get("/", getAllTahunAjaran);
router.get("/:id", getTahunAjaranById);
router.post("/", createTahunAjaran);
router.patch("/:id", updateTahunAjaran);
// DELETE /api/tahun-ajaran/:tahunAjaranId
router.delete("/:tahunAjaranId", deleteTahunAjaran);
// DELETE /tahun-ajaran/:tahunAjaranId/kelas/:kelasId
router.delete("/:tahunAjaranId/kelas/:kelasId", deleteKelasFromTahunAjaran);

router.post("/kelas/bulk", addManyKelasToTahunAjaran);
router.put("/kelas/bulk-update", bulkUpdateKelasTahunAjaran);

export default router;
