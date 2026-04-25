import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/authStore';

const EDU_TR_REGEX = /^[^\s@]+@[^\s@]+\.edu\.tr$/i;

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [form, setForm] = useState({
    full_name: '',
    university_email: '',
    university: '',
    department: '',
    password: '',
  });
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!EDU_TR_REGEX.test(form.university_email)) {
      setLocalError('E-posta .edu.tr uzantılı olmalıdır.');
      return;
    }
    if (form.password.length < 6) {
      setLocalError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    const result = await register(form);
    if (result.ok) {
      navigate('/', { replace: true });
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">UniVerse</h1>
          <p className="mt-2 text-sm text-slate-500">
            Üniversite topluluğuna katıl
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Ad Soyad
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              value={form.full_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ahmet Yılmaz"
            />
          </div>

          <div>
            <label
              htmlFor="university_email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Üniversite E-postası
            </label>
            <input
              id="university_email"
              name="university_email"
              type="email"
              required
              autoComplete="email"
              value={form.university_email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="ornek@universite.edu.tr"
            />
            <p className="mt-1 text-xs text-slate-400">
              .edu.tr uzantılı bir adres olmalı
            </p>
          </div>

          <div>
            <label
              htmlFor="university"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Üniversite{' '}
              <span className="text-slate-400 font-normal">(opsiyonel)</span>
            </label>
            <input
              id="university"
              name="university"
              type="text"
              value={form.university}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Boğaziçi Üniversitesi"
            />
          </div>

          <div>
            <label
              htmlFor="department"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Bölüm{' '}
              <span className="text-slate-400 font-normal">(opsiyonel)</span>
            </label>
            <input
              id="department"
              name="department"
              type="text"
              value={form.department}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Bilgisayar Mühendisliği"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="En az 6 karakter"
            />
          </div>

          {displayError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {displayError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-medium py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Kayıt yapılıyor…' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Zaten hesabın var mı?{' '}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
}
