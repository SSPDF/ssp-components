---
name: atualizar-ssplib
description: Atualiza a @ssplib/react-components (lib de componentes da SSP-DF) num app Next.js consumidor, junto com a stack que ela exige (MUI, React, Next, pickers, toastify). Use quando o usuário pedir para atualizar, migrar ou subir a versão da @ssplib/react-components / ssp-components num app, ou para levar um app para a 1.x (MUI 9 + React 19). Traz um script de diagnóstico que compara o app com a versão-alvo, propõe os comandos de instalação e aponta no código o que os codemods não resolvem.
---

# Atualizar a @ssplib/react-components num app

A lib declara **só o major atual** de cada peer (MUI, React, Next, pickers, toastify). Atualizar a lib é atualizar a stack do app de uma vez. Quem roda é o MUI do app, então um erro de migração não aparece na lib: aparece na tela do app, muitas vezes **sem erro de compilação** (layout do Grid, cor que vira preta, `{...props}` apagado por codemod).

O trabalho é: diagnosticar → instalar → codemods → correções manuais → verificar → entregar para o usuário testar. **Não commite.** Entregue o working tree e pare; commit só quando o usuário pedir.

`SCRIPT` abaixo é `scripts/diagnostico.mjs` desta skill (caminho absoluto a partir da pasta onde este `SKILL.md` está). Ele só lê o app, não instala nada e não depende de pacote nenhum.

## 0. Antes de começar

1. Rode tudo na raiz do app. Confira `git status`: o working tree tem que estar limpo e no branch que o usuário indicou. Se houver mudança local que não é sua, pare e pergunte.
2. Descubra o **alvo**: a versão pedida (`1.0.0`, `next`, `latest`) ou um tarball local (`../ssp-components/pack/ssplib-react-components-<versão>.tgz`, gerado na lib com `npm run pack:local`). Sem indicação, pergunte: não suba para `latest` por conta própria.
3. `npm ci` para o `node_modules` refletir o lockfile (o diagnóstico lê as versões instaladas).
4. Se existir um `git stash` de uma migração anterior (`git stash list`), use-o como **referência** para as correções manuais, não como ponto de partida (`stash pop` sobre uma `develop` que andou dá conflito). Para um arquivo que não mudou na `develop` desde a base do stash (`git diff --stat stash@{0}^1 HEAD -- <arquivo>` vazio), dá para comparar a saída dos codemods com a versão do stash, as duas passadas pelo Prettier, e aproveitar a correção já validada.

## 1. Diagnóstico

```sh
node SCRIPT --alvo <alvo>
node SCRIPT --alvo <alvo> --changelog   # as seções do CHANGELOG entre a versão instalada e a alvo
```

Leia o relatório inteiro e o trecho do CHANGELOG (as seções **"O que o app precisa fazer"** de cada versão no caminho) antes de mexer em qualquer arquivo. O relatório traz:

- **Node**: local e dos `Dockerfile`s / `.nvmrc` / CI contra o `engines` da lib. Node do build abaixo do exigido é bloqueio: avise o usuário, não contorne.
- **Peers**: o que sobe, o que precisa ser declarado no app (ex.: `react-hook-form` que vinha de carona na `0.0.x`).
- **Família MUI fora das peers** (`@mui/lab`, `@mui/x-charts`…): remover se o código não usa, senão subir junto.
- **Dependências do app que não aceitam a stack nova** (peer de React/MUI/Next). Se nem a última versão aceita, é decisão do usuário (trocar, remover, esperar): pergunte.
- **Lockfiles**: mais de um (`package-lock.json` + `yarn.lock`) e qual o build usa.
- **Comandos de instalação propostos.** A ordem importa: tudo o que sobe é desinstalado primeiro.
- **Achados no código**, por categoria, com `arquivo:linha`. Guarde essa lista: é o seu checklist.

## 2. Instalar

1. **Antes dos codemods**, salve a contagem de spreads (o script avisa em `spread-em-risco` quais elementos correm perigo):
   ```sh
   node SCRIPT --salvar-spreads /tmp/spreads-antes.json
   ```
