import { useEffect, useState } from 'react';
import axios, { waitForBackendDetection } from '@/lib/axios';
import { Activity, AlertCircle, Server } from 'lucide-react';

interface HealthData {
  status: string;
  timestamp: string;
  message: string;
}

const HealthStatus = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error, setError] = useState(false);
  const [port, setPort] = useState<string>('');

  useEffect(() => {
    // Inicia o health check após aguardar a detecção de porta
    let mounted = true;
    
    const initHealthCheck = async () => {
      // Aguarda a detecção de porta completar
      await waitForBackendDetection();
      
      // Se o componente ainda está montado, inicia o health check
      if (mounted) {
        checkHealth();
      }
    };
    
    initHealthCheck();
    
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const checkHealth = async () => {
    try {
      const response = await axios.get('/health');
      setHealth(response.data);
      setError(false);
      
      // Extrai a porta da baseURL
      const baseURL = axios.defaults.baseURL || '';
      const portMatch = baseURL.match(/:(\d+)/);
      if (portMatch) {
        setPort(portMatch[1]);
      }
    } catch (err) {
      console.error('Health check failed:', err);
      setError(true);
    }
  };

  const isHealthy = health?.status === 'healthy' && !error;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
      isHealthy 
        ? 'bg-success/10 text-success' 
        : 'bg-destructive/10 text-destructive'
    }`}>
      {isHealthy ? (
        <>
          <Activity className="h-3 w-3 animate-pulse" />
          <span>API Online</span>
          {port && (
            <>
              <Server className="h-3 w-3 ml-1" />
              <span className="font-mono">:{port}</span>
            </>
          )}
        </>
      ) : (
        <>
          <AlertCircle className="h-3 w-3" />
          <span>API Offline</span>
        </>
      )}
    </div>
  );
};

export default HealthStatus;
