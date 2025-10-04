# CSV Chat Flow - EDA AI Minds

Sistema inteligente de análise de dados CSV com chat interativo e IA.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:8080`

## 📋 Pré-requisitos

- Node.js 18+ (recomendado usar [nvm](https://github.com/nvm-sh/nvm))
- Backend API rodando na porta 8000 ou 8001

## 🎯 Funcionalidades

- ✅ Upload de arquivos CSV
- ✅ Chat interativo com IA para análise de dados
- ✅ Detecção automática de porta do backend
- ✅ Visualização de arquivos processados
- ✅ Métricas em tempo real
- ✅ Interface moderna e responsiva

## 🏗️ Tecnologias

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS
- **State:** React Query (TanStack Query)
- **HTTP Client:** Axios com detecção automática de porta
- **Routing:** React Router v6

## 🔧 Configuração

### Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` baseado no `.env.example`:

```env
# Backend API (opcional - detecta automaticamente se não especificado)
VITE_API_URL=http://localhost:8000

# Supabase (se necessário)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
```

### Backend

O frontend detecta automaticamente qual porta o backend está usando (8000 ou 8001).

**Nenhuma configuração manual necessária!**

Para mais detalhes, veja [docs/PORT_DETECTION.md](./docs/PORT_DETECTION.md)

## 📚 Documentação

Documentação detalhada disponível na pasta [`docs/`](./docs/):

- **[Backend Fix Instructions](./docs/BACKEND_FIX_INSTRUCTIONS.md)** - Como corrigir o roteamento de agentes no backend
- **[Why Agents Not Working](./docs/WHY_AGENTS_NOT_WORKING.md)** - Diagnóstico completo do problema de invocação de agentes
- **[Port Detection](./docs/PORT_DETECTION.md)** - Como funciona a detecção automática de porta
- **[Network Error Fix](./docs/NETWORK_ERROR_FIX.md)** - Correções de erros de rede
- **[Console Warnings Fix](./docs/CONSOLE_WARNINGS_FIX.md)** - Warnings corrigidos do console

## 🏃 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint
npm run lint
```

## 📁 Estrutura do Projeto

```
csv-chat-flow/
├── src/
│   ├── components/     # Componentes React
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilitários e configurações
│   ├── pages/          # Páginas da aplicação
│   └── integrations/   # Integrações externas
├── docs/               # Documentação técnica
├── public/             # Arquivos estáticos
└── ...                 # Arquivos de configuração
```

## 🐛 Solução de Problemas

### Backend não detectado
- Verifique se o backend está rodando na porta 8000 ou 8001
- Veja os logs no console do navegador (F12)
- Consulte [docs/PORT_DETECTION.md](./docs/PORT_DETECTION.md)

### Agentes não estão analisando os dados
- O problema está no backend, não no frontend
- Consulte [docs/WHY_AGENTS_NOT_WORKING.md](./docs/WHY_AGENTS_NOT_WORKING.md)
- Siga as instruções em [docs/BACKEND_FIX_INSTRUCTIONS.md](./docs/BACKEND_FIX_INSTRUCTIONS.md)

### Erros no console
- Consulte [docs/CONSOLE_WARNINGS_FIX.md](./docs/CONSOLE_WARNINGS_FIX.md)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e pertence à AI Minds Group.

## 🔗 Links Úteis

- [Lovable Project](https://lovable.dev/projects/37d2fe7e-602f-45e4-955c-b5dfcf97f3aa)
- [Documentação Técnica](./docs/)

---

**Desenvolvido por AI Minds Group** 🧠
