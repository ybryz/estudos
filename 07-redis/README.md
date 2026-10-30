# 07 - Redis: cache das buscas do Busca CEP

Continuação do 06. Antes, toda busca ia até o ViaCEP. Agora o back-end olha primeiro no **Redis**: se o CEP já foi buscado, a resposta vem de lá; se não, vai ao ViaCEP e guarda no Redis por 1 hora. A página também mostra quantas vezes cada CEP já foi buscado.

## Como rodar

```bash
docker compose up -d          # sobe o Redis (porta 6380 no PC)
cd backend
npm install
npm run db:preparar
npm start                     # back-end na porta 3000
```

Depois é só abrir o `frontend/index.html` no navegador e buscar um CEP duas vezes. No terminal do back-end aparece `veio do ViaCEP` na primeira e `veio do cache` na segunda.

## Comandos do redis-cli

```bash
docker exec -it redis-estudos redis-cli
```

| Comando | O que faz |
|---|---|
| `SET nome gabi` | guarda um valor numa chave |
| `GET nome` | lê o valor da chave |
| `DEL nome` | apaga a chave |
| `EXPIRE nome 60` | a chave some em 60 segundos |
| `TTL nome` | mostra quantos segundos faltam (`-1` não expira, `-2` não existe) |
| `INCR visitas` | soma 1 ao número (cria com 1 se não existir) |

## O que é cache

Cache é uma cópia guardada para não precisar buscar de novo na fonte. Aqui a fonte é o ViaCEP, que é uma chamada pela internet e demora mais. O endereço fica salvo na chave `cep:01001000` por 3600 segundos (1 hora), e o contador de buscas fica em `contador:01001000`, que usa o `INCR`.

## Por que o Redis é rápido

Ele guarda os dados na **memória RAM**, e não no disco como o SQLite do 06. Ler da memória é bem mais rápido do que ler do disco, e ainda mais do que fazer uma chamada pela internet. Além disso, o modelo é simples: chave e valor, sem tabelas nem ligações.

## O que acontece quando o tempo do cache acaba

O Redis apaga a chave sozinho. Na próxima busca desse CEP o `GET` volta vazio, o back-end vai de novo ao ViaCEP e guarda outra vez por mais 1 hora. Com isso, se um endereço mudar no ViaCEP, no máximo 1 hora depois a página já mostra o novo.

## Diferença para o banco do 06

| | Banco (06, SQLite) | Redis (07) |
|---|---|---|
| Onde guarda | arquivo no disco | memória |
| Serve para | guardar para sempre (o histórico) | guardar por pouco tempo (o cache) |
| Estrutura | tabelas ligadas por chave primária e estrangeira | chave e valor |
| Dura | até alguém apagar | até o `EXPIRE` acabar |

Os dois trabalham juntos: o histórico continua indo para o SQLite, e o Redis só evita ir ao ViaCEP à toa.