2. Rode os comandos de instalação do relatório, na ordem (revise a lista antes). O primeiro desinstala a lib antiga: sem isso, as dependências dela que ficam no lock (ex.: `react-leaflet` 4 da `0.0.x`, que pede React 18) fazem o npm dar `ERESOLVE` acusando a própria lib nova. **Nunca** `--force` nem `--legacy-peer-deps`: um `ERESOLVE` que sobra aponta um pacote real em conflito. Leia no relatório do npm (`~/.npm/_logs/*-eresolve-report.txt`) qual é, resolva-o (subir, remover) e rode de novo.
3. Confira que `package.json` ficou com faixas normais (`^9.4.0`, não `latest`) e que o `@ssplib/react-components` aponta para o alvo.

## 3. Codemods

Antes: `transpilePackages` com `'@ssplib/react-components'` no `next.config` (o diagnóstico acusa em `transpile`). Obrigatório desde a `1.0.0-rc.2`.

Rode só os que o caminho de versões pede (a lista está no CHANGELOG da versão que introduziu a mudança). Para sair da `0.x` (MUI 5) para a `1.x`, veja `references/0.x-para-1.x.md`, que tem a ordem exata e o que cada um deixa para trás.

Depois dos codemods, **sempre**:

```sh
node SCRIPT --comparar-spreads /tmp/spreads-antes.json
```

Cada arquivo listado perdeu um `{...x}`. Abra o `git diff` dele, veja nos usos do componente o que o spread carregava e decida (reponha, ou converta as props de layout em `size`: detalhes na referência). O codemod descarta o spread sem erro e o TypeScript não acusa.

Os codemods também reformatam o código (aspas duplas, ponto e vírgula). Se o app tiver `.prettierrc`, rode `npx prettier --write` nos arquivos que a migração tocou, e só neles.

## 4. Correções manuais

1. Rode o diagnóstico de novo (`node SCRIPT --alvo <alvo>`). O que sobrou em cada categoria é o que o codemod não resolveu. Corrija item a item seguindo a explicação da categoria e a referência. Nas categorias marcadas como **silenciosas** (`cor-caminho-tema`, `grid-legado`, `spread-em-risco`) o TypeScript não vai avisar.
2. Rode o type-check do app (`npx tsc --noEmit`) e corrija todos os erros. Os mais comuns estão na referência. Não use `any`, `@ts-ignore` nem cast para calar erro de tipo vindo da migração: descubra a API nova.
3. Em dúvida sobre a API do MUI, consulte a documentação **da versão instalada**, não a memória: o `llms.txt` da lib (`node_modules/@ssplib/react-components/llms.txt`) lista os links, ou o MCP oficial do MUI se o app tiver.
4. Mantenha o estilo do app (aspas, ponto e vírgula, indentação). Não refatore o que a migração não pede.

### Cópias locais de componentes da lib (`copia-da-lib`)

Apps costumam ter a própria versão de um componente da lib (o viva-flor tem `components/form/Input`, `DatePicker`, `FetchAutoComplete`…, cópias antigas). **Antes de corrigir uma cópia para o MUI novo, tente trocá-la pelo componente da lib**: menos código no app e as correções da lib passam a valer para ele. O diagnóstico lista cada cópia, o equivalente na lib e quantos arquivos a importam.

