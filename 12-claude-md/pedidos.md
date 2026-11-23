# Pedidos ao Claude Code: antes e depois

Três pedidos ruins (inventados a partir do próprio estudos) reescritos no formato bom:
**objetivo**, **contexto**, **o que não mexer** e **como saber que ficou pronto**.

---

## Pedido 1: botão de limpar no Busca CEP

### Ruim

> coloca um botão de limpar no busca cep

O que falta: qual das três cópias do Busca CEP (05, 06 ou 07)? Limpar o quê (o campo, o resultado, os dois)?
Pode mexer no back-end? Como testar? O Claude vai ter que adivinhar tudo isso.

### Bom

> **Objetivo:** colocar um botão "Limpar" no front-end do Busca CEP que apaga o CEP digitado e
> o resultado (endereço ou erro) e volta o cursor para o campo.
>
> **Contexto:** é o Busca CEP de `05-busca-cep`. O front-end é HTML, CSS e JS puros
> (`frontend/index.html`, `style.css`, `app.js`), sem framework. O botão "Buscar" já existe
> dentro de `<div class="linha">`.
>
> **O que não mexer:** o back-end, os testes, as cópias do Busca CEP no 06 e no 07 e o README.
> Sem dependência nova.
>
> **Como saber que ficou pronto:** abro a página, busco `01001-000`, clico em "Limpar" e o
> campo e o resultado ficam vazios com o cursor no campo; o mesmo depois de um erro;
> `npm test` no back-end continua passando; um commit só, com os três arquivos do front.

---

## Pedido 2: deixar a busca mais rápida

### Ruim

> a busca tá lenta, arruma

O que falta: lenta onde (no back-end, no ViaCEP, na página)? Quanto é "lenta"? O Claude pode
sair colocando cache, trocando biblioteca ou mexendo em tudo para "otimizar".

### Bom

> **Objetivo:** descobrir por que a busca do CEP demora e me dizer a causa antes de mudar algo.
>
> **Contexto:** estou no `05-busca-cep`. A busca do CEP `01001-000` demora uns 3 segundos
> para aparecer na página. O back-end chama o ViaCEP em `backend/src/viacep.js`, com limite de
> 5 segundos. O cache com Redis existe só no estudo `07-redis`.
>
> **O que não mexer:** não coloque cache nem dependência nova e não mude o código ainda.
> Primeiro só investigue.
>
> **Como saber que ficou pronto:** você me mostra quanto tempo cada parte leva (página →
> back-end → ViaCEP), com o comando ou o print usado para medir, e diz onde está a demora e o
> que sugere fazer. Nada é commitado nesta etapa.

---

## Pedido 3: explicar um conceito no README

### Ruim

> escreve o readme do estudo 12 explicando o claude.md

O que falta: o README do estudos é escrito pela Gabriela, com as palavras dela. O Claude vai
escrever um texto que não é dela e talvez ainda invente coisa que não foi feita.

### Bom

> **Objetivo:** me ajudar a escrever o README do `12-claude-md`, sem escrever o texto por mim.
>
> **Contexto:** no estudo 12 eu fiz o `CLAUDE.md` da raiz, os pedidos reescritos em
> `12-claude-md/pedidos.md` e o antes e depois do botão de limpar em duas branches. Eu vou
> escrever o README com as minhas palavras.
>
> **O que não mexer:** não crie nem altere o `README.md`. Não mude o `CLAUDE.md` nem o Busca
> CEP.
>
> **Como saber que ficou pronto:** um arquivo `12-claude-md/notas.md` com uma lista do que foi
> feito (o que tem no CLAUDE.md, os pedidos, o que cada branch fez) e as dúvidas que o README
> precisa responder, para eu usar como apoio. Só esse arquivo no `git status`.

---

## O que muda do ruim para o bom

| | Ruim | Bom |
|---|---|---|
| **Objetivo** | uma frase solta | diz o resultado esperado |
| **Contexto** | o Claude adivinha a pasta e a tecnologia | diz a pasta, os arquivos e o que já existe |
| **O que não mexer** | nada, então ele pode mexer em tudo | diz o que fica de fora (outras pastas, README, dependências) |
| **Pronto** | "acho que ficou bom" | um teste, um passo a passo ou um arquivo que dá para conferir |
