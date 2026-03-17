import { useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { PageContent } from '@/components/PageContent';
import { Card, CardContent } from '@/components/ui/card';

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
    <PageContent>
      <PageHeader title={title} description={subtitle} />

      <Card>
        <CardContent className="pt-6">
          {isChamadoView ? (
            <>
              <h2 className="mb-2 text-base font-semibold text-foreground">{viewLabel}</h2>
              <p className="text-sm text-muted-foreground">
                {pathEnd === 'painel'
                  ? 'Painel de acompanhamento em construção. Em breve você poderá acompanhar os chamados aqui.'
                  : 'Formulário de abertura de chamado em construção. Em breve você poderá gerar chamados por aqui.'}
              </p>
            </>
          ) : isAdicionar ? (
            <>
              <h2 className="mb-2 text-base font-semibold text-foreground">Nova solicitação</h2>
              <p className="text-sm text-muted-foreground">
                Formulário de solicitação em construção. Em breve você poderá enviar por aqui.
              </p>
            </>
          ) : (
            <>
              <h2 className="mb-2 text-base font-semibold text-foreground">Todos os registros</h2>
              <p className="text-sm text-muted-foreground">
                Nenhum registro. Use &quot;Adicionar&quot; no menu para criar uma nova solicitação.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </PageContent>
  );
}
