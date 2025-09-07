import prisma from "../src/models/prisma.js";
// import { faker } from "@faker-js/faker/locale/id_ID";
import bcrypt from "bcrypt";

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // ==========================
  // Admin (Guru dengan role ADMIN)
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
  console.log("✅ Admin Guru dibuat");

  // ==========================
  // Guru (role: GURU)
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
  console.log(`✅ ${guruList.length} Guru dibuat`);

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
  console.log(`✅ ${kelasList.length} Kelas dibuat`);

  // ==========================
  // Siswa (role: SISWA)
  // ==========================
  const siswaList = [];
  for (let i = 0; i < 10; i++) {
    const kelas = kelasList[i % kelasList.length];
    const siswa = await prisma.siswa.create({
      data: {
        nis: `20230${i}`,
        nama: `Siswa ${i}`,
        alamat: `Alamat Siswa ${i}`,
        tanggalLahir: new Date(2007, i % 12, (i % 28) + 1),
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
  console.log(`✅ ${siswaList.length} Siswa dibuat`);

  // ==========================
  // OrangTua + Relasi (Siswa_Orangtua)
  // ==========================
  for (let i = 0; i < siswaList.length; i++) {
    const orangtua = await prisma.orangTua.create({
      data: {
        nama: `Orangtua ${i}`,
        hubungan: i % 2 === 0 ? "Ayah" : "Ibu",
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
  console.log(`✅ ${siswaList.length} OrangTua dibuat`);

  // ==========================
  // MataPelajaran
  // ==========================
  const mapelList = [];
  const daftarMapel = [
    "Matematika",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "Fisika",
    "Kimia",
    "Biologi",
    "Sejarah",
    "Geografi",
  ];

  for (const nama of daftarMapel) {
    const mapel = await prisma.mataPelajaran.create({
      data: {
        namaMapel: nama,
        kelompokMapel: "Umum",
      },
    });
    mapelList.push(mapel);
  }
  console.log(`✅ ${mapelList.length} Mata Pelajaran dibuat`);

  // ==========================
  // NilaiRapor
  // ==========================
  const semesterArr = ["Ganjil", "Genap"];
  for (const siswa of siswaList) {
    for (const mapel of mapelList) {
      for (const semester of semesterArr) {
        await prisma.nilaiRapor.create({
          data: {
            id_siswa: siswa.id_siswa,
            id_mapel: mapel.id_mapel,
            semester,
            nilai: Math.floor(Math.random() * 41) + 60, // 60-100
          },
        });
      }
    }
  }
  console.log("✅ Nilai Rapor dibuat untuk semua siswa");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
