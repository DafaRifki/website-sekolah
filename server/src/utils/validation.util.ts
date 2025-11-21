import Joi from "joi";

export const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Format email tidak valid",
    "any.required": "Email wajib diisi",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password minimal 6 karakter",
    "any.required": "Password wajib diisi",
  }),
});

export const registerValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("GURU", "SISWA").optional(),
});

export const paginationValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid("asc", "desc").default("asc"),
});

// Guru validation
export const guruValidation = Joi.object({
  nip: Joi.string().required().messages({
    "any.required": "NIP wajib diisi",
    "string.empty": "NIP tidak boleh kosong",
  }),
  nama: Joi.string().required().messages({
    "any.required": "Nama guru wajib diisi",
    "string.empty": "Nama guru tidak boleh kosong",
  }),
  jenisKelamin: Joi.string().valid("L", "P").optional().messages({
    "any.only": "Jenis kelamin harus L atau P",
  }),
  alamat: Joi.string().optional().allow(""),
  noHP: Joi.string().required().messages({
    "any.required": "Nomor HP wajib diisi",
    "string.empty": "Nomor HP tidak boleh kosong",
  }),
  email: Joi.string().email().optional().allow("").messages({
    "string.email": "Format email tidak valid",
  }),
  jabatan: Joi.string().optional().allow(""),
});

export const updateGuruValidation = Joi.object({
  nip: Joi.string().optional(),
  nama: Joi.string().optional(),
  jenisKelamin: Joi.string().valid("L", "P").optional().messages({
    "any.only": "Jenis kelamin harus L atau P",
  }),
  alamat: Joi.string().optional().allow(""),
  noHP: Joi.string().optional(),
  email: Joi.string().email().optional().allow("").messages({
    "string.email": "Format email tidak valid",
  }),
  jabatan: Joi.string().optional().allow(""),
})
  .min(1)
  .messages({
    "object.min": "Minimal satu field harus diisi",
  });

// Siswa validation
export const siswaValidation = Joi.object({
  nama: Joi.string().required().messages({
    "any.required": "Nama siswa wajib diisi",
    "string.empty": "Nama siswa tidak boleh kosong",
  }),
  alamat: Joi.string().optional().allow(""),
  tanggalLahir: Joi.date().iso().optional().allow(null),
  jenisKelamin: Joi.string().valid("L", "P").optional().messages({
    "any.only": "Jenis kelamin harus L atau P",
  }),
  kelasId: Joi.number().integer().optional().allow(null),
});

export const updateSiswaValidation = Joi.object({
  nama: Joi.string().optional(),
  alamat: Joi.string().optional().allow(""),
  tanggalLahir: Joi.date().iso().optional().allow(null),
  jenisKelamin: Joi.string().valid("L", "P").optional(),
  kelasId: Joi.number().integer().optional().allow(null),
}).min(1);

export const changePasswordValidation = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "string.min": "New password must be at least 6 characters long",
    "any.required": "New password is required",
  }),
});

export const refreshTokenValidation = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Refresh token is required",
  }),
});

// Add these validations
export const createUserValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Format email tidak valid",
    "any.required": "Email wajib diisi",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password minimal 6 karakter",
    "any.required": "Password wajib diisi",
  }),
  role: Joi.string().valid("ADMIN", "GURU", "SISWA").required().messages({
    "any.only": "Role harus ADMIN, GURU, atau SISWA",
    "any.required": "Role wajib diisi",
  }),
  guruId: Joi.number().integer().optional(),
  siswaId: Joi.number().integer().optional(),
});

export const updateUserValidation = Joi.object({
  email: Joi.string().email().optional(),
  role: Joi.string().valid("ADMIN", "GURU", "SISWA").optional(),
  guruId: Joi.number().integer().optional(),
  siswaId: Joi.number().integer().optional(),
});

