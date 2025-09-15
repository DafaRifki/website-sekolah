import prisma from "../models/prisma.js";
import bcrypt from "bcrypt";

export const getAllSiswaService = async () => {
  return await prisma.siswa.findMany({
    orderBy: { id_siswa: "asc" },
    include: {
      user: { select: { email: true, role: true } },
      kelas: {
        include: {
          guru: {
            select: { nama: true },
          },
        },
      },
      nilaiRapor: {
        include: {
          mapel: {
            select: { namaMapel: true },
          },
        },
      },
      Siswa_Orangtua: {
        include: {
          orangtua: {
            select: {
              nama: true,
              pekerjaan: true,
              hubungan: true,
              alamat: true,
              noHp: true,
            },
          },
        },
      },
    },
  });
};

export const getSiswaByIdService = async (id) => {
  return await prisma.siswa.findUnique({
    where: { id_siswa: parseInt(id) },
    include: {
      user: {
        select: { email: true, role: true },
      },
      kelas: {
        include: {
          guru: {
            select: { nama: true },
          },
          // Tambahkan tahunRel agar bisa menampilkan tahun ajaran
          tahunRel: {
            include: {
              tahunAjaran: {
                select: { id_tahun: true, namaTahun: true },
              },
            },
          },
        },
      },
      nilaiRapor: {
        include: {
          mapel: {
            select: { namaMapel: true },
          },
        },
      },
      Siswa_Orangtua: {
        include: {
          orangtua: {
            select: {
              nama: true,
              pekerjaan: true,
              hubungan: true,
              alamat: true,
              noHp: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Create Siswa lengkap dengan user, kelas, dan orangtua.
 * @param {Object} data - data siswa dan orangtua
 * @param {Object} file - file foto profil (optional)
 */
export const createSiswaService = async (data, file) => {
  const {
    email,
    password,
    nama,
    nis,
    alamat,
    tanggalLahir,
    kelasId,
    jenisKelamin,
    orangtuaNama,
    orangtuaHubungan,
    orangtuaPekerjaan,
    orangtuaAlamat,
    orangtuaNoHp,
  } = data;

  // validasi unik email
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email sudah digunakan");

  // validasi unik NIS
  const existingSiswa = await prisma.siswa.findUnique({ where: { nis } });
  if (existingSiswa) throw new Error("NIS sudah digunakan");

  const hashedPassword = await bcrypt.hash(password, 10);
  const fotoUrl = file ? `/uploads/${file.filename}` : null;

  // Buat user dulu
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "SISWA",
    },
  });

  // Buat siswa + relasi
  const siswa = await prisma.siswa.create({
    data: {
      nama,
      nis,
      alamat,
      tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
      jenisKelamin,
      fotoProfil: fotoUrl,

      // relasi kelas
      kelas: kelasId ? { connect: { id_kelas: parseInt(kelasId) } } : undefined,

      // relasi user
      user: { connect: { id: user.id } },

      // relasi orangtua
      Siswa_Orangtua: orangtuaNama
        ? {
            create: {
              status: "Aktif",
              orangtua: {
                create: {
                  nama: orangtuaNama,
                  hubungan: orangtuaHubungan || "Orang Tua",
                  pekerjaan: orangtuaPekerjaan || "-",
                  alamat: orangtuaAlamat || "-",
                  noHp: orangtuaNoHp || null,
                },
              },
            },
          }
        : undefined,
    },
    include: {
      user: { select: { email: true, role: true } },
      kelas: { include: { guru: { select: { nama: true } } } },
      nilaiRapor: { include: { mapel: { select: { namaMapel: true } } } },
      Siswa_Orangtua: {
        include: {
          orangtua: {
            select: {
              nama: true,
              hubungan: true,
              pekerjaan: true,
              alamat: true,
              noHp: true,
            },
          },
        },
      },
    },
  });

  // update user agar punya relasi ke siswaId
  await prisma.user.update({
    where: { id: user.id },
    data: { siswaId: siswa.id_siswa },
  });

  return siswa;
};

/**
 * Update data siswa beserta relasi user, kelas, dan orangtua.
 * @param {number|string} id - id_siswa yang ingin diupdate
 * @param {Object} data - data siswa dan orangtua
 * @param {Object} file - file foto profil (optional)
 */
export const updateSiswaService = async (id, data, file) => {
  const {
    email,
    password,
    nama,
    nis,
    alamat,
    tanggalLahir,
    kelasId,
    jenisKelamin,
    orangtuaId,
    orangtuaNama,
    orangtuaHubungan,
    orangtuaPekerjaan,
    orangtuaAlamat,
    orangtuaNoHp,
  } = data;

  const siswa = await prisma.siswa.findUnique({
    where: { id_siswa: parseInt(id) },
    include: {
      user: true,
      Siswa_Orangtua: { include: { orangtua: true } },
    },
  });

  if (!siswa) throw new Error("Siswa tidak ditemukan");

  // -----------------------
  // Update data siswa utama
  // -----------------------
  const updateData = {};
  if (nama) updateData.nama = nama;
  if (nis) updateData.nis = nis;
  if (alamat) updateData.alamat = alamat;
  if (tanggalLahir) updateData.tanggalLahir = new Date(tanggalLahir);
  if (jenisKelamin) updateData.jenisKelamin = jenisKelamin;
  if (kelasId) updateData.kelas = { connect: { id_kelas: parseInt(kelasId) } };
  if (file) updateData.fotoProfil = `${file.filename}`;

  // -----------------------
  // Update akun user
  // -----------------------
  if (email || password) {
    const userUpdateData = {};
    if (email) userUpdateData.email = email;
    if (password) userUpdateData.password = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: siswa.user.id },
      data: userUpdateData,
    });
  }

  // -----------------------
  // Update siswa utama
  // -----------------------
  const updatedSiswa = await prisma.siswa.update({
    where: { id_siswa: parseInt(id) },
    data: updateData,
    include: {
      user: { select: { email: true, role: true } },
      kelas: { include: { guru: { select: { nama: true } } } },
      nilaiRapor: { include: { mapel: { select: { namaMapel: true } } } },
      Siswa_Orangtua: {
        include: {
          orangtua: {
            select: {
              nama: true,
              hubungan: true,
              pekerjaan: true,
              alamat: true,
              noHp: true,
            },
          },
        },
      },
    },
  });

  // -----------------------
  // Update atau buat orangtua
  // -----------------------
  if (orangtuaNama) {
    if (orangtuaId) {
      // update existing
      await prisma.orangTua.update({
        where: { id_orangtua: parseInt(orangtuaId) },
        data: {
          nama: orangtuaNama,
          hubungan: orangtuaHubungan || "Orang Tua",
          pekerjaan: orangtuaPekerjaan || "-",
          alamat: orangtuaAlamat || "-",
          noHp: orangtuaNoHp || null,
        },
      });
    } else if (siswa.Siswa_Orangtua.length > 0) {
      // update orangtua pertama jika id tidak dikirim
      const existingOrtu = siswa.Siswa_Orangtua[0].orangtua;
      await prisma.orangTua.update({
        where: { id_orangtua: existingOrtu.id_orangtua },
        data: {
          nama: orangtuaNama,
          hubungan: orangtuaHubungan || "Orang Tua",
          pekerjaan: orangtuaPekerjaan || "-",
          alamat: orangtuaAlamat || "-",
          noHp: orangtuaNoHp || null,
        },
      });
    } else {
      // create baru jika siswa belum punya orangtua sama sekali
      await prisma.siswa_Orangtua.create({
        data: {
          siswa: { connect: { id_siswa: parseInt(id) } },
          status: "Aktif",
          orangtua: {
            create: {
              nama: orangtuaNama,
              hubungan: orangtuaHubungan || "Orang Tua",
              pekerjaan: orangtuaPekerjaan || "-",
              alamat: orangtuaAlamat || "-",
              noHp: orangtuaNoHp || null,
            },
          },
        },
      });
    }
  }

  return updatedSiswa;
};

export const deleteSiswaService = async (id) => {
  const siswaId = parseInt(id);

  const siswa = await prisma.siswa.findUnique({
    where: { id_siswa: siswaId },
  });
  if (!siswa) throw new Error("Siswa tidak ditemukan");

  // 🔑 Hapus user yang terhubung dulu
  await prisma.user.deleteMany({
    where: { siswaId: siswaId },
  });

  // Hapus relasi siswa-orangtua
  await prisma.siswa_Orangtua.deleteMany({
    where: { id_siswa: siswaId },
  });

  // Hapus nilai rapor
  await prisma.nilaiRapor.deleteMany({
    where: { id_siswa: siswaId },
  });

  // Terakhir hapus siswa
  await prisma.siswa.delete({
    where: { id_siswa: siswaId },
  });

  return siswa;
};
