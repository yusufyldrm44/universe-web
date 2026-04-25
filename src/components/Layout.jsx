import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/authStore';

const navItems = [
  { to: '/', label: 'Ana Sayfa', end: true },
  { to: '/listings', label: 'İlanlar' },
  { to: '/events', label: 'Etkinlikler' },
  { to: '/messages', label: 'Mesajlar' },
  { to: '/profile', label: 'Profil' },
];

const linkClasses = ({ isActive }) =>
  [
    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
    isActive
      ? 'bg-white/15 text-white'
      : 'text-white/80 hover:text-white hover:bg-white/10',
  ].join(' ');

export default function Layout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-primary text-white shadow">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <NavLink to="/" className="text-xl font-bold tracking-tight">
              UniVerse
            </NavLink>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={linkClasses}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {user?.full_name && (
              <span className="hidden sm:inline text-sm text-white/80">
                {user.full_name}
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
            >
              Çıkış
            </button>
          </div>
        </div>
        <nav className="md:hidden border-t border-white/10">
          <div className="max-w-6xl mx-auto px-2 py-2 flex gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={linkClasses}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
