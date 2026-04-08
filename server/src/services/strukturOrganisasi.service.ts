import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Mengambil semua data struktur organisasi dari database
 */
export const getAllStruktur = async () => {
  return await prisma.strukturOrganisasi.findMany({
    orderBy: {
      id: 'asc' // Urutkan berdasarkan ID agar posisi tetap konsisten
    }
  });
};

/**
 * Membuat data struktur organisasi baru
 * Menambahkan field 'sambutan' ke dalam parameter data
 */
export const createStruktur = async (data: {
  kategori: string;
  jabatan: string;
  nama: string;
  foto: string;
  ttl?: string;
  alamat?: string;
  telp?: string;
  sambutan?: string; // Field baru ditambahkan di sini
}) => {
  return await prisma.strukturOrganisasi.create({
    data: {
      kategori: data.kategori,
      jabatan: data.jabatan,
      nama: data.nama,
      foto: data.foto,
      ttl: data.ttl || null,
      alamat: data.alamat || null,
      telp: data.telp || null,
      sambutan: data.sambutan || null, // Pastikan tersimpan ke database
    },
  });
};

/**
 * Menghapus data struktur organisasi berdasarkan ID
 */
export const deleteStruktur = async (id: number) => {
  return await prisma.strukturOrganisasi.delete({
    where: { id },
  });
};

/**
 * Mengambil satu data berdasarkan ID
 */
export const getStrukturById = async (id: number) => {
  return await prisma.strukturOrganisasi.findUnique({
    where: { id },
  });
};

/**
 * Memperbarui data struktur organisasi
 * Menggunakan partial agar bisa update field tertentu saja (termasuk sambutan)
 */
export const updateStruktur = async (id: number, data: any) => {
  return await prisma.strukturOrganisasi.update({
    where: { id },
    data: {
      ...data,
      // Memastikan jika data.id ikut terkirim dari frontend, tidak merusak database
      id: undefined 
    },
  });
};