import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [form, setForm] = useState({ university_email: '', password: '' });

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form);
    if (result.ok) {
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">UniVerse</h1>
          <p className="mt-2 text-sm text-slate-500">
            Üniversite hesabınla giriş yap
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-medium py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Hesabın yok mu?{' '}
          <Link
            to="/register"
            className="text-primary font-medium hover:underline"
          >
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
}
