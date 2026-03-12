import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AREA_CLIENTE_LINKS } from '../config/links';
import './Home.css';

export default function Home() {
  const { logout } = useAuth();

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Safe Site</h1>
        <button type="button" onClick={logout} className="home-logout">
          Sair
        </button>
      </header>

      <main className="home-main">
        <h2 className="area-titulo">Área do Cliente</h2>

        <nav className="linktree" aria-label="Links da área do cliente">
          {AREA_CLIENTE_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.id}
                href={link.href}
                className="linktree-item"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="linktree-label">{link.label}</span>
                {link.subtitle && (
                  <span className="linktree-subtitle">{link.subtitle}</span>
                )}
              </a>
            ) : (
              <Link
                key={link.id}
                to={link.href}
                className="linktree-item"
              >
                <span className="linktree-label">{link.label}</span>
                {link.subtitle && (
                  <span className="linktree-subtitle">{link.subtitle}</span>
                )}
              </Link>
            )
          )}
        </nav>
      </main>
    </div>
  );
}
