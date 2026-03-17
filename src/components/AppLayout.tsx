import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AREA_CLIENTE_LINKS } from '../config/links';
import { ADMIN_LINKS } from '../config/adminLinks';
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
  BarChart3,
  Building2,
  Users,
  FileDown,
  Settings,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import './AppLayout.css';

export default function AppLayout() {
  const { logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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

  const linkBase = cn(
    'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
    'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
  );
  const linkActive = 'bg-primary/30 text-foreground hover:bg-primary/40 hover:text-foreground';
  const sublinkBase = cn(
    'flex items-center gap-2.5 rounded-lg py-2 pl-10 pr-3 text-sm transition-colors',
    'text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
  );
  const sublinkActive = 'bg-primary/25 text-foreground hover:bg-primary/35';

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          'flex min-h-screen flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out',
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:shadow-xl',
          sidebarOpen ? 'w-[280px]' : 'w-[72px]'
        )}
      >
        <div className="flex min-h-16 flex-shrink-0 items-center gap-3 border-b border-sidebar-border px-4 py-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
            title={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          {sidebarOpen && (
            <Link to="/" className="text-lg font-bold tracking-wide text-primary no-underline">
              SAFE
            </Link>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto py-3" aria-label="Navegação principal">
          {isAdmin ? (
            <div className="flex flex-col gap-0.5">
              {ADMIN_LINKS.map((link) => {
                const isActive = location.pathname === link.href;
                const Icon =
                  link.id === 'dashboard' ? BarChart3 :
                  link.id === 'acompanhamento' ? ClipboardList :
                  link.id === 'empresas' ? Building2 :
                  link.id === 'usuarios' ? Users :
                  link.id === 'relatorios' ? FileDown :
                  link.id === 'configuracoes' ? Settings : FileText;
                return (
                  <Link
                    key={link.id}
                    to={link.href}
                    className={cn(linkBase, isActive && linkActive)}
                  >
                    <Icon size={20} className="shrink-0" />
                    {sidebarOpen && <span>{link.label}</span>}
                  </Link>
                );
              })}
            </div>
          ) : (
            <>
              <Link
                to="/"
                className={cn(linkBase, location.pathname === '/' && linkActive)}
              >
                <LayoutDashboard size={20} className="shrink-0" />
                {sidebarOpen && <span>Dashboard</span>}
              </Link>
              {AREA_CLIENTE_LINKS.map((link) => {
                if (link.basePath) {
                  const isActive = location.pathname.startsWith(link.basePath);
                  const isOpen = openSubmenus[link.id] ?? isActive;
                  const items = link.submenuItems ?? [
                    { path: 'arquivos', label: 'Solicitações' },
                    { path: 'adicionar', label: 'Adicionar' },
                  ];
                  const firstPath = `${link.basePath}/${items[0].path}`;

                  if (!sidebarOpen) {
                    return (
                      <Link
                        key={link.id}
                        to={firstPath}
                        className={cn(linkBase, 'justify-center px-0', isActive && linkActive)}
                        title={link.label}
                      >
                        <FolderOpen size={20} className="shrink-0" />
                      </Link>
                    );
                  }

                  const getSubIcon = (sub: { path: string; label: string }, idx: number) => {
                    if (sub.label === 'Adicionar' || sub.path === 'adicionar') return <Plus key={sub.path} size={20} />;
                    if (sub.label === 'Gerar Chamado') return <Plus key={sub.path} size={20} />;
                    if (sub.label === 'Solicitações') return <List key={sub.path} size={20} />;
                    if (sub.label === 'Arquivos') return <Ticket key={sub.path} size={20} />;
                    return idx === 0 ? <List key={sub.path} size={20} /> : <LayoutGrid key={sub.path} size={20} />;
                  };

                  return (
                    <div key={link.id} className="mb-1">
                      <button
                        type="button"
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors',
                          'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          isOpen && 'bg-sidebar-accent/50'
                        )}
                        onClick={() => {
                          if (!isOpen) {
                            setOpenSubmenus((prev) => ({ ...prev, [link.id]: true }));
                            navigate(firstPath);
                          } else {
                            toggleSubmenu(link.id);
                          }
                        }}
                        aria-expanded={isOpen}
                      >
                        <FolderOpen size={20} className="shrink-0 text-sidebar-foreground/80" />
                        <span className="min-w-0 flex-1 truncate">{link.label}</span>
                        <span className="shrink-0 text-sidebar-foreground/60">
                          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="flex flex-col gap-0.5 pl-0">
                          {items.map((sub, idx) => (
                            <Link
                              key={sub.path}
                              to={`${link.basePath}/${sub.path}`}
                              className={cn(
                                sublinkBase,
                                location.pathname === `${link.basePath}/${sub.path}` && sublinkActive
                              )}
                            >
                              {getSubIcon(sub, idx)}
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
                      className={linkBase}
                    >
                      <FileText size={20} className="shrink-0" />
                      {sidebarOpen && <span>{link.label}</span>}
                    </a>
                  );
                }

                return (
                  <Link
                    key={link.id}
                    to={link.href}
                    className={cn(linkBase, location.pathname === link.href && linkActive)}
                  >
                    <FileText size={20} className="shrink-0" />
                    {sidebarOpen && <span>{link.label}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <button
            type="button"
            onClick={logout}
            className={cn(
              'flex w-full items-center gap-2 rounded-md py-2 text-sm font-medium transition-colors',
              'text-destructive hover:bg-destructive/10',
              !sidebarOpen && 'justify-center'
            )}
            title="Sair"
          >
            <LogOut size={20} className="shrink-0" />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}
