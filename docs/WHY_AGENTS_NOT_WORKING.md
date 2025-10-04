# 🔍 Por que os Agentes não estão sendo invocados?

## 🎯 Diagnóstico Completo

### ✅ O que está funcionando (Frontend)

1. **Upload de arquivo CSV** ✅
   - Frontend envia o arquivo para `/csv/upload`
   - Backend processa e retorna `file_id`
   - Frontend armazena o `file_id` no estado

2. **Envio do file_id no chat** ✅
   - Frontend envia `file_id` em cada mensagem
   - Pode verificar no Network tab (F12):
   ```json
   POST /chat
   {
     "message": "Quantas linhas tem?",
     "session_id": "abc123",
     "file_id": "xyz789"  // ← Está sendo enviado!
   }
   ```

3. **Feedback visual** ✅
   - Banner mostra qual arquivo está sendo analisado
   - Porta do backend detectada automaticamente
   - Erros são tratados adequadamente

---

## ❌ O que NÃO está funcionando (Backend)

### Problema: Backend ignora o `file_id`

O backend está recebendo o `file_id`, mas **não está usando** para:
1. Carregar o arquivo CSV
2. Adicionar contexto ao prompt
3. Invocar agentes especializados em análise de dados

### Evidência:

**Mensagem enviada:**
```
"Quantas linhas tem este arquivo?"
```

**Resposta do backend (genérica, sem contexto):**
```
"Ok! Para te ajudar com análises estatísticas...
Por favor, me diga:
1. Qual é o seu objetivo?
2. Que tipo de dados você tem?
..."
```

**Resposta esperada (com contexto do CSV):**
```
"Este arquivo contém 150 linhas e 8 colunas.
As colunas são: id, nome, idade, cidade, estado, país, profissão, salário."
```

---

## 🔧 O que precisa ser corrigido no Backend

### 1. Verificar se o `file_id` está sendo recebido

**Local:** Arquivo que define o endpoint `/chat` (ex: `main.py`, `routes.py`)

**Verificar:**
```python
@app.post("/chat")
async def chat(request: ChatRequest):
    print(f"🔍 DEBUG - file_id recebido: {request.file_id}")  # Adicione este log
    print(f"🔍 DEBUG - message: {request.message}")
    
    # Resto do código...
```

**Teste:**
- Faça uma pergunta no chat
- Verifique os logs do backend no terminal
- Deve mostrar: `🔍 DEBUG - file_id recebido: abc-123-xyz`

---

### 2. Verificar se o schema aceita `file_id`

**Local:** Definição de `ChatRequest` (ex: `schemas.py`, `models.py`)

**Deve ter:**
```python
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    file_id: Optional[str] = None  # ← PRECISA EXISTIR!
```

**Se não existir:**
```python
# O backend está ignorando o file_id porque não está no schema!
# Adicione o campo file_id
```

---

### 3. Verificar se o CSV está sendo carregado

**Local:** Endpoint `/chat`

**Problema comum:**
```python
@app.post("/chat")
async def chat(request: ChatRequest):
    # ❌ ERRADO - Sempre usa LLM genérica
    response = llm.invoke(request.message)
    return {"response": response}
```

**Correção necessária:**
```python
@app.post("/chat")
async def chat(request: ChatRequest):
    # ✅ CORRETO - Verifica se há file_id
    if request.file_id:
        # Carrega o CSV
        df = load_csv(request.file_id)
        
        # Adiciona contexto
        context = f"""
        Arquivo CSV carregado:
        - Linhas: {len(df)}
        - Colunas: {len(df.columns)}
        - Nomes das colunas: {list(df.columns)}
        - Amostra de dados: {df.head(3).to_dict()}
        
        Pergunta: {request.message}
        """
        
        # Usa agente de análise de dados
        response = data_analysis_agent.invoke(context)
    else:
        # Sem arquivo, LLM genérica
        response = llm.invoke(request.message)
    
    return {"response": response}
```

---

### 4. Verificar se existe função para carregar CSV

**Local:** Funções auxiliares

**Deve existir:**
```python
import pandas as pd
from pathlib import Path

UPLOAD_DIR = Path("uploads")

def load_csv(file_id: str) -> pd.DataFrame:
    """Carrega um CSV pelo file_id"""
    csv_path = UPLOAD_DIR / f"{file_id}.csv"
    
    if not csv_path.exists():
        raise FileNotFoundError(f"Arquivo {file_id} não encontrado")
    
    df = pd.read_csv(csv_path)
    return df
```

**Se não existir:**
- O backend não consegue acessar o CSV carregado
- Precisa implementar esta função

---

### 5. Verificar se os agentes estão configurados

**Local:** Configuração de LangChain/LangGraph

**Deve existir:**
```python
from langchain.agents import create_pandas_dataframe_agent
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4", temperature=0)

def get_data_analysis_agent(df: pd.DataFrame):
    """Cria um agente especializado em análise de dados"""
    agent = create_pandas_dataframe_agent(
        llm,
        df,
        verbose=True,
        agent_type="openai-functions"
    )
    return agent
```

**Se não existir:**
- Backend não tem agentes especializados
- Precisa configurar LangChain com agentes de análise de dados

---

## 🧪 Testes para Validar a Correção

### Teste 1: Verificar se file_id está sendo recebido

```bash
# No terminal do backend, adicione logs e reinicie
# Depois faça upload e envie uma mensagem
# Deve aparecer nos logs:
🔍 DEBUG - file_id recebido: abc-123-xyz
```

### Teste 2: Testar endpoint /chat com curl