export const resetPasswordValidation = Joi.object({
  newPassword: Joi.string().min(6).required().messages({
    "string.min": "Password minimal 6 karakter",
    "any.required": "Password baru wajib diisi",
  }),
});

export const tahunAjaranValidation = Joi.object({
  namaTahun: Joi.string().required().messages({
    "any.required": "Nama tahun ajaran wajib diisi",
  }),
  startDate: Joi.date().iso().required().messages({
    "any.required": "Tanggal mulai wajib diisi",
    "date.format": "Format tanggal tidak valid",
  }),
  endDate: Joi.date().iso().greater(Joi.ref("startDate")).required().messages({
    "any.required": "Tanggal selesai wajib diisi",
    "date.greater": "Tanggal selesai harus setelah tanggal mulai",
  }),
  semester: Joi.number().integer().valid(1, 2).required().messages({
    "any.required": "Semester wajib diisi",
    "any.only": "Semester harus 1 atau 2",
  }),
  isActive: Joi.boolean().optional().default(false),
});

export const updateTahunAjaranValidation = Joi.object({
  namaTahun: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  semester: Joi.number().integer().valid(1, 2).optional(),
  isActive: Joi.boolean().optional(),
});

export const pendaftaranValidation = Joi.object({
  // Informasi Pendaftaran
  unitPendidikan: Joi.string().optional().allow(""),
  jenisPendaftaran: Joi.string().optional().allow(""),
  noIndukPesertaDidik: Joi.string().optional().allow(""),
  jurusan: Joi.string().optional().allow(""),
  tanggalPendaftaran: Joi.date().iso().optional().allow(null),

  // Data Siswa - Identitas (REQUIRED)
  nama: Joi.string().required().messages({
    "any.required": "Nama wajib diisi",
    "string.empty": "Nama tidak boleh kosong",
  }),
  jenisKelamin: Joi.string().valid("L", "P").optional().allow(""),
  nisn: Joi.string().optional().allow(""),
  nik: Joi.string().optional().allow(""),
  noKK: Joi.string().optional().allow(""),
  tempatLahir: Joi.string().optional().allow(""),
  tanggalLahir: Joi.date().iso().optional().allow(null),
  agama: Joi.string().optional().allow(""),

  // Data Siswa - Alamat & Kontak
  alamat: Joi.string().optional().allow(""),
  noHandphonAktif: Joi.string().optional().allow(""),
  tempatTinggal: Joi.string().optional().allow(""),
  transportasi: Joi.string().optional().allow(""),

  // Data Siswa - Keluarga
  anakKe: Joi.string().optional().allow(""),
  penerimaKIP: Joi.string().optional().allow(""),
  noKIP: Joi.string().optional().allow(""),

  // Data Ayah
  namaAyah: Joi.string().optional().allow(""),
  nikAyah: Joi.string().optional().allow(""),
  tempatLahirAyah: Joi.string().optional().allow(""),
  tanggalLahirAyah: Joi.date().iso().optional().allow(null),
  pendidikanAyah: Joi.string().optional().allow(""),
  noHPAyah: Joi.string().optional().allow(""),
  pekerjaanAyah: Joi.string().optional().allow(""),
  penghasilanAyah: Joi.string().optional().allow(""),

  // Data Ibu
  namaIbu: Joi.string().optional().allow(""),
  nikIbu: Joi.string().optional().allow(""),
  tempatLahirIbu: Joi.string().optional().allow(""),
  tanggalLahirIbu: Joi.date().iso().optional().allow(null),
  pendidikanIbu: Joi.string().optional().allow(""),
  noHPIbu: Joi.string().optional().allow(""),
  pekerjaanIbu: Joi.string().optional().allow(""),
  penghasilanIbu: Joi.string().optional().allow(""),

  // Data Wali
  namaWali: Joi.string().optional().allow(""),
  nikWali: Joi.string().optional().allow(""),
  tempatLahirWali: Joi.string().optional().allow(""),
  tanggalLahirWali: Joi.date().iso().optional().allow(null),
  pendidikanWali: Joi.string().optional().allow(""),
  noWali: Joi.string().optional().allow(""),
  pekerjaanWali: Joi.string().optional().allow(""),
  penghasilanWali: Joi.string().optional().allow(""),

  // Data Fisik & Lainnya
  tinggiBadan: Joi.string().optional().allow(""),
  beratBadan: Joi.string().optional().allow(""),
  jarakSekolah: Joi.string().optional().allow(""),
  waktuTempuh: Joi.string().optional().allow(""),
  jumlahSaudara: Joi.string().optional().allow(""),

  // Dokumen
  ijazah: Joi.string().optional().allow(""),
  skhun: Joi.string().optional().allow(""),
  kartuKeluarga: Joi.string().optional().allow(""),
  aktaKelahiran: Joi.string().optional().allow(""),
  ktpOrangTua: Joi.string().optional().allow(""),

  // Contact & Asal
  email: Joi.string().email().optional().allow(""),
  noHp: Joi.string().optional().allow(""),
  asalSekolah: Joi.string().optional().allow(""),

  // Required System
  tahunAjaranId: Joi.number().integer().required().messages({
    "any.required": "Tahun ajaran wajib dipilih",
    "number.base": "Tahun ajaran harus berupa angka",
  }),
});

