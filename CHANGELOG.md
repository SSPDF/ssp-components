# Changelog

Mudanças relevantes para quem consome `@ssplib/react-components`. A lib segue [semver](https://semver.org/lang/pt-BR/) a partir da `0.1.0`: enquanto estiver em `0.x`, **mudança breaking sobe o minor** (`0.1` → `0.2`) e correção sobe o patch.

## 0.1.0

Primeira versão com packaging correto. Nenhum componente muda de comportamento ou de visual — os 83 snapshots das stories são idênticos aos da `0.0.349`.

> Um app com `"@ssplib/react-components": "^0.0.349"` **não** recebe esta versão automaticamente (em `0.0.x` o `^` fixa a versão exata). Para atualizar, troque para `"^0.1.0"`.

### O que o app precisa fazer

Instalar as peer dependencies, se ainda não tiver (a maioria dos apps já tem todas):

```bash
npm install @mui/material @mui/icons-material @mui/x-date-pickers @emotion/react @emotion/styled react-hook-form dayjs react-toastify
```

Se o `npm install` acusar peer fora da faixa, as faixas estão no `README.md` ("Contrato de peer dependencies").

### Mudanças

- **`peerDependencies` declaradas.** O MUI (`@mui/material ^5.8.6`, `@mui/icons-material ^5`, `@mui/x-date-pickers ^6`), o Emotion, `react-hook-form`, `dayjs` e `react-toastify` agora são peers — sempre vieram do app em runtime, mas o pacote não declarava isso. `react-hook-form`, `dayjs` e `react-toastify` deixam de ser dependências próprias, o que elimina o risco de duas cópias na árvore (contexto de formulário e `toast()` de instâncias diferentes).
- **Corrigido: `Stepper` quebrava em apps sem `@mui/lab`.** O bundle importava `@mui/lab` sem declará-lo. Agora ele é dependência da lib (fixado em `5.0.0-alpha.127`, que aceita qualquer `@mui/material` 5) e é instalado junto.
- **Corrigido: `require('@ssplib/react-components')` falhava.** `main` e `exports.require` apontavam para `index.cjs.js`, que nunca existiu; agora apontam para `index.cjs`. Afeta Jest, scripts Node e qualquer resolução CommonJS.
- **Corrigido: ordem das condições em `exports`.** `types` passa a ser a primeira, como o TypeScript exige.
- **O bundle não embute mais uma cópia do `@mui/system`.** `FileUpload` e `DropFileUpload` importavam `Stack` de `@mui/system`, que não era externo, e o build copiava o pacote para dentro do `dist/` (~40 kB). Agora usam o `Stack` do `@mui/material` do app.
- **Novo export: `GenericFormProvider`.** O provider dos componentes `Generic*` existia mas não era exportado; antes era preciso montar `useForm()` + o `FormProvider` do react-hook-form na mão.

### Problema conhecido

- `Table` lê o `localStorage` durante o render e quebra no SSR do Next. Carregue-a com `next/dynamic` e `ssr: false` (exemplo no `README.md`). Já acontecia nas versões anteriores.
