import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  ChevronDown,
  Home,
  LogOut,
  MessageSquare,
  Sparkles,
  Store,
  User,
} from 'lucide-react';
import { useAuthStore } from '../services/authStore';

const navItems = [
  { to: '/', label: 'Ana Sayfa', icon: Home, end: true },
  { to: '/listings', label: 'İlanlar', icon: Store },
  { to: '/events', label: 'Etkinlikler', icon: Calendar },
  { to: '/messages', label: 'Mesajlar', icon: MessageSquare },
  { to: '/profile', label: 'Profil', icon: User },
];

const desktopLinkClasses = ({ isActive }) =>
  [
    'relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'text-primary' : 'text-slate-600 hover:text-primary',
    'after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-primary after:transition-all',
    isActive ? 'after:opacity-100' : 'after:opacity-0',
  ].join(' ');

const mobileLinkClasses = ({ isActive }) =>
  [
    'flex flex-col items-center gap-0.5 flex-1 py-2 text-[11px] font-medium transition-colors',
    isActive ? 'text-primary' : 'text-slate-500 hover:text-primary',
  ].join(' ');

const initialsOf = (name) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';

export default function Layout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    setLeaving(true);
    setTimeout(() => {
      logout();
      navigate('/login', { replace: true });
    }, 200);
  };

  return (
    <div
      className={`min-h-full flex flex-col bg-stone-50 transition-opacity duration-200 ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-slate-200/70">
        <div className="max-w-screen-2xl mx-auto px-8 lg:px-16 h-16 flex items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary text-white flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight text-primary-dark">
              UniVerse
            </span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={desktopLinkClasses}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Bildirimler"
              className="relative w-10 h-10 inline-flex items-center justify-center rounded-xl text-slate-600 hover:text-primary hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger ring-2 ring-white" />
            </button>

            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-gradient-primary text-white text-sm font-semibold flex items-center justify-center">
                  {initialsOf(user?.full_name)}
                </span>
                <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[8rem] truncate">
                  {user?.full_name || 'Kullanıcı'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    menuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/70 overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {user?.full_name || 'Kullanıcı'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.university_email || ''}
                    </p>
                    {user?.university && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {user.university}
                        {user.department ? ` · ${user.department}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Profilim
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-screen-2xl mx-auto px-8 lg:px-16 py-12 pb-24 md:pb-12 animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Mobil alt nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur bg-white/90 border-t border-slate-200">
        <div className="flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={mobileLinkClasses}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
