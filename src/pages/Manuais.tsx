import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Upload, X, FileText, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { PageContent } from '@/components/PageContent';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import './Manuais.css';

const IS_DEV = import.meta.env.DEV;

type ArquivoEnviado = { id: string; name: string; size: number; url?: string; mock?: boolean };

/** Arquivos de exemplo para visualização em desenvolvimento */
const MOCK_ARQUIVOS: ArquivoEnviado[] = [
  { id: 'mock-1', name: 'Manual de Segurança do Trabalho.pdf', size: 1024 * 450, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', mock: true },
  { id: 'mock-2', name: 'Procedimento Operacional Padrão - EPI.pdf', size: 1024 * 280, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', mock: true },
  { id: 'mock-3', name: 'NR-12 - Segurança em Máquinas e Equipamentos.pdf', size: 1024 * 1200, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', mock: true },
  { id: 'mock-4', name: 'Checklist de Inspeção Mensal.docx', size: 1024 * 85, mock: true },
  { id: 'mock-5', name: 'Ficha de EPI - Entrega e Devolução.xlsx', size: 1024 * 42, mock: true },
];

export default function Manuais() {
  const location = useLocation();
  const isAdicionar = location.pathname.endsWith('/adicionar');

  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<ArquivoEnviado[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  }

  function handleSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    setFiles((prev) => [...prev, ...selected]);
    e.target.value = '';
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) return;
    setIsUploading(true);
    await new Promise((r) => setTimeout(r, 800));
    const novos = files.map((f) => ({
      id: `${Date.now()}-${f.name}`,
      name: f.name,
      size: f.size,
    }));
    setUploadedFiles((prev) => [...novos, ...prev]);
    setFiles([]);
    setIsUploading(false);
  }

  return (
    <PageContent>
      <PageHeader
        title="Manuais e Procedimentos"
        description={isAdicionar ? 'Envie novos arquivos' : 'Arquivos enviados'}
      />

      {isAdicionar ? (
          <Card>
            <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-input bg-muted/30 hover:bg-muted/50'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.odt"
                  onChange={handleSelectFiles}
                  className="manuais-input-hidden"
                />
                <Upload className="size-10 shrink-0 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
              </div>

              {files.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground">Arquivos selecionados ({files.length})</h3>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                        <FileText className="size-5 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate text-foreground">{file.name}</span>
                        <span className="shrink-0 text-muted-foreground">{formatSize(file.size)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          aria-label="Remover arquivo"
                        >
                          <X className="size-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <Button type="submit" disabled={isUploading}>
                    {isUploading ? 'Enviando...' : 'Enviar arquivos'}
                  </Button>
                </div>
              )}
            </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-base font-semibold text-foreground">Arquivos</h2>
              {(uploadedFiles.length === 0 && !IS_DEV) ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum arquivo enviado. Use &quot;Adicionar&quot; no menu para enviar.
                </p>
              ) : (
                <>
                  {IS_DEV && uploadedFiles.length === 0 && (
                    <p className="mb-3 text-xs text-muted-foreground">
                      Dados de exemplo. Envie arquivos reais em &quot;Adicionar&quot; para ver seus documentos.
                    </p>
                  )}
                  <ul className="space-y-2">
                    {(uploadedFiles.length > 0 ? uploadedFiles : MOCK_ARQUIVOS).map((arq) => {
                      const isClickable = !!(arq.url || arq.mock);
                      const handleClick = () => {
                        if (arq.url) window.open(arq.url, '_blank', 'noopener,noreferrer');
                        else if (arq.mock) window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank', 'noopener,noreferrer');
                      };
                      return (
                        <li
                          key={arq.id}
                          className={`flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm ${isClickable ? 'cursor-pointer hover:bg-muted/60 transition-colors' : ''}`}
                          role={isClickable ? 'button' : undefined}
                          onClick={isClickable ? handleClick : undefined}
                          onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } } : undefined}
                          tabIndex={isClickable ? 0 : undefined}
                        >
                          <FileText className="size-5 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate text-foreground">{arq.name}</span>
                          <span className="shrink-0 text-muted-foreground">{formatSize(arq.size)}</span>
                          {isClickable && (
                            <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        )}
    </PageContent>
  );
}