export const updatePendaftaranValidation = Joi.object({
  // Informasi Pendaftaran
  unitPendidikan: Joi.string().optional().allow(""),
  jenisPendaftaran: Joi.string().optional().allow(""),
  noIndukPesertaDidik: Joi.string().optional().allow(""),
  jurusan: Joi.string().optional().allow(""),
  tanggalPendaftaran: Joi.date().iso().optional().allow(null),

  // Data Siswa - Identitas
  nama: Joi.string().optional(),
  jenisKelamin: Joi.string().valid("L", "P").optional().allow(""),
  nisn: Joi.string().optional().allow(""),
  nik: Joi.string().optional().allow(""),
  noKK: Joi.string().optional().allow(""),
  tempatLahir: Joi.string().optional().allow(""),
  tanggalLahir: Joi.date().iso().optional().allow(null),
  agama: Joi.string().optional().allow(""),

  // Data Siswa - Alamat & Kontak
  alamat: Joi.string().optional().allow(""),
  noHandphonAktif: Joi.string().optional().allow(""),
  tempatTinggal: Joi.string().optional().allow(""),
  transportasi: Joi.string().optional().allow(""),

  // Data Siswa - Keluarga
  anakKe: Joi.string().optional().allow(""),
  penerimaKIP: Joi.string().optional().allow(""),
  noKIP: Joi.string().optional().allow(""),

  // Data Ayah
  namaAyah: Joi.string().optional().allow(""),
  nikAyah: Joi.string().optional().allow(""),
  tempatLahirAyah: Joi.string().optional().allow(""),
  tanggalLahirAyah: Joi.date().iso().optional().allow(null),
  pendidikanAyah: Joi.string().optional().allow(""),
  noHPAyah: Joi.string().optional().allow(""),
  pekerjaanAyah: Joi.string().optional().allow(""),
  penghasilanAyah: Joi.string().optional().allow(""),

  // Data Ibu
  namaIbu: Joi.string().optional().allow(""),
  nikIbu: Joi.string().optional().allow(""),
  tempatLahirIbu: Joi.string().optional().allow(""),
  tanggalLahirIbu: Joi.date().iso().optional().allow(null),
  pendidikanIbu: Joi.string().optional().allow(""),
  noHPIbu: Joi.string().optional().allow(""),
  pekerjaanIbu: Joi.string().optional().allow(""),
  penghasilanIbu: Joi.string().optional().allow(""),

  // Data Wali
  namaWali: Joi.string().optional().allow(""),
  nikWali: Joi.string().optional().allow(""),
  tempatLahirWali: Joi.string().optional().allow(""),
  tanggalLahirWali: Joi.date().iso().optional().allow(null),
  pendidikanWali: Joi.string().optional().allow(""),
  noWali: Joi.string().optional().allow(""),
  pekerjaanWali: Joi.string().optional().allow(""),
  penghasilanWali: Joi.string().optional().allow(""),

  // Data Fisik & Lainnya
  tinggiBadan: Joi.string().optional().allow(""),
  beratBadan: Joi.string().optional().allow(""),
  jarakSekolah: Joi.string().optional().allow(""),
  waktuTempuh: Joi.string().optional().allow(""),
  jumlahSaudara: Joi.string().optional().allow(""),

  // Dokumen
  ijazah: Joi.string().optional().allow(""),
  skhun: Joi.string().optional().allow(""),
  kartuKeluarga: Joi.string().optional().allow(""),
  aktaKelahiran: Joi.string().optional().allow(""),
  ktpOrangTua: Joi.string().optional().allow(""),

  // Contact & Asal
  email: Joi.string().email().optional().allow(""),
  noHp: Joi.string().optional().allow(""),
  asalSekolah: Joi.string().optional().allow(""),

  // Status (untuk update oleh admin)
  statusDokumen: Joi.string()
    .valid("BELUM_DITERIMA", "LENGKAP", "KURANG")
    .optional(),
  statusPembayaran: Joi.string()
    .valid("BELUM_BAYAR", "LUNAS", "CICIL")
    .optional(),
}).min(1);

