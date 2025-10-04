# 🔧 Instruções para Corrigir o Bug do Backend

## 📋 Problema Identificado

O backend está respondendo com a LLM genérica sem o contexto dos arquivos CSV carregados. Quando o usuário faz upload de um CSV e tenta fazer perguntas sobre ele, a resposta é genérica e não específica aos dados carregados.

## 🎯 Objetivo

Garantir que quando um `file_id` é enviado na requisição `/chat`, o backend:
1. Carregue o CSV correspondente
2. Adicione o contexto do CSV ao prompt
3. Use agentes especializados em análise de dados
4. Retorne respostas específicas sobre os dados do arquivo

---

## ✅ Checklist de Verificação

### 1. Verificar o Endpoint `/chat`

**Localização:** Procure pelo arquivo que define a rota `/chat` (geralmente `main.py`, `routes.py`, ou similar)

**Verificar:**
```python
@app.post("/chat")
async def chat(request: ChatRequest):
    # DEVE EXISTIR: Verificação se file_id está presente
    if request.file_id:
        # Lógica para carregar o CSV
        # Lógica para usar agente de análise de dados
    else:
        # Lógica da LLM genérica
```

**❌ Se não existir a verificação do `file_id`**, o backend sempre usará a LLM genérica!

---

### 2. Verificar o Schema do Request

**Localização:** Procure pela definição de `ChatRequest` (geralmente em `schemas.py`, `models.py`, ou no mesmo arquivo das rotas)

**Deve conter:**
```python
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    file_id: Optional[str] = None  # ← ESTE CAMPO DEVE EXISTIR!
```

**🔍 Se `file_id` não estiver no schema:**
```python
# ADICIONE este campo:
file_id: Optional[str] = None
```

---

### 3. Verificar o Carregamento do CSV

**Localização:** Procure por funções que carregam/recuperam arquivos CSV

**Deve existir algo como:**
```python
def load_csv(file_id: str):
    # Carrega o CSV do banco de dados ou sistema de arquivos
    # Retorna os dados do CSV (DataFrame, dict, etc.)
    pass
```

**❌ Se não existir:**

Adicione uma função para recuperar o CSV:

```python
import pandas as pd
import os

def load_csv_by_file_id(file_id: str):
    """Carrega o CSV pelo file_id"""
    # Opção 1: Se os arquivos estão salvos em disco
    csv_path = f"uploads/{file_id}.csv"
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Arquivo {file_id} não encontrado")
    
    df = pd.read_csv(csv_path)
    return df
    
    # Opção 2: Se os metadados estão no banco de dados
    # file_record = db.get_file_by_id(file_id)
    # df = pd.read_csv(file_record.path)
    # return df
```

---

### 4. Verificar a Integração com Agentes/LLM

**Localização:** Procure pelo código que chama a LLM ou agentes

**PROBLEMA COMUM:**
```python
# ❌ ERRADO - Sempre usa prompt genérico
@app.post("/chat")
async def chat(request: ChatRequest):
    response = llm.invoke(request.message)  # Sem contexto do CSV!
    return {"response": response}
```

**✅ CORRETO:**
```python
@app.post("/chat")
async def chat(request: ChatRequest):
    # Verifica se há um arquivo associado
    if request.file_id:
        # Carrega o CSV
        df = load_csv_by_file_id(request.file_id)
        
        # Cria contexto com informações do CSV
        csv_context = f"""
        Você está analisando um arquivo CSV com as seguintes características:
        - Número de linhas: {len(df)}
        - Número de colunas: {len(df.columns)}
        - Colunas: {', '.join(df.columns.tolist())}
        - Primeiras linhas:
        {df.head(5).to_string()}
        
        Estatísticas descritivas:
        {df.describe().to_string()}
        """
        
        # Combina a mensagem do usuário com o contexto
        full_prompt = f"{csv_context}\n\nPergunta do usuário: {request.message}"
        
        # Usa agente especializado ou LLM com contexto
        response = data_analysis_agent.invoke(full_prompt)
    else:
        # Sem arquivo, usa LLM genérica
        response = llm.invoke(request.message)
    
    return {"response": response, "session_id": request.session_id}
```

---

### 5. Verificar o Endpoint de Upload `/csv/upload`

**O upload DEVE retornar o `file_id`:**

```python
@app.post("/csv/upload")
async def upload_csv(file: UploadFile):
    # Salva o arquivo
    file_id = str(uuid.uuid4())  # Gera ID único
    file_path = f"uploads/{file_id}.csv"
    
    # Salva no disco
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # Processa o CSV
    df = pd.read_csv(file_path)
    
    # ✅ IMPORTANTE: Retornar o file_id
    return {
        "file_id": file_id,  # ← DEVE EXISTIR!
        "filename": file.filename,
        "rows": len(df),
        "columns": len(df.columns),
        "message": "Arquivo processado com sucesso"
    }
```

---

## 🛠️ Correção Passo a Passo

### Passo 1: Abra o arquivo principal do backend
```bash
# Procure por arquivos como:
# - main.py
# - app.py
# - api/routes.py
# - routers/chat.py
```

### Passo 2: Localize a função do endpoint `/chat`
```python
# Procure por algo como:
@app.post("/chat")
@router.post("/chat")
```

### Passo 3: Adicione a verificação do file_id

