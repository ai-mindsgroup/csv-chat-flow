import { useState } from 'react';
import MetricsBar from '@/components/MetricsBar';
import FileUploader from '@/components/FileUploader';
import ChatInterface from '@/components/ChatInterface';
import FilesList from '@/components/FilesList';
import HealthStatus from '@/components/HealthStatus';
import { Brain } from 'lucide-react';

const Index = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentFileId, setCurrentFileId] = useState<string | undefined>();
  const [currentFileName, setCurrentFileName] = useState<string | undefined>();

  const handleUploadSuccess = (fileId: string, fileName: string) => {
    setRefreshKey((prev) => prev + 1);
    setCurrentFileId(fileId);
    setCurrentFileName(fileName);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              EDA AI Minds
            </h1>
            <p className="text-lg text-muted-foreground">
              Análise Inteligente de Dados CSV
            </p>
          </div>
          <div className="flex justify-center">
            <HealthStatus />
          </div>
        </header>

        {/* Metrics Dashboard */}
        <section>
          <MetricsBar key={`metrics-${refreshKey}`} />
        </section>

        {/* Upload Section */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            📤 Upload de CSV
          </h2>
          <FileUploader onUploadSuccess={handleUploadSuccess} />
        </section>

        {/* Chat Section */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            💬 Chat com IA
          </h2>
          <ChatInterface fileId={currentFileId} fileName={currentFileName} />
        </section>

        {/* Files List Section */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            📋 Arquivos Processados
          </h2>
          <FilesList refreshTrigger={refreshKey} />
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>EDA AI Minds • Exploratory Data Analysis powered by AI</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