// Validation untuk import CSV
export const importPendaftaranValidation = Joi.object({
  tahunAjaranId: Joi.number().integer().required().messages({
    "any.required": "Tahun ajaran ID wajib diisi",
    "number.base": "Tahun ajaran ID harus berupa angka",
  }),
});

// Validation untuk reject pendaftaran
export const rejectPendaftaranValidation = Joi.object({
  reason: Joi.string().optional().allow(""),
});

// Kelas validation
export const kelasValidation = Joi.object({
  namaKelas: Joi.string().required().messages({
    "any.required": "Nama kelas wajib diisi",
    "string.empty": "Nama kelas tidak boleh kosong",
  }),
  tingkat: Joi.string().required().messages({
    "any.required": "Tingkat wajib diisi",
    "string.empty": "Tingkat tidak boleh kosong",
  }),
  waliId: Joi.number().integer().optional().allow(null).messages({
    "number.base": "Wali kelas harus berupa angka",
  }),
  tahunAjaranId: Joi.number().integer().optional().messages({
    "number.base": "Tahun ajaran ID harus berupa angka",
  }),
});

export const updateKelasValidation = Joi.object({
  namaKelas: Joi.string().optional(),
  tingkat: Joi.string().optional(),
  waliId: Joi.number().integer().optional().allow(null),
})
  .min(1)
  .messages({
    "object.min": "Minimal satu field harus diisi",
  });

export const assignSiswaValidation = Joi.object({
  siswaIds: Joi.array()
    .items(Joi.number().integer())
    .min(1)
    .required()
    .messages({
      "array.base": "siswaIds harus berupa array",
      "array.min": "Minimal satu siswa harus dipilih",
      "any.required": "siswaIds wajib diisi",
    }),
});

// Mata Pelajaran validation
export const mataPelajaranValidation = Joi.object({
  namaMapel: Joi.string().required().messages({
    "any.required": "Nama mata pelajaran wajib diisi",
    "string.empty": "Nama mata pelajaran tidak boleh kosong",
  }),
  kelompokMapel: Joi.string().optional().allow("").messages({
    "string.base": "Kelompok mata pelajaran harus berupa text",
  }),
});

export const updateMataPelajaranValidation = Joi.object({
  namaMapel: Joi.string().optional(),
  kelompokMapel: Joi.string().optional().allow(""),
})
  .min(1)
  .messages({
    "object.min": "Minimal satu field harus diisi",
  });

