# 08 - Arquitetura de software

[ESCREVA AQUI: uma ou duas frases suas sobre do que trata este estudo.]

## Os três jeitos

| | Monolito | Monolito modular | Microsserviços |
|---|---|---|---|
| **Vantagens** | É facil e rapido de começar, pois é tudo em um só lugar | resolve a bagunça do monolito, cada assunto fica em uma pasta especifica, e um modulo só usa o que o outro mostra, continua snedo um sistema, só bem simples de rodar | empresa grande usa pois cada quipe do seu serviço pode se responsabilizar sem atrapalhar uns aos outros, e se um serviço cai. os outros continuam no ar |
| **Desvantagens** | conforme cresce, vai virando bagunça, e mexer numa parte pode quebrar a outra | [ESCREVA AQUI] | em um projeto pequeno seria muito exagero, pois seriam varios sistemas e varios bancos para cuidas, a comunicaçao pela rede da muito trabalho para pouco ganho |
| **Quando usar** | projeto pequeno ou duas pessoas | projeto pequeno ou duas pessoas (recomendo o modular) | empresa com dez equipes |

## A loja inventada nos três jeitos

![Loja virtual nos três jeitos](desenho-loja.png)

[ESCREVA AQUI: uma frase sua explicando o desenho.]

## Busca CEP: antes e depois

### Antes (tudo no server.js)

```
backend/
├── package.json
├── prisma/
│   └── schema.prisma
└── src/
    └── server.js
```

### Depois (separado em módulos)

```
backend/
├── package.json
├── prisma/
│   └── schema.prisma
└── src/
    ├── server.js
    └── modulos/
        ├── cep/
        │   ├── index.js
        │   ├── cep.rotas.js
        │   └── cep.servico.js
        ├── historico/
        │   ├── index.js
        │   ├── historico.rotas.js
        │   ├── historico.servico.js
        │   └── prisma.js
        └── cache/
            ├── index.js
            └── cache.servico.js
```

### Por que ele é um monolito modular

[ESCREVA AQUI com suas palavras. Pistas: quantos sistemas rodam? Quantos bancos?
Para que serve o index.js de cada módulo? Um módulo mexe nos arquivos de dentro
do outro ou só usa o que o index.js mostra?]
