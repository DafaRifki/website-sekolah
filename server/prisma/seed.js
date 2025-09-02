import prisma from "../src/models/prisma.js";
// import { faker } from "@faker-js/faker/locale/id_ID";
import bcrypt from "bcrypt";

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // ==========================
  // Admin (disimpan di tabel Guru)
  // ==========================
  const adminGuru = await prisma.guru.create({
    data: {
      nip: "1980000",
      nama: "Admin Guru",
      jenisKelamin: "Laki-laki",
      alamat: "Alamat Admin",
      noHP: "081234567890",
      email: "admin@guru.com",
      jabatan: "Admin Sekolah",
    },
  });

  await prisma.user.create({
    data: {
      email: adminGuru.email,
      password: hashedPassword,
      role: "ADMIN",
      guruId: adminGuru.id_guru,
    },
  });

  console.log("✅ Admin dibuat di tabel Guru");

  // ==========================
  // Guru
  // ==========================
  const guruList = [];
  for (let i = 1; i <= 5; i++) {
    const guru = await prisma.guru.create({
      data: {
        nip: `198000${i}`,
        nama: `Guru ${i}`,
        jenisKelamin: i % 2 === 0 ? "Perempuan" : "Laki-laki",
        alamat: `Alamat Guru ${i}`,
        noHP: `08123${i}45678`,
        email: `guru${i}@sekolah.com`,
        jabatan: "Guru Mapel",
      },
    });

    await prisma.user.create({
      data: {
        email: guru.email,
        password: hashedPassword,
        role: "GURU",
        guruId: guru.id_guru,
      },
    });

    guruList.push(guru);
  }
  console.log(`✅ ${guruList.length} Guru berhasil dibuat`);

  // ==========================
  // Kelas
  // ==========================
  const kelasList = [];
  const tingkatArr = ["X", "XI", "XII"];
  const namaHuruf = ["A", "B", "C", "D", "E"];

  for (let i = 0; i < 5; i++) {
    const waliKelas = guruList[i % guruList.length];
    const kelas = await prisma.kelas.create({
      data: {
        namaKelas: `Kelas ${tingkatArr[i % tingkatArr.length]} ${namaHuruf[i]}`,
        tingkat: tingkatArr[i % tingkatArr.length],
        waliId: waliKelas.id_guru,
      },
    });
    kelasList.push(kelas);
  }
  console.log(`✅ ${kelasList.length} Kelas berhasil dibuat`);

  // ==========================
  // Siswa
  // ==========================
  const siswaList = [];
  for (let i = 0; i < 5; i++) {
    const kelas = kelasList[i % kelasList.length];
    const siswa = await prisma.siswa.create({
      data: {
        nis: `202300${i}`,
        nama: `Siswa ${i}`,
        alamat: `Alamat Siswa ${i}`,
        tanggalLahir: new Date(2007, i, i + 5),
        jenisKelamin: i % 2 === 0 ? "Perempuan" : "Laki-laki",
        kelasId: kelas.id_kelas,
      },
    });

    await prisma.user.create({
      data: {
        email: `siswa${i}@sekolah.com`,
        password: hashedPassword,
        role: "SISWA",
        siswaId: siswa.id_siswa,
      },
    });

    siswaList.push(siswa);
  }
  console.log(`✅ ${siswaList.length} Siswa berhasil dibuat`);

  // ==========================
  // OrangTua
  // ==========================
  for (let i = 0; i < 5; i++) {
    const orangtua = await prisma.orangTua.create({
      data: {
        nama: `Orangtua ${i}`,
        hubungan: "Ayah/Ibu",
        pekerjaan: "Pekerjaan Orangtua",
        alamat: `Alamat Orangtua ${i}`,
        noHp: `0812345678${i}`,
        siswa: {
          create: {
            id_siswa: siswaList[i].id_siswa,
            status: "Aktif",
          },
        },
      },
    });
  }
  console.log("✅ 5 OrangTua berhasil dibuat");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
