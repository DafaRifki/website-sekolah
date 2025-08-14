import prisma from "../src/models/prisma.js";
import { faker } from "@faker-js/faker/locale/id_ID";
import bcrypt from "bcrypt";

async function main() {
  // Bersihkan data lama
  await prisma.siswa.deleteMany();
  await prisma.kelas.deleteMany();
  await prisma.guru.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin dibuat: ${admin.email}`);

  // Guru
  const guruList = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase() + `.${i}`, // pastikan unik
        password: hashedPassword,
        role: "GURU",
      },
    });

    const guru = await prisma.guru.create({
      data: {
        nama: faker.person.fullName(),
        nip: faker.string.numeric({ length: 18 }),
        mataPelajaran: faker.helpers.arrayElement([
          "Matematika",
          "Bahasa Indonesia",
          "Bahasa Inggris",
          "IPA",
          "IPS",
          "PJOK",
          "Seni Budaya",
        ]),
        fotoProfil: faker.image.avatar(),
        userId: user.id,
      },
    });

    guruList.push(guru);
  }
  console.log(`✅ ${guruList.length} Guru berhasil dibuat`);

  // Kelas
  const kelasList = [];
  for (let i = 0; i < 6; i++) {
    const waliKelas = faker.helpers.arrayElement(guruList);
    const kelas = await prisma.kelas.create({
      data: {
        nama: `Kelas ${faker.helpers.arrayElement([
          "X",
          "XI",
          "XII",
        ])} ${faker.helpers.arrayElement(["A", "B", "C"])}-${i + 1}`,
        guruId: waliKelas.id,
      },
    });
    kelasList.push(kelas);
  }
  console.log(`✅ ${kelasList.length} Kelas berhasil dibuat`);

  // Siswa
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase() + `.${i}`, // unik
        password: hashedPassword,
        role: "SISWA",
      },
    });

    const randomKelas = faker.helpers.arrayElement(kelasList);
    await prisma.siswa.create({
      data: {
        nama: faker.person.fullName(),
        nis: faker.string.numeric({ length: 10 }),
        alamat: `${faker.location.streetAddress(
          true
        )}, ${faker.location.city()}, ${faker.location.state()}`,
        tanggalLahir: faker.date.birthdate({ min: 10, max: 18, mode: "age" }),
        fotoProfil: faker.image.avatar(),
        userId: user.id,
        kelasId: randomKelas.id,
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
