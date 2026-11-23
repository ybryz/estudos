# CLAUDE.md — repositório estudos

Regras e contexto para o Claude Code trabalhar neste repositório.

## O que é este repositório

É o repositório de estudos da Gabriela (Ciência da Computação e IA). Cada demanda de estudo
vira uma pasta numerada com um README que ela mesma escreve. Não é um produto: é material de
estudo, então o código deve ser simples, comentado em português e fácil de entender.

## Organização das pastas

| Pasta | O que tem |
|---|---|
| `01-github`, `02-git` | só README (perfil do GitHub; conflito de merge em `conflito.md`) |
| `03-claude-code` | README e os arquivos dos dois terminais (`terminal-a.md`, `terminal-b.md`) do estudo de worktree |
| `04-n8n-whatsapp` | workflows do N8N (`.json`) e `docker-compose.yml` do N8N + WAHA |
| `05-busca-cep` | **o Busca CEP**: `backend/` (Express) e `frontend/` (HTML, CSS e JS puros), com testes |
| `06-banco-de-dados` | cópia do Busca CEP com histórico de buscas em SQLite (Prisma) |
| `07-redis` | cópia do Busca CEP com histórico e cache no Redis (`docker-compose.yml`) |
| `12-claude-md` | material do estudo 12 (pedidos ao Claude Code e notas) |
| `README.md` (raiz) | apresentação e a tabela com as demandas |

Os estudos 06 e 07 têm a sua própria cópia do Busca CEP. Mexa só na pasta que a tarefa pedir;
não altere as pastas dos outros estudos.

## Busca CEP: como rodar e testar

Fica em `05-busca-cep`. Precisa do Node 20 ou mais novo. São dois programas (dois terminais):

- `backend/`: Express, rota `GET /cep/:cep` que consulta o ViaCEP e devolve
  `{ rua, bairro, cidade, estado }` (400 CEP inválido, 404 não encontrado, 502 ViaCEP fora).
  Roda em `http://localhost:3000`.
- `frontend/`: `index.html`, `style.css` e `app.js` servidos por `server.js` (sem dependências)
  em `http://localhost:5173`. O front só chama o back-end, nunca o ViaCEP direto.

```bash
# terminal 1: back-end
cd 05-busca-cep/backend
npm install
npm start

# terminal 2: front-end
cd 05-busca-cep/frontend
npm start

# testes do back-end (node --test; não precisam de internet: o ViaCEP é simulado)
cd 05-busca-cep/backend
npm test
```

O front-end não tem teste automatizado: confira abrindo a página.

Os Busca CEP do 06 e do 07 sobem com `npm install`, `npm run db:preparar` e `npm start` (o 07
precisa antes do `docker compose up -d` para o Redis) e não têm `npm test`.

## Regras

1. **Um commit por etapa.** Cada etapa da tarefa é um commit separado, com mensagem curta em
   português no padrão `tipo: o que foi feito` (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
2. **Testes antes do commit.** Se a mudança mexe em código do Busca CEP, rode `npm test` em
   `05-busca-cep/backend` e só faça o commit com todos passando. Se a mudança for no front-end,
   abra a página e confira na mão.
3. **Nada de chave no código.** Senha, chave de API, token e endereço com usuário e senha nunca
   ficam no código: vão num `.env` que está no `.gitignore`, e o código só usa o nome da
   variável (`process.env.X`). Nada de dado de empresa ou de cliente, nem dado de pessoa real.
4. **O README é escrito pela Gabriela.** Não escreva nem reescreva o README dos estudos: ele é
   com as palavras dela. Se precisar, deixe notas ou rascunho em outro arquivo para ela usar.
5. **Não mexa no que não foi pedido.** Sem refatorar, renomear ou "melhorar" arquivos fora da
   tarefa. Sem dependência nova sem pedir.
6. **Branch a partir da develop atualizada.** `git checkout develop`, `git pull origin develop`
   e depois `git checkout -b feat/nome-da-tarefa`. Push e pull request só quando a Gabriela
   liberar; até lá, só commits locais.

## Como saber que ficou pronto

- `npm test` passando em `05-busca-cep/backend` (quando há código);
- a mudança aparece funcionando na página, quando é no front-end;
- só os arquivos da tarefa aparecem no `git status`;
- um commit por etapa, sem `.env`, sem `node_modules` e sem segredo.
