# 🔄 Detecção Automática de Porta do Backend

## 📋 O que foi implementado?

O sistema agora detecta automaticamente qual porta o backend está usando (8000 ou 8001), tornando a aplicação mais flexível e fácil de usar.

## ✨ Funcionalidades

### 1. Detecção Automática de Porta
- ✅ Tenta conectar na porta **8001** primeiro
- ✅ Se falhar, tenta a porta **8000**
- ✅ Usa a primeira porta que responder com sucesso
- ✅ Se nenhuma estiver disponível, usa 8001 como padrão

### 2. Configuração via Variável de Ambiente (Opcional)
Você pode forçar uma URL específica criando/editando o arquivo `.env`:

```env
# Backend API Configuration (Optional)
VITE_API_URL="http://localhost:8000"
```

Se essa variável estiver definida, o sistema tentará ela **primeiro** antes de testar as portas padrão.

### 3. Indicador Visual de Porta
O componente **HealthStatus** agora mostra:
- 🟢 **API Online** - Quando conectado
- 🔴 **API Offline** - Quando desconectado
- 🖥️ **:8001** ou **:8000** - Porta atualmente em uso

## 🎯 Como funciona?

### Ordem de tentativa:
1. **Se `VITE_API_URL` está definido** → Tenta essa URL primeiro
2. **Porta 8001** → Tenta `http://localhost:8001/health`
3. **Porta 8000** → Tenta `http://localhost:8000/health`
4. **Fallback** → Usa `http://localhost:8001` como padrão

### Logs no Console:
Quando você abrir o DevTools (F12), verá mensagens como:
```
✅ Backend detectado na porta 8001
```
ou
```
❌ Porta 8001 não disponível, tentando próxima...
✅ Backend detectado na porta 8000
```

## 🚀 Vantagens

### Antes:
❌ Tinha que editar manualmente o código para mudar a porta  
❌ Se o backend mudasse de porta, quebrava a aplicação  
❌ Não sabia qual porta estava sendo usada  

### Agora:
✅ Detecção automática - funciona sem configuração  
✅ Flexível - funciona com qualquer porta (8000 ou 8001)  
✅ Visual - mostra a porta em uso no header  
✅ Configurável - pode forçar uma URL específica via `.env`  

## 📝 Arquivos Modificados

### 1. `src/lib/axios.ts`
- Adicionada função `detectBackendPort()`
- Suporte a variável `VITE_API_URL`
- Interceptor para detecção dinâmica
- Logs informativos no console

### 2. `src/components/HealthStatus.tsx`
- Exibe a porta em uso
- Ícone de servidor
- Animação de pulso quando online

### 3. `.env.example`
- Documentação da variável `VITE_API_URL`

## 🧪 Como Testar

### Teste 1: Backend na porta 8001
```bash
# Inicie o backend na porta 8001
uvicorn main:app --reload --port 8001

# Abra a aplicação frontend
# Deve mostrar: 🟢 API Online :8001
```

### Teste 2: Backend na porta 8000
```bash
# Inicie o backend na porta 8000
uvicorn main:app --reload --port 8000

# Abra a aplicação frontend
# Deve mostrar: 🟢 API Online :8000
```

### Teste 3: Sem backend
```bash
# Pare o backend (Ctrl+C)

# Abra a aplicação frontend
# Deve mostrar: 🔴 API Offline
# Console mostrará: ⚠️ Backend não detectado, usando porta 8001 como padrão
```

### Teste 4: URL customizada
```bash
# Crie/edite o arquivo .env
VITE_API_URL="http://192.168.1.100:8001"

# Reinicie o frontend (npm run dev)
# Deve tentar conectar no IP especificado primeiro
```

## 🔧 Configuração Avançada

### Forçar uma URL específica:
```env
# .env
VITE_API_URL="http://localhost:8000"
```

### Mudar a ordem de detecção:
Edite `src/lib/axios.ts` e modifique o array `ports`:
```typescript
const ports = [8000, 8001]; // Tenta 8000 primeiro
```

### Adicionar mais portas:
```typescript
const ports = [8001, 8000, 3000, 5000]; // Tenta múltiplas portas
```

### Desabilitar detecção automática:
```env
# .env
VITE_API_URL="http://localhost:8001"
```
E remova o interceptor do `axios.ts` (comentar linhas do interceptor).

## 💡 Dicas

1. **Verifique sempre o console do navegador (F12)** - Os logs mostram qual porta está sendo usada

2. **O HealthStatus atualiza a cada 30 segundos** - Se você iniciar o backend depois do frontend, aguarde até 30s

3. **Reinicie o frontend após mudar o .env** - Variáveis de ambiente são lidas apenas no build

4. **Use a variável VITE_API_URL em produção** - Para apontar para o backend em outro servidor

## 🐛 Troubleshooting

### Problema: Continua tentando porta errada
**Solução:** Limpe o cache e recarregue (Ctrl+Shift+R)

### Problema: Não detecta o backend
**Solução:** Verifique se o endpoint `/health` existe no backend

### Problema: Timeout muito longo
**Solução:** Ajuste o timeout em `axios.ts`:
```typescript
timeout: 2000, // 2 segundos (padrão)
```

### Problema: Backend em outro host/IP
**Solução:** Use a variável de ambiente:
```env
VITE_API_URL="http://192.168.1.100:8001"
```

---

## 🎉 Resultado

Agora a aplicação é **plug and play**! Não importa se o backend está na porta 8000 ou 8001, o frontend encontra automaticamente e se conecta! 🚀
