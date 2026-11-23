# Rascunho de apoio: 5 dicas do vídeo

Material de apoio para escrever o README da 12. **Não é o README.**

Vídeo: [A Própria Anthropic Explica Como Usar o Claude Code](https://youtu.be/iMso7WbhUr0)
(canal Augusto Galego, uns 15 minutos).

> **Atenção:** a fala do vídeo não foi transcrita (o YouTube não entrega a legenda sem login e o
> vídeo não tem capítulos). A descrição do vídeo aponta para a página oficial de boas práticas
> do Claude Code (<https://code.claude.com/docs/en/best-practices>), que é o que o vídeo explica.
> As 5 dicas abaixo foram tiradas dessa página. **Confira com o vídeo** e troque o que ele
> disser diferente.

## 1. Diga ao Claude o que ele não consegue ver

No CLAUDE.md, coloque só o que o Claude não descobre lendo o código: o comando exato para
rodar e testar, decisões que não estão escritas em lugar nenhum, o que já precisou ser
corrigido duas vezes. Pergunta da página: "ele acharia isso lendo o código?" Se sim, não
precisa estar lá. CLAUDE.md curto funciona melhor que CLAUDE.md longo. (`/init` cria um
primeiro rascunho.)

*No estudos:* o comando de teste do Busca CEP, "qual das cópias do Busca CEP usar" e "o README é
da Gabriela" são coisas que ele não sabe sozinho, por isso estão no `CLAUDE.md`.

## 2. Escreva um pedido específico

Diga o arquivo, descreva o problema e diga como é "pronto". Pedido vago faz o Claude
adivinhar.

*No estudos:* é o formato do `pedidos.md`: objetivo, contexto, o que não mexer e como saber
que ficou pronto.

## 3. Dê ao Claude um jeito de conferir o próprio trabalho

Algo que ele possa rodar e que responda passou ou falhou: os testes, um comando, um passo a
passo. E peça a prova (a saída do teste), não só "todos os testes passaram".

*No estudos:* o `npm test` de `05-busca-cep/backend` (com o `node --test`), que está escrito
no `CLAUDE.md`.

## 4. Regra que não pode ter exceção não fica só no CLAUDE.md

O CLAUDE.md é orientação, e o Claude pode decidir que uma regra não se aplica. O que nunca pode
acontecer (ex.: ler o `.env`) vai para as permissões ou para um hook, que o Claude Code obriga
de verdade.

*No estudos:* "nada de chave no código" está no CLAUDE.md, mas a proteção de verdade é o
`.gitignore` com o `.env` (como o de `04-n8n-whatsapp`), que impede o arquivo de subir.

## 5. Acompanhe e corrija cedo

Olhe o primeiro minuto do trabalho e aperte `Esc` se ele for para o lado errado. Depois de duas
correções que não deram certo, use `/clear` e escreva um pedido melhor, em vez de corrigir uma
terceira vez. `/clear` também entre tarefas que não têm nada a ver uma com a outra.

## Uma coisa que a página diz para parar de fazer

Escrever IMPORTANTE ou tudo em MAIÚSCULAS no CLAUDE.md e descrever a arquitetura inteira lá
(o Claude lê o código sozinho). Ponto para pensar: o `CLAUDE.md` do estudos tem uma tabela de
pastas porque a demanda pediu; ela ajuda porque diz qual cópia do Busca CEP usar (05, 06 ou 07), que é
justamente o que o Claude não adivinha.
