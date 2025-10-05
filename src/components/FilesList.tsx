import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { FileText, Database, Layers } from 'lucide-react';

interface FileInfo {
  file_id: string;
  filename: string;
  rows: number;
  columns: number;
}

interface FilesListProps {
  refreshTrigger?: number;
}

const FilesList = ({ refreshTrigger }: FilesListProps) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, [refreshTrigger]);

  const loadFiles = async () => {
    try {
      const response = await axios.get('/csv/files');
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm border p-6">
        <div className="animate-pulse text-muted-foreground">Carregando arquivos...</div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Arquivos Enviados
          <span className="text-sm text-muted-foreground font-normal">
            ({files.length})
          </span>
        </h3>
      </div>

      <div className="divide-y">
        {files.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <div>Nenhum arquivo enviado ainda</div>
            <div className="text-sm mt-1">Faça upload de um CSV para começar</div>
          </div>
        ) : (
          files.map((file, i) => (
            <div
              key={i}
              className="p-4 hover:bg-accent/5 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {file.filename}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ID: {file.file_id}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Database className="h-4 w-4" />
                  <span>{file.rows.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Layers className="h-4 w-4" />
                  <span>{file.columns}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FilesList;