// Orang Tua validation
export const orangTuaValidation = Joi.object({
  nama: Joi.string().required().messages({
    "any.required": "Nama orang tua wajib diisi",
    "string.empty": "Nama orang tua tidak boleh kosong",
  }),
  hubungan: Joi.string().required().messages({
    "any.required": "Hubungan wajib diisi",
    "string.empty": "Hubungan tidak boleh kosong",
  }),
  pekerjaan: Joi.string().required().messages({
    "any.required": "Pekerjaan wajib diisi",
    "string.empty": "Pekerjaan tidak boleh kosong",
  }),
  alamat: Joi.string().required().messages({
    "any.required": "Alamat wajib diisi",
    "string.empty": "Alamat tidak boleh kosong",
  }),
  noHp: Joi.string().required().messages({
    "any.required": "Nomor HP wajib diisi",
    "string.empty": "Nomor HP tidak boleh kosong",
  }),
});

export const updateOrangTuaValidation = Joi.object({
  nama: Joi.string().optional(),
  hubungan: Joi.string().optional(),
  pekerjaan: Joi.string().optional(),
  alamat: Joi.string().optional(),
  noHp: Joi.string().optional(),
})
  .min(1)
  .messages({
    "object.min": "Minimal satu field harus diisi",
  });

export const linkSiswaValidation = Joi.object({
  siswaId: Joi.number().integer().required().messages({
    "any.required": "siswaId wajib diisi",
    "number.base": "siswaId harus berupa angka",
  }),
  status: Joi.string().optional().default("Aktif"),
});

// Nilai validation
export const nilaiValidation = Joi.object({
  id_siswa: Joi.number().integer().required().messages({
    "any.required": "ID siswa wajib diisi",
    "number.base": "ID siswa harus berupa angka",
  }),
  id_mapel: Joi.number().integer().required().messages({
    "any.required": "ID mata pelajaran wajib diisi",
    "number.base": "ID mata pelajaran harus berupa angka",
  }),
  tahunAjaranId: Joi.number().integer().required().messages({
    "any.required": "ID tahun ajaran wajib diisi",
    "number.base": "ID tahun ajaran harus berupa angka",
  }),
  semester: Joi.string().valid("1", "2").required().messages({
    "any.required": "Semester wajib diisi",
    "any.only": "Semester harus 1 atau 2",
  }),
  nilai: Joi.number().integer().min(0).max(100).required().messages({
    "any.required": "Nilai wajib diisi",
    "number.base": "Nilai harus berupa angka",
    "number.min": "Nilai minimal 0",
    "number.max": "Nilai maksimal 100",
  }),
});

export const updateNilaiValidation = Joi.object({
  nilai: Joi.number().integer().min(0).max(100).required().messages({
    "any.required": "Nilai wajib diisi",
    "number.base": "Nilai harus berupa angka",
    "number.min": "Nilai minimal 0",
    "number.max": "Nilai maksimal 100",
  }),
});

