import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  GraduationCap,
  Info,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
} from 'lucide-react';
import { useAuthStore } from '../services/authStore';

const EDU_TR_REGEX = /^[^\s@]+@[^\s@]+\.edu\.tr$/i;

const scorePassword = (pw) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score += 1;
  if (pw.length >= 10) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 4);
};

const STRENGTH_META = [
  { label: '', color: '', width: 'w-0' },
  { label: 'Zayıf', color: 'bg-danger', width: 'w-1/4' },
  { label: 'Orta', color: 'bg-warning', width: 'w-2/4' },
  { label: 'İyi', color: 'bg-accent', width: 'w-3/4' },
  { label: 'Güçlü', color: 'bg-success', width: 'w-full' },
];

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

  const strength = useMemo(
    () => scorePassword(form.password),
    [form.password],
  );
  const strengthMeta = STRENGTH_META[strength];

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
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
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
              Bir hesap aç,
              <br />
              kampüse katıl.
            </h2>
            <span className="block w-16 h-px bg-white/30 mt-10" />
            <p className="mt-6 font-serif italic text-white/50 text-lg xl:text-xl">
              Yalnızca .edu.tr e-postaları.
            </p>
          </div>
        </div>

        <span className="absolute bottom-12 right-12 text-xs uppercase tracking-[0.22em] text-white/40">
          © 2026 UNIVERSE
        </span>
      </aside>

      <section className="flex items-center justify-center px-6 py-10 lg:py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-primary">UniVerse</span>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-primary-dark">Hesap oluştur</h1>
            <p className="mt-2 text-slate-500">
              Birkaç adımda topluluğa katıl.
            </p>
          </div>

          <div className="mb-5 flex items-start gap-2.5 text-sm bg-accent-light/60 border border-accent/20 text-primary-dark rounded-xl px-3.5 py-3">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-accent" />
            <span>
              <strong className="font-semibold">İpucu:</strong> Yalnızca{' '}
              <code className="font-mono bg-white/60 px-1.5 py-0.5 rounded">
                .edu.tr
              </code>{' '}
              uzantılı e-posta adresleri kabul edilir.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Field
              icon={User}
              label="Ad Soyad"
              id="full_name"
              name="full_name"
              type="text"
              required
              value={form.full_name}
              onChange={handleChange}
              placeholder="Ahmet Yılmaz"
            />

            <Field
              icon={Mail}
              label="Üniversite E-postası"
              id="university_email"
              name="university_email"
              type="email"
              required
              autoComplete="email"
              value={form.university_email}
              onChange={handleChange}
              placeholder="ornek@universite.edu.tr"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                icon={Building2}
                label="Üniversite"
                hint="opsiyonel"
                id="university"
                name="university"
                type="text"
                value={form.university}
                onChange={handleChange}
                placeholder="Boğaziçi Üniv."
              />
              <Field
                icon={GraduationCap}
                label="Bölüm"
                hint="opsiyonel"
                id="department"
                name="department"
                type="text"
                value={form.department}
                onChange={handleChange}
                placeholder="Bilg. Müh."
              />
            </div>

            <div>
              <Field
                icon={Lock}
                label="Şifre"
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                placeholder="En az 6 karakter"
              />
              {form.password && (
                <div className="mt-2">
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strengthMeta.color} ${strengthMeta.width}`}
                    />
                  </div>
                  {strengthMeta.label && (
                    <p className="mt-1.5 text-xs text-slate-500">
                      Şifre gücü:{' '}
                      <span className="font-medium text-slate-700">
                        {strengthMeta.label}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {displayError && (
              <div className="flex items-start gap-2.5 text-sm text-danger bg-red-50 border border-red-100 rounded-xl px-3.5 py-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{displayError}</span>
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
                  Kayıt yapılıyor…
                </>
              ) : (
                'Kayıt Ol'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Zaten hesabın var mı?{' '}
            <Link
              to="/login"
              className="text-accent font-semibold hover:underline"
            >
              Giriş yap
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function Field({ icon: Icon, label, hint, id, ...inputProps }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5"
      >
        <span>{label}</span>
        {hint && (
          <span className="text-xs font-normal text-slate-400">{hint}</span>
        )}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        )}
        <input
          id={id}
          {...inputProps}
          className="w-full pl-11 pr-3 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
        />
      </div>
    </div>
  );
}
