# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 🔄 Detecção automática de porta do backend (8000 ou 8001)
- 📤 Sistema de upload de arquivos CSV com feedback visual
- 💬 Interface de chat integrada com contexto de arquivo
- 📊 Componente de métricas em tempo real
- 📋 Lista de arquivos processados
- 🏥 Health status com indicador de porta
- 📱 UI responsiva com shadcn/ui
- 📚 Documentação técnica completa em `/docs`
- ⚠️ Tratamento de erros com feedback ao usuário
- 🔁 Sistema de retry para requisições

### Changed
- ⚡ Otimizado sistema de detecção de porta com cache
- 🎨 Melhorado feedback visual de arquivos sendo analisados
- 🔧 Interceptors do Axios para melhor tratamento de erros
- ⏱️ Health check agora aguarda detecção de porta completar

### Fixed
- 🐛 Erro de Network Error ao carregar lista de arquivos
- ⚠️ Warnings do React Router v7
- 🔄 Loop infinito de re-detecção de porta
- 🌐 Erro de conexão em health checks
- 📡 Sincronização de múltiplas requisições simultâneas

### Documentation
- 📖 Documentação de correção do backend
- 🔍 Diagnóstico de problemas com agentes
- 🌐 Guia de detecção de porta
- 🐛 Troubleshooting de erros de rede
- ⚠️ Correção de warnings do console

---

## [1.0.0] - 2025-10-04

### Added
- 🎉 Versão inicial do projeto
- ✨ Estrutura base com React + TypeScript + Vite
- 🎨 UI com shadcn/ui e Tailwind CSS
- 🔌 Integração com Supabase
- 📱 Páginas Index e NotFound
- 🧩 Componentes UI reutilizáveis

---

## Tipos de Mudanças

- **Added** - Novas funcionalidades
- **Changed** - Mudanças em funcionalidades existentes
- **Deprecated** - Funcionalidades que serão removidas
- **Removed** - Funcionalidades removidas
- **Fixed** - Correções de bugs
- **Security** - Correções de segurança
- **Documentation** - Mudanças na documentação
