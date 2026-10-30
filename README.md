# Organiza

Aplicação de organização pessoal criada com Angular 21. Adicione tarefas, marque
o que já foi feito, filtre por situação e acompanhe seu progresso. As tarefas
ficam salvas no armazenamento local do navegador.

## Requisitos

- Node.js compatível com Angular 21
- npm

## Executar localmente

```bash
npm install
npm start
```

Abra `http://localhost:4200/` no navegador. A aplicação atualiza automaticamente
quando os arquivos são alterados.

## Validar e gerar build

```bash
npm test
npm run build
```

O build de produção é gerado em `dist/`.

Para renderização SSR em produção, configure `NG_ALLOWED_HOSTS` com os nomes de
host públicos da aplicação, separados por vírgula.