**ANTES (❌ código com bug):**
```python
@app.post("/chat")
async def chat(request: ChatRequest):
    # Usa sempre a LLM genérica
    response = llm.invoke(request.message)
    return {"response": response}
```

**DEPOIS (✅ código corrigido):**
```python
@app.post("/chat")
async def chat(request: ChatRequest):
    if request.file_id:
        # Carrega o CSV
        try:
            df = load_csv_by_file_id(request.file_id)
            
            # Prepara contexto
            csv_info = {
                "rows": len(df),
                "columns": len(df.columns.tolist()),
                "column_names": df.columns.tolist(),
                "sample_data": df.head(3).to_dict('records'),
                "statistics": df.describe().to_dict()
            }
            
            # Cria prompt com contexto
            context_prompt = f"""
            Você é um analista de dados especializado. Você está analisando um arquivo CSV com:
            - {csv_info['rows']} linhas
            - {csv_info['columns']} colunas
            - Colunas: {', '.join(csv_info['column_names'])}
            
            Dados de amostra (primeiras linhas):
            {json.dumps(csv_info['sample_data'], indent=2, ensure_ascii=False)}
            
            Pergunta do usuário: {request.message}
            
            Responda de forma específica com base nos dados fornecidos.
            """
            
            # Usa agente de análise de dados
            response = data_analysis_agent.invoke(context_prompt)
            
        except FileNotFoundError:
            response = "❌ Erro: Arquivo não encontrado. Por favor, faça o upload novamente."
        except Exception as e:
            response = f"❌ Erro ao processar o arquivo: {str(e)}"
    else:
        # Sem arquivo, informa que precisa de upload
        response = llm.invoke(request.message)
    
    return {
        "response": response,
        "session_id": request.session_id,
        "file_id": request.file_id
    }
```

### Passo 4: Certifique-se que o schema aceita file_id

```python
# Localize a definição de ChatRequest
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    file_id: Optional[str] = None  # ← Adicione se não existir
```

### Passo 5: Verifique a função de carregar CSV

```python
import pandas as pd
import os
from pathlib import Path

# Defina onde os arquivos são salvos
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

def load_csv_by_file_id(file_id: str) -> pd.DataFrame:
    """Carrega um CSV pelo seu file_id"""
    csv_path = UPLOAD_DIR / f"{file_id}.csv"
    
    if not csv_path.exists():
        raise FileNotFoundError(f"Arquivo com ID {file_id} não encontrado")
    
    df = pd.read_csv(csv_path)
    return df
```

---

## 🧪 Como Testar a Correção

### Teste 1: Upload do arquivo
```bash
# Faça upload de um CSV e capture o file_id retornado
curl -X POST http://localhost:8001/csv/upload \
  -F "file=@test.csv"

# Deve retornar algo como:
# {
#   "file_id": "abc-123-xyz",
#   "filename": "test.csv",
#   "rows": 100,
#   "columns": 5
# }
```

### Teste 2: Chat com file_id
```bash
# Use o file_id do upload anterior
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quantas linhas tem este arquivo?",
    "file_id": "abc-123-xyz"
  }'

# Deve retornar uma resposta ESPECÍFICA sobre o arquivo!
# Exemplo: "Este arquivo contém 100 linhas e 5 colunas."
```

### Teste 3: Chat sem file_id
```bash
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá, como você pode me ajudar?"
  }'

# Deve retornar a mensagem genérica de boas-vindas
```

---

## 📝 Resumo das Alterações Necessárias

| Arquivo | O que verificar | O que corrigir |
|---------|----------------|----------------|
| **Schema/Models** | `file_id` existe em `ChatRequest`? | Adicionar `file_id: Optional[str] = None` |
| **Rota /chat** | Verifica se `file_id` está presente? | Adicionar `if request.file_id:` |
| **Rota /chat** | Carrega o CSV quando `file_id` existe? | Adicionar `df = load_csv_by_file_id(request.file_id)` |
| **Rota /chat** | Inclui contexto do CSV no prompt? | Adicionar informações do DataFrame no prompt |
| **Rota /upload** | Retorna o `file_id` na resposta? | Adicionar `"file_id": file_id` na resposta |
| **Funções auxiliares** | Existe função para carregar CSV? | Criar `load_csv_by_file_id()` |

---

## 🚀 Após a Correção

1. **Reinicie o backend:**
   ```bash
   # Pare o servidor (Ctrl+C)
   # Inicie novamente
   uvicorn main:app --reload --port 8001
   ```

2. **Teste no frontend:**
   - Faça upload de um arquivo CSV
   - Faça uma pergunta específica como: "Quantas linhas tem?"
   - A resposta deve ser específica do arquivo carregado!

---

## 📞 Próximos Passos

Se após seguir estas instruções o problema persistir, verifique:

1. **Logs do backend** - Veja se há erros ao processar o file_id
2. **Network tab do navegador** - Confirme que o file_id está sendo enviado
3. **Banco de dados/arquivos** - Confirme que o CSV está sendo salvo corretamente

---

## ✅ Resultado Esperado

**ANTES:**
```
Usuário: "Quantas linhas tem este arquivo?"
Backend: *resposta genérica sobre como contar linhas em Python*
```

**DEPOIS:**
```
Usuário: "Quantas linhas tem este arquivo?"
Backend: "Este arquivo CSV contém 150 linhas e 8 colunas. As colunas são: id, nome, idade, cidade, estado, país, profissão, salário."
```

---

**Boa sorte com a correção! 🚀**
