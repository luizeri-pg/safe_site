/**
 * Links e botões da Área do Cliente.
 * Atualize as URLs conforme os destinos reais (forms, SOC, bucket, etc.).
 * Itens com submenu têm basePath e exibem itens na sidebar.
 */
export interface SubmenuItem {
  path: string;
  label: string;
}

export interface AreaLink {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  external?: boolean;
  /** Se definido, o item na sidebar tem seta e submenu. */
  basePath?: string;
  /** Itens do submenu. Se não informado, usa "Todos os arquivos" e "Adicionar". */
  submenuItems?: SubmenuItem[];
}

export const AREA_CLIENTE_LINKS: AreaLink[] = [
  {
    id: 'soc',
    label: 'SOC',
    subtitle: 'URL',
    href: 'https://sistema.soc.com.br/WebSoc/',
    external: true,
  },
  {
    id: 'manuais',
    label: 'Manuais e Procedimentos',
    subtitle: 'Envie e consulte arquivos',
    href: '/manuais-e-procedimentos',
    basePath: '/manuais-e-procedimentos',
    external: false,
  },
  {
    id: 'ppp',
    label: 'Solicitação de PPP',
    subtitle: 'Forms',
    href: '/solicitacao-ppp/arquivos',
    basePath: '/solicitacao-ppp',
    external: false,
  },
  {
    id: 'cat',
    label: 'Abertura de CAT',
    subtitle: 'Forms',
    href: '/abertura-cat/arquivos',
    basePath: '/abertura-cat',
    external: false,
  },
  {
    id: 'cargo',
    label: 'Inclusão de Cargo',
    subtitle: 'Forms',
    href: '/inclusao-cargo/arquivos',
    basePath: '/inclusao-cargo',
    external: false,
  },
  {
    id: 'setor-ghe',
    label: 'Inclusão de Setor | GHE',
    subtitle: 'Forms',
    href: '/inclusao-setor-ghe/arquivos',
    basePath: '/inclusao-setor-ghe',
    external: false,
  },
  {
    id: 'unidade',
    label: 'Inclusão de Nova Unidade',
    subtitle: 'Forms',
    href: '/inclusao-nova-unidade/arquivos',
    basePath: '/inclusao-nova-unidade',
    external: false,
  },
  {
    id: 'chamado',
    label: 'Abertura de Chamado',
    subtitle: 'Gera chamado e painel de acompanhamento',
    href: '/abertura-chamado/gera-chamado',
    basePath: '/abertura-chamado',
    submenuItems: [
      { path: 'gera-chamado', label: 'Gera chamado' },
      { path: 'painel', label: 'Painel de acompanhamento' },
    ],
    external: false,
  },
  {
    id: 'visita',
    label: 'Solicitação de Visita Técnica',
    subtitle: 'Forms',
    href: '/solicitacao-visita-tecnica/arquivos',
    basePath: '/solicitacao-visita-tecnica',
    external: false,
  },
];
