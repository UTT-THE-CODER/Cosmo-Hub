import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Menu, Rocket, Sparkles, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/discover', label: 'Discover' },
  { to: '/news', label: 'News' },
  { to: '/quotes', label: 'Quotes' },
  { to: '/my-cosmos', label: 'My Cosmos' },
  { to: '/planet-lab', label: 'Planet Lab' },
  { to: '/about', label: 'About' },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Explorer';

  const logout = async () => {
    await signOut();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <div className="cosmos-app">
      <div className="starfield fixed inset-0 -z-10 opacity-90" />

      <header className="cosmos-header">
        <div className="cosmos-header-inner">
          <Link to="/" className="brand-link">
            <span className="brand-mark">
              <Rocket size={18} />
            </span>
            <span className="brand-copy">
              <span className="brand-name">Cosmos Hub</span>
              <span className="brand-index">Mission Control</span>
            </span>
          </Link>

          <nav className="desktop-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `desktop-nav-link ${isActive ? 'desktop-nav-link-active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="desktop-auth">
            {user ? (
              <div className="user-menu-wrap">
                <button onClick={() => setUserMenuOpen((current) => !current)} className="user-menu-button" aria-expanded={userMenuOpen}>
                  <UserRound size={15} className="user-icon" />
                  <span>{displayName}</span>
                </button>
                {userMenuOpen && (
                  <div className="user-menu-popover">
                    <div className="user-menu-head">
                      <span className="user-menu-name">{displayName}</span>
                      <span className="user-menu-mail">{user.email}</span>
                    </div>
                    <button onClick={logout} className="user-menu-logout">
                      <LogOut size={15} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="login-link">
                  <LogIn size={15} />
                  Login
                </Link>
                <Link to="/signup" className="signup-link">
                  Sign up
                </Link>
              </>
            )}
            <Link to="/planet-lab" className="create-button">
              Create a Planet
            </Link>
          </div>

          <button className="mobile-menu-button" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle navigation">
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="mobile-panel">
            <nav className="mobile-nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {user ? (
                <button onClick={logout} className="mobile-logout">
                  <LogOut size={15} />
                  Log out
                </button>
              ) : (
                <>
                  <NavLink to="/login" onClick={() => setMobileOpen(false)} className="mobile-login">
                    <LogIn size={15} /> Login
                  </NavLink>
                  <NavLink to="/signup" onClick={() => setMobileOpen(false)} className="mobile-signup">
                    Sign up
                  </NavLink>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="cosmos-page-shell">
        {children}
      </main>

      <footer className="cosmos-footer">
        <div className="cosmos-footer-inner">
          <div className="cosmos-footer-brand">
            <Sparkles size={16} className="footer-spark" />
            <span>Cosmos Hub — interactive exploration for curious minds.</span>
          </div>
          <div className="cosmos-footer-path">{location.pathname}</div>
        </div>
      </footer>
    </div>
  );
}