```bash
# Substitua o file_id pelo ID real do seu arquivo
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quantas linhas tem este arquivo?",
    "file_id": "SEU_FILE_ID_AQUI"
  }'
```

**Resultado esperado:**
```json
{
  "response": "Este arquivo contém 150 linhas e 8 colunas..."
}
```

**Resultado atual (bug):**
```json
{
  "response": "Ok! Para te ajudar com análises... (resposta genérica)"
}
```

### Teste 3: Testar sem file_id

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá, como você pode me ajudar?"
  }'
```

**Resultado esperado:**
```json
{
  "response": "Olá! Eu posso ajudar a analisar seus dados CSV... (resposta genérica OK)"
}
```

---

## 📋 Checklist de Correção

Use esta lista para verificar o que precisa ser feito no backend:

- [ ] **Schema/Models**
  - [ ] `file_id: Optional[str] = None` existe em `ChatRequest`?
  - [ ] Backend reconhece o campo?

- [ ] **Endpoint /chat**
  - [ ] Verifica se `request.file_id` existe?
  - [ ] Tem lógica `if request.file_id:`?
  - [ ] Carrega o CSV quando `file_id` é fornecido?

- [ ] **Carregamento de CSV**
  - [ ] Função `load_csv(file_id)` existe?
  - [ ] Arquivos são salvos com o `file_id` como nome?
  - [ ] Caminho correto (ex: `uploads/{file_id}.csv`)?

- [ ] **Contexto do CSV**
  - [ ] Extrai informações do DataFrame (linhas, colunas)?
  - [ ] Adiciona essas informações ao prompt?
  - [ ] Inclui amostra dos dados?

- [ ] **Agentes**
  - [ ] Agente de análise de dados configurado?
  - [ ] LangChain/LangGraph instalados?
  - [ ] Agente recebe o DataFrame como contexto?

- [ ] **Endpoint /csv/upload**
  - [ ] Retorna `file_id` na resposta?
  - [ ] Salva o arquivo com nome `{file_id}.csv`?

---

## 🎯 Arquitetura Esperada

```
┌──────────────────────────────────────────────────────────┐
│ FRONTEND                                                 │
├──────────────────────────────────────────────────────────┤
│ 1. Upload CSV → Backend                                  │
│    ├─ POST /csv/upload                                   │
│    └─ Recebe: { file_id: "abc-123" }                    │
│                                                          │
│ 2. Armazena file_id no estado                           │
│    └─ currentFileId = "abc-123"                         │
│                                                          │
│ 3. Envia mensagem com file_id                           │
│    ├─ POST /chat                                        │
│    └─ Body: { message: "...", file_id: "abc-123" }     │
└──────────────────────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────┐
│ BACKEND                                                  │
├──────────────────────────────────────────────────────────┤
│ 4. Recebe requisição /chat                              │
│    └─ request.file_id = "abc-123" ✅                    │
│                                                          │
│ 5. Verifica se file_id existe                           │
│    └─ if request.file_id: ... ❌ FALTA ISSO!           │
│                                                          │
│ 6. Carrega o CSV                                        │
│    └─ df = load_csv("abc-123") ❌ FALTA!               │
│                                                          │
│ 7. Cria contexto com dados do CSV                       │
│    └─ context = f"Linhas: {len(df)}..." ❌ FALTA!      │
│                                                          │
│ 8. Invoca agente de análise de dados                    │
│    └─ agent.invoke(context) ❌ FALTA!                   │
│                                                          │
│ 9. Retorna resposta específica                          │
│    └─ "Este arquivo tem 150 linhas..." ❌ NÃO ACONTECE! │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 Onde está o código do Backend?

O frontend que você está trabalhando **não contém o backend**.

**Possíveis localizações:**
1. Repositório separado (ex: `csv-chat-api`, `backend-eda`)
2. Pasta separada no mesmo projeto
3. Servidor remoto

**Como encontrar:**
```bash
# Procure por processos Python rodando
ps aux | grep python
ps aux | grep uvicorn
ps aux | grep fastapi

# Ou verifique a porta 8000
netstat -ano | findstr :8000
```

---

## 🚀 Próximos Passos

1. **Localize o código do backend**
   - Onde está o arquivo `main.py` ou similar?
   - Qual repositório/pasta?

2. **Abra o arquivo que define o endpoint `/chat`**
   - Procure por `@app.post("/chat")`
   - Verifique se tem `if request.file_id:`

3. **Siga o documento `BACKEND_FIX_INSTRUCTIONS.md`**
   - Contém todas as correções necessárias
   - Passo a passo detalhado
   - Exemplos de código

4. **Teste após cada alteração**
   - Use os testes deste documento
   - Verifique os logs do backend
   - Confirme que a resposta mudou

---

## 📞 Resumo

### O problema NÃO está no frontend! ✅

O frontend está:
- ✅ Enviando o `file_id` corretamente
- ✅ Mostrando feedback visual
- ✅ Tratando erros adequadamente

### O problema está no backend! ❌

O backend está:
- ❌ Ignorando o `file_id` recebido
- ❌ Não carregando o CSV
- ❌ Não invocando agentes de análise de dados
- ❌ Sempre usando LLM genérica sem contexto

### Solução:

Seguir as instruções em **`BACKEND_FIX_INSTRUCTIONS.md`** para corrigir o backend.

---

**Status:** 🔴 Backend precisa ser corrigido
**Prioridade:** 🔥 Alta - Funcionalidade principal não funciona
**Responsável:** Desenvolvedor backend / DevOps
