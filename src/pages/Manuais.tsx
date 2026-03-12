import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Upload, X, FileText } from 'lucide-react';
import './Manuais.css';

type ArquivoEnviado = { id: string; name: string; size: number };

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
    <div className="manuais-page">
      <div className="manuais-main">
        <h1 className="manuais-titulo">Manuais e Procedimentos</h1>
        <p className="manuais-subtitulo">
          {isAdicionar ? 'Envie novos arquivos' : 'Arquivos enviados'}
        </p>

        {isAdicionar ? (
          <section className="manuais-adicionar">
            <form onSubmit={handleSubmit} className="manuais-form">
              <div
                className={`manuais-dropzone ${isDragging ? 'manuais-dropzone--active' : ''}`}
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
                <Upload className="manuais-dropzone-icon" size={40} />
                <p className="manuais-dropzone-text">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
              </div>

              {files.length > 0 && (
                <div className="manuais-list">
                  <h3 className="manuais-list-titulo">Arquivos selecionados ({files.length})</h3>
                  <ul className="manuais-list-ul">
                    {files.map((file, index) => (
                      <li key={`${file.name}-${index}`} className="manuais-list-item">
                        <FileText size={18} className="manuais-list-icon" />
                        <span className="manuais-list-nome">{file.name}</span>
                        <span className="manuais-list-tamanho">{formatSize(file.size)}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="manuais-list-remove"
                          aria-label="Remover arquivo"
                        >
                          <X size={18} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="manuais-submit"
                  >
                    {isUploading ? 'Enviando...' : 'Enviar arquivos'}
                  </button>
                </div>
              )}
            </form>
          </section>
        ) : (
          <section className="manuais-submenu">
            <h2 className="manuais-submenu-titulo">Todos os arquivos</h2>
            {uploadedFiles.length === 0 ? (
              <p className="manuais-empty">
                Nenhum arquivo enviado. Use &quot;Adicionar&quot; no menu para enviar.
              </p>
            ) : (
              <ul className="manuais-arquivos-list">
                {uploadedFiles.map((arq) => (
                  <li key={arq.id} className="manuais-arquivos-item">
                    <FileText size={18} className="manuais-arquivos-icon" />
                    <span className="manuais-arquivos-nome">{arq.name}</span>
                    <span className="manuais-arquivos-tamanho">{formatSize(arq.size)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
