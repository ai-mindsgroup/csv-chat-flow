import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from '@/lib/axios';
import { isAxiosError } from 'axios';
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface UploadResponse {
  file_id: string;
  filename: string;
  rows: number;
  columns: number;
  message: string;
}

interface FileUploaderProps {
  onUploadSuccess: (fileId: string, fileName: string) => void;
}

const FileUploader = ({ onUploadSuccess }: FileUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress('Enviando arquivo...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<UploadResponse>('/csv/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadProgress('Processado com sucesso!');
      toast.success(`✅ ${response.data.filename}`, {
        description: `${response.data.rows.toLocaleString()} linhas • ${response.data.columns} colunas processadas`,
      });
      
      setTimeout(() => {
        onUploadSuccess(response.data.file_id, response.data.filename);
        setUploadProgress('');
      }, 1500);
    } catch (error) {
      console.error('Erro no upload:', error);
      let errorText = 'Tente novamente';
      if (isAxiosError(error)) {
        errorText = error.response?.data?.detail || error.message;
      } else if (error instanceof Error) {
        errorText = error.message;
      }
      toast.error('Erro no upload', {
        description: errorText,
      });
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-all duration-200
        ${isDragActive 
          ? 'border-primary bg-primary/5 scale-[1.02]' 
          : 'border-border hover:border-primary/50 hover:bg-accent/5'
        }
        ${uploading ? 'opacity-60 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4">
        {uploading ? (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div>
              <div className="text-lg font-medium text-foreground">Processando...</div>
              <div className="text-sm text-muted-foreground mt-1">{uploadProgress}</div>
            </div>
          </>
        ) : uploadProgress ? (
          <>
            <CheckCircle2 className="h-12 w-12 text-success" />
            <div className="text-lg font-medium text-success">{uploadProgress}</div>
          </>
        ) : (
          <>
            {isDragActive ? (
              <>
                <FileText className="h-12 w-12 text-primary" />
                <div className="text-lg font-medium text-primary">Solte o arquivo aqui</div>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div>
                  <div className="text-lg font-medium text-foreground">
                    Arraste seu arquivo CSV aqui
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    ou clique para selecionar
                  </div>
                </div>
                <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  Apenas arquivos .csv
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
