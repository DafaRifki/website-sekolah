import prisma from "../src/models/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // ==========================
  // Tahun Ajaran + TarifPembayaran
  // ==========================
  const tahunAjaranList = [];
  const daftarTahun = ["2022/2023", "2023/2024", "2024/2025"];

  for (let i = 0; i < daftarTahun.length; i++) {
    const tahun = await prisma.tahunAjaran.create({
      data: {
        namaTahun: daftarTahun[i],
        tarif: {
          create: {
            nominal: 5000000 + i * 500000,
            keterangan: `Tarif pendaftaran tahun ${daftarTahun[i]}`,
          },
        },
      },
    });
    tahunAjaranList.push(tahun);
  }
  console.log(`✅ ${tahunAjaranList.length} Tahun Ajaran + Tarif dibuat`);

  // ==========================
  // Admin (Guru role ADMIN)
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
        nip: `19800${i}`,
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
  // Kelas + Relasi TahunAjaran
  // ==========================
  const kelasList = [];
  const tingkatArr = ["X", "XI", "XII"];
  const namaHuruf = ["A", "B", "C"];

  for (let i = 0; i < 6; i++) {
    const waliKelas = guruList[i % guruList.length];
    const tingkat = tingkatArr[i % tingkatArr.length];

    const kelas = await prisma.kelas.create({
      data: {
        namaKelas: `${tingkat} ${namaHuruf[i % namaHuruf.length]}`,
        tingkat,
        waliId: waliKelas.id_guru,
      },
    });

    // tentukan tahun ajaran aktif untuk kelas
    let activeTahunId;
    if (tingkat === "X") {
      activeTahunId = tahunAjaranList[2].id_tahun; // 2024/2025
    } else if (tingkat === "XI") {
      activeTahunId = tahunAjaranList[1].id_tahun; // 2023/2024
    } else {
      activeTahunId = tahunAjaranList[0].id_tahun; // 2022/2023
    }

    for (const t of tahunAjaranList) {
      await prisma.kelasTahunAjaran.create({
        data: {
          kelasId: kelas.id_kelas,
          tahunAjaranId: t.id_tahun,
          isActive: t.id_tahun === activeTahunId,
        },
      });
    }

    kelasList.push(kelas);
  }
  console.log(`✅ ${kelasList.length} Kelas dibuat dengan relasi Tahun Ajaran`);

  // ==========================
  // Siswa (role: SISWA)
  // ==========================
  const siswaList = [];
  for (let i = 0; i < 20; i++) {
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
  // OrangTua + Relasi
  // ==========================
  for (let i = 0; i < siswaList.length; i++) {
    await prisma.orangTua.create({
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
  // Mata Pelajaran
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
  // Nilai Rapor
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
            nilai: Math.floor(Math.random() * 41) + 60,
          },
        });
      }
    }
  }
  console.log("✅ Nilai Rapor dibuat untuk semua siswa");

  // ==========================
  // Absensi
  // ==========================
  const statusAbsensi = ["HADIR", "SAKIT", "IZIN", "TIDAK_HADIR"];
  const today = new Date();

  for (const siswa of siswaList) {
    for (let d = 0; d < 5; d++) {
      const tanggal = new Date(today);
      tanggal.setDate(today.getDate() - d);

      await prisma.absensi.create({
        data: {
          tanggal,
          status:
            statusAbsensi[Math.floor(Math.random() * statusAbsensi.length)],
          keterangan: "Catatan tambahan",
          id_siswa: siswa.id_siswa,
          id_tahun: tahunAjaranList[1].id_tahun, // contoh: semua absensi masuk tahun 2023/2024
        },
      });
    }
  }
  console.log("✅ Absensi dibuat untuk semua siswa");

  // ==========================
  // Pendaftaran Siswa Baru
  // ==========================
  for (let i = 0; i < 5; i++) {
    await prisma.pendaftaran.create({
      data: {
        nama: `Calon Siswa ${i}`,
        alamat: `Alamat Calon Siswa ${i}`,
        tanggalLahir: new Date(2011, i % 12, (i % 28) + 1),
        jenisKelamin: i % 2 === 0 ? "Laki-laki" : "Perempuan",
        noHp: `0898765432${i}`,
        email: `calon${i}@mail.com`,
        statusDokumen: "BELUM_DITERIMA",
        statusPembayaran: "BELUM_BAYAR",
        tahunAjaranId: tahunAjaranList[2].id_tahun, // tahun terbaru
      },
    });
  }
  console.log("✅ 5 Pendaftaran Siswa Baru dibuat");

  // ==========================
  // Pembayaran (simulate cicilan random)
  // ==========================
  for (const siswa of siswaList) {
    const tahunAktif =
      tahunAjaranList[Math.floor(Math.random() * tahunAjaranList.length)];
    const tarif = await prisma.tarifPembayaran.findFirst({
      where: { tahunAjaranId: tahunAktif.id_tahun },
    });

    // tentukan jumlah cicilan random (0 - 3 kali)
    const cicilanCount = Math.floor(Math.random() * 4);

    let totalBayar = 0;
    for (let c = 0; c < cicilanCount; c++) {
      const bayar = Math.min(
        Math.floor(tarif.nominal / 3),
        tarif.nominal - totalBayar
      );
      totalBayar += bayar;

      await prisma.pembayaran.create({
        data: {
          siswaId: siswa.id_siswa,
          tahunAjaranId: tahunAktif.id_tahun,
          tarifId: tarif.id_tarif,
          jumlahBayar: bayar,
          metode: c % 2 === 0 ? "Transfer" : "Tunai",
          keterangan: `Cicilan ke-${c + 1}`,
        },
      });
    }
  }
  console.log("✅ Pembayaran dibuat (random cicilan untuk siswa)");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
