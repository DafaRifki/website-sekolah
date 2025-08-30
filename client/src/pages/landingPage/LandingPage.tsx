import React from "react";
import PublicLayout from "../layout/PublicLayout";
import ProfileSekolah from "./components/ProfileSekolah";

const LandingPage: React.FC = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
       <section
        className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('/img/download.jpg')" }}
        >
            {/* Overlay supaya teks tetap terbaca */}
        <div className="absolute inset-0"></div>

        <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-green-600 mb-4">
            Selamat Datang di Portal Isekai
            </h2>
            <p className="text-black-500 mb-6 max-w-2xl mx-auto">
            Nikmati pengalaman belajar interaktif dengan fitur modern, akses mudah,
            dan desain yang ramah pengguna.
            </p>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
            Lihat Selengkapnya
            </button>
        </div>
        </section>
      {/* Section Konten 1 */}
      <section className="py-20 px-6 bg-white text-center">
        <h3 className="text-2xl font-semibold text-green-700 mb-4">
          Fitur Unggulan
        </h3>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Kami menyediakan berbagai fitur unggulan untuk mendukung pembelajaran digital mulai dari kelas online, forum diskusi, hingga
          akses materi tanpa batas.
        </p>
      </section>

      {/* Section Konten 2 */}
      <section className="py-20 px-6 bg-gray-50 text-center">
        <h3 className="text-2xl font-semibold text-green-700 mb-4">
          Mengapa Memilih Kami?
        </h3>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Dengan pengalaman panjang dalam dunia pendidikan dan teknologi, kami memberikan solusi terbaik untuk kebutuhan belajar modern.
        </p>
      </section>

      {/* Komponen ProfileSekolah */}
      <section className="py-20 px-6 bg-white">
        <ProfileSekolah />
      </section>

      {/* Footer-like Section */}
      <section className="py-20 bg-green-600 text-white text-center">
        <h3 className="text-2xl font-bold mb-4">Ayo Mulai Sekarang!</h3>
        <p className="mb-6">Bergabunglah bersama ribuan pelajar lainnya dan temukan pengalaman belajar baru.</p>
        <button className="px-6 py-2 bg-white text-green-700 rounded-lg shadow hover:bg-gray-100 transition">
          Daftar Gratis
        </button>
      </section>
    </PublicLayout>
  );
};

export default LandingPage;
