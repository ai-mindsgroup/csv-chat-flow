import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Activity, AlertCircle } from 'lucide-react';

interface HealthData {
  status: string;
  timestamp: string;
  message: string;
}

const HealthStatus = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const response = await axios.get('/health');
      setHealth(response.data);
      setError(false);
    } catch (err) {
      console.error('Health check failed:', err);
      setError(true);
    }
  };

  const isHealthy = health?.status === 'healthy' && !error;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
      isHealthy 
        ? 'bg-success/10 text-success' 
        : 'bg-destructive/10 text-destructive'
    }`}>
      {isHealthy ? (
        <>
          <Activity className="h-3 w-3" />
          <span>API Online</span>
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
