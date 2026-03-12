import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AREA_CLIENTE_LINKS } from '../config/links';
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  List,
  Plus,
  Ticket,
  LayoutGrid,
  ClipboardList,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import './AppLayout.css';

export default function AppLayout() {
  const { logout, isAdmin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenSubmenus((prev) => {
      const next = { ...prev };
      AREA_CLIENTE_LINKS.forEach((link) => {
        if (link.basePath && location.pathname.startsWith(link.basePath)) {
          next[link.id] = true;
        }
      });
      return next;
    });
  }, [location.pathname]);

  const toggleSubmenu = (id: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="app-layout">
      <aside className={`app-sidebar ${sidebarOpen ? 'app-sidebar--open' : 'app-sidebar--closed'}`}>
        <div className="app-sidebar-header">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="app-sidebar-close"
            title={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          {sidebarOpen && (
            <Link to="/" className="app-sidebar-logo">
              SAFE
            </Link>
          )}
        </div>

        <nav className="app-sidebar-nav" aria-label="Navegação principal">
          {isAdmin ? (
            <Link
              to="/acompanhamento"
              className={`app-sidebar-link ${location.pathname === '/acompanhamento' ? 'app-sidebar-link--active' : ''}`}
            >
              <ClipboardList size={20} />
              {sidebarOpen && <span>Acompanhamento</span>}
            </Link>
          ) : (
            <>
              <Link
                to="/"
                className={`app-sidebar-link ${location.pathname === '/' ? 'app-sidebar-link--active' : ''}`}
              >
                <LayoutDashboard size={20} />
                {sidebarOpen && <span>Dashboard</span>}
              </Link>
              {AREA_CLIENTE_LINKS.map((link) => {
            if (link.basePath) {
              const isActive = location.pathname.startsWith(link.basePath);
              const isOpen = openSubmenus[link.id] ?? isActive;
              const items = link.submenuItems ?? [
                { path: 'arquivos', label: 'Todos os arquivos' },
                { path: 'adicionar', label: 'Adicionar' },
              ];
              const firstPath = `${link.basePath}/${items[0].path}`;

              if (!sidebarOpen) {
                return (
                  <Link
                    key={link.id}
                    to={firstPath}
                    className={`app-sidebar-link ${isActive ? 'app-sidebar-link--active' : ''}`}
                    title={link.label}
                  >
                    <FolderOpen size={20} />
                  </Link>
                );
              }

              const subIcons = link.submenuItems
                ? [<Ticket key="ticket" size={18} />, <LayoutGrid key="grid" size={18} />]
                : [<List key="list" size={18} />, <Plus key="plus" size={18} />];

              return (
                <div key={link.id} className="app-sidebar-group-wrap">
                  <button
                    type="button"
                    className={`app-sidebar-group ${isOpen ? 'app-sidebar-group--open' : ''}`}
                    onClick={() => toggleSubmenu(link.id)}
                    aria-expanded={isOpen}
                  >
                    <FolderOpen size={20} />
                    <span className="app-sidebar-group-label">{link.label}</span>
                    <span className="app-sidebar-group-arrow">
                      {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="app-sidebar-sub">
                      {items.map((sub, idx) => (
                        <Link
                          key={sub.path}
                          to={`${link.basePath}/${sub.path}`}
                          className={`app-sidebar-sublink ${location.pathname === `${link.basePath}/${sub.path}` ? 'app-sidebar-sublink--active' : ''}`}
                        >
                          {subIcons[idx]}
                          <span>{sub.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            if (link.external) {
              return (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-sidebar-link"
                >
                  <FileText size={20} />
                  {sidebarOpen && <span>{link.label}</span>}
                </a>
              );
            }

            return (
              <Link
                key={link.id}
                to={link.href}
                className={`app-sidebar-link ${location.pathname === link.href ? 'app-sidebar-link--active' : ''}`}
              >
                <FileText size={20} />
                {sidebarOpen && <span>{link.label}</span>}
              </Link>
            );
          })}
            </>
          )}
        </nav>

        <div className="app-sidebar-footer">
          <button
            type="button"
            onClick={logout}
            className="app-sidebar-logout"
            title="Sair"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
