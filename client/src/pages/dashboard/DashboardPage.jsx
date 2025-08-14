import React from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Kalau ada token/session, hapus di sini
    navigate("/"); // Kembali ke halaman login
  };

  return (
    <section className="hero is-fullheight" style={{ background: "#f9fff6" }}>
      {/* Navbar */}
      <nav
        className="navbar"
        style={{ backgroundColor: "#3d9970", padding: "0.5rem 1rem" }}
      >
        <div className="navbar-brand">
          <span
            className="navbar-item"
            style={{ color: "white", fontWeight: "bold", fontSize: "1.2rem" }}
          >
            🎓 Dashboard Sekolah
          </span>
        </div>
        <div className="navbar-end">
          <div className="navbar-item">
            <button
              onClick={handleLogout}
              className="button is-warning is-small"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="columns" style={{ height: "calc(100vh - 52px)" }}>
        {/* Sidebar */}
        <aside
          className="column is-2 menu p-4"
          style={{
            backgroundColor: "#e6ffed",
            borderRight: "2px solid #cceccc",
          }}
        >
          <p className="menu-label">Menu</p>
          <ul className="menu-list">
            <li>
              <a className="is-active">🏠 Beranda</a>
            </li>
            <li>
              <a>👨‍🎓 Data Siswa</a>
            </li>
            <li>
              <a>👩‍🏫 Data Guru</a>
            </li>
            <li>
              <a>📚 Jadwal Pelajaran</a>
            </li>
            <li>
              <a>📢 Pengumuman</a>
            </li>
            <li>
              <a>⚙️ Pengaturan</a>
            </li>
          </ul>
        </aside>

        {/* Konten Utama */}
        <div className="column p-5">
          <h1 className="title" style={{ color: "#3d9970" }}>
            Selamat Datang di Dashboard Sekolah
          </h1>
          <p className="subtitle" style={{ color: "#888" }}>
            Ringkasan informasi akademik sekolah Anda
          </p>

          {/* Cards */}
          <div className="columns is-multiline">
            <div className="column is-4">
              <div className="card">
                <div className="card-content has-text-centered">
                  <p className="title" style={{ color: "#ffcc00" }}>850</p>
                  <p className="subtitle">Total Siswa</p>
                </div>
              </div>
            </div>
            <div className="column is-4">
              <div className="card">
                <div className="card-content has-text-centered">
                  <p className="title" style={{ color: "#ffcc00" }}>45</p>
                  <p className="subtitle">Total Guru</p>
                </div>
              </div>
            </div>
            <div className="column is-4">
              <div className="card">
                <div className="card-content has-text-centered">
                  <p className="title" style={{ color: "#ffcc00" }}>20</p>
                  <p className="subtitle">Mata Pelajaran</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Data Siswa */}
          <div className="card" style={{ marginTop: "2rem" }}>
            <header
              className="card-header"
              style={{ backgroundColor: "#3d9970" }}
            >
              <p className="card-header-title" style={{ color: "white" }}>
                Data Siswa Terbaru
              </p>
            </header>
            <div className="card-content">
              <table className="table is-fullwidth is-striped is-hoverable">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Kelas</th>
                    <th>Jurusan</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Andi Pratama</td>
                    <td>XII IPA 1</td>
                    <td>IPA</td>
                    <td>Aktif</td>
                  </tr>
                  <tr>
                    <td>Siti Rahma</td>
                    <td>XII IPS 2</td>
                    <td>IPS</td>
                    <td>Aktif</td>
                  </tr>
                  <tr>
                    <td>Rudi Hartono</td>
                    <td>X IPA 3</td>
                    <td>IPA</td>
                    <td>Aktif</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}