export const bulkNilaiValidation = Joi.object({
  kelasId: Joi.number().integer().required().messages({
    "any.required": "ID kelas wajib diisi",
    "number.base": "ID kelas harus berupa angka",
  }),
  id_mapel: Joi.number().integer().required().messages({
    "any.required": "ID mata pelajaran wajib diisi",
    "number.base": "ID mata pelajaran harus berupa angka",
  }),
  tahunAjaranId: Joi.number().integer().required().messages({
    "any.required": "ID tahun ajaran wajib diisi",
    "number.base": "ID tahun ajaran harus berupa angka",
  }),
  semester: Joi.string().valid("1", "2").required().messages({
    "any.required": "Semester wajib diisi",
    "any.only": "Semester harus 1 atau 2",
  }),
  nilaiData: Joi.array()
    .items(
      Joi.object({
        id_siswa: Joi.number().integer().required(),
        nilai: Joi.number().integer().min(0).max(100).required(),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "nilaiData harus berupa array",
      "array.min": "Minimal harus ada 1 siswa",
      "any.required": "nilaiData wajib diisi",
    }),
});

// Absensi validation
export const absensiValidation = Joi.object({
  id_siswa: Joi.number().integer().required().messages({
    "any.required": "ID siswa wajib diisi",
    "number.base": "ID siswa harus berupa angka",
  }),
  tanggal: Joi.date().iso().required().messages({
    "any.required": "Tanggal wajib diisi",
    "date.format": "Format tanggal tidak valid",
  }),
  status: Joi.string()
    .valid("HADIR", "SAKIT", "IZIN", "TIDAK_HADIR")
    .required()
    .messages({
      "any.required": "Status wajib diisi",
      "any.only": "Status harus HADIR, SAKIT, IZIN, atau TIDAK_HADIR",
    }),
  keterangan: Joi.string().optional().allow(""),
  id_tahun: Joi.number().integer().required().messages({
    "any.required": "ID tahun ajaran wajib diisi",
    "number.base": "ID tahun ajaran harus berupa angka",
  }),
});

export const updateAbsensiValidation = Joi.object({
  status: Joi.string()
    .valid("HADIR", "SAKIT", "IZIN", "TIDAK_HADIR")
    .optional()
    .messages({
      "any.only": "Status harus HADIR, SAKIT, IZIN, atau TIDAK_HADIR",
    }),
  keterangan: Joi.string().optional().allow(""),
})
  .min(1)
  .messages({
    "object.min": "Minimal satu field harus diisi",
  });

export const bulkAbsensiValidation = Joi.object({
  kelasId: Joi.number().integer().required().messages({
    "any.required": "ID kelas wajib diisi",
    "number.base": "ID kelas harus berupa angka",
  }),
  tanggal: Joi.date().iso().required().messages({
    "any.required": "Tanggal wajib diisi",
    "date.format": "Format tanggal tidak valid",
  }),
  id_tahun: Joi.number().integer().required().messages({
    "any.required": "ID tahun ajaran wajib diisi",
    "number.base": "ID tahun ajaran harus berupa angka",
  }),
  absensiData: Joi.array()
    .items(
      Joi.object({
        id_siswa: Joi.number().integer().required(),
        status: Joi.string()
          .valid("HADIR", "SAKIT", "IZIN", "TIDAK_HADIR")
          .required(),
        keterangan: Joi.string().optional().allow(""),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "absensiData harus berupa array",
      "array.min": "Minimal harus ada 1 siswa",
      "any.required": "absensiData wajib diisi",
    }),
});

// Tarif Pembayaran validation
export const tarifPembayaranValidation = Joi.object({
  namaTagihan: Joi.string().required().messages({
    "any.required": "Jenis pembayaran wajib diisi",
    "string.empty": "Jenis pembayaran tidak boleh kosong",
  }),
  nominal: Joi.number().integer().min(0).required().messages({
    "any.required": "Nominal wajib diisi",
    "number.base": "Nominal harus berupa angka",
    "number.min": "Nominal tidak boleh negatif",
  }),
  keterangan: Joi.string().allow("", null).optional(),
  tahunAjaranId: Joi.number().integer().required().messages({
    "any.required": "Tahun ajaran wajib diisi",
    "number.base": "Tahun ajaran harus berupa angka",
  }),
});

export const updateTarifPembayaranValidation = Joi.object({
  namaTagihan: Joi.string().optional(),
  nominal: Joi.number().integer().min(0).optional(),
  keterangan: Joi.string().allow("", null).optional(),
  tahunAjaranId: Joi.number().integer().optional(),
}).min(1);

/**
 * Validation for creating single tagihan
 * POST /api/tagihan
 */
export const tagihanValidation = Joi.object({
  id_siswa: Joi.number().integer().required().messages({
    "any.required": "ID siswa wajib diisi",
    "number.base": "ID siswa harus berupa angka",
    "number.integer": "ID siswa harus berupa angka bulat",
  }),
  tarifId: Joi.number().integer().required().messages({
    "any.required": "ID tarif wajib diisi",
    "number.base": "ID tarif harus berupa angka",
    "number.integer": "ID tarif harus berupa angka bulat",
  }),
  tahunAjaranId: Joi.number().integer().required().messages({
    "any.required": "Tahun ajaran wajib diisi",
    "number.base": "Tahun ajaran harus berupa angka",
    "number.integer": "Tahun ajaran harus berupa angka bulat",
  }),
  bulan: Joi.string().allow("", null).optional().messages({
    "string.base": "Bulan harus berupa teks",
  }),
  status: Joi.string()
    .valid("BELUM_BAYAR", "LUNAS", "CICIL")
    .optional()
    .default("BELUM_BAYAR")
    .messages({
      "any.only": "Status harus salah satu dari: BELUM_BAYAR, LUNAS, CICIL",
      "string.base": "Status harus berupa teks",
    }),
});

/**
 * Validation for generating bulk tagihan
 * POST /api/tagihan/generate-bulk
 */
export const generateBulkTagihanValidation = Joi.object({
  tarifId: Joi.number().integer().required().messages({
    "any.required": "ID tarif wajib diisi",
    "number.base": "ID tarif harus berupa angka",
    "number.integer": "ID tarif harus berupa angka bulat",
  }),
  tahunAjaranId: Joi.number().integer().required().messages({
    "any.required": "Tahun ajaran wajib diisi",
    "number.base": "Tahun ajaran harus berupa angka",
    "number.integer": "Tahun ajaran harus berupa angka bulat",
  }),
  bulan: Joi.string().allow("", null).optional().messages({
    "string.base": "Bulan harus berupa teks",
  }),
  siswaIds: Joi.array().items(Joi.number().integer()).optional().messages({
    "array.base": "Siswa IDs harus berupa array",
    "number.base": "Setiap siswa ID harus berupa angka",
    "number.integer": "Setiap siswa ID harus berupa angka bulat",
  }),
});

/**
 * Validation for updating tagihan status
 * PUT /api/tagihan/:id/status
 */
export const updateStatusTagihanValidation = Joi.object({
  status: Joi.string()
    .valid("BELUM_BAYAR", "LUNAS", "CICIL")
    .required()
    .messages({
      "any.required": "Status wajib diisi",
      "any.only": "Status harus salah satu dari: BELUM_BAYAR, LUNAS, CICIL",
      "string.base": "Status harus berupa teks",
    }),
});

/**
 * Validation for creating pembayaran
 * POST /api/pembayaran
 */
export const pembayaranValidation = Joi.object({
  tagihanId: Joi.number().integer().required().messages({
    "any.required": "ID tagihan wajib diisi",
    "number.base": "ID tagihan harus berupa angka",
  }),
  jumlahBayar: Joi.number().integer().min(1).required().messages({
    "any.required": "Jumlah bayar wajib diisi",
    "number.base": "Jumlah bayar harus berupa angka",
    "number.min": "Jumlah bayar minimal 1",
  }),
  metode: Joi.string().optional().messages({
    "string.base": "Metode harus berupa teks",
  }),
  keterangan: Joi.string().allow("", null).optional(),
  tanggal: Joi.date().optional().messages({
    "date.base": "Tanggal harus berupa format tanggal",
  }),
});

/**
 * Validation for updating pembayaran
 * PUT /api/pembayaran/:id
 */
export const updatePembayaranValidation = Joi.object({
  jumlahBayar: Joi.number().integer().min(1).optional().messages({
    "number.base": "Jumlah bayar harus berupa angka",
    "number.min": "Jumlah bayar minimal 1",
  }),
  metode: Joi.string().optional(),
  keterangan: Joi.string().allow("", null).optional(),
  tanggal: Joi.date().optional(),
}).min(1);
