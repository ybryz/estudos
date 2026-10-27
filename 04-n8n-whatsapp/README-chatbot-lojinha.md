# Chatbot de WhatsApp da Lojinha Fictícia (WAHA + n8n + Redis)

Projeto de estudo: um bot de WhatsApp com menu de atendimento, feito com n8n e WAHA rodando localmente no Docker.

## O que o bot faz

1. A pessoa manda qualquer mensagem.
2. O bot marca como lida e envia o menu de boas-vindas.
3. O bot espera a resposta e trata a opção:

| Resposta | O que o bot envia |
|---|---|
| `1` | Horário de funcionamento |
| `2` | Endereço da loja |
| `3` | Aviso de que um atendente vai chamar a pessoa |
| qualquer outra coisa | "Não entendi" e o menu de novo |

Depois de responder 1, 2 ou 3, a conversa recomeça pelo menu na próxima mensagem.

## Ferramentas

- **WAHA**: API que conecta um número de WhatsApp (`http://localhost:3000`).
- **n8n**: monta o fluxo do bot (`http://localhost:5678`).
- **Redis**: guarda em que ponto está cada conversa (menu enviado ou não, validade de 6 horas).
- **Docker Compose**: sobe tudo junto.

## Como o fluxo funciona

```
WhatsApp → WAHA → Webhook (n8n) → Dados → Mensagem recebida?
→ Send Seen → Já recebeu o menu? (Redis)
    ├ não → marca no Redis → envia o menu
    └ sim → Opção 1 / 2 / 3 → responde → apaga a marca
            outra → "não entendi" + menu
```

Cada nó do n8n tem um papel:
- **Webhook**: recebe as mensagens que o WAHA envia.
- **Dados**: separa os campos úteis (número, texto, nome, se foi eu que enviei).
- **Mensagem recebida?**: ignora as mensagens enviadas por mim e os status, para o bot não responder a si mesmo.
- **Redis**: dá memória ao bot, para ele saber se já mandou o menu.
- **Opção (Switch)**: escolhe a resposta conforme o texto digitado.

## Como rodar

1. Suba os containers na pasta do `docker-compose.yml`:
   ```
   docker compose up -d
   ```
2. Crie um arquivo `.env` ao lado do `docker-compose.yml` com a chave de API do WAHA:
   ```
   WAHA_API_KEY=coloque-uma-chave-forte-aqui
   ```
   O `docker-compose.yml` usa essa variável em `WAHA_API_KEY`.
3. Abra o dashboard do WAHA (`http://localhost:3000/dashboard`), informe a chave quando pedir, crie a sessão `default` e leia o QR code em **Aparelhos conectados** no WhatsApp. Quando o status ficar **WORKING**, está conectado.
4. No n8n, crie as credenciais:
   - **WAHA API**: URL `http://host.docker.internal:3000` e a mesma chave do `.env`.
   - **Redis**: host `redis`, porta `6379`, senha `default`.
5. Importe o workflow e ative com o botão **Active**.

## Cuidados

- **Não coloque a chave de API no Git.** Deixe o `.env` fora do repositório.
- **Cuidado ao ativar o bot num número pessoal.** Ele responde a todo mundo que escrever. Para testar, use um número separado ou filtre uma lista de números permitidos.
- **Dentro do Docker**, o n8n fala com o WAHA e o Redis pelos nomes dos serviços ou por `host.docker.internal`, nunca por `localhost`.
- O webhook de produção (`/webhook/...`) só funciona com o workflow **ativo**. O de teste (`/webhook-test/...`) só funciona com o botão "Listen for test event".

## O que aprendi

- Um webhook recebe os eventos do WhatsApp e o n8n decide a resposta.
- Um bot de menu precisa de **estado** (memória por conversa). Sem isso, ele não sabe se a mensagem é a primeira ou a resposta a uma pergunta.
- Uma API sem chave (`WAHA_NO_API_KEY`) é aceitável só para testes locais e deve ser protegida antes de expor a porta.
- Sempre testar com cuidado quando há um WhatsApp real conectado, porque as mensagens de teste saem de verdade.
