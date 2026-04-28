import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  Sparkles,
} from 'lucide-react';
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Sol — marka paneli */}
      <aside className="hidden lg:flex relative min-h-screen bg-stone-900 text-white">
        <div className="absolute top-12 left-12 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white/70" strokeWidth={1.5} />
          <span className="text-sm font-medium tracking-[0.18em] uppercase text-white/80">
            UniVerse
          </span>
        </div>

        <div className="flex flex-col justify-center px-16 xl:px-20 w-full">
          <div className="max-w-2xl">
            <h2 className="font-serif font-normal text-white text-6xl xl:text-7xl leading-[1.05] tracking-tight">
              Üniversite hayatın,
              <br />
              tek bir evrende.
            </h2>
            <span className="block w-16 h-px bg-white/30 mt-10" />
            <p className="mt-6 font-serif italic text-white/50 text-lg xl:text-xl">
              İlanlar, etkinlikler, topluluklar.
            </p>
          </div>
        </div>

        <span className="absolute bottom-12 right-12 text-xs uppercase tracking-[0.22em] text-white/40">
          © 2026 UNIVERSE
        </span>
      </aside>

      {/* Sağ — form */}
      <section className="flex items-center justify-center px-6 py-12 lg:py-16">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-primary">UniVerse</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary-dark">
              Tekrar hoş geldin
            </h1>
            <p className="mt-2 text-slate-500">
              Hesabına giriş yaparak devam et.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="university_email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Üniversite E-postası
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="university_email"
                  name="university_email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.university_email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-3 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
                  placeholder="ornek@universite.edu.tr"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Şifre
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-3 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 text-sm text-danger bg-red-50 border border-red-100 rounded-xl px-3.5 py-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white font-semibold py-3 rounded-xl shadow-glow transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Giriş yapılıyor…
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Hesabın yok mu?{' '}
            <Link
              to="/register"
              className="text-accent font-semibold hover:underline"
            >
              Kayıt ol
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
