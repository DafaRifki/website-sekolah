import prisma from "../src/models/prisma.js";
// import { faker } from "@faker-js/faker/locale/id_ID";
import bcrypt from "bcrypt";

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Admin
  const admin = await prisma.user.createMany({
    data: [
      {
        email: "admin1@example.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    ],
    data: [
      {
        email: "admin2@example.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    ],
    data: [
      {
        email: "admin3@example.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    ],
  });
  console.log(`✅ Admin dibuat: ${admin.email}`);

  // Guru
  const guruList = [];
  for (let i = 0; i < 3; i++) {
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

  // Kelas
  // const kelasList = [];
  // for (let i = 0; i < 6; i++) {
  //   const waliKelas = faker.helpers.arrayElement(guruList);
  //   const kelas = await prisma.kelas.create({
  //     data: {
  //       nama: `Kelas ${faker.helpers.arrayElement([
  //         "X",
  //         "XI",
  //         "XII",
  //       ])} ${faker.helpers.arrayElement(["A", "B", "C"])}-${i + 1}`,
  //       guruId: waliKelas.id,
  //     },
  //   });
  //   kelasList.push(kelas);
  // }
  // console.log(`✅ ${kelasList.length} Kelas berhasil dibuat`);

  // Siswa
  for (let i = 0; i < 3; i++) {
    const siswa = await prisma.siswa.create({
      data: {
        nis: `202300${i}`,
        nama: `Siswa ${i}`,
        alamat: `Alamat Siswa ${i}`,
        tanggalLahir: new Date(2007, i, i + 5),
        jenisKelamin: i % 2 === 0 ? "Perempuan" : "Laki-laki",
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
  }
  console.log("✅ 20 Siswa berhasil dibuat");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