1. **Cópia sem uso** (`sem uso no app`): apague o arquivo em vez de migrá-lo.
2. **Compare o contrato** da cópia com o componente da lib (o `Generic*` quando a cópia usa o `useFormContext` do react-hook-form; o clássico quando usa o `FormContext` da lib). A troca só é segura se todos batem:
   - **Contexto do formulário:** o provider em volta dos usos é o que o componente da lib espera (`GenericFormProvider`/`FormProvider` do RHF para `Generic*`, `FormProvider` da lib para os clássicos).
   - **Valor gravado no formulário:** mesmo tipo e formato (ex.: o `GenericDatePicker` grava `'DD/MM/YYYY'`; a cópia do viva-flor gravava `Dayjs`). O que vai para a API não pode mudar.
   - **Valor inicial:** de onde vem (prop `defaultValue` × estado do formulário via `reset`/`useWatch`). Tela de edição que carrega os dados com `reset` precisa continuar mostrando o valor.
   - **Ciclo de vida:** o componente da lib faz `unregister` ao desmontar? (o `GenericDatePicker` faz, salvo `persistValue`): em formulário por etapas, isso apaga o dado da etapa anterior.
   - **Props usadas pelo app:** todas existem na lib com o mesmo significado (ex.: o `Field` da lib usa `title` = rótulo e `name` = valor; o do viva-flor, `name` = rótulo e `dsc` = valor) e nenhuma funcionalidade só da cópia é usada (o `FetchAutoComplete` do viva-flor tem `incluirValorAtual`).
   - **Visual e mensagens:** layout, textos de erro e validação equivalentes, ou a diferença é aceitável para o usuário.
3. **Contrato equivalente:** troque os imports, apague a cópia, rode `tsc` e verifique no browser o fluxo de **criação e o de edição** que usam o campo.
4. **Contrato diferente:** mantenha e corrija a cópia, e liste a divergência na entrega (o que impediu a troca). Não mude a lib para caber na cópia; se a lib não tiver algo que o app precisa, é uma proposta para o usuário decidir.

## 5. Verificar

Tudo verde antes de entregar:

1. `npx tsc --noEmit` sem erros.
2. Lint do app (`npm run lint`, se existir): nenhum erro novo em relação à `develop`.
3. `npm run build` (o `next build` também renderiza as páginas no SSR).
4. Diagnóstico final: `node SCRIPT --alvo <alvo>` sem peers para subir e sem achados nas categorias de migração.
5. `next dev` e abrir as páginas principais **no browser**, com o console aberto. Olhe layout (campos lado a lado que viraram largura total, cores), e o console do browser e do terminal (o Next 16 repassa os avisos do browser como `[browser]`). Um erro ou aviso que vem da lib (stack trace em `@ssplib/react-components`) é **bug da lib**: registre e avise o usuário, não contorne no app.
6. Se o app tem testes, rode-os. Seletores que mudam estão na referência.

Páginas que dependem de login, API ou dados reais: diga ao usuário quais você não conseguiu exercitar.

## 6. Entregar

Pare e informe o usuário, sem commitar:

- versões antes → depois (lib e stack);
- arquivos tocados e o que foi manual (fora dos codemods), em especial spreads repostos e cores/layouts corrigidos;
- cópias locais de componentes da lib: quais foram trocadas pela lib, quais foram apagadas por falta de uso e, das mantidas, o que impediu a troca;
- o que foi verificado e o que ficou para o teste dele (páginas com login, fluxos com dados reais);
- problemas encontrados na lib ou nesta skill, para corrigir na lib (repo `ssp-components`).

## Quando algo dá errado

- **A lib não recua para caber no app.** A lib acompanha as versões atuais e as exigências dela (peers, `transpilePackages`, Node) são do app cumprir. Se o app quebra por não cumprir uma delas, **atualize o app**; não mude a lib para aceitar o jeito antigo do app (nem faixa de peer mais larga, nem shim de compatibilidade). Exemplo real: o viva-flor não tinha `transpilePackages` e o build quebrou no SSR; a correção foi a linha no `next.config.js` do app.
- **Bug de verdade na lib** (componente quebrado mesmo com o app cumprindo tudo, tipo exportado errado, aviso no console com stack na lib): não contorne no app. Pare, mostre ao usuário o arquivo da lib e a reprodução, e pergunte antes de mexer na lib; a correção sai numa nova versão.
- **Achado que esta skill ou o script deveriam ter pego**: diga qual padrão faltou, para a skill ser corrigida no repo da lib (`skills/atualizar-ssplib/`).
- Para desfazer tudo: `git checkout -- . && git clean -fd` (confirme com o usuário antes) e `npm ci`.
