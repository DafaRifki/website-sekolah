// src/validations/rapor.validation.ts
import Joi from "joi";

// ============================================================================
// WALI KELAS VALIDATIONS
// ============================================================================

/**
 * Validation for GET /api/rapor (query params)
 */
export const getRaporListSchema = Joi.object({
  tahunId: Joi.number().integer().positive().required().messages({
    "number.base": "tahunId harus berupa angka",
    "number.positive": "tahunId harus positif",
    "any.required": "tahunId wajib diisi",
  }),
  kelasId: Joi.number().integer().positive().required().messages({
    "number.base": "kelasId harus berupa angka",
    "number.positive": "kelasId harus positif",
    "any.required": "kelasId wajib diisi",
  }),
  semester: Joi.string().valid("1", "2").required().messages({
    "string.base": "semester harus berupa string",
    "any.only": 'semester harus "1" atau "2"',
    "any.required": "semester wajib diisi",
  }),
});

/**
 * Validation for POST /api/rapor/generate-bulk
 */
export const generateBulkSchema = Joi.object({
  tahunId: Joi.number().integer().positive().required().messages({
    "number.base": "tahunId harus berupa angka",
    "number.positive": "tahunId harus positif",
    "any.required": "tahunId wajib diisi",
  }),
  kelasId: Joi.number().integer().positive().required().messages({
    "number.base": "kelasId harus berupa angka",
    "number.positive": "kelasId harus positif",
    "any.required": "kelasId wajib diisi",
  }),
  semester: Joi.string().valid("1", "2").required().messages({
    "string.base": "semester harus berupa string",
    "any.only": 'semester harus "1" atau "2"',
    "any.required": "semester wajib diisi",
  }),
});

/**
 * Validation for POST /api/rapor/generate-single
 */
export const generateSingleSchema = Joi.object({
  id_siswa: Joi.number().integer().positive().required().messages({
    "number.base": "id_siswa harus berupa angka",
    "number.positive": "id_siswa harus positif",
    "any.required": "id_siswa wajib diisi",
  }),
  tahunId: Joi.number().integer().positive().required().messages({
    "number.base": "tahunId harus berupa angka",
    "number.positive": "tahunId harus positif",
    "any.required": "tahunId wajib diisi",
  }),
  semester: Joi.string().valid("1", "2").required().messages({
    "string.base": "semester harus berupa string",
    "any.only": 'semester harus "1" atau "2"',
    "any.required": "semester wajib diisi",
  }),
});

/**
 * Validation for PUT /api/rapor/:id/catatan
 */
export const updateCatatanSchema = Joi.object({
  catatanWaliKelas: Joi.string().max(5000).allow("", null).optional().messages({
    "string.max": "catatanWaliKelas maksimal 5000 karakter",
  }),
  sikapSpritual: Joi.string()
    .valid("A", "B", "C", "D")
    .allow(null)
    .optional()
    .messages({
      "any.only": "sikapSpritual harus A, B, C, atau D",
    }),
  sikapSosial: Joi.string()
    .valid("A", "B", "C", "D")
    .allow(null)
    .optional()
    .messages({
      "any.only": "sikapSosial harus A, B, C, atau D",
    }),
  deskripsiSpritual: Joi.string()
    .max(1000)
    .allow("", null)
    .optional()
    .messages({
      "string.max": "deskripsiSpritual maksimal 1000 karakter",
    }),
  deskripsiSosial: Joi.string().max(1000).allow("", null).optional().messages({
    "string.max": "deskripsiSosial maksimal 1000 karakter",
  }),
  ekstrakurikuler: Joi.array()
    .items(
      Joi.object({
        nama: Joi.string().required().messages({
          "any.required": "Nama ekstrakurikuler wajib diisi",
        }),
        nilai: Joi.string().valid("A", "B", "C").required().messages({
          "any.only": "Nilai ekstrakurikuler harus A, B, atau C",
          "any.required": "Nilai ekstrakurikuler wajib diisi",
        }),
        keterangan: Joi.string().allow("", null).optional(),
      }),
    )
    .optional(),
  prestasi: Joi.array()
    .items(
      Joi.object({
        nama: Joi.string().required().messages({
          "any.required": "Nama prestasi wajib diisi",
        }),
        tingkat: Joi.string()
          .valid(
            "Sekolah",
            "Kecamatan",
            "Kabupaten",
            "Provinsi",
            "Nasional",
            "Internasional",
          )
          .required()
          .messages({
            "any.only":
              "Tingkat harus Sekolah, Kecamatan, Kabupaten, Provinsi, Nasional, atau Internasional",
            "any.required": "Tingkat prestasi wajib diisi",
          }),
        keterangan: Joi.string().allow("", null).optional(),
      }),
    )
    .optional(),
  naik: Joi.boolean().optional(),
  kelas: Joi.string().max(50).allow("", null).optional().messages({
    "string.max": "Nama kelas maksimal 50 karakter",
  }),
});

