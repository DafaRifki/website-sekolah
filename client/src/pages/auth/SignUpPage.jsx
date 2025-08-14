import React from 'react';
import { Link } from 'react-router-dom';

export default function SignUpPage() {
  return (
    <section className="hero is-fullheight" style={{ background: '#fffbe6' }}>
      <div className="hero-body is-flex is-align-items-center is-justify-content-center">
        <div className="box" style={{ backgroundColor: '#e6ffed', borderRadius: '15px', width: '100%', maxWidth: '400px' }}>
          <h1 className="title has-text-centered" style={{ color: '#ffcc00' }}>
            Sign Up
          </h1>
          <form>
            <div className="field">
              <label className="label" style={{ color: '#3d9970' }}>Nama Lengkap</label>
              <div className="control has-icons-left">
                <input className="input" type="text" placeholder="Masukkan nama" />
                <span className="icon is-small is-left">
                  <i className="fas fa-user"></i>
                </span>
              </div>
            </div>

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
              <button className="button is-fullwidth" style={{ backgroundColor: '#ffcc00', color: '#3d9970' }}>
                Daftar
              </button>
            </div>
          </form>

          <p className="has-text-centered" style={{ marginTop: '10px' }}>
            Sudah punya akun? <Link to="/" style={{ color: '#3d9970' }}>Login</Link>
          </p>
        </div>
      </div>
    </section>
  );
}