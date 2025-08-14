import React from 'react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <section className="hero is-fullheight" style={{ background: '#fff7e6', padding: 0 }}>
      <div className="columns is-gapless" style={{ height: '100vh', margin: 0 }}>
        
        {/* Kolom Gambar dengan Gradien Menyatu */}
        <div
          className="column is-half"
          style={{
            position: 'relative',
            backgroundImage: 'url("/img/gedung.jpeg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay gradien di sisi kanan */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '100%',
              background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, #fff7e6 100%)',
            }}
          ></div>
        </div>

        {/* Kolom Form */}
        <div className="column is-half is-flex is-align-items-center is-justify-content-center" style={{ backgroundColor: '#fff7e6' }}>
          <div
            className="box"
            style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: 'white',
              borderRadius: '15px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            {/* Logo */}
            <img
              src="/img/logo.png" // ganti dengan path logo kamu
              alt="Logo"
              style={{ width: '80px', height: '80px', marginBottom: '10px' }}
            />
            
            {/* Tulisan di bawah logo */}
            <p style={{ color: '#3d9970', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              As-Sakinah Information System
            </p>

            {/* Judul Login */}
            <h1 className="title has-text-centered" style={{ color: '#3d9970', marginBottom: '1.5rem' }}>
              Login
            </h1>

            <form>
              <div className="field">
                <label className="label" style={{ color: '#3d9970' }}>Email</label>
                <div className="control has-icons-left">
                  <input className="input" type="email" placeholder="Masukkan email" />
                  <span className="icon is-small is-left">
                    <i className="fas fa-envelope"></i>
                  </span>
                </div>
              </div>

              <div className="field">
                <label className="label" style={{ color: '#3d9970' }}>Password</label>
                <div className="control has-icons-left">
                  <input className="input" type="password" placeholder="Masukkan password" />
                  <span className="icon is-small is-left">
                    <i className="fas fa-lock"></i>
                  </span>
                </div>
              </div>

              <div className="field">
                <button className="button is-fullwidth" style={{ backgroundColor: '#3d9970', color: 'white' }}>
                  Login
                </button>
              </div>
            </form>

            <p className="has-text-centered" style={{ marginTop: '10px' }}>
              Belum punya akun? <Link to="/signup" style={{ color: '#c89003ff' }}>Daftar</Link>
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}