/**
 * Validation for GET /api/rapor/statistics (query params)
 */
export const getRaporStatisticsSchema = Joi.object({
  kelasId: Joi.number().integer().positive().optional().messages({
    "number.base": "kelasId harus berupa angka",
    "number.positive": "kelasId harus positif",
  }),
  tahunId: Joi.number().integer().positive().optional().messages({
    "number.base": "tahunId harus berupa angka",
    "number.positive": "tahunId harus positif",
  }),
});

// ============================================================================
// GURU MAPEL VALIDATIONS
// ============================================================================

/**
 * Validation for GET /api/rapor/guru/mapel (query params)
 */
export const getMapelByGuruSchema = Joi.object({
  tahunId: Joi.number().integer().positive().required().messages({
    "number.base": "tahunId harus berupa angka",
    "number.positive": "tahunId harus positif",
    "any.required": "tahunId wajib diisi",
  }),
});

/**
 * Validation for GET /api/rapor/guru/siswa (query params)
 */
export const getSiswaForNilaiSchema = Joi.object({
  kelasId: Joi.number().integer().positive().required().messages({
    "number.base": "kelasId harus berupa angka",
    "number.positive": "kelasId harus positif",
    "any.required": "kelasId wajib diisi",
  }),
  mapelId: Joi.number().integer().positive().required().messages({
    "number.base": "mapelId harus berupa angka",
    "number.positive": "mapelId harus positif",
    "any.required": "mapelId wajib diisi",
  }),
  tahunId: Joi.number().integer().positive().required().messages({
    "number.base": "tahunId harus berupa angka",
    "number.positive": "tahunId harus positif",
    "any.required": "tahunId wajib diisi",
  }),
});

/**
 * Validation for POST /api/rapor/guru/nilai
 */
export const inputNilaiSchema = Joi.object({
  id_siswa: Joi.number().integer().positive().required().messages({
    "number.base": "id_siswa harus berupa angka",
    "number.positive": "id_siswa harus positif",
    "any.required": "id_siswa wajib diisi",
  }),
  id_mapel: Joi.number().integer().positive().required().messages({
    "number.base": "id_mapel harus berupa angka",
    "number.positive": "id_mapel harus positif",
    "any.required": "id_mapel wajib diisi",
  }),
  tahunAjaranId: Joi.number().integer().positive().required().messages({
    "number.base": "tahunAjaranId harus berupa angka",
    "number.positive": "tahunAjaranId harus positif",
    "any.required": "tahunAjaranId wajib diisi",
  }),
  semester: Joi.string().valid("1", "2").required().messages({
    "string.base": "semester harus berupa string",
    "any.only": 'semester harus "1" atau "2"',
    "any.required": "semester wajib diisi",
  }),
  // Option 1: Input nilai final langsung
  nilai: Joi.number().min(0).max(100).optional().messages({
    "number.base": "nilai harus berupa angka",
    "number.min": "nilai minimal 0",
    "number.max": "nilai maksimal 100",
  }),
  // Option 2: Input breakdown nilai (akan di-calculate otomatis)
  nilaiTugas: Joi.number().min(0).max(100).optional().messages({
    "number.base": "nilaiTugas harus berupa angka",
    "number.min": "nilaiTugas minimal 0",
    "number.max": "nilaiTugas maksimal 100",
  }),
  nilaiUTS: Joi.number().min(0).max(100).optional().messages({
    "number.base": "nilaiUTS harus berupa angka",
    "number.min": "nilaiUTS minimal 0",
    "number.max": "nilaiUTS maksimal 100",
  }),
  nilaiUAS: Joi.number().min(0).max(100).optional().messages({
    "number.base": "nilaiUAS harus berupa angka",
    "number.min": "nilaiUAS minimal 0",
    "number.max": "nilaiUAS maksimal 100",
  }),
})
  .or("nilai", "nilaiTugas", "nilaiUTS", "nilaiUAS")
  .messages({
    "object.missing":
      "Harus mengisi nilai final ATAU breakdown nilai (nilaiTugas, nilaiUTS, nilaiUAS)",
  });

