// src/pages/projects/LoginPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <section className="hero is-fullheight" style={{ background: '#e6ffed' }}>
      <div className="hero-body">
        <div className="container">
          <div
            className="columns is-vcentered is-variable is-8"  // menambah spacing antar kolom
            style={{ paddingTop: '2rem', paddingBottom: '2rem' }}
          >

            {/* Kolom Gambar */}
            <div className="column is-5 is-offset-1">  {/* offset untuk sisakan space kiri */}
              <figure className="image" style={{ height: '100%', borderRadius: '10px', overflow: 'hidden' }}>
                <img
                  src="/img/gedung.jpeg"
                  alt="Login Illustration"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </figure>
            </div>

            {/* Kolom Form */}
            <div className="column is-5">
              <div
                className="box"
                style={{
                  backgroundColor: '#fff7e6',
                  borderRadius: '15px',
                  padding: '2rem',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                }}
              >
                <h1 className="title has-text-centered" style={{ color: '#3d9970' }}>
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
                    <button
                      className="button is-fullwidth"
                      style={{ backgroundColor: '#3d9970', color: 'white' }}
                    >
                      Login
                    </button>
                  </div>
                </form>

                <p className="has-text-centered" style={{ marginTop: '10px' }}>
                  Belum punya akun?{' '}
                  <Link to="/signup" style={{ color: '#ffcc00' }}>Daftar</Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
