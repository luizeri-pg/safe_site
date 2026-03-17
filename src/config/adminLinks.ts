/**
 * Links do painel administrativo (role admin).
 */
export interface AdminLink {
  id: string;
  label: string;
  href: string;
  subtitle?: string;
}

export const ADMIN_LINKS: AdminLink[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', subtitle: 'Visão geral' },
  { id: 'acompanhamento', label: 'Acompanhamento', href: '/acompanhamento', subtitle: 'Solicitações' },
  { id: 'empresas', label: 'Empresas', href: '/admin/empresas', subtitle: 'Cadastro de empresas' },
  { id: 'usuarios', label: 'Usuários', href: '/admin/usuarios', subtitle: 'Cadastro de usuários' },
  { id: 'relatorios', label: 'Relatórios', href: '/admin/relatorios', subtitle: 'Exportar dados' },
  { id: 'configuracoes', label: 'Configurações', href: '/admin/configuracoes', subtitle: 'Parâmetros do sistema' },
];
