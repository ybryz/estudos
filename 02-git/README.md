# 02 - Git: conflitos de merge

## O que é um conflito
Um conflito acontece quando duas branches alteram a **mesma parte do mesmo arquivo**
e o Git não consegue decidir sozinho qual versão manter. Ele pausa o merge e marca
o arquivo para você resolver à mão.

## Passo a passo do exercício
1. Ter o arquivo `02-git/conflito.md` na `main`.
2. Criar a branch `cor-roxo` e mudar a linha do arquivo para "roxo".
3. Voltar para a `main`, criar a branch `cor-azul` e mudar a **mesma linha** para "azul".
   As duas branches precisam sair do mesmo commit da `main`. Se a segunda for criada a
   partir da primeira, a história fica em linha reta e não existe conflito.
4. Enviar as duas branches ao GitHub e abrir um pull request para cada uma, com descrição.
5. Fazer o merge do primeiro PR (`cor-roxo`).
6. O segundo PR (`cor-azul`) passa a mostrar "This branch has conflicts that must be resolved".
7. Resolver na máquina: trazer a `main` para a branch, editar o arquivo, `git add`, `git commit`, `git push`.
8. Fazer o merge do segundo PR.

## Comandos usados
```bash
git switch -c cor-roxo           # cria e entra numa branch
git add 02-git/conflito.md              # prepara a alteração
git commit -m "mensagem"         # registra a alteração
git push -u origin cor-roxo      # envia a branch ao GitHub
git switch main                  # troca de branch
git pull origin main             # traz as novidades da main
git merge main                   # junta a main na branch atual (aqui aparece o conflito)
git status                       # mostra os arquivos em conflito (UU)
git merge --abort                # cancela um merge com conflito
```

## Como resolver um conflito
Depois do `git merge main`, o arquivo fica assim:
```
<<<<<<< HEAD
cor favoritaaa doo gatinho: azullll
=======
cor favoritaaa doo gatinho: roxo
>>>>>>> main
```
- Entre `<<<<<<< HEAD` e `=======` está a versão da sua branch.
- Entre `=======` e `>>>>>>> main` está a versão que veio da `main`.

Passos:
1. Decida o texto final (uma das versões, as duas ou um texto novo).
   Neste exercício o resultado foi: `cor favoritaaa doo gatinho: roxo e azul`.
2. Apague as linhas `<<<<<<<`, `=======` e `>>>>>>>`.
3. `git add 02-git/conflito.md`
4. `git commit -m "resolve conflito"`
5. `git push origin cor-azul`

O PR deixa de mostrar conflito e pode ser mergeado.

## Como evitar conflitos
- Faça `git pull` antes de começar a trabalhar e antes de dar push.
- Use branches curtas e faça merge com frequência.
- Combine com o time quem mexe em qual arquivo.
- Faça commits pequenos e focados.
- Não reformate arquivos inteiros sem necessidade.
