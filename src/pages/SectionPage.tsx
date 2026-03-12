import { useLocation } from 'react-router-dom';
import './Manuais.css';

interface SectionPageProps {
  title: string;
  basePath: string;
  /** Subtítulo da tela (ex.: "Gera chamado", "Painel de acompanhamento"). Se não informado, usa "Lista" ou "Nova solicitação". */
  viewLabel?: string;
}

export default function SectionPage({ title, basePath, viewLabel }: SectionPageProps) {
  const location = useLocation();
  const pathEnd = location.pathname.replace(basePath, '').replace(/^\//, '') || 'arquivos';
  const isAdicionar = pathEnd === 'adicionar';
  const isChamadoView = Boolean(viewLabel);

  const subtitle = viewLabel ?? (isAdicionar ? 'Nova solicitação' : 'Lista de solicitações');

  return (
    <div className="manuais-page">
      <div className="manuais-main">
        <h1 className="manuais-titulo">{title}</h1>
        <p className="manuais-subtitulo">{subtitle}</p>

        {isChamadoView ? (
          <section className="manuais-submenu">
            <h2 className="manuais-submenu-titulo">{viewLabel}</h2>
            <p className="manuais-empty">
              {pathEnd === 'painel'
                ? 'Painel de acompanhamento em construção. Em breve você poderá acompanhar os chamados aqui.'
                : 'Formulário de abertura de chamado em construção. Em breve você poderá gerar chamados por aqui.'}
            </p>
          </section>
        ) : isAdicionar ? (
          <section className="manuais-adicionar">
            <h2 className="manuais-adicionar-titulo">Nova solicitação</h2>
            <p className="manuais-empty">
              Formulário de solicitação em construção. Em breve você poderá enviar por aqui.
            </p>
          </section>
        ) : (
          <section className="manuais-submenu">
            <h2 className="manuais-submenu-titulo">Todos os registros</h2>
            <p className="manuais-empty">
              Nenhum registro. Use &quot;Adicionar&quot; no menu para criar uma nova solicitação.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
