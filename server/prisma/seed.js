import prisma from "../src/models/prisma.js";
import { faker } from "@faker-js/faker/locale/id_ID";
import bcrypt from "bcrypt";

async function main() {
  // Password default semua akun: "password123"
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Admin
  await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Guru + user account
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        password: hashedPassword,
        role: "GURU",
      },
    });
    await prisma.guru.create({
      data: {
        nama: faker.person.fullName(),
        nip: faker.string.numeric(18),
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
  }

  // Siswa + user account
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        password: hashedPassword,
        role: "SISWA",
      },
    });
    await prisma.siswa.create({
      data: {
        nama: faker.person.fullName(),
        nis: faker.string.numeric(10),
        alamat: `${faker.location.streetAddress(
          true
        )}, ${faker.location.city()}, ${faker.location.state()}`,
        tanggalLahir: faker.date.birthdate({ min: 10, max: 18, mode: "age" }),
        fotoProfil: faker.image.avatar(),
        userId: user.id,
      },
    });
  }

  console.log("✅ Dummy data admin, guru, dan siswa berhasil dibuat");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
