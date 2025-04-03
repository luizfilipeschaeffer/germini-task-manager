# Sistema de Gerenciamento de Tarefas com Gemini AI

Este é um sistema de gerenciamento de tarefas que utiliza a API do Google Gemini para gerar, expandir e analisar tarefas de desenvolvimento de software.

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione sua chave da API do Gemini:
```env
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-2.0-flash
DEFAULT_SUBTASKS=3
DEFAULT_PRIORITY=medium
LOG_LEVEL=info
```

Pegue a sua chave de API [neste link](https://ai.google.dev/gemini-api/docs?hl=pt-br)

## Comandos Disponíveis

### Criar Novas Tasks
```bash
npm run task create --prompt "Descrição do que precisa ser feito" --tasks 10
```
- `--prompt`: Descrição do que precisa ser implementado
- `--tasks`: Número máximo de tasks a serem geradas (padrão: 10)

### Expandir uma Task em Subtasks
```bash
npm run task expand --id 1 --num 3 --prompt "Contexto adicional"
```
- `--id`: ID da task a ser expandida
- `--num`: Número de subtasks a serem geradas (padrão: 3)
- `--prompt`: Contexto adicional para a geração das subtasks (opcional)

### Analisar uma Task
```bash
npm run task analyze --id 1
```
- `--id`: ID da task a ser analisada

### Listar Tasks
```bash
npm run task list [--status pending]
```
- `--status`: Filtrar tasks por status (opcional)

### Alterar Status de uma Task
```bash
npm run task set-status --id 1 --status done
```
- `--id`: ID da task
- `--status`: Novo status (ex: pending, in-progress, done)

## Estrutura do Projeto

```
task-management-system/
├── src/
│   └── TaskManager.js       # Classe principal do gerenciador de tasks
├── scripts/
│   └── task-system.js      # CLI para gerenciamento de tasks
├── tasks/
│   └── tasks.json          # Arquivo onde as tasks são armazenadas
├── config/
│   └── .env               # Configurações do sistema
├── package.json
└── README.md
```

## Exemplos de Uso

1. Criar tasks para um novo recurso:
```bash
npm run task create --prompt "Implementar sistema de autenticação com login e registro"
```

2. Expandir uma task em subtasks:
```bash
npm run task expand --id 1 --num 5 --prompt "Foco em segurança e validação"
```

3. Analisar uma task específica:
```bash
npm run task analyze --id 1
```

4. Listar todas as tasks pendentes:
```bash
npm run task list --status pending
```

5. Marcar uma task como concluída:
```bash
npm run task set-status --id 1 --status done
```

## Funcionalidades

- Geração de tasks usando IA
- Expansão de tasks em subtasks
- Análise detalhada de tasks
- Gerenciamento de dependências entre tasks
- Sistema de prioridades
- Controle de status
- Interface de linha de comando intuitiva
- Feedback visual com cores e ícones
- Persistência em arquivo JSON
- Suporte a múltiplos níveis de tasks

## Contribuindo

1. Fork o projeto
2. Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request 
