import { Meta, StoryObj } from '@storybook/nextjs'
import { SwitchWatch, ToggleVisibility } from '../components/form/switch/ToggleVisibility'
import Switch from '../components/form/switch/Switch'
import Input from '../components/form/input/Input'
import FormBaseDecorator from '../decorators/FormBaseDecorator'

/**
 * `SwitchWatch` mostra os filhos conforme o valor de outro campo do formulário e,
 * ao escondê-los, remove do form os campos listados em `unregisterNameList`
 * (via o `ToggleVisibility` que ele renderiza internamente).
 *
 * Ligue e desligue o switch e envie o formulário: os campos escondidos não
 * aparecem no payload.
 */
const meta: Meta<typeof SwitchWatch> = {
    title: 'Switch/SwitchWatch',
    component: SwitchWatch,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof SwitchWatch>

export const Base: Story = {
    render: () => (
        <>
            <Switch name='possuiVeiculo' title='Possui veículo?' />
            <SwitchWatch switchId='possuiVeiculo' unregisterNameList={['placa']}>
                <Input name='placa' type='input' title='Placa do veículo' />
            </SwitchWatch>
        </>
    ),
}

/**
 * Com `invert`, o bloco aparece quando o switch está **desligado**.
 */
export const Invertido: Story = {
    render: () => (
        <>
            <Switch name='possuiCpf' title='Possui CPF?' />
            <SwitchWatch switchId='possuiCpf' unregisterNameList={['justificativaSemCpf']} invert>
                <Input name='justificativaSemCpf' type='input' title='Justifique a ausência de CPF' />
            </SwitchWatch>
        </>
    ),
}

/**
 * Com `checkValue`, o gatilho é o valor de um input qualquer, não só de um switch.
 */
export const PorValorDeCampo: Story = {
    render: () => (
        <>
            <Input name='uf' type='input' title="Digite 'DF' para revelar o campo abaixo" />
            <SwitchWatch switchId='uf' unregisterNameList={['regiaoAdministrativa']} checkValue='DF'>
                <Input name='regiaoAdministrativa' type='input' title='Região administrativa' />
            </SwitchWatch>
        </>
    ),
}

/**
 * `ToggleVisibility` é o componente de efeito colateral que o `SwitchWatch` monta
 * internamente: ele não renderiza nada (`<></>`) e existe só para chamar
 * `formUnregister` nos campos de `unregisterNameList` quando é desmontado.
 *
 * Usar direto só faz sentido para controlar o unregister manualmente — daí a
 * story não ter saída visual.
 */
export const ToggleVisibilityDireto: Story = {
    render: () => (
        <>
            <Switch name='possuiAnexo' title='Possui anexo?' />
            <Input name='descricaoAnexo' type='input' title='Descrição do anexo' />
            <ToggleVisibility switchId='possuiAnexo' unregisterNameList={['descricaoAnexo']} hasCheckValue={false} />
        </>
    ),
}
