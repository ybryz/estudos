# 03 - Claude Code: git worktree

## O que é
Um `git worktree` é uma **segunda (ou terceira...) pasta de trabalho ligada ao mesmo
repositório**. Cada worktree tem a sua própria branch e os seus próprios arquivos, mas
todas compartilham o mesmo histórico (a pasta `.git`) — nada é clonado de novo.

Sem worktree, para trabalhar em duas branches ao mesmo tempo você precisaria alternar
com `git switch` (e guardar alterações pela metade) ou clonar o repositório duas vezes.
Com worktree, cada branch fica aberta na sua pasta.

## Regra importante
Uma mesma branch **não pode estar aberta em dois worktrees ao mesmo tempo**. O Git
recusa, para evitar que dois lugares mexam na mesma branch.

## Por que isso importa no Claude Code
Dá para rodar várias sessões do Claude Code em paralelo, cada uma num terminal e num
worktree próprio. Como as pastas são isoladas, uma sessão não sobrescreve os arquivos
da outra, e cada uma trabalha na sua branch.

Neste estudo:

| Pasta | Branch |
|-------|--------|
| `Estudos` | `main` |
| `Estudos-terminal-a` | `claude/terminal-a` |
| `Estudos-terminal-b` | `claude/terminal-b` |

## Comandos
```bash
git worktree add ../Estudos-terminal-a -b claude/terminal-a   # cria a pasta e uma branch nova
git worktree add ../outra-pasta nome-da-branch                # cria a pasta para uma branch que já existe
git worktree list                                             # lista os worktrees
git worktree remove ../Estudos-terminal-a                     # apaga a pasta do worktree
git worktree prune                                            # limpa registros de pastas que não existem mais
```

## O que é compartilhado e o que não é
- **Compartilhado:** commits, branches, tags, remotes e o stash.
- **Separado:** os arquivos da pasta, o `HEAD` (qual branch está aberta) e a área de
  staging (`git add`).

O stash ser compartilhado é uma pegadinha: um `git stash pop` numa sessão pode puxar
alterações guardadas por outra. Em vez de stash, prefira um commit temporário.

## Juntando o trabalho
Cada worktree termina com commits na sua branch. Para juntar, é o fluxo normal:
`git push`, abrir um pull request e fazer o merge na `main`. Se duas branches mexerem na
mesma linha, aparece um conflito de merge (veja `02-git/README.md`).