/**
 * Validation for POST /api/rapor/guru/nilai-bulk
 */
export const inputNilaiBulkSchema = Joi.object({
  kelasId: Joi.number().integer().positive().required().messages({
    "number.base": "kelasId harus berupa angka",
    "number.positive": "kelasId harus positif",
    "any.required": "kelasId wajib diisi",
  }),
  mapelId: Joi.number().integer().positive().required().messages({
    "number.base": "mapelId harus berupa angka",
    "number.positive": "mapelId harus positif",
    "any.required": "mapelId wajib diisi",
  }),
  tahunAjaranId: Joi.number().integer().positive().required().messages({
    "number.base": "tahunAjaranId harus berupa angka",
    "number.positive": "tahunAjaranId harus positif",
    "any.required": "tahunAjaranId wajib diisi",
  }),
  semester: Joi.string().valid("1", "2").required().messages({
    "string.base": "semester harus berupa string",
    "any.only": 'semester harus "1" atau "2"',
    "any.required": "semester wajib diisi",
  }),
  nilaiList: Joi.array()
    .items(
      Joi.object({
        id_siswa: Joi.number().integer().positive().required().messages({
          "number.base": "id_siswa harus berupa angka",
          "number.positive": "id_siswa harus positif",
          "any.required": "id_siswa wajib diisi",
        }),
        nilai: Joi.number().min(0).max(100).optional(),
        nilaiTugas: Joi.number().min(0).max(100).optional(),
        nilaiUTS: Joi.number().min(0).max(100).optional(),
        nilaiUAS: Joi.number().min(0).max(100).optional(),
      }).or("nilai", "nilaiTugas", "nilaiUTS", "nilaiUAS"),
    )
    .min(1)
    .required()
    .messages({
      "array.min": "nilaiList minimal harus ada 1 siswa",
      "any.required": "nilaiList wajib diisi",
    }),
});

/**
 * Validation for GET /api/rapor/guru/statistics (query params)
 */
export const getNilaiStatisticsSchema = Joi.object({
  tahunId: Joi.number().integer().positive().required().messages({
    "number.base": "tahunId harus berupa angka",
    "number.positive": "tahunId harus positif",
    "any.required": "tahunId wajib diisi",
  }),
  semester: Joi.string().valid("1", "2").required().messages({
    "string.base": "semester harus berupa string",
    "any.only": 'semester harus "1" atau "2"',
    "any.required": "semester wajib diisi",
  }),
});

// ============================================================================
// PARAMS VALIDATION
// ============================================================================

/**
 * Validation for route params with :id
 */
export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "id harus berupa angka",
    "number.positive": "id harus positif",
    "any.required": "id wajib diisi",
  }),
});

/**
 * Validation for PUT /api/rapor/guru/nilai/:id
 */
export const updateNilaiSchema = Joi.object({
  nilai: Joi.number().min(0).max(100).optional().messages({
    "number.base": "nilai harus berupa angka",
    "number.min": "nilai minimal 0",
    "number.max": "nilai maksimal 100",
  }),
  nilaiTugas: Joi.number().min(0).max(100).optional().messages({
    "number.base": "nilaiTugas harus berupa angka",
    "number.min": "nilaiTugas minimal 0",
    "number.max": "nilaiTugas maksimal 100",
  }),
  nilaiUTS: Joi.number().min(0).max(100).optional().messages({
    "number.base": "nilaiUTS harus berupa angka",
    "number.min": "nilaiUTS minimal 0",
    "number.max": "nilaiUTS maksimal 100",
  }),
  nilaiUAS: Joi.number().min(0).max(100).optional().messages({
    "number.base": "nilaiUAS harus berupa angka",
    "number.min": "nilaiUAS minimal 0",
    "number.max": "nilaiUAS maksimal 100",
  }),
})
  .min(1)
  .messages({
    "object.min": "Minimal satu field nilai harus diisi",
  });

/**
 * Validation for DELETE /api/rapor/guru/nilai/:id (params)
 */
export const deleteNilaiParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "id harus berupa angka",
    "number.positive": "id harus positif",
    "any.required": "id wajib diisi",
  }),
});
