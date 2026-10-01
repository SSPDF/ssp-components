import { BoxProps, SxProps, Theme } from '@mui/material'

/**
 * Props de um `Box` que o app passa à lib, no formato do MUI 5: estilos soltos como props
 * (`border`, `borderRadius`, `bgcolor`…, as "system props") junto das props de DOM.
 *
 * O MUI 9 tirou as system props do `Box`, e estilos passados assim sumiriam sem erro. Aqui eles
 * são separados para irem ao `sx`. Fica tudo que não é prop de DOM: `id`, `className`, `style`,
 * `role`, `title`, `tabIndex`, `component`, `aria-*`, `data-*` e funções (eventos).
 */
export type BoxComEstilosSoltos = BoxProps & Record<string, unknown>

const PROPS_DE_DOM = new Set(['id', 'className', 'style', 'role', 'title', 'tabIndex', 'component', 'ref', 'children', 'sx'])

/**
 * Separa as props de DOM (vão para o `Box`) e monta o `sx` com a mesma precedência do MUI 5, em
 * que as system props entravam antes do `sx`: estilos soltos do app, depois a base da lib, depois
 * o `sx` do app.
 */
export function separarPropsDeEstilo(props: BoxComEstilosSoltos = {}, base: Record<string, unknown> = {}) {
    const dom: Record<string, unknown> = {}
    const estilo: Record<string, unknown> = {}
    for (const [chave, valor] of Object.entries(props)) {
        if (PROPS_DE_DOM.has(chave) || chave.startsWith('aria-') || chave.startsWith('data-') || typeof valor === 'function') dom[chave] = valor
        else estilo[chave] = valor
    }
    const { sx, ...resto } = dom
    return { dom: resto as BoxProps, sx: [estilo, base, ...(Array.isArray(sx) ? sx : [sx])] as SxProps<Theme> }
}
