# 09 - Segurança básica

Neste estudo eu aprendi onde ficam as senhas, chaves e configurações de um projeto (no .env, nunca no código), o que nunca pode ir para o GitHub e o que fazer quando alguma coisa vaza. Para praticar, deixei a porta e o endereço do ViaCEP do Busca CEP no .env.

## O que é um segredo

Segredo é qualquer informação que dá acesso a alguma coisa: senha, chave de API, token, endereço de banco com usuário e senha. Quem tem o segredo consegue entrar no sistema, usar o serviço ou até gastar dinheiro no seu nome. Por isso ele não pode ficar no código, porque o código vai para o GitHub e qualquer pessoa pode ver.

## O que nunca vai para o GitHub

- o arquivo `.env`
- senhas de banco de dados
- chaves de API (de serviços de IA, de pagamento, do Google, da AWS...)
- tokens de acesso (do GitHub, do Slack, de login)
- chaves privadas e certificados (`.pem`, `.key`)
- endereço de banco com usuário e senha juntos (ex.: `postgres://usuario:senha@...`)
- dados de pessoas reais e de clientes

## .env, .env.example e .gitignore

| Arquivo | Para que serve | Vai para o GitHub? |
|---|---|---|
| `.env` | guarda os valores de verdade (senhas, chaves, portas) só na minha máquina | **não** |
| `.env.example` | mostra os nomes das variáveis que o projeto precisa, com valores de exemplo e sem segredo, para quem baixar o projeto saber o que preencher | sim |
| `.gitignore` | lista os arquivos que o git deve ignorar; o `.env` fica nele para nunca subir por engano | sim |

O código só sabe o nome da variável (`process.env.PORT`), não o valor. Assim o código pode ir para o GitHub sem problema.

## Busca CEP com .env

No back-end do Busca CEP (`busca-cep/backend`), a porta e o endereço do ViaCEP saíram do código e foram para o `.env`:

```
PORT=3000
VIACEP_URL=https://viacep.com.br/ws
```

O Node lê o `.env` sozinho com `node --env-file=.env` (já está no `npm start`), sem precisar instalar nada. Se o `.env` não existir, o servidor avisa e não sobe.

Para rodar:

```
cd busca-cep/backend
cp .env.example .env
npm install
npm start
```

E o front-end, em outro terminal:

```
cd busca-cep/frontend
npm start
```

## Varredura do histórico do estudos

Procurei em todos os 62 commits do estudos (todas as branches) se alguma chave, senha ou token já tinha sido commitado. O git guarda todas as versões dos arquivos, então mesmo uma senha apagada depois continuaria lá no histórico.

Fiz em três passos:

1. **Arquivos de segredo:** procurei se algum `.env`, `.pem`, `.key` ou parecido já tinha entrado em algum commit. Só achei o `.env.example` deste estudo, que não tem segredo.
2. **Palavras suspeitas:** procurei linhas com `password`, `senha`, `secret`, `api_key`, `token` e `DATABASE_URL`. O que apareceu eram só leituras de variável (`process.env.DATABASE_URL`), um `${WAHA_API_KEY}` que vem do `.env` e textos de exemplo no README do estudo 04.
3. **Formatos de chave conhecidos:** procurei os começos de chave de verdade (`ghp_`, `sk-`, `AKIA`, `AIza`, `xoxb-`, chave privada, JWT, banco com senha no endereço). Não achei nenhum.

**Resultado:** nenhuma chave, senha ou token de verdade foi commitado no estudos. O Secret scanning do GitHub também não mostra nenhum alerta.

**Ponto de atenção:** no docker-compose do estudo 04 ficaram as senhas `default` do Redis e do Postgres escritas direto no arquivo. Não vaza nada, porque elas só funcionam nos containers locais da minha máquina, mas o certo seria colocar essas senhas no `.env` e usar `${POSTGRES_PASSWORD}` no compose.

## Proteção do GitHub

No estudos estão ligados o **Secret scanning**, que avisa quando acha uma chave no repositório, e o **Push protection**, que bloqueia o push se tiver uma chave dentro, antes dela chegar no GitHub.

![Secret scanning e Push protection ligados](prints/protecao-github.png)

## Se uma chave vazar

1. **Trocar a chave na hora** (revogar a antiga e gerar uma nova no site do serviço). Só apagar do código não basta: a chave antiga continua no histórico do git e alguém pode já ter copiado.
2. Colocar a chave nova só no `.env`.
3. Olhar no serviço se alguém usou a chave enquanto ela estava exposta (gastos, acessos estranhos).
4. Avisar quem é responsável pelo projeto.

## 5 cuidados ao pedir código para a IA

1. **Nunca colar senha ou chave de verdade no chat.** Se precisar mostrar, troco por um valor de mentira.
2. **Pedir para usar variável de ambiente.** Se a IA escrever a chave direto no código, peço para mover para o `.env`.
3. **Conferir o `git status` antes do commit**, para ver se o `.env` ou outro arquivo de segredo não entrou na lista.
4. **Desconfiar de valores "de exemplo" que parecem reais** e não deixar a IA inventar senha fraca como `admin` ou `123456` em arquivo de configuração.
5. **Não colocar segredo no front-end**, porque tudo o que vai para o navegador qualquer pessoa consegue ver. Chave fica só no back-end.
