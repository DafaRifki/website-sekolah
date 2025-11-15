import {
  PrismaClient,
  Role,
  StatusAbsensi,
  StatusTagihan,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...\n");

  // ==================== 1. USERS ====================
  console.log("👤 Seeding users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@school.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const guruUser = await prisma.user.create({
    data: {
      email: "guru@school.com",
      password: hashedPassword,
      role: Role.GURU,
    },
  });

  const siswaUser = await prisma.user.create({
    data: {
      email: "siswa@school.com",
      password: hashedPassword,
      role: Role.SISWA,
    },
  });

  console.log("✅ 3 users created");

  // ==================== 2. TAHUN AJARAN ====================
  console.log("\n📅 Seeding tahun ajaran...");

  const tahunAjaran2024S1 = await prisma.tahunAjaran.create({
    data: {
      namaTahun: "2024/2025",
      startDate: new Date("2024-07-15"),
      endDate: new Date("2024-12-20"),
      semester: 1,
      isActive: false,
    },
  });

  const tahunAjaran2024S2 = await prisma.tahunAjaran.create({
    data: {
      namaTahun: "2024/2025",
      startDate: new Date("2025-01-06"),
      endDate: new Date("2025-06-20"),
      semester: 2,
      isActive: true,
    },
  });

  const tahunAjaran2025S1 = await prisma.tahunAjaran.create({
    data: {
      namaTahun: "2025/2026",
      startDate: new Date("2025-07-15"),
      endDate: new Date("2025-12-20"),
      semester: 1,
      isActive: false,
    },
  });

  console.log("✅ 3 tahun ajaran created");

  // ==================== 3. GURU ====================
  console.log("\n👨‍🏫 Seeding guru...");

  const guru1 = await prisma.guru.create({
    data: {
      nip: "198001012005011001",
      nama: "Budi Santoso, S.Pd",
      jenisKelamin: "L",
      noHP: "081234567890",
      email: "budi@school.com",
      alamat: "Jl. Pendidikan No. 1",
      jabatan: "Guru Matematika",
    },
  });

  const guru2 = await prisma.guru.create({
    data: {
      nip: "198502102006012002",
      nama: "Siti Nurhaliza, S.Pd",
      jenisKelamin: "P",
      noHP: "081234567891",
      email: "siti@school.com",
      alamat: "Jl. Pendidikan No. 2",
      jabatan: "Guru Bahasa Indonesia",
    },
  });

  const guru3 = await prisma.guru.create({
    data: {
      nip: "199003152007011003",
      nama: "Ahmad Fauzi, S.Si",
      jenisKelamin: "L",
      noHP: "081234567892",
      email: "ahmad@school.com",
      alamat: "Jl. Pendidikan No. 3",
      jabatan: "Guru IPA",
    },
  });

  // Link guruUser to guru1
  await prisma.user.update({
    where: { id: guruUser.id },
    data: { guruId: guru1.id_guru },
  });

  console.log("✅ 3 guru created");

  // ==================== 4. KELAS ====================
  console.log("\n🏫 Seeding kelas...");

  const kelasXIPA1 = await prisma.kelas.create({
    data: {
      namaKelas: "X IPA 1",
      tingkat: "X",
      waliId: guru1.id_guru,
    },
  });

  const kelasXIPA2 = await prisma.kelas.create({
    data: {
      namaKelas: "X IPA 2",
      tingkat: "X",
      waliId: guru2.id_guru,
    },
  });

  const kelasXIIPA1 = await prisma.kelas.create({
    data: {
      namaKelas: "XI IPA 1",
      tingkat: "XI",
      waliId: guru3.id_guru,
    },
  });

  console.log("✅ 3 kelas created");

  // Link kelas to tahun ajaran
  await prisma.kelasTahunAjaran.createMany({
    data: [
      {
        kelasId: kelasXIPA1.id_kelas,
        tahunAjaranId: tahunAjaran2024S2.id_tahun,
        isActive: true,
      },
      {
        kelasId: kelasXIPA2.id_kelas,
        tahunAjaranId: tahunAjaran2024S2.id_tahun,
        isActive: true,
      },
      {
        kelasId: kelasXIIPA1.id_kelas,
        tahunAjaranId: tahunAjaran2024S2.id_tahun,
        isActive: true,
      },
    ],
  });
  console.log("✅ Kelas linked to tahun ajaran");

  // ==================== 5. SISWA ====================
  console.log("\n👨‍🎓 Seeding siswa...");

  const siswaData = [
    { nama: "Ahmad Faiz", nis: "2024001", kelas: kelasXIPA1.id_kelas },
    { nama: "Budi Setiawan", nis: "2024002", kelas: kelasXIPA1.id_kelas },
    { nama: "Citra Dewi", nis: "2024003", kelas: kelasXIPA1.id_kelas },
    { nama: "Dewi Lestari", nis: "2024004", kelas: kelasXIPA2.id_kelas },
    { nama: "Eka Prasetyo", nis: "2024005", kelas: kelasXIPA2.id_kelas },
    { nama: "Fitri Handayani", nis: "2024006", kelas: kelasXIPA2.id_kelas },
    { nama: "Gita Putri", nis: "2024007", kelas: kelasXIIPA1.id_kelas },
    { nama: "Hendra Gunawan", nis: "2024008", kelas: kelasXIIPA1.id_kelas },
    { nama: "Indah Permata", nis: "2024009", kelas: kelasXIIPA1.id_kelas },
    { nama: "Joko Susilo", nis: "2024010", kelas: kelasXIPA1.id_kelas },
  ];

  const allSiswa = [];
  for (let i = 0; i < siswaData.length; i++) {
    const data = siswaData[i];
    const siswa = await prisma.siswa.create({
      data: {
        nis: data.nis,
        nama: data.nama,
        jenisKelamin: i % 2 === 0 ? "L" : "P",
        tanggalLahir: new Date(`200${i % 10}-05-15`),
        alamat: `Jl. Siswa No. ${i + 1}, Jakarta`,
        kelasId: data.kelas,
      },
    });
    allSiswa.push(siswa);
  }

  // Link first siswa to siswaUser
  await prisma.user.update({
    where: { id: siswaUser.id },
    data: { siswaId: allSiswa[0].id_siswa },
  });

  console.log(`✅ ${allSiswa.length} siswa created`);

  // ==================== 6. ORANG TUA ====================
  console.log("\n👨‍👩‍👧 Seeding orang tua...");

  for (let i = 0; i < 5; i++) {
    const siswa = allSiswa[i];

    // Ayah
    const ayah = await prisma.orangTua.create({
      data: {
        nama: `Ayah ${siswa.nama}`,
        hubungan: "Ayah",
        pekerjaan: "Wiraswasta",
        alamat: siswa.alamat || "Jakarta",
        noHp: `0812345${6000 + i * 2}`,
      },
    });

    // Ibu
    const ibu = await prisma.orangTua.create({
      data: {
        nama: `Ibu ${siswa.nama}`,
        hubungan: "Ibu",
        pekerjaan: "Ibu Rumah Tangga",
        alamat: siswa.alamat || "Jakarta",
        noHp: `0812345${6001 + i * 2}`,
      },
    });

    // Link to siswa
    await prisma.siswa_Orangtua.createMany({
      data: [
        {
          id_siswa: siswa.id_siswa,
          id_orangtua: ayah.id_orangtua,
          status: "Aktif",
        },
        {
          id_siswa: siswa.id_siswa,
          id_orangtua: ibu.id_orangtua,
          status: "Aktif",
        },
      ],
    });
  }

  console.log("✅ 10 orang tua created & linked");

  // ==================== 7. MATA PELAJARAN ====================
  console.log("\n📚 Seeding mata pelajaran...");

  const mataPelajaranData = [
    { nama: "Matematika", kelompok: "Wajib" },
    { nama: "Bahasa Indonesia", kelompok: "Wajib" },
    { nama: "Bahasa Inggris", kelompok: "Wajib" },
    { nama: "Fisika", kelompok: "Peminatan MIPA" },
    { nama: "Kimia", kelompok: "Peminatan MIPA" },
    { nama: "Biologi", kelompok: "Peminatan MIPA" },
    { nama: "Sejarah", kelompok: "Wajib" },
    { nama: "Geografi", kelompok: "Peminatan IPS" },
    { nama: "Ekonomi", kelompok: "Peminatan IPS" },
    { nama: "Sosiologi", kelompok: "Peminatan IPS" },
    { nama: "Seni Budaya", kelompok: "Wajib" },
    { nama: "Pendidikan Jasmani", kelompok: "Wajib" },
  ];

  const allMapel = [];
  for (const mp of mataPelajaranData) {
    const mapel = await prisma.mataPelajaran.create({
      data: {
        namaMapel: mp.nama,
        kelompokMapel: mp.kelompok,
      },
    });
    allMapel.push(mapel);
  }

  console.log(`✅ ${allMapel.length} mata pelajaran created`);

  // ==================== 8. TARIF PEMBAYARAN ====================
  console.log("\n💰 Seeding tarif pembayaran...");

  const tarifSPP = await prisma.tarifPembayaran.create({
    data: {
      namaTagihan: "SPP Bulanan 2024/2025",
      nominal: 500000,
      keterangan: "SPP untuk siswa tahun ajaran 2024/2025",
      tahunAjaranId: tahunAjaran2024S2.id_tahun,
    },
  });

  const tarifPendaftaran = await prisma.tarifPembayaran.create({
    data: {
      namaTagihan: "Biaya Pendaftaran 2024/2025",
      nominal: 2000000,
      keterangan: "Biaya pendaftaran siswa baru",
      tahunAjaranId: tahunAjaran2024S2.id_tahun,
    },
  });

  const tarifSeragam = await prisma.tarifPembayaran.create({
    data: {
      namaTagihan: "Seragam Sekolah 2024/2025",
      nominal: 750000,
      keterangan: "Paket seragam lengkap",
      tahunAjaranId: tahunAjaran2024S2.id_tahun,
    },
  });

  const allTarif = [tarifSPP, tarifPendaftaran, tarifSeragam];
  console.log("✅ 3 tarif pembayaran created");

  // ==================== 9. TAGIHAN ====================
  console.log("\n🧾 Seeding tagihan...");

  const bulanList = ["Januari", "Februari", "Maret", "April", "Mei"];
  const allTagihan = [];

  // Generate SPP untuk 5 siswa pertama (5 bulan)
  for (const siswa of allSiswa.slice(0, 5)) {
    for (const bulan of bulanList) {
      const tagihan = await prisma.tagihan.create({
        data: {
          id_siswa: siswa.id_siswa,
          tarifId: tarifSPP.id_tarif,
          tahunAjaranId: tahunAjaran2024S2.id_tahun,
          bulan: bulan,
          status: StatusTagihan.BELUM_BAYAR,
        },
      });
      allTagihan.push(tagihan);
    }
  }

  // Generate Biaya Pendaftaran untuk 3 siswa pertama
  for (const siswa of allSiswa.slice(0, 3)) {
    const tagihan = await prisma.tagihan.create({
      data: {
        id_siswa: siswa.id_siswa,
        tarifId: tarifPendaftaran.id_tarif,
        tahunAjaranId: tahunAjaran2024S2.id_tahun,
        bulan: null,
        status: StatusTagihan.BELUM_BAYAR,
      },
    });
    allTagihan.push(tagihan);
  }

  // Generate Seragam untuk 5 siswa pertama
  for (const siswa of allSiswa.slice(0, 5)) {
    const tagihan = await prisma.tagihan.create({
      data: {
        id_siswa: siswa.id_siswa,
        tarifId: tarifSeragam.id_tarif,
        tahunAjaranId: tahunAjaran2024S2.id_tahun,
        bulan: null,
        status: StatusTagihan.BELUM_BAYAR,
      },
    });
    allTagihan.push(tagihan);
  }

  console.log(`✅ ${allTagihan.length} tagihan created`);

  // ==================== 10. PEMBAYARAN ====================
  console.log("\n💳 Seeding pembayaran...");

  const metodePembayaran = ["CASH", "TRANSFER", "QRIS"];
  let pembayaranCount = 0;

  // Create pembayaran untuk beberapa tagihan
  for (let i = 0; i < Math.min(15, allTagihan.length); i++) {
    const tagihan = allTagihan[i];
    const tarif = await prisma.tarifPembayaran.findUnique({
      where: { id_tarif: tagihan.tarifId },
    });

    if (!tarif) continue;

    // Random: full payment or partial
    const isFullPayment = Math.random() > 0.3;
    const jumlahBayar = isFullPayment
      ? tarif.nominal
      : Math.floor(tarif.nominal * 0.5);

    await prisma.pembayaran.create({
      data: {
        tagihanId: tagihan.id_tagihan,
        jumlahBayar: jumlahBayar,
        tanggal: new Date(2025, 0, Math.floor(Math.random() * 28) + 1),
        metode: metodePembayaran[i % metodePembayaran.length],
        keterangan: isFullPayment ? "Pembayaran lunas" : "Pembayaran cicilan",
      },
    });

    // Update tagihan status
    const newStatus = isFullPayment ? StatusTagihan.LUNAS : StatusTagihan.CICIL;
    await prisma.tagihan.update({
      where: { id_tagihan: tagihan.id_tagihan },
      data: { status: newStatus },
    });

    pembayaranCount++;
  }

  console.log(`✅ ${pembayaranCount} pembayaran created`);

  // ==================== 11. NILAI RAPOR ====================
  console.log("\n📝 Seeding nilai rapor...");

  let nilaiCount = 0;
  for (const siswa of allSiswa.slice(0, 5)) {
    for (const mapel of allMapel.slice(0, 6)) {
      await prisma.nilaiRapor.create({
        data: {
          id_siswa: siswa.id_siswa,
          id_mapel: mapel.id_mapel,
          tahunAjaranId: tahunAjaran2024S2.id_tahun,
          semester: "2",
          nilai: Math.floor(Math.random() * 30) + 70,
        },
      });
      nilaiCount++;
    }
  }

  console.log(`✅ ${nilaiCount} nilai rapor created`);

  // ==================== 12. ABSENSI ====================
  console.log("\n✅ Seeding absensi...");

  const statusAbsensiList = [
    StatusAbsensi.HADIR,
    StatusAbsensi.HADIR,
    StatusAbsensi.HADIR,
    StatusAbsensi.HADIR,
    StatusAbsensi.SAKIT,
    StatusAbsensi.IZIN,
  ];

  let absensiCount = 0;
  for (const siswa of allSiswa.slice(0, 5)) {
    for (let day = 1; day <= 20; day++) {
      const status =
        statusAbsensiList[Math.floor(Math.random() * statusAbsensiList.length)];

      await prisma.absensi.create({
        data: {
          id_siswa: siswa.id_siswa,
          tanggal: new Date(2025, 0, day),
          status: status,
          keterangan:
            status === StatusAbsensi.SAKIT
              ? "Sakit demam"
              : status === StatusAbsensi.IZIN
              ? "Keperluan keluarga"
              : null,
          id_tahun: tahunAjaran2024S2.id_tahun,
        },
      });
      absensiCount++;
    }
  }

  console.log(`✅ ${absensiCount} absensi records created`);

  // ==================== 13. PENDAFTARAN ====================
  console.log("\n📋 Seeding pendaftaran...");

  const pendaftaranData = [
    {
      nama: "Luki Hermawan",
      email: "luki@gmail.com",
      noHp: "081234560001",
      statusDokumen: "LENGKAP",
      statusPembayaran: "LUNAS",
    },
    {
      nama: "Maya Sari",
      email: "maya@gmail.com",
      noHp: "081234560002",
      statusDokumen: "LENGKAP",
      statusPembayaran: "BELUM_BAYAR",
    },
    {
      nama: "Nanda Pratama",
      email: "nanda@gmail.com",
      noHp: "081234560003",
      statusDokumen: "KURANG",
      statusPembayaran: "BELUM_BAYAR",
    },
  ];

  for (const data of pendaftaranData) {
    await prisma.pendaftaran.create({
      data: {
        nama: data.nama,
        jenisKelamin: "L",
        tempatLahir: "Jakarta",
        tanggalLahir: new Date("2010-05-15"),
        agama: "Islam",
        alamat: "Jl. Pendaftar No. 1",
        email: data.email,
        noHp: data.noHp,
        asalSekolah: "SMP Negeri 1",
        namaAyah: "Ayah " + data.nama,
        namaIbu: "Ibu " + data.nama,
        tahunAjaranId: tahunAjaran2024S2.id_tahun,
        statusDokumen: data.statusDokumen as any,
        statusPembayaran: data.statusPembayaran as any,
      },
    });
  }

  console.log("✅ 3 pendaftaran created");

  // ==================== SUMMARY ====================
  console.log("\n" + "=".repeat(50));
  console.log("🎉 SEEDING COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(50));

  const stats = {
    users: await prisma.user.count(),
    tahunAjaran: await prisma.tahunAjaran.count(),
    guru: await prisma.guru.count(),
    kelas: await prisma.kelas.count(),
    siswa: await prisma.siswa.count(),
    orangTua: await prisma.orangTua.count(),
    mataPelajaran: await prisma.mataPelajaran.count(),
    tarifPembayaran: await prisma.tarifPembayaran.count(),
    tagihan: await prisma.tagihan.count(),
    pembayaran: await prisma.pembayaran.count(),
    nilaiRapor: await prisma.nilaiRapor.count(),
    absensi: await prisma.absensi.count(),
    pendaftaran: await prisma.pendaftaran.count(),
  };

  console.log("\n📊 Database Statistics:");
  console.log("------------------------");
  Object.entries(stats).forEach(([key, value]) => {
    console.log(`${key.padEnd(20)}: ${value}`);
  });

  console.log("\n🔐 Login Credentials:");
  console.log("------------------------");
  console.log("Admin:");
  console.log("  Email: admin@school.com");
  console.log("  Password: password123");
  console.log("\nGuru:");
  console.log("  Email: guru@school.com");
  console.log("  Password: password123");
  console.log("\nSiswa:");
  console.log("  Email: siswa@school.com");
  console.log("  Password: password123");

  console.log("\n✅ Ready to test!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    // process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
