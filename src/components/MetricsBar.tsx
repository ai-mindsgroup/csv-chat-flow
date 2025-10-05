import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Activity, Database, FileText, Layers } from 'lucide-react';

interface Metrics {
  total_files: number;
  total_rows: number;
  total_columns: number;
  status: string;
}

const MetricsBar = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await axios.get('/dashboard/metrics');
      setMetrics(response.data);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando métricas...</div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-card rounded-lg shadow-sm border p-6">
        <div className="text-center text-destructive">Erro ao carregar métricas</div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{metrics.total_files}</div>
            <div className="text-sm text-muted-foreground">Arquivos</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{metrics.total_rows.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Linhas</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{metrics.total_columns}</div>
            <div className="text-sm text-muted-foreground">Colunas</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-success/10 rounded-lg">
            <Activity className="h-6 w-6 text-success" />
          </div>
          <div>
            <div className="text-2xl font-bold text-success">{metrics.status}</div>
            <div className="text-sm text-muted-foreground">Status</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsBar;
