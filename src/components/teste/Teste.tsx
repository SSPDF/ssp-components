import React, { FormEvent, useContext, useEffect, useRef, useState } from 'react'
import Input from '../form/input/Input'
import Stepper from '../form/stepper/Stepper'
import StepperBlock from '../form/stepper/StepperBlock'
import RequiredCheckBoxGroup from '../form/checkbox/RequiredCheckBoxValidator'
import CheckBox from '../form/checkbox/CheckBox'
import MultInput from '../form/input/MultInput'
import CheckBoxWarning from '../form/checkbox/CheckBoxWarning'
import DatePicker from '../form/date/DatePicker'
import TimePicker from '../form/date/TimePicker'
import FileUpload from '../form/file/FileUpload'
import { FixedAutoComplete } from '../form/input/FixedAutoComplete'
import DropFileUpload from '../form/file/DropFileUpload'
import { Box, Button, MenuItem, Stack, Tab, Tabs, Typography } from '@mui/material'
import Table from '../form/table/Table'
import { createPortal } from 'react-dom'

import '../../css/globals.css'
import FetchAutoComplete from '../form/input/FetchAutoComplete'
import { PDFIcon, TrashIcon } from '../icons/icons'
import { MODAL } from '../modal/Modal'
import FormProvider from '../providers/FormProvider'
import { toast } from 'react-toastify'
import { FormContext } from '../../context/form'
import NavBar from '../navbar/NavBar'
import TabNavBar from '../navbar/TabNavBar'
import CustomMenu from '../utils/CustomMenu'

const token = `eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKdWI2dTBpX2JmQjd3OVdnX1VBQkxrMDA2ajRSa2FhamU0SFU4NHNFdEtBIn0.eyJleHAiOjE3MDkzMDY1NzksImlhdCI6MTcwOTMwMzU4MSwiYXV0aF90aW1lIjoxNzA5MzAzNTc5LCJqdGkiOiJmYmU5NjllZC0zNmZlLTRjZGItYjc5ZC1hZTA1YTc4YjViMTkiLCJpc3MiOiJodHRwczovL2htZ3Npc3RlbWFzZXh0ZXJub3Muc3NwLmRmLmdvdi5ici9rZXljbG9hay9yZWFsbXMvZXZlbnRvcyIsImF1ZCI6WyJldmVudG8tZnJvbnQtZGV2IiwiZXZlbnRvcy1iYWNrZW5kLWRldiIsImV2ZW50b3MtYmFja2VuZCJdLCJzdWIiOiJjZTE0YTE3Yi1jZWI3LTRlYjUtOTk2Yy1iMGMyNTVmM2QyNmMiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJldmVudG9zLWZyb250Iiwibm9uY2UiOiI2N2U3ZjM1Yy04ODVlLTQ4ZmUtODM1OS03ZDA4MzJhZGFmMzgiLCJzZXNzaW9uX3N0YXRlIjoiY2JmZmMxN2MtOWZiNC00ODA3LTk3MDItNjYwZDM5MzFlMTQyIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2htZ2V2ZW50b3NleHRlcm5vLnNzcC5kZi5nb3YuYnIiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbInZpZXdlciIsImNhZGFzdHJvLWFjYW8tZXZlbnRvcyIsImFkbWluIiwidXNlciIsImV2ZW50b3NfaW9hLXBtZGYiXX0sInJlc291cmNlX2FjY2VzcyI6eyJldmVudG8tZnJvbnQtZGV2Ijp7InJvbGVzIjpbImNhZGFzdHJvLWFjYW8tZXZlbnRvcyIsImV2ZW50b3MtdXNlciIsImV2ZW50b3Mtdmlld2VyIiwiZXZlbnRvcy1hZG1pbiJdfSwiZXZlbnRvcy1mcm9udCI6eyJyb2xlcyI6WyJjYWRhc3Ryby1hY2FvLWV2ZW50b3MiLCJldmVudG9zLXVzZXIiLCJldmVudG9zLXZpZXdlciIsImV2ZW50b3MtYWRtaW4iXX0sImV2ZW50b3MtYmFja2VuZC1kZXYiOnsicm9sZXMiOlsiY2FkYXN0cm8tYWNhby1ldmVudG9zIiwiZXZlbnRvcy11c2VyIiwiZXZlbnRvcy12aWV3ZXIiLCJldmVudG9zLWFkbWluIl19LCJldmVudG9zLWJhY2tlbmQiOnsicm9sZXMiOlsiY2FkYXN0cm8tYWNhby1ldmVudG9zIiwiZXZlbnRvcy11c2VyIiwiZXZlbnRvcy12aWV3ZXIiLCJldmVudG9zLWFkbWluIl19fSwic2NvcGUiOiJvcGVuaWQgcGhvbmUgcHJvZmlsZSBlbWFpbCIsInNpZCI6ImNiZmZjMTdjLTlmYjQtNDgwNy05NzAyLTY2MGQzOTMxZTE0MiIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IlBlZGluIDA1NTE5NDI5MTYyIiwicGhvbmVfbnVtYmVyIjoiNjE5OTMwNTg0MjMiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiIwNTUxOTQyOTE2MiIsImdpdmVuX25hbWUiOiJQZWRpbiIsImZhbWlseV9uYW1lIjoiMDU1MTk0MjkxNjIiLCJlbWFpbCI6ImdhaXRhY2hpMEBnbWFpbC5jb20ifQ.BLoJWIWUM-ihxIA6g-Z9aJ90MsBv2tGCtLzEnonbvGWBfqGomuhsMFECq3MvlhGpvJvEkg0NbrOzzZmiuEAnO1VwkqPITvQUgfsat0ckrs_C6pFM8nezCkc3Ee5ffBbfNAnYUtKZ7S0u5gmhMncql-z-LxwYE7_RbGu5vCEoN41ZLkmawwfYJnNN_NDv1b4g5Dx6QLkz9V4QgIMRq76WwTzJ7DgniD8hY4VDmyOO3Xk6LFS-6xPR274c30bDIw21O52ImM6t0sswaWGeb3zU3kN3N5oA6G4A1uLdNDd9kwlWlOAUWwCL8wXlRYPnWjYBU_dwuk5u4nMVHl6dcd8rEQ`

