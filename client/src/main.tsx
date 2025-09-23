import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage.tsx";
import { Toaster } from "sonner";
import SignUpPage from "./pages/SignUpPage.tsx";
import AuthLayout from "./pages/layout/AuthLayout.tsx";
// import DashboardPage from "./pages/DashboardPage.tsx";
import PublicRoute from "./routes/PublicRoute.tsx";
import ProfilePage from "./pages/settings/ProfilePage.tsx";
import PasswordPage from "./pages/settings/PasswordPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import LandingPage from "./pages/landingPage/LandingPage.tsx";
import DataSiswaPage from "./pages/admin/siswa/DataSiswaPage.tsx";
import EditSiswaPage from "./pages/admin/siswa/EditSiswaPage.tsx";
import DataGuruPage from "./pages/admin/guru/DataGuruPage.tsx";
import ProfileSekolah from "./pages/landingPage/components/ProfileSekolah.tsx";
import KepalaSekolah from "./pages/landingPage/guru/KepalaSekolah.tsx";
import Fasilitas from "./pages/landingPage/fasilitas/Fasilitas.tsx";
import StrukturOrganisasi from "./pages/landingPage/guru/StrukturOrganisasi.tsx";
import BukuIndukPage from "./pages/admin/buku-induk/BukuIndukPage.tsx";
import SiswaDetail from "./pages/admin/buku-induk/components/SiswaDetail.tsx";
import DataKelasPage from "./pages/admin/kelas/DataKelasPage.tsx";
import Berita from "./pages/landingPage/berita/Berita.tsx";
import DashboardPageIndex from "./pages/dashboard/index.tsx";
import PendaftaranPage from "./pages/admin/pendaftaran/PendaftaranPage.tsx";
import CekStatusPage from "./pages/CekStatusPage.tsx";
import TahunAjaranPage from "./pages/admin/tahun-ajaran/TahunAjaranPage.tsx";
import SiswaBaruLayout from "./pages/layout/siswa-baru/SiswaBaruLayout.tsx";
import PembayaranPage from "./pages/admin/pembayaran/PembayaranPage.tsx";

const root = document.getElementById("root") as HTMLElement;

const publicRoute = [
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },
  { path: "/cek-status", element: <CekStatusPage /> },
];

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Toaster duration={2000} position="top-right" />
    <Routes>
      {publicRoute.map(({ path, element }) => (
        <Route
          path={path}
          element={<PublicRoute>{element}</PublicRoute>}
          key={path}
        />
      ))}
      <Route path="/signup" element={<SignUpPage />} />

      <Route path="/profil-sekolah" element={<ProfileSekolah />} />
      <Route path="/kepala-sekolah" element={<KepalaSekolah />} />
      <Route path="/fasilitas" element={<Fasilitas />} />
      <Route path="/struktur-organisasi" element={<StrukturOrganisasi />} />
      <Route path="/berita" element={<Berita />} />
      <Route element={<AuthLayout />}>
        <Route path="/dashboard" element={<DashboardPageIndex />} />
        {/* Data Siswa */}
        <Route path="/siswa" element={<DataSiswaPage />} />
        <Route path="/siswa/:id/edit" element={<EditSiswaPage />} />
        {/* Pendaftaran siswa baru */}
        {/* Grup khusus siswa baru */}
        <Route path="/siswa-baru" element={<SiswaBaruLayout />}>
          {/* Default redirect ke pendaftaran */}
          <Route index element={<Navigate to="pendaftaran" replace />} />
          <Route path="pendaftaran" element={<PendaftaranPage />} />
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

        <Route path="/settings/profile" element={<ProfilePage />} />
        <Route path="/settings/password" element={<PasswordPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
      {/* <Route path="/test" element={<h2>Halo ini adalah test</h2>} /> */}
    </Routes>
  </BrowserRouter>
);
