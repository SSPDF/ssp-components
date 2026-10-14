import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import storybook from 'eslint-plugin-storybook'
import prettier from 'eslint-config-prettier'

/**
 * Flat config do ESLint (criado com o 9 na Etapa 0 do UPGRADE_PLAN.md; no 10 desde a Etapa 4).
 *
 * Critério desta primeira passada: **nada que exija refatoração entra como `error`**.
 * O objetivo aqui é ter o lint rodando no CI sem travar as Etapas 1–8; as regras
 * ruidosas ficam em `warn` e vão sendo zeradas ao longo do plano.
 *
 * `eslint-config-prettier` vem por último para desligar as regras de formatação —
 * quem manda em formatação é o .prettierrc (4 espaços, aspas simples, sem ponto
 * e vírgula, printWidth 200).
 */
export default tseslint.config(
    {
        ignores: ['dist/**', 'storybook-static/**', 'node_modules/**', 'snapshots/**', 'examples/**', '*.cjs'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...storybook.configs['flat/recommended'],
    {
        files: ['**/*.{ts,tsx,js,jsx,mjs}'],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            'react-hooks': reactHooks,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,

            // --- Erros de verdade: pegam bug, não estilo -------------------------
            // A lib tem casos reais de <MenuItem> sem key dentro de .map()
            // (CustomMenu, Table, GenericTable) — ver seção 5.8 do UPGRADE_PLAN.md.
            'no-undef': 'off', // o TS já resolve isso, e aqui dá falso positivo com tipos
            // Log de depuração não vai para o console dos apps (UPGRADE_PLAN.md 5.13e). Erro de
            // verdade usa console.error/warn; os logs pedidos pelo app (`debugLog` do Stepper,
            // `enableDebugLogs` do KeycloakAuthProvider) têm eslint-disable na linha.
            'no-console': ['error', { allow: ['error', 'warn'] }],

            // --- Dívida conhecida: warn agora, error depois ----------------------
            // Estas 12 ocorrências não são auto-corrigíveis e exigiriam editar o
            // corpo de componentes. Conforme a decisão 4 do plano ("o primeiro PR
            // só corrige o que for automático"), entram como warn e são zeradas
            // ao longo das Etapas 2–7:
            //   no-unused-expressions  FetchAutoComplete:124, GenericFetchAutoComplete:90,
            //                          TabNavBar:154, CustomMenu:38  (padrão `cond && fn()`)
            //   no-useless-escape      GenericInput:82, Input:223  (regex de e-mail)
            //   no-var                 GenericTable:317, GenericTable:386
            //   no-case-declarations   utils.tsx:185,186,240,241
            'no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-expressions': 'warn',
            'no-useless-escape': 'warn',
            'no-var': 'warn',
            'no-case-declarations': 'warn',
            // `strict: false` no tsconfig deixou muito `any` pela base.
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/ban-ts-comment': 'warn',
            '@typescript-eslint/no-empty-object-type': 'warn',
            // Vários componentes chamam hooks condicionalmente (TabNavBar/NavBar com
            // `if (next) useRouter()`). É bug latente, mas consertar agora mudaria
            // comportamento — fica para depois da Etapa 0.
            'react-hooks/rules-of-hooks': 'warn',
            'react-hooks/exhaustive-deps': 'warn',
            // Regras do React Compiler, que o `recommended` do eslint-plugin-react-hooks 7
            // liga como `error` (Etapa 4, 25/09/2026). Cada ocorrência exige mexer no corpo
            // do componente, então entram como warn pelo mesmo critério acima. A `globals`
            // aponta as variáveis de módulo do `Table.tsx` (UPGRADE_PLAN.md 5.13a).
            'react-hooks/set-state-in-effect': 'warn',
            'react-hooks/preserve-manual-memoization': 'warn',
            'react-hooks/immutability': 'warn',
            'react-hooks/globals': 'warn',
        },
    },
    {
        // Tema escuro do app (UPGRADE_PLAN.md seção 17): a cor do escuro entra por
        // `theme.applyStyles('dark', …)` (`noEscuro` de utils/temaEscuro.ts), com a paleta de
        // `paleta(theme)`. `palette.mode` e as cores neutras lidas de `theme.palette` não acompanham
        // um app com `cssVariables` + `colorSchemes`: lá o modo troca por CSS e `theme.palette` é a
        // do claro. Fora o teste, que compara justamente com o `palette.mode`.
        files: ['src/components/**/*.{ts,tsx}'],
        ignores: ['**/*.test.{ts,tsx}'],
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: "MemberExpression[property.name='mode'][object.type='MemberExpression'][object.property.name='palette']",
                    message:
                        "Não decida a cor por palette.mode: use noEscuro(theme, …) de utils/temaEscuro.ts (theme.applyStyles('dark')). Com cssVariables o modo troca por CSS e palette.mode fica 'light'.",
                },
                {
                    // `theme.alpha` com variáveis CSS troca `var(--x)` por `var(--xChannel)` e monta
                    // `rgba(… / a)`: com cor literal sai `rgba(#01BA35 / 0.16)`, CSS inválido, descartado.
                    selector: "CallExpression[callee.property.name='alpha'][callee.object.type='Identifier'][arguments.0.type=/^(Literal|TemplateLiteral)$/]",
                    message: "theme.alpha só com token da paleta (p.primary.main…). Para cor fixa, use alpha('#…', a) de '@mui/material'.",
                },
                {
                    // Com variáveis CSS, cada um devolve { '*:where(.dark) &': … }: dois no mesmo objeto têm a
                    // mesma chave e o segundo apaga o primeiro (o campo voltava a ficar branco no escuro).
                    selector:
                        'ObjectExpression > SpreadElement:has(CallExpression[callee.name=/^(noEscuro|fundoDoCampo|caixaDeErro|cartaoDeOpcao)$/]) ~ SpreadElement:has(CallExpression[callee.name=/^(noEscuro|fundoDoCampo|caixaDeErro|cartaoDeOpcao)$/])',
                    message: 'Dois estilos de escuro (noEscuro, fundoDoCampo, caixaDeErro, cartaoDeOpcao) no mesmo objeto: com cssVariables o segundo apaga o primeiro. Junte tudo num noEscuro só.',
                },
                {
                    selector: "MemberExpression[property.name=/^(background|text|divider|action|common)$/][object.type='MemberExpression'][object.property.name='palette']",
                    message: 'Cor neutra lida de theme.palette é a do claro num app com cssVariables. No claro use o valor fixo de sempre; no escuro, noEscuro(theme, (p) => …) com o p que ele passa.',
                },
            ],
        },
    },
    {
        // Stories podem usar console à vontade — várias demonstram o submit. O `teste/` fica fora do build.
        // Scripts (da lib e das skills) são CLIs: a saída deles é o console.
        files: ['src/stories/**', 'src/decorators/**', 'scripts/**', 'skills/*/scripts/**', 'src/components/teste/**', '**/*.test.{ts,tsx}'],
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    prettier,
)