export function Exemplo() {
    return (
        <Stepper debugLog>
            <StepperBlock title='Testando'>
                <Input name='teste' type='input' title='Input' required />
                <Input name='teste' type='cep' title='Input' required />
                <Input name='teste' type='cnpj' title='Input' required />
                <Input name='teste' type='cpf' title='Input' required />
                <Input name='teste' type='cpf_cnpj' title='Input' required />
                <Input name='teste' type='email' title='Input' required />
                <Input name='teste' type='input' title='Input' required />
                <Input name='teste' type='number' title='Input' required />
                <Input name='teste' type='password' title='Input' required />
                <Input name='teste' type='phone' title='Input' required />
                <Input name='teste' type='rg' title='Input' required />

                <MultInput name='teste' title='Input' required />

                <CheckBox name='teste' title='Input' />

                <RequiredCheckBoxGroup name='x'>
                    <CheckBox name='teste' title='Input' />
                    <CheckBox name='teste' title='Input' />
                </RequiredCheckBoxGroup>

                <CheckBoxWarning name='teste' title='Input' customWarning={<>Apensa um teste</>} />

                <DatePicker name='teste' title='Input' />
                <TimePicker name='teste' title='Input' />

                <FileUpload apiURL='#' name='teste' title='Input' tipoArquivo='0' />
                <DropFileUpload apiURL='#' name='teste' title='Input' tipoArquivo='0' />

                {/* <FileUpload name='raj' title='Tst' apiURL='https:hmgapieventosexterno.ssp.df.gov.br/files' tipoArquivo='22' required /> */}
                {/* <DropFileUpload name='file' apiURL='https:hmgapieventosexterno.ssp.df.gov.br/files' title='Teste Arquivo' tipoArquivo='22' tstToken={token} multiple={true} required /> */}

                {/* <FixedAutoComplete name='haha' title='Testing' list={list} required />

                         <MultInput name='haha' /> */}
            </StepperBlock>
            <StepperBlock title='Segundo'>
                <Input name='teste2' type='input' />
            </StepperBlock>
        </Stepper>
    )
}

const getKeys = (values: any, id: number) => {
    if (!values || Object.keys(values).length <= 0) return []
    if (!values[id]) return []

    let keys = Object.keys(values[id]).map((x) => `${id}.${x}`)
    if (values.files) keys = [...keys, ...Object.keys(values.files).map((x) => `files.${x}`)]

    return keys
}

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

function backup() {
    const [testFunc, setTestFunc] = useState(fetch('http://localhost:7171/table'))
    const context = useContext(FormContext)!

    const [test, setTest] = useState<{ id: number | string; label: string } | undefined>(undefined)

    return (
        <>
            <h1>{context.formWatch('testing')}</h1>

            <Input name='testing' type='input' title='Nome completo' md={8} required />
            <FetchAutoComplete name='ronald' title='Testando' url='http://localhost:7171/autocomplete' watchValue={test} required />
            {/* <Input name='ronald' type='cpf_cnpj' title='Valor padrao' watchValue={context.formWatch('testing')} required /> */}
            <p>{JSON.stringify(test)}</p>

            <Button type='submit' variant='contained'>
                Enviar
            </Button>
            <Button
                onClick={(e) =>
                    setTest({
                        id: 14,
                        label: 'CONSEG PARANOÁ',
                    })
                }
            >
                MUDAR
            </Button>
        </>
    )
}

interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
}

// function CustomTabPanel(props: TabPanelProps) {
//     const { children, value, index, ...other } = props

//     return (
//         <Box role='tabpanel' display={value !== index ? 'none' : ''} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
//             {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
//         </Box>
//     )
// }

const CustomTabPanel = React.memo(function Custom(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <Box role='tabpanel' display={value !== index ? 'none' : ''} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </Box>
    )
})

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    }
}

const okok = document.getElementById('ronaldo')

export default function Teste() {
    const [testFunc, setTestFunc] = useState(fetch('http://localhost:7171/table'))
    const context = useContext(FormContext)!

    const [test, setTest] = useState('')
    const [value, setValue] = React.useState(0)
    const ref = useRef<DocumentFragment | null>(null)

    const [show, setShow] = useState(false)

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue)
    }

    return (
        <Box bgcolor='#F9F9F9'>
            {/* <MultInput name='test' title='Testando' /> */}
            {/* <Stepper>
                <StepperBlock title='Teste 1'>
                    <Input name='teste1' type='input' title='Teste' required />
                </StepperBlock>
                {show && (
                    <StepperBlock title='Teste 2'>
                        <Input name='teste2' type='input' title='Teste' required />
                    </StepperBlock>
                )}
            </Stepper>

            <Button onClick={(e) => setShow((s) => !s)}>Mudar show</Button> */}

            {/* <FetchAutoComplete name='ronald' title='Testando' url='http://localhost:7171/autocomplete' />
            <FixedAutoComplete
                name='ronald2'
                title='Testando'
                list={[
                    {
                        id: 0,
                        label: 'foda',
                    },
                ]}
            /> */}
            {/* 
            <TimePicker name={'teste'} title='Data' md={2.6} defaultValue={'11/05/2024'} required />
            <DatePicker name={'teste'} title='Data' md={2.6} defaultValue={'11/05/2024'} required />

            <Button type='submit' variant='contained'>
                Enviar
            </Button> */}
            {/* <TabNavBar
                img='/conoc/logossp.png'
                color='#208FE8'
                links={[
                    {
                        name: 'Meus atendimentos',
                        path: '/ocorrencia/doUsuario',
                    },
                    {
                        name: 'Validar certidão',
                        path: '/ocorrencia/validar',
                    },
                    {
                        name: 'Atendimentos recentes',
                        path: '/ocorrencia',
                    },
                    {
                        name: 'Pesquisa de atendimentos',
                        path: '/ocorrencia/consulta',
                    },
                ]}
                pos='inherit'
                title={'Secretaria de Segurança Pública do Distrito Federal'}
                menuItems={[]}
                logoutMsg='Sair'
                paddingBottom={3}
                next={false}
            /> */}
            {/* <FormProvider
                onSubmit={(dt, files) => {
                    console.log(dt)
                }}
            >
                <Stepper debugLog>
                    <StepperBlock optional title='Teste'>
                        <Input name='teste' type='input' required />
                        <DatePicker name='testeDt' title='Validade da CNH' md={6} required />
                        <TimePicker name='testeTime' title='Validade da CNH' md={6} required />
                    </StepperBlock>
                    <StepperBlock optional title='Teste 2'>
                        <Input name='teste2' type='input' required />
                    </StepperBlock>
                </Stepper>
            </FormProvider> */}
            {/* <Input name='haha' type='sei' title='Teste' required />
            <Button variant='contained' type='submit'>
                Enviar
            </Button> */}
            {/* <NavBar
                img=''
                links={[
                    {
                        name: 'Teste',
                        path: '/teste',
                    },
                    {
                        name: 'Ronaldo',
                        path: '/ronaldo',
                    },
                ]}
                el={
                    <Box>
                        <Button variant='contained'>Teste</Button>
                    </Box>
                }
                menuItems={<></>}
                title='Testando'
                next={false}
                pos='inherit'
            /> */}
            {/* <TabNavBar
                img=''
                links={[
                    {
                        name: 'Home',
                        path: '/',
                    },
                    {
                        name: 'Teste',
                        path: '/teste',
                    },
                    {
                        name: 'Ronaldo',
                        path: '/ronaldo',
                    },
                ]}
                menuItems={<></>}
                title='Testando'
                next={false}
                el={
                    <Box>
                        <Button variant='contained'>Teste</Button>
                    </Box>
                }
                pos='inherit'
            /> */}

            <Button
                onClick={(e) => {
                    setTestFunc(fetch('http://localhost:7171/table'))
                }}
            >
                Mudar
            </Button>

            <Table
                id='teste'
                fetchFunc={() => testFunc}
                useKC={false}
                dataPath='body.data'
                tableName='Teste'
                columns={[
                    {
                        keyName: 'coSeqEventoExterno',
                        title: 'Protocolo',
                    },
                    {
                        keyName: 'dsEnderecoLocal',
                        title: 'Local',
                    },
                    {
                        keyName: 'dtCadastro',
                        title: 'Data de Solicitação',
                    },
                    {
                        keyName: 'noEvento',
                        title: 'Nome',
                    },
                    {
                        keyName: 'noTableRa',
                        title: 'RA',
                    },
                    {
                        keyName: 'nuPublicoMaximo',
                        title: 'Público Máximo',
                    },
                    {
                        keyName: 'dtTableDates',
                        title: 'Datas',
                        size: 2,
                    },
                    {
                        keyName: 'nuProcessoFormatadoSei',
                        title: 'Processo SEI',
                    },
                    {
                        keyName: 'stEventoExterno',
                        title: 'Status do Evento',
                        customComponent: (txt) => getStatus(txt),
                    },
                ]}
                action={() => (
                    <>
                        <Button variant='contained'>Teste</Button>
                    </>
                )}
                orderBy={[
                    {
                        label: 'Protocolo',
                        key: 'coSeqEventoExterno',
                        type: 'number',
                    },
                ]}
                filters={[
                    {
                        label: 'Protocolo',
                        type: 'number',
                        keyName: 'coSeqEventoExterno',
                        operator: 'igual',
                        operators: ['igual', 'maior que', 'menor que'],
                        value: '',
                    },
                    {
                        label: 'Nome do Evento',
                        type: 'string',
                        keyName: 'noEvento',
                        operator: 'contem',
                        operators: ['igual', 'contem'],
                        value: '',
                    },
                    {
                        label: 'Data de Solicitação',
                        type: 'date',
                        keyName: 'dtCadastro',
                        operator: 'data exata',
                        operators: ['data exata', 'entre'],
                        value: '',
                    },
                    {
                        label: 'RA',
                        type: 'string',
                        keyName: 'noTableRa',
                        operator: 'contem',
                        operators: ['contem', 'tem um dos'],
                        useList: [
                            {
                                id: 'LAGO NORTE',
                                label: 'LAGO NORTE',
                            },
                        ],
                        // useList: ['PLANO PILOTO', 'LAGO NORTE'],
                        value: '',
                    },
                ]}
                columnSize={11}
                mediaQueryLG={{
                    all: 3,
                    action: 9,
                }}
            />
            {/* <Table
                fetchFunc={() => fetch('http://localhost:7171/table2')}
                useKC={false}
                // dataPath='body.data'
                tableName='Teste'
                columns={[
                    {
                        keyName: 'codSituacaoRisco',
                        title: 'Protocolo',
                    },
                    {
                        keyName: 'noEvento',
                        title: 'Nome',
                    },
                    {
                        keyName: 'dtTableDates',
                        title: 'Datas',
                        size: 2,
                    },
                    {
                        keyName: 'dsEnderecoLocal',
                        title: 'Local',
                    },
                    {
                        keyName: 'noTableRa',
                        title: 'RA',
                    },
                    {
                        keyName: 'nuPublicoMaximo',
                        title: 'Público Máximo',
                    },
                    {
                        keyName: 'dtCadastro',
                        title: 'Data de Solicitação',
                    },
                    {
                        keyName: 'nuProcessoFormatadoSei',
                        title: 'Processo SEI',
                    },
                    {
                        keyName: 'stEventoExterno',
                        title: 'Status do Evento',
                        customComponent: (txt) => getStatus(txt),
                    },
                ]}
                action={() => (
                    <>
                        <Button variant='contained'>Teste</Button>
                    </>
                )}
                filters={{
                    Protocolo: [
                        {
                            keyName: 'CO_SEQ_DEVOLUTIVA_CADASTRO',
                            type: 'a-z',
                            name: 'Ordernar em ordem crescente',
                        },
                        {
                            keyName: 'CO_SEQ_DEVOLUTIVA_CADASTRO',
                            type: 'z-a',
                            name: 'Ordernar em ordem decrescente',
                        },
                    ],
                }}
                columnSize={11}
                mediaQueryLG={{
                    all: 3,
                    action: 9,
                }}
            /> */}

            {/* <FileUpload apiURL={'https://hmgapieventosexterno.ssp.df.gov.br/files'} route='data' name='fileCroqui' title='Enviar Croqui' tipoArquivo='2' required sizeLimit={1} /> */}
        </Box>
    )
}
