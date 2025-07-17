import { Box, Button, Stack } from '@mui/material'
import { Source } from '@storybook/blocks'
import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import 'react-toastify/ReactToastify.min.css'
import { Table } from '../components/form/table/Table'
import { SspComponentsProvider } from '../components/providers/SspComponentsProvider'

// const meta: Meta<typeof Teste> = {
//     title: 'Exemplo/Table',
//     component: Teste,
//     tags: ['autodocs'],
//     // decorators: [FormBaseDecorator],
// }

// export default meta
// type Story = StoryObj<typeof Teste>

// export const Base: Story = {
//     args: {},
// }

// function Teste() {
//     const [testFunc, setTestFunc] = useState(fetch('http://localhost:7171/table'))

//     return (
//         <SspComponentsProvider>
//             <Table
//                 fetchFunc={() => testFunc}
//                 useKC={false}
//                 dataPath='body.data'
//                 tableName='Teste'
//                 columns={[
//                     {
//                         keyName: 'coSeqEventoExterno',
//                         title: 'Protocolo',
//                     },
//                     {
//                         keyName: 'dsEnderecoLocal',
//                         title: 'Local',
//                         size: 2,
//                     },
//                     {
//                         keyName: 'stEventoExterno',
//                         title: 'Status do Evento',
//                         customComponent: (txt) => getStatus(txt),
//                     },
//                 ]}
//                 action={() => (
//                     <>
//                         <Button variant='contained'>Teste</Button>
//                     </>
//                 )}
//                 filters={{
//                     Protocolo: [
//                         {
//                             keyName: 'coSeqEventoExterno',
//                             type: 'a-z',
//                             name: 'Ordernar em ordem crescente',
//                         },
//                         {
//                             keyName: 'coSeqEventoExterno',
//                             type: 'z-a',
//                             name: 'Ordernar em ordem decrescente',
//                         },
//                     ],
//                 }}
//                 columnSize={5}
//             />
//             <Source
//                 code={`
// // use state se precisar atualizar a lista, caso contrário passe o fetch direto
// const [testFunc, setTestFunc] = useState(fetch('http://localhost:7171/table'))

// ...

// <Table
//     fetchFunc={() => testFunc}
//     useKC={false}
//     //dataPath -> caminho em string (lodash.get) para o caminho da lista retornada pelo servidor. Olhe 'api-test.json' no projeto para ver a lita usada aqui.
//     dataPath='body.data'
//     tableName='Teste'
//     columns={[
//         {
//             keyName: 'coSeqEventoExterno',
//             title: 'Protocolo',
//         },
//         {
//             keyName: 'dsEnderecoLocal',
//             title: 'Local',
//             size: 2,
//         },
//         {
//             keyName: 'stEventoExterno',
//             title: 'Status do Evento',
//             // customComponent -> opção de mostrar component customizável
//             customComponent: (txt) => getStatus(txt),
//         },
//     ]}
//     action={() => (
//         <>
//             <Button variant='contained'>Teste</Button>
//         </>
//     )}
//     filters={{
//         Protocolo: [
//             {
//                 keyName: 'coSeqEventoExterno',
//                 type: 'a-z',
//                 name: 'Ordernar em ordem crescente',
//             },
//             {
//                 keyName: 'coSeqEventoExterno',
//                 type: 'z-a',
//                 name: 'Ordernar em ordem decrescente',
//             },
//         ],
//     }}
//     columnSize={5}
// />
// `}
//             />

//             <h3>Component customizado usado no exemplo</h3>
//             <Source
//                 code={`
// function getStatus(content: string) {
//     let color = ''
//     let name = ''

//     switch (content) {
//         case 'P':
//             color = '#AB4812'
//             name = 'Em Análise'
//             break
//         case 'A':
//             color = '#0A549A'
//             name = 'Cadastrado'
//             break
//         case 'C':
//             color = '#a1a1a1'
//             name = 'Cancelado'
//             break
//         case 'R':
//             color = '#EF4444'
//             name = 'Reprovado'
//             break
//         case 'L':
//             color = '#22C55E'
//             name = 'Licenciado'
//             break
//         case 'PA':
//             color = '#6366F1'
//             name = 'Pré Aprovado'
//             break
//         case 'FP':
//             color = '#991b1b'
//             name = 'Fora do Prazo'
//             break
//     }

//     return (
//         <Stack color='white' fontWeight={600} direction='row' justifyContent='start'>
//             <Box bgcolor={color} width='128px' borderRadius='14px' paddingX={1.2} paddingY={0.6} textAlign='center'>
//                 {name}
//             </Box>
//         </Stack>
//     )
// }
// `}
//             />
//         </SspComponentsProvider>
//     )
// }

function getStatus(content: string) {
    let color = ''
    let name = ''

    switch (content) {
        case 'P':
            color = '#AB4812'
            name = 'Em Análise'
            break
        case 'A':
            color = '#0A549A'
            name = 'Cadastrado'
            break
        case 'C':
            color = '#a1a1a1'
            name = 'Cancelado'
            break
        case 'R':
            color = '#EF4444'
            name = 'Reprovado'
            break
        case 'L':
            color = '#22C55E'
            name = 'Licenciado'
            break
        case 'PA':
            color = '#6366F1'
            name = 'Pré Aprovado'
            break
        case 'FP':
            color = '#991b1b'
            name = 'Fora do Prazo'
            break
    }

    return (
        <Stack color='white' fontWeight={600} direction='row' justifyContent='start'>
            <Box bgcolor={color} width='128px' borderRadius='14px' paddingX={1.2} paddingY={0.6} textAlign='center'>
                {name}
            </Box>
        </Stack>
    )
}
