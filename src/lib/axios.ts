import axios from 'axios';

// Pega a URL da variável de ambiente ou null
const API_URL_FROM_ENV = import.meta.env.VITE_API_URL;

// Cache da URL detectada
let detectedBaseURL: string | null = null;
let detectionPromise: Promise<string> | null = null;
let isDetecting = false;

// Função para detectar qual porta está disponível
const detectBackendPort = async (): Promise<string> => {
  // Se já foi detectado, retorna do cache
  if (detectedBaseURL) {
    return detectedBaseURL;
  }

  // Se já está detectando, aguarda a detecção em andamento
  if (detectionPromise) {
    return detectionPromise;
  }

  // Inicia nova detecção
  isDetecting = true;
  detectionPromise = (async () => {
    // Se houver URL configurada na variável de ambiente, tenta ela primeiro
    if (API_URL_FROM_ENV) {
      try {
        const response = await axios.get(`${API_URL_FROM_ENV}/health`, {
          timeout: 2000,
        });
        
        if (response.status === 200) {
          console.log(`✅ Backend detectado na URL configurada: ${API_URL_FROM_ENV}`);
          detectedBaseURL = API_URL_FROM_ENV;
          return API_URL_FROM_ENV;
        }
      } catch (error) {
        console.log(`❌ URL configurada ${API_URL_FROM_ENV} não disponível, tentando portas padrão...`);
      }
    }
    
    // Tenta as portas padrão
    const ports = [8001, 8000];
    
    for (const port of ports) {
      try {
        const response = await axios.get(`http://localhost:${port}/health`, {
          timeout: 2000,
        });
        
        if (response.status === 200) {
          console.log(`✅ Backend detectado na porta ${port}`);
          const url = `http://localhost:${port}`;
          detectedBaseURL = url;
          return url;
        }
      } catch (error) {
        console.log(`❌ Porta ${port} não disponível, tentando próxima...`);
      }
    }
    
    // Se nenhuma porta estiver disponível, usa a 8001 como padrão
    console.warn('⚠️ Backend não detectado em nenhuma porta, usando http://localhost:8001 como padrão');
    const defaultURL = 'http://localhost:8001';
    detectedBaseURL = defaultURL;
    return defaultURL;
  })();

  try {
    const url = await detectionPromise;
    return url;
  } finally {
    isDetecting = false;
  }
};

// Inicia a detecção imediatamente
const initialBaseURL = API_URL_FROM_ENV || 'http://localhost:8001';
detectBackendPort().then((url) => {
  axiosInstance.defaults.baseURL = url;
});

const axiosInstance = axios.create({
  baseURL: initialBaseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para garantir que a URL correta seja usada
axiosInstance.interceptors.request.use(
  async (config) => {
    // Evita loop infinito em requisições de health check
    if (config.url?.includes('/health')) {
      return config;
    }
    
    // Garante que a detecção foi concluída antes de fazer a requisição
    if (!detectedBaseURL || isDetecting) {
      const detectedURL = await detectBackendPort();
      config.baseURL = detectedURL;
      axiosInstance.defaults.baseURL = detectedURL;
    } else {
      config.baseURL = detectedBaseURL;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta para re-detectar em caso de erro de rede
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Não re-detecta se o erro for em uma requisição de health check
    // (o health check já faz parte do processo de detecção)
    const isHealthCheck = error.config?.url?.includes('/health');
    
    // Se houver erro de rede em requisições normais (não health check), limpa o cache e tenta re-detectar
    if (!isHealthCheck && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      console.log('🔄 Erro de rede detectado, tentando re-detectar backend...');
      detectedBaseURL = null;
      detectionPromise = null;
      
      // Tenta detectar novamente
      const newURL = await detectBackendPort();
      axiosInstance.defaults.baseURL = newURL;
      
      // Não re-tenta automaticamente para evitar loops infinitos
      console.log(`📡 Nova URL detectada: ${newURL}. Tente a requisição novamente.`);
    }
    
    return Promise.reject(error);
  }
);

// Função auxiliar para componentes que precisam aguardar a detecção
export const waitForBackendDetection = async (): Promise<string> => {
  return await detectBackendPort();
};

// Função para obter a URL atual (pode ser null se ainda não detectou)
export const getCurrentBackendURL = (): string | null => {
  return detectedBaseURL;
};

export default axiosInstance;
