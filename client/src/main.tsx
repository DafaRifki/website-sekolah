import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { Suspense, lazy } from "react";
import ScrollToTop from "./components/ScrollToTop.tsx";
import Loading from "./components/Loading.tsx";

// Lazy load all page components
const LoginPage = lazy(() => import("./pages/LoginPage.tsx"));
const SignUpPage = lazy(() => import("./pages/SignUpPage.tsx"));
const AuthLayout = lazy(() => import("./pages/layout/AuthLayout.tsx"));
const PublicRoute = lazy(() => import("./routes/PublicRoute.tsx"));
const ProfilePage = lazy(() => import("./pages/settings/ProfilePage.tsx"));
const PasswordPage = lazy(() => import("./pages/settings/PasswordPage.tsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.tsx"));
const LandingPage = lazy(() => import("./pages/landingPage/LandingPage.tsx"));
const DataSiswaPage = lazy(() => import("./pages/admin/siswa/DataSiswaPage.tsx"));
const EditSiswaPage = lazy(() => import("./pages/admin/siswa/EditSiswaPage.tsx"));
const DataGuruPage = lazy(() => import("./pages/admin/guru/DataGuruPage.tsx"));
const ProfileSekolah = lazy(() => import("./pages/landingPage/components/ProfileSekolah.tsx"));
const KepalaSekolah = lazy(() => import("./pages/landingPage/guru/KepalaSekolah.tsx"));
const Fasilitas = lazy(() => import("./pages/landingPage/fasilitas/Fasilitas.tsx"));
const StrukturOrganisasi = lazy(() => import("./pages/landingPage/guru/StrukturOrganisasi.tsx"));
const BukuIndukPage = lazy(() => import("./pages/admin/buku-induk/BukuIndukPage.tsx"));
const SiswaDetail = lazy(() => import("./pages/admin/buku-induk/components/SiswaDetail.tsx"));
const DataKelasPage = lazy(() => import("./pages/admin/kelas/DataKelasPage.tsx"));
const Berita = lazy(() => import("./pages/landingPage/berita/Berita.tsx"));
const DashboardPageIndex = lazy(() => import("./pages/dashboard/index.tsx"));
const PendaftaranPage = lazy(() => import("./pages/admin/pendaftaran/PendaftaranPage.tsx"));
const CekStatusPage = lazy(() => import("./pages/CekStatusPage.tsx"));
const TahunAjaranPage = lazy(() => import("./pages/admin/tahun-ajaran/TahunAjaranPage.tsx"));
const SiswaBaruLayout = lazy(() => import("./pages/layout/siswa-baru/SiswaBaruLayout.tsx"));
const Pendaftaran = lazy(() => import("./pages/landingPage/pendaftaran/Pendaftaran.tsx"));
const TenagaKependidikan = lazy(() => import("./pages/landingPage/guru/TenagaKependidikan.tsx"));
const PembayaranPage = lazy(() => import("./pages/admin/pembayaran/PembayaranPage.tsx"));
const TagihanPage = lazy(() => import("./pages/admin/tagihan/TagihanPage.tsx"));
const TagihanSiswaPage = lazy(() => import("./pages/dashboard/siswa/TagihanSiswaPage.tsx"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loading />
  </div>
);

const root = document.getElementById("root") as HTMLElement;

const publicRoute = [
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },
  { path: "/cek-status", element: <CekStatusPage /> },
];

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    {/* supaya selalu scroll ke atas */}
    <ScrollToTop />
    <Toaster duration={2000} position="top-right" />

    <Suspense fallback={<PageLoader />}>
      <Routes>
        {publicRoute.map(({ path, element }) => (
          <Route
            path={path}
            element={<PublicRoute>{element}</PublicRoute>}
            key={path}
          />
        ))}

        <Route path="/profil-sekolah" element={<ProfileSekolah />} />
        <Route path="/kepala-sekolah" element={<KepalaSekolah />} />
        <Route path="/fasilitas" element={<Fasilitas />} />
        <Route path="/struktur-organisasi" element={<StrukturOrganisasi />} />
        <Route path="/berita" element={<Berita />} />
        <Route path="/pendaftaran" element={<Pendaftaran />} />
        <Route path="/tenaga-kependidikan" element={<TenagaKependidikan />} />

        {/* Grup dengan AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<DashboardPageIndex />} />
          <Route path="/dashboard/tagihan" element={<TagihanSiswaPage />} />

          {/* Data Siswa */}
          <Route path="/siswa" element={<DataSiswaPage />} />
          <Route path="/siswa/:id/edit" element={<EditSiswaPage />} />

          {/* Pendaftaran siswa baru */}
          <Route path="/siswa-baru" element={<SiswaBaruLayout />}>
            <Route index element={<Navigate to="pendaftaran" replace />} />
            <Route path="pendaftaran" element={<PendaftaranPage />} />
            <Route path="tagihan" element={<TagihanPage />} />
            <Route path="pembayaran" element={<PembayaranPage />} />
          </Route>

          {/* Data Guru */}
          <Route path="/guru" element={<DataGuruPage />} />

          {/* Data Kelas */}
          <Route path="/kelas" element={<DataKelasPage />} />

          {/* Data Tahun Ajaran */}
          <Route path="/tahun-ajaran" element={<TahunAjaranPage />} />

          {/* Buku Induk */}
          <Route path="/buku-induk" element={<BukuIndukPage />} />
          <Route path="/buku-induk/:id" element={<SiswaDetail />} />

          {/* Settings */}
          <Route path="/settings/profile" element={<ProfilePage />} />
          <Route path="/settings/password" element={<PasswordPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
