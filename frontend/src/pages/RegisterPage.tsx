import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Nama lengkap harus diisi';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak sama';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      setErrors(prev => ({
        ...prev,
        email: err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Daftar Akun</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Nama Lengkap</label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Masukkan email"
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Masukkan password"
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">Konfirmasi Password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Masukkan ulang password"
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Mendaftar...
                    </>
                  ) : 'Daftar'}
                </button>

                <div className="text-center">
                  <button 
                    type="button" 
                    className="btn btn-link" 
                    onClick={() => navigate('/login')}
                  >
                    Sudah punya akun? Masuk
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;