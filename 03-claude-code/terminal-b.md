# 03 - Claude Code: git worktree add (terminal B)

## O que é um worktree
Um worktree é uma **segunda pasta de trabalho do mesmo repositório**, com uma branch
própria. Todas compartilham o mesmo histórico (`.git`), mas cada uma tem seus arquivos.
Assim dois terminais (ou duas sessões do Claude Code) trabalham ao mesmo tempo sem pisar
um no outro e sem precisar de `git stash` ou de trocar de branch.

## Exemplo de uso
Estando na pasta principal (`Estudos`, branch `main`):

```bash
# cria a pasta ../Estudos-terminal-b já em uma branch nova
git worktree add ../Estudos-terminal-b -b claude/terminal-b

# lista todos os worktrees
git worktree list
```

Saída esperada do `git worktree list`:
```
C:/Users/bryfa/Desktop/Estudos            d7ecde5 [main]
C:/Users/bryfa/Desktop/Estudos-terminal-a d7ecde5 [claude/terminal-a]
C:/Users/bryfa/Desktop/Estudos-terminal-b d7ecde5 [claude/terminal-b]
```

Depois é só abrir um terminal em cada pasta:
```bash
cd ../Estudos-terminal-b
claude          # sessão do Claude Code isolada nessa pasta e nessa branch
```

## Comandos usados
```bash
git worktree add <pasta> -b <branch>   # cria a pasta e a branch nova a partir do commit atual
git worktree add <pasta> <branch>      # cria a pasta usando uma branch que já existe
git worktree list                      # mostra os worktrees e a branch de cada um
git worktree remove <pasta>            # apaga a pasta do worktree (a branch continua existindo)
git worktree prune                     # limpa registros de pastas que foram apagadas na mão
```

## Cuidados
- Uma mesma branch **não pode** estar aberta em dois worktrees ao mesmo tempo.
- O stash (`git stash`) é compartilhado entre todos os worktrees, então prefira commits
  temporários para guardar trabalho.
- Para juntar o trabalho, faça push da branch e abra um pull request como de costume.
