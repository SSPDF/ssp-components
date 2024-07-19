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
import axios from 'axios'

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
            color = '#1c4d54'
            name = 'Com Pendência'
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
    const [testFunc, setTestFunc] = useState(fetch('http://localhost:7171/table2'))
    const context = useContext(FormContext)!

    const [test, setTest] = useState('')
    const [value, setValue] = React.useState(0)
    const ref = useRef<DocumentFragment | null>(null)

    const [show, setShow] = useState(false)

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue)
    }

    const valor = {
        id: 14,
        label: 'CONSEG PARANOÁ',
    }

    return (
        <Box bgcolor='#F9F9F9'>
            <Stepper>
                <StepperBlock title='Teste 1'>
                    <FetchAutoComplete name='coRA' title='RA:' customLoadingText='Carregando RA' url={`http://localhost:7171/autocomplete`} watchValue={valor} md={6} required />
                    <FixedAutoComplete
                        name='coRA2'
                        title='RA:'
                        customLoadingText='Carregando RA'
                        list={[
                            {
                                id: 4,
                                label: 'CONSEG BRASÍLIA CENTRO E SIA',
                            },
                            {
                                id: 14,
                                label: 'CONSEG PARANOÁ',
                            },
                            {
                                id: 15,
                                label: 'CONSEG PARANOÁ RURAL',
                            },
                            {
                                id: 31,
                                label: 'CONSEG VARJÃO',
                            },
                            {
                                id: 37,
                                label: 'CONSEG ITAPOÃ',
                            },
                            {
                                id: 26,
                                label: 'CONSEG LAGO NORTE',
                            },
                        ]}
                        watchValue={valor}
                        md={6}
                        required
                    />
                </StepperBlock>
                <StepperBlock title='Teste 1'>
                    <Input name='teste1' type='input' title='Teste' />
                </StepperBlock>
            </Stepper>
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

            {/* <Button
                onClick={(e) => {
                    setTestFunc(fetch('http://localhost:7171/table2'))
                }}
            >
                Mudar
            </Button> */}

            {/* <Table
                id='teste'
                fetchFunc={() => testFunc}
                useKC={false}
                // dataPath='body.data'
                tableName='Teste'
                columns={[
                    // {
                    //     keyName: 'coSeqEventoExterno',
                    //     title: 'Protocolo',
                    // },
                    // {
                    //     keyName: 'dsEnderecoLocal',
                    //     title: 'Local',
                    // },
                    // {
                    //     keyName: 'dtCadastro',
                    //     title: 'Data de Solicitação',
                    // },
                    // {
                    //     keyName: 'noEvento',
                    //     title: 'Nome',
                    // },
                    // {
                    //     keyName: 'noTableRa',
                    //     title: 'RA',
                    // },
                    // {
                    //     keyName: 'nuPublicoMaximo',
                    //     title: 'Público Máximo',
                    // },
                    // {
                    //     keyName: 'dtTableDates',
                    //     title: 'Datas',
                    //     size: 2,
                    // },
                    // {
                    //     keyName: 'nuProcessoFormatadoSei',
                    //     title: 'Processo SEI',
                    // },
                    // {
                    //     keyName: 'stEventoExterno',
                    //     title: 'Status do Evento',
                    //     customComponent: (txt) => getStatus(txt),
                    // },
                    {
                        keyName: 'CO_SEQ_DEVOLUTIVA_CADASTRO',
                        title: 'Protocolo',
                        size: 0.7,
                    },
                    {
                        keyName: 'DS_DESCRICAO',
                        title: 'Descrição',
                        size: 2,
                    },
                    {
                        keyName: 'NO_RISP',
                        title: 'RISP',
                    },
                    {
                        keyName: 'NO_TIPO_DEVOLUTIVA',
                        title: 'Tipo de demanda',
                    },
                    {
                        keyName: 'DS_CONSEG',
                        title: 'Conseg',
                        size: 1.5,
                    },
                    {
                        keyName: 'DT_CADASTRO',
                        title: 'Data Abertura',
                    },
                    {
                        keyName: 'TB_HISTORICO_ESTADO.0.DT_CADASTRO',
                        title: 'Movimentação Último Estado',
                        size: 1.5,
                    },
                    {
                        keyName: 'TB_HISTORICO_ESTADO.0.DS_ESTADO',
                        title: 'Estado - PAF',
                        size: 0.8,
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
                filtersFunc={{
                    datas: (value) => {
                        const new_value = value.split(' | ').map((x) => x.split(' - ')[0])
                        return new_value
                    },
                    conseg: (value) => {
                        console.log(value)
                        return value
                    },
                }}
                filters={[
                    // {
                    //     label: 'Protocolo',
                    //     keyName: 'coSeqEventoExterno',
                    //     operator: 'igual',
                    //     operators: ['igual', 'maior que', 'menor que'],
                    //     type: 'number',
                    //     value: '',
                    // },
                    // {
                    //     label: 'Local',
                    //     keyName: 'dsEnderecoLocal',
                    //     operator: 'contem',
                    //     operators: ['igual', 'contem'],
                    //     type: 'string',
                    //     value: '',
                    // },
                    // {
                    //     label: 'Data da Solicitação',
                    //     keyName: 'dtCadastro',
                    //     operator: 'data exata',
                    //     operators: ['data exata', 'entre', 'antes de', 'depois de'],
                    //     type: 'date',
                    //     value: '',
                    // },
                    // {
                    //     label: 'Datas',
                    //     keyName: 'dtTableDates',
                    //     operator: 'data inicio',
                    //     operators: ['data inicio', 'data fim', 'tem a data'],
                    //     type: 'dates',
                    //     customFunc: 'datas',
                    //     value: '',
                    // },
                    // {
                    //     label: 'Nome do Evento',
                    //     keyName: 'noEvento',
                    //     operator: 'contem',
                    //     operators: ['igual', 'contem'],
                    //     type: 'string',
                    //     value: '',
                    // },
                    // {
                    //     label: 'RA x',
                    //     type: 'string',
                    //     keyName: 'noTableRa',
                    //     operator: 'tem um dos',
                    //     operators: ['contem', 'tem um dos'],
                    //     useList: [
                    //         { id: 'ARAPOANGA', label: 'ARAPOANGA' },
                    //         { id: 'ARAPOANGA 2', label: 'ARAPOANGA 2' },
                    //     ],
                    //     value: '',
                    // },
                    // {
                    //     label: 'Público Máximo',
                    //     keyName: 'nuPublicoMaximo',
                    //     operator: 'igual',
                    //     operators: ['igual', 'maior que', 'menor que'],
                    //     type: 'number',
                    //     value: '',
                    // },
                    {
                        label: 'Protocolo',
                        keyName: 'CO_SEQ_DEVOLUTIVA_CADASTRO',
                        operator: 'igual',
                        operators: ['igual', 'maior que', 'menor que'],
                        type: 'number',
                        value: '',
                    },
                    {
                        label: 'Descrição',
                        keyName: 'DS_DESCRICAO',
                        operator: 'contem',
                        operators: ['igual', 'contem'],
                        type: 'string',
                        value: '',
                    },
                    {
                        label: 'Conseg',
                        keyName: 'DS_CONSEG',
                        operator: 'igual',
                        operators: ['igual', 'tem um dos'],
                        useList: [
                            {
                                id: '3',
                                label: 'CONSEG BRASÍLIA',
                            },
                            {
                                id: '4',
                                label: 'CONSEG BRASÍLIA CENTRO E SIA',
                            },
                            {
                                id: '5',
                                label: 'CONSEG NOROESTE',
                            },
                            {
                                id: '6',
                                label: 'CONSEG GAMA',
                            },
                            {
                                id: '7',
                                label: 'CONSEG GAMA RURAL',
                            },
                            {
                                id: '8',
                                label: 'CONSEG TAGUATINGA',
                            },
                            {
                                id: '9',
                                label: 'CONSEG BRAZLÂNIDA',
                            },
                            {
                                id: '10',
                                label: 'CONSEG BRAZLÂNDIA RURAL',
                            },
                            {
                                id: '11',
                                label: 'CONSEG SOBRADINHO',
                            },
                            {
                                id: '12',
                                label: 'CONSEG PLANALTINA',
                            },
                            {
                                id: '13',
                                label: 'CONSEG PLANALTINA RURAL',
                            },
                            {
                                id: '14',
                                label: 'CONSEG PARANOÁ',
                            },
                            {
                                id: '15',
                                label: 'CONSEG PARANOÁ RURAL',
                            },
                            {
                                id: '16',
                                label: 'CONSEG NÚCLEO BANDEIRANTE',
                            },
                            {
                                id: '17',
                                label: 'CONSEG CEILÂNDIA',
                            },
                            {
                                id: '18',
                                label: 'CONSEG GUARÁ',
                            },
                            {
                                id: '19',
                                label: 'CONSEG CRUZEIRO',
                            },
                            {
                                id: '20',
                                label: 'CONSEG SAMAMBAIA',
                            },
                            {
                                id: '21',
                                label: 'CONSEG SANTA MARIA',
                            },
                            {
                                id: '22',
                                label: 'CONSEG SÃO SEBASTIÃO',
                            },
                            {
                                id: '23',
                                label: 'CONSEG RECANTO DAS EMAS',
                            },
                            {
                                id: '24',
                                label: 'CONSEG LAGO SUL',
                            },
                            {
                                id: '25',
                                label: 'CONSEG RIACHO FUNDO',
                            },
                            {
                                id: '26',
                                label: 'CONSEG LAGO NORTE',
                            },
                            {
                                id: '27',
                                label: 'CONSEG CANDANGOLÂNDIA',
                            },
                            {
                                id: '28',
                                label: 'CONSEG ÁGUAS CLARAS',
                            },
                            {
                                id: '29',
                                label: 'CONSEG RIACHO FUNDO II',
                            },
                            {
                                id: '30',
                                label: 'CONSEG SUDOESTE/OCTOGONAL',
                            },
                            {
                                id: '31',
                                label: 'CONSEG VARJÃO',
                            },
                            {
                                id: '32',
                                label: 'CONSEG PARK WAY',
                            },
                            {
                                id: '33',
                                label: 'CONSEG SCIA/ESTRUTURAL',
                            },
                            {
                                id: '34',
                                label: 'CONSEG SOBRADINHO II',
                            },
                            {
                                id: '35',
                                label: 'CONSEG JARDIM BOTÂNICO',
                            },
                            {
                                id: '36',
                                label: 'CONSEG TORORÓ',
                            },
                            {
                                id: '37',
                                label: 'CONSEG ITAPOÃ',
                            },
                            {
                                id: '38',
                                label: 'CONSEG SIA',
                            },
                            {
                                id: '39',
                                label: 'CONSEG VICENTE PIRES',
                            },
                            {
                                id: '40',
                                label: 'CONSEG FERCAL',
                            },
                            {
                                id: '41',
                                label: 'CONSEG SOL NASCENTE/PÔR DO SOL',
                            },
                            {
                                id: '42',
                                label: 'CONSEG ARNIQUEIRA',
                            },
                            {
                                id: '44',
                                label: 'CONSEG ÁGUA QUENTE',
                            },
                        ].map((x) => ({ id: x.label, label: x.label })),
                        type: 'string',
                        value: '',
                    },
                    {
                        label: 'Órgão',
                        keyName: 'IOA_LIST',
                        operator: 'contem',
                        operators: ['contem', 'tem um dos'],
                        useList: [
                            {
                                id: 'sspdf',
                                label: 'SSPDF - SECRETARIA DE ESTADO DA SEGURANÇA PÚBLICA DO DF',
                            },
                            {
                                id: 'dpf',
                                label: 'DPF - DEPARTAMENTO DE POLÍCIA FEDERAL',
                            },
                            {
                                id: 'detran-df',
                                label: 'DETRAN-DF - DEPARTAMENTO DE TRÂNSITO DO DISTRITO FEDERAL',
                            },
                            {
                                id: 'sefaz',
                                label: 'SEFAZ - SECRETARIA DE ESTADO DE FAZENDA DO DF',
                            },
                            {
                                id: 'tcb',
                                label: 'TCB - TRANSPORTE COLETIVO DE BRASILIA',
                            },
                            {
                                id: 'derdf',
                                label: 'DERDF - DEPARTAMENTO DE ESTRADAS DE RODAGEM DO DISTRITO FEDERAL',
                            },
                            {
                                id: 'sejus',
                                label: 'SEJUS - SECRETARIA DE JUSTIÇA E CIDADANIA',
                            },
                            {
                                id: 'slu',
                                label: 'SLU - SERVIÇO DE LIMPEZA URBANA',
                            },
                            {
                                id: 'samu',
                                label: 'SAMU - SERVIÇO DE ATENDIMENTO MOVÉL DE URGÊNCIA',
                            },
                            {
                                id: 'ciob',
                                label: 'CIOB - CENTRO INTEGRADO DE OPERAÇÕES DE BRASÍLIA',
                            },
                            {
                                id: 'prf',
                                label: 'PRF - POLÍCIA RODOVIÁRIA FEDERAL',
                            },
                            {
                                id: 'semob',
                                label: 'SEMOB - SECRETARIA DE TRANSPORTE E MOBILIDADE',
                            },
                            {
                                id: 'sesipe-df',
                                label: 'SESIPE-DF - SUBSECRETARIA DO SISTEMA PENITENCIÁRIO DO DISTRITO FEDERAL',
                            },
                            {
                                id: 'ses',
                                label: 'SES - SECRETARIA DE SAÚDE',
                            },
                            {
                                id: 'metro-df',
                                label: 'METRO-DF - COMPANHIA DO METROPOLITANO DO DISTRITO FEDERAL',
                            },
                            {
                                id: 'abin ',
                                label: 'ABIN  - AGÊNCIA BRASILEIRA DE INTELIGÊNCIA',
                            },
                            {
                                id: 'anac',
                                label: 'ANAC - AGÊNCIA NACIONAL DE AVIAÇÃO CIVIL',
                            },
                            {
                                id: 'anatel ',
                                label: 'ANATEL  - AGÊNCIA NACIONAL DE TELECOMUNICAÇÕES',
                            },
                            {
                                id: 'aneel ',
                                label: 'ANEEL  - AGÊNCIA NACIONAL DE ENERGIA ELÉTRICA',
                            },
                            {
                                id: 'antt ',
                                label: 'ANTT  - AGÊNCIA NACIONAL DE TRANSPORTES TERRESTRES',
                            },
                            {
                                id: 'anvisa ',
                                label: 'ANVISA  - AGÊNCIA NACIONAL DE VIGILÂNCIA SANITÁRIA',
                            },
                            {
                                id: 'ascom',
                                label: 'ASCOM - ASSESSORIA DE COMUNICAÇÃO',
                            },
                            {
                                id: 'caesb ',
                                label: 'CAESB  - COMPANHIA DE SANEAMENTO AMBIENTAL DO DISTRITO FEDERAL',
                            },
                            {
                                id: 'casa civil ',
                                label: 'CASA CIVIL  - CASA CIVIL DO DISTRITO FEDERAL',
                            },
                            {
                                id: 'casa militar ',
                                label: 'CASA MILITAR  - CASA MILITAR DO DISTRITO FEDERAL',
                            },
                            {
                                id: 'ceb ',
                                label: 'CEB  - COMPANHIA ENERGÉTICA DE BRASÍLIA',
                            },
                            {
                                id: 'cmp ',
                                label: 'CMP  - COMANDO MILITAR DO PLANALTO',
                            },
                            {
                                id: 'depol - câmara dos deputados',
                                label: 'DEPOL - CÂMARA DOS DEPUTADOS - DEPARTAMENTO DE POLÍCIA LEGISLATIVA',
                            },
                            {
                                id: 'dftrans',
                                label: 'DFTRANS - TRANSPORTE URBANO DO DISTRITO FEDERAL',
                            },
                            {
                                id: 'fab ',
                                label: 'FAB  - FORÇA AÉREA BRASILEIRA',
                            },
                            {
                                id: 'fnsp ',
                                label: 'FNSP  - FORÇA NACIONAL DE SEGURANÇA',
                            },
                            {
                                id: 'ibram ',
                                label: 'IBRAM  - INSTITUTO BRASÍLIA AMBIENTAL',
                            },
                            {
                                id: 'mb ',
                                label: 'MB  - MARINHA DO BRASIL',
                            },
                            {
                                id: 'md ',
                                label: 'MD  - MINISTÉRIO DA DEFESA',
                            },
                            {
                                id: 'mj ',
                                label: 'MJ  - MISTÉRIO DA JUSTIÇA',
                            },
                            {
                                id: 'mre ',
                                label: 'MRE  - MINISTÉRIO DAS RELAÇÕES EXTERIORES',
                            },
                            {
                                id: 'novacap ',
                                label: 'NOVACAP  - COMPANHIA URBANIZADORA DA NOVA CAPITAL',
                            },
                            {
                                id: 'pf ',
                                label: 'PF  - POLÍCIA FEDERAL',
                            },
                            {
                                id: 'stf ',
                                label: 'STF  - SUPREMO TRIBUNAL FEDERAL',
                            },
                            {
                                id: 'tjdf ',
                                label: 'TJDF  - TRIBUNAL DE JUSTIÇA DO DISTRITO FEDERAL',
                            },
                            {
                                id: 'vij ',
                                label: 'VIJ  - VARA DA INFÂNCIA E JUVENTUDE',
                            },
                            {
                                id: 'tre-df',
                                label: 'TRE-DF - TRIBUNAL REGIONAL ELEITORAL',
                            },
                            {
                                id: 'tse',
                                label: 'TSE - TRIBUNAL SUPERIOR ELEITORAL',
                            },
                            {
                                id: 'si/sspdf',
                                label: 'SI/SSPDF - SUBSECRETARIA DE INTELIGÊNCIA',
                            },
                            {
                                id: 'seagri',
                                label: 'SEAGRI - SECRETARIA DE AGRICULTURA DO DF',
                            },
                            {
                                id: 'secult',
                                label: 'SECULT - SUB SECRETÁRIA DE CULTURA',
                            },
                            {
                                id: 'sedes',
                                label: 'SEDES - SECRETARIA DE DESENVOLVIMENTO SOCIAL DO DISTRITO FEDERAL',
                            },
                            {
                                id: 'codhab',
                                label: 'CODHAB - COMPANHIA DE DESENVOLVIMENTO HABITACIONAL',
                            },
                            {
                                id: 'secretaria da mulher',
                                label: 'SECRETARIA DA MULHER - SECRETARIA DA MULHER',
                            },
                            {
                                id: 'mec - ministério da educação',
                                label: 'MEC - MINISTÉRIO DA EDUCAÇÃO - MINISTÉRIO DA EDUCAÇÃO',
                            },
                            {
                                id: 'secti',
                                label: 'SECTI - SECRETARIA DE CIÊNCIA, TECNOLOGIA E INOVAÇÃO',
                            },
                            {
                                id: 'df legal',
                                label: 'DF LEGAL - DF LEGAL',
                            },
                            {
                                id: 'terracap',
                                label: 'TERRACAP - TERRACAP - Agência de Desenvolvimento do Distrito Federal',
                            },
                            {
                                id: 'suprec/ssp',
                                label: 'SUPREC/SSP - SUBSECRETARIA DE PREVENÇÃO A CRIMINALIDADE',
                            },
                            {
                                id: 'secid',
                                label: 'SECID - SECRETARIA EXECUTIVA DAS CIDADES',
                            },
                            {
                                id: 'gsi',
                                label: 'GSI - GABINETE DE SEGURANÇA INSTITUCIONAL',
                            },
                            {
                                id: 'adm erb',
                                label: 'ADM ERB - ADMINISTRAÇÃO DA ESTAÇÃO RODOVIÁRIA DE BRASÍLIA',
                            },
                            {
                                id: 'ra - i',
                                label: 'RA - I - ADMINISTRAÇÃO REGIONAL DO PLANO PILOTO',
                            },
                            {
                                id: 'cime',
                                label: 'CIME - CENTRO DE MONITORAÇÃO ELETRÔNICA',
                            },
                            {
                                id: 'gsi',
                                label: 'GSI - GABINETE DE SEGURANÇA INSTITUCIONAL',
                            },
                            {
                                id: 'ra - xxxii',
                                label: 'RA - XXXII - ADMINISTRAÇÃO REGIONAL DO SOL NASCENTE E PÔR DO SOL',
                            },
                            {
                                id: 'ibama',
                                label: 'IBAMA - INSTITUTO BRASILEIRO DO MEIO AMBIENTE E DOS RECURSOS NATURAIS RENOVÁVEIS',
                            },
                            {
                                id: 'dnit',
                                label: 'DNIT - DEPARTAMENTO NACIONAL DE INFRAESTRUTURA DE TRANSPORTES',
                            },
                            {
                                id: 'sema',
                                label: 'SEMA - SECRETARIA DE ESTADO DO MEIO AMBIENTE DO DISTRITO FEDERAL',
                            },
                            {
                                id: 'inmetro',
                                label: 'INMETRO - INSTITUTO NACIONAL DE METROLOGIA, QUALIDADE E TECNOLOGIA',
                            },
                            {
                                id: 'anp',
                                label: 'ANP - AGÊNCIA NACIONAL DO PETRÓLEO',
                            },
                            {
                                id: 'funai',
                                label: 'FUNAI - FUNDAÇÃO NACIONAL DO ÍNDIO',
                            },
                            {
                                id: 'ra - iii',
                                label: 'RA - III - ADMINISTRAÇÃO REGIONAL DE TAGUATINGA',
                            },
                            {
                                id: 'fgv',
                                label: 'FGV - FUNDAÇÃO GETÚLIO VARGAS',
                            },
                            {
                                id: 'see/df',
                                label: 'SEE/DF - SECRETARIA DE ESTADO DE EDUCAÇÃO',
                            },
                            {
                                id: 'cesl',
                                label: 'CESL - CAMPO DA ESPERANÇA SERVIÇOS LTDA',
                            },
                            {
                                id: 'ect',
                                label: 'ECT - EMPRESA BRASILEIRA DE CORREIOS E TELÉGRAFOS',
                            },
                            {
                                id: 'inep',
                                label: 'INEP - INSTITUTO NACIONAL DE ESTUDOS E PESQUISAS',
                            },
                            {
                                id: 'ra - xv',
                                label: 'RA - XV - ADMINISTRAÇÃO REGIONAL DO RECANTO DAS EMAS',
                            },
                            {
                                id: 'ra - xiv',
                                label: 'RA - XIV - ADMINISTRAÇÃO REGIONAL DE SÃO SEBASTIÃO',
                            },
                            {
                                id: 'ra - xii',
                                label: 'RA - XII - ADMINISTRAÇÃO REGIONAL DE SAMAMBAIA',
                            },
                            {
                                id: 'eb',
                                label: 'EB - EXÉRCITO BRASILEIRO',
                            },
                            {
                                id: 'sodf',
                                label: 'SODF - SECRETARIA DE ESTADO DE OBRAS E INFRAESTRUTURA DO DISTRITO FEDERAL',
                            },
                            {
                                id: 'ra - xxix',
                                label: 'RA - XXIX - ADMINISTRAÇÃO REGIONAL DO SETOR DE INDÚSTRIA E ABASTECIMENTO',
                            },
                            {
                                id: 'sbi',
                                label: 'SBI - Subsecretaria de inteligência',
                            },
                            {
                                id: 'ra - ii',
                                label: 'RA - II - ADMINISTRAÇÃO REGIONAL DO GAMA',
                            },
                            {
                                id: 'ra - iv',
                                label: 'RA - IV - ADMINISTRAÇÃO REGIONAL DE BRAZLÂNDIA',
                            },
                            {
                                id: 'ra - v',
                                label: 'RA - V - ADMINISTRAÇÃO REGIONAL DE SOBRADINHO',
                            },
                            {
                                id: 'ra - vi',
                                label: 'RA - VI - ADMINISTRAÇÃO REGIONAL DE PLANALTINA',
                            },
                            {
                                id: 'ra - vii',
                                label: 'RA - VII - ADMINISTRAÇÃO REGIONAL DO PARANOÁ',
                            },
                            {
                                id: 'ra - vii',
                                label: 'RA - VII - ADMINISTRAÇÃO REGIONAL DO NÚCLEO BANDEIRANTE',
                            },
                            {
                                id: 'ra - ix',
                                label: 'RA - IX - ADMINISTRAÇÃO REGIONAL DE CEILÂNDIA',
                            },
                            {
                                id: 'ra - x',
                                label: 'RA - X - ADMINISTRAÇÃO REGIONAL DO GUARÁ',
                            },
                            {
                                id: 'ra - xi',
                                label: 'RA - XI - ADMINISTRAÇÃO REGIONAL DO CRUZEIRO',
                            },
                            {
                                id: 'ra - xiii',
                                label: 'RA - XIII - ADMINISTRAÇÃO REGIONAL DE SANTA MARIA',
                            },
                            {
                                id: 'ra - xvi',
                                label: 'RA - XVI - ADMINISTRAÇÃO REGIONAL DO LAGO SUL',
                            },
                            {
                                id: 'ra - xvii',
                                label: 'RA - XVII - ADMINISTRAÇÃO REGIONAL DO RIACHO FUNDO',
                            },
                            {
                                id: 'ra - xvii',
                                label: 'RA - XVII - ADMINISTRAÇÃO REGIONAL DO LAGO NORTE',
                            },
                            {
                                id: 'ra - xix',
                                label: 'RA - XIX - ADMINISTRAÇÃO REGIONAL DA CANDANGOLÂNDIA',
                            },
                            {
                                id: 'ra - xx',
                                label: 'RA - XX - ADMINISTRAÇÃO REGIONAL DE ÁGUAS CLARAS',
                            },
                            {
                                id: 'ra - xxi',
                                label: 'RA - XXI - ADMINISTRAÇÃO REGIONAL DO RIACHO FUNDO II',
                            },
                            {
                                id: 'ra - xxii',
                                label: 'RA - XXII - ADMINISTRAÇÃO REGIONAL DO SUDOESTE/OCTOGONAL',
                            },
                            {
                                id: 'ra - xxiii',
                                label: 'RA - XXIII - ADMINISTRAÇÃO REGIONAL DO VARJÃO',
                            },
                            {
                                id: 'ra - xxiv',
                                label: 'RA - XXIV - ADMINISTRAÇÃO REGIONAL DO PARK WAY',
                            },
                            {
                                id: 'ra - xxv',
                                label: 'RA - XXV - ADMINISTRAÇÃO REGIONAL DO SCIA/ESTRUTURAL',
                            },
                            {
                                id: 'ra - xxvi',
                                label: 'RA - XXVI - ADMINISTRAÇÃO REGIONAL DE SOBRADINHO II',
                            },
                            {
                                id: 'ra - xxvii',
                                label: 'RA - XXVII - ADMINISTRAÇÃO REGIONAL DO JARDIM BOTÂNICO',
                            },
                            {
                                id: 'ra - xxvii',
                                label: 'RA - XXVII - ADMINISTRAÇÃO REGIONAL DO ITAPOÃ',
                            },
                            {
                                id: 'ra - xxx',
                                label: 'RA - XXX - ADMINISTRAÇÃO REGIONAL DE VICENTE PIRES',
                            },
                            {
                                id: 'ra - xxxi',
                                label: 'RA - XXXI - ADMINISTRAÇÃO REGIONAL DA FERCAL',
                            },
                            {
                                id: 'ra - xxxiii',
                                label: 'RA - XXXIII - ADMINISTRAÇÃO REGIONAL DE ARNIQUEIRA',
                            },
                            {
                                id: 'ra - xxxiv',
                                label: 'RA - XXXIV - ADMINISTRAÇÃO REGIONAL DE ARAPOANGA',
                            },
                            {
                                id: 'ra - xxxv',
                                label: 'RA - XXXV - ADMINISTRAÇÃO REGIONAL DE ÁGUA QUENTE',
                            },
                            {
                                id: 'regional de ensino',
                                label: 'Regional de Ensino - Regional de Ensino',
                            },
                            {
                                id: '1º bpm/pmdf',
                                label: '1º BPM/PMDF - Asa Sul e Vila Telebrasília',
                            },
                            {
                                id: '2º bpm/pmdf',
                                label: '2º BPM/PMDF - Taguatinga e Taguaparque',
                            },
                            {
                                id: '3º bpm/pmdf',
                                label: '3º BPM/PMDF - Asa Norte e Noroeste',
                            },
                            {
                                id: '4º bpm/pmdf',
                                label: '4º BPM/PMDF - Guára I e II',
                            },
                            {
                                id: '5º bpm/pmdf',
                                label: '5º BPM/PMDF - Lago Sul e Aeroporto',
                            },
                            {
                                id: '6º bpm/pmdf',
                                label: '6º BPM/PMDF - Área Central, Esplanada dos Ministérios, Vila Planalto e Setor de Clubes Esportivos Norte',
                            },
                            {
                                id: '7º bpm/pmdf',
                                label: '7º BPM/PMDF - Cruzeiro, Sudoeste e Octogonal',
                            },
                            {
                                id: '8º bpm/pmdf',
                                label: '8º BPM/PMDF - Ceilândia Sul e Norte, Pôr do Sol, Sol Nascente e Pró-DF',
                            },
                            {
                                id: '9º bpm/pmdf',
                                label: '9º BPM/PMDF - Gama, Ponte Alta e Engenho das Lajes Urbano',
                            },
                            {
                                id: '10º bpm/pmdf',
                                label: '10º BPM/PMDF - Ceilândia Norte, Condomínio Privê e Sol Nascente',
                            },
                            {
                                id: '11º bpm/pmdf',
                                label: '11º BPM/PMDF - Samambaia',
                            },
                            {
                                id: '13º bpm/pmdf',
                                label: '13º BPM/PMDF - Sobradinho e Sobradinho II, Grande Colorado, Condomínio RK, Vila Basevi e Fercal',
                            },
                            {
                                id: '14º bpm/pmdf',
                                label: '14º BPM/PMDF - Planaltina, Arapoanga, Mestre DArmas e Vale do Amanhecer',
                            },
                            {
                                id: '15º bpm/pmdf',
                                label: '15º BPM/PMDF - Estrutural, SCIA, SIA, Colônia Agrícola 26 de Setembro, Colônia Agrícola Cabeceira do Valo e Núcleo Rural Cana do Reino',
                            },
                            {
                                id: '16º bpm/pmdf',
                                label: '16º BPM/PMDF - Brazlândia e Incra 08',
                            },
                            {
                                id: '17º bpm/pmdf',
                                label: '17º BPM/PMDF - Águas Claras, Vicente Pires, Jockey Club e Park Way',
                            },
                            {
                                id: '20º bpm/pmdf',
                                label: '20º BPM/PMDF - Paranoá e Itapoã',
                            },
                            {
                                id: '21º bpm/pmdf',
                                label: '21º BPM/PMDF - São Sebastião, Jardim Botânico, Jardins Magueiral e Núcleo Rural Café sem Troco',
                            },
                            {
                                id: '24º bpm/pmdf',
                                label: '24º BPM/PMDF - Lago Norte, Varjão, Taquari e Granja do Torto',
                            },
                            {
                                id: '25º bpm/pmdf',
                                label: '25º BPM/PMDF - Núcelo Bandeirante, Candangolândia, Metropolitana e Setor de Mansões Park Way',
                            },
                            {
                                id: '26º bpm/pmdf',
                                label: '26º BPM/PMDF - Santa Maria, Porto Rico e DVO',
                            },
                            {
                                id: '27º bpm/pmdf',
                                label: '27º BPM/PMDF - Recanto das Emas, Água Quente e Tororó',
                            },
                            {
                                id: '28º bpm/pmdf',
                                label: '28º BPM/PMDF - Riacho Fundo I e II, CAUB',
                            },
                            {
                                id: 'bpma/pmdf',
                                label: 'BPMA/PMDF - Batalhão de Polícia Militar Ambiental',
                            },
                            {
                                id: 'bpr/pmdf',
                                label: 'BPR/PMDF - Batalhão de Policiamento Rural',
                            },
                            {
                                id: 'bpesc/pmdf',
                                label: 'BPESC/PMDF - Batalhão de Policiamento Escolar',
                            },
                            {
                                id: 'bptran/pmdf',
                                label: 'BPTRAN/PMDF - Batalhão de Policiamento de Trânsito',
                            },
                            {
                                id: 'bprv/pmdf',
                                label: 'BPRV/PMDF - Batalhão de Policiamento Rodoviário',
                            },
                            {
                                id: 'copom/pmdf',
                                label: 'COPOM/PMDF - Centro de Operações',
                            },
                            {
                                id: 'cpp/pmdf',
                                label: 'CPP/PMDF - Centro de Políticas de Segurança Pública',
                            },
                            {
                                id: 'outros/pmdf',
                                label: 'Outros/PMDF - Demais não contemplados especificamente',
                            },
                            {
                                id: '1º gbm/cbmdf',
                                label: '1º GBM/CBMDF - Brasília',
                            },
                            {
                                id: '2º gbm/cbmdf',
                                label: '2º GBM/CBMDF - Taguatinga',
                            },
                            {
                                id: '3º gbm/cbmdf',
                                label: '3º GBM/CBMDF - SIA',
                            },
                            {
                                id: '4º gbm/cbmdf',
                                label: '4º GBM/CBMDF - Asa Norte',
                            },
                            {
                                id: '6º gbm/cbmdf',
                                label: '6º GBM/CBMDF - Núcleo Bandeirante',
                            },
                            {
                                id: '7º gbm/cbmdf',
                                label: '7º GBM/CBMDF - Brazlândia',
                            },
                            {
                                id: '8º gbm/cbmdf',
                                label: '8º GBM/CBMDF - Ceilândia',
                            },
                            {
                                id: '9º gbm/cbmdf',
                                label: '9º GBM/CBMDF - Planaltina',
                            },
                            {
                                id: '10º gbm/cbmdf',
                                label: '10º GBM/CBMDF - Paranoá',
                            },
                            {
                                id: '11º gbm/cbmdf',
                                label: '11º GBM/CBMDF - Lago Sul',
                            },
                            {
                                id: '12º gbm/cbmdf',
                                label: '12º GBM/CBMDF - Samambaia',
                            },
                            {
                                id: '13º gbm/cbmdf',
                                label: '13º GBM/CBMDF - Guara I',
                            },
                            {
                                id: '15º gbm/cbmdf',
                                label: '15º GBM/CBMDF - Asa Sul',
                            },
                            {
                                id: '16º gbm/cbmdf',
                                label: '16º GBM/CBMDF - Gama',
                            },
                            {
                                id: '17º gbm/cbmdf',
                                label: '17º GBM/CBMDF - São Sebastião',
                            },
                            {
                                id: '18º gbm/cbmdf',
                                label: '18º GBM/CBMDF - Santa Maria',
                            },
                            {
                                id: '19º gbm/cbmdf',
                                label: '19º GBM/CBMDF - Candangolândia',
                            },
                            {
                                id: '20º gbm/cbmdf',
                                label: '20º GBM/CBMDF - Recanto das Emas',
                            },
                            {
                                id: '21º gbm/cbmdf',
                                label: '21º GBM/CBMDF - Riacho Fundo',
                            },
                            {
                                id: '22º gbm/cbmdf',
                                label: '22º GBM/CBMDF - Sobradinho',
                            },
                            {
                                id: '25º gbm/cbmdf',
                                label: '25º GBM/CBMDF - Águas Claras',
                            },
                            {
                                id: '34º gbm/cbmdf',
                                label: '34º GBM/CBMDF - Lago Norte',
                            },
                            {
                                id: '36º gbm/cbmdf',
                                label: '36º GBM/CBMDF - Recanto das Emas Centro',
                            },
                            {
                                id: '37º gbm/cbmdf',
                                label: '37º GBM/CBMDF - Samambaia Centro',
                            },
                            {
                                id: '41º gbm/cbmdf',
                                label: '41º GBM/CBMDF - Setor de Indústria de Ceilândia',
                            },
                            {
                                id: '45º gbm/cbmdf',
                                label: '45º GBM/CBMDF - Sudoeste e Octogonal',
                            },
                            {
                                id: 'gaeph/cbmdf',
                                label: 'GAEPH/CBMDF - Grupamento de Atendimento de Emergência Pré-Hospitalar',
                            },
                            {
                                id: 'gbs/cbmdf',
                                label: 'GBS/CBMDF - Grupamento de Busca e Salvamento',
                            },
                            {
                                id: 'gpciu/cbmdf',
                                label: 'GPCIU/CBMDF - Grupamento de Prevenção e Combate a Incêndio Urbano',
                            },
                            {
                                id: 'gpram/cbmdf',
                                label: 'GPRAM/CBMDF - Grupamento de Proteção Ambiental',
                            },
                            {
                                id: 'gpciv',
                                label: 'GPCIV - Grupamento de Proteção Civil',
                            },
                            {
                                id: 'gavop',
                                label: 'GAVOP - Grupamento de Aviação Operacional',
                            },
                            {
                                id: 'outros/cbmdf',
                                label: 'Outros/CBMDF - Demais unidades não contempladas especificamente',
                            },
                            {
                                id: '1ª dp/pcdf',
                                label: '1ª DP/PCDF - Asa Sul',
                            },
                            {
                                id: '2ª dp/pcdf',
                                label: '2ª DP/PCDF - Asa Norte',
                            },
                            {
                                id: '3ª dp/pcdf',
                                label: '3ª DP/PCDF - Cruzeiro Velho',
                            },
                            {
                                id: '4ª dp/pcdf',
                                label: '4ª DP/PCDF - Guára II',
                            },
                            {
                                id: '5ª dp/pcdf',
                                label: '5ª DP/PCDF - Setor de Grandes Áreas Norte',
                            },
                            {
                                id: '6ª dp/pcdf',
                                label: '6ª DP/PCDF - Paranoá',
                            },
                            {
                                id: '8ª dp/pcdf',
                                label: '8ª DP/PCDF - Setor Complementar de Indústria e Abastecimento',
                            },
                            {
                                id: '9ª dp/pcdf',
                                label: '9ª DP/PCDF - Lago Norte',
                            },
                            {
                                id: '10ª dp/pcdf',
                                label: '10ª DP/PCDF - Lago Sul',
                            },
                            {
                                id: '11ª dp/pcdf',
                                label: '11ª DP/PCDF - Núcleo Bandeirante',
                            },
                            {
                                id: '12ª dp/pcdf',
                                label: '12ª DP/PCDF - Taguacentro Centro',
                            },
                            {
                                id: '13ª dp/pcdf',
                                label: '13ª DP/PCDF - Sobradinho',
                            },
                            {
                                id: '14ª dp/pcdf',
                                label: '14ª DP/PCDF - Gama',
                            },
                            {
                                id: '15ª dp/pcdf',
                                label: '15ª DP/PCDF - Ceilândia Centro',
                            },
                            {
                                id: '16ª dp/pcdf',
                                label: '16ª DP/PCDF - Planaltina',
                            },
                            {
                                id: '17ª dp/pcdf',
                                label: '17ª DP/PCDF - Taguatiga Norte',
                            },
                            {
                                id: '18ª dp/pcdf',
                                label: '18ª DP/PCDF - Brazlândia',
                            },
                            {
                                id: '19ª dp/pcdf',
                                label: '19ª DP/PCDF - Setor "P" Norte da Ceilândia',
                            },
                            {
                                id: '20ª dp/pcdf',
                                label: '20ª DP/PCDF - Gama',
                            },
                            {
                                id: '21ª dp/pcdf',
                                label: '21ª DP/PCDF - Taguatinga Sul',
                            },
                            {
                                id: '23ª dp/pcdf',
                                label: '23ª DP/PCDF - Setor "P" Sul da Ceilândia',
                            },
                            {
                                id: '24ª dp/pcdf',
                                label: '24ª DP/PCDF - Setor "O" da Ceilândia',
                            },
                            {
                                id: '26ª dp/pcdf',
                                label: '26ª DP/PCDF - Samambaia Norte',
                            },
                            {
                                id: '27ª dp/pcdf',
                                label: '27ª DP/PCDF - Recanto das Emas',
                            },
                            {
                                id: '29ª dp/pcdf',
                                label: '29ª DP/PCDF - Riacho Fundo',
                            },
                            {
                                id: '30ª dp/pcdf',
                                label: '30ª DP/PCDF - São Sebastião',
                            },
                            {
                                id: '31ª dp/pcdf',
                                label: '31ª DP/PCDF - Planaltina',
                            },
                            {
                                id: '32ª dp/pcdf',
                                label: '32ª DP/PCDF - Samambaia Sul',
                            },
                            {
                                id: '33ª dp/pcdf',
                                label: '33ª DP/PCDF - Santa Maria',
                            },
                            {
                                id: '35ª dp/pcdf',
                                label: '35ª DP/PCDF - Sobradinho II',
                            },
                            {
                                id: '38ª dp/pcdf',
                                label: '38ª DP/PCDF - Vicente Pires',
                            },
                            {
                                id: 'cord/pcdf',
                                label: 'CORD/PCDF - Coordenação de Repressão às Drogas',
                            },
                            {
                                id: 'chpp/pcdf',
                                label: 'CHPP/PCDF - Coordenação de Repressão a Homicídios e de Proteção à Pessoa',
                            },
                            {
                                id: 'corf/pcdf',
                                label: 'CORF/PCDF - Coordenação de Repressão ao Crime contra o Consumidor, a Propriedade Imaterial e a Fraudes',
                            },
                            {
                                id: 'corpatri/pcdf',
                                label: 'CORPATRI/PCDF - Coordenação de Repressão aos Crimes Patrimonias',
                            },
                            {
                                id: 'dca i/pcdf',
                                label: 'DCA I/PCDF - Delegacia da Criança e do Adolescente I',
                            },
                            {
                                id: 'dca ii/pcdf',
                                label: 'DCA II/PCDF - Delegacia da Criança e do Adolescente II',
                            },
                            {
                                id: 'deam i/pcdf',
                                label: 'DEAM I/PCDF - Delegacia Especial de Atendimento à Mulher I',
                            },
                            {
                                id: 'deam ii/pcdf',
                                label: 'DEAM II/PCDF - Delegacia Especial de Atendimento à Mulher II',
                            },
                            {
                                id: 'cepema/pcdf',
                                label: 'CEPEMA/PCDF - Coordenação Especial de Proteção ao Meio Ambiente, à Ordem Urbanística e ao Animal',
                            },
                            {
                                id: 'dpca/pcdf',
                                label: 'DPCA/PCDF - Delegacia de Proteção à Criança e ao Adolescente',
                            },
                            {
                                id: 'decrin/pcdf',
                                label: 'DECRIN/PCDF - Delegacia Especial de Repressão aos Crimes por Discriminação Racial, Religiosa ou por Orientação Sexual contra a Pessoa Idosa ou com Deficiência',
                            },
                            {
                                id: 'drcc/pcdf',
                                label: 'DRCC/PCDF - Delegacia Especial de Repressão aos Crimes Cibernéticos',
                            },
                            {
                                id: 'outros/pcdf',
                                label: 'Outros/PCDF - Demais unidades não contempladas especificamente',
                            },
                            {
                                id: 'gab/sspdf',
                                label: 'GAB/SSPDF - Gabinete',
                            },
                            {
                                id: 'si/sspdf',
                                label: 'SI/SSPDF - Subsecretaria de Inteligência',
                            },
                            {
                                id: 'sudec/sspdf',
                                label: 'SUDEC/SSPDF - Subsecretaria do Sistema de Defesa Civil',
                            },
                            {
                                id: 'subisp/sspdf',
                                label: 'SUBISP/SSPDF - Subsecretária de Integração de Políticas em Segurança Pública',
                            },
                            {
                                id: 'suprec/sspdf',
                                label: 'SUPREC/SSPDF - Subsecretaria de Prevenção à Criminalidade',
                            },
                            {
                                id: 'sopi/sspdf',
                                label: 'SOPI/SSPDF - Subsecretaria de Operações Integradas',
                            },
                            {
                                id: 'sgi/sspdf',
                                label: 'SGI/SSPDF - Subsecretaria de Gestão da Informação',
                            },
                            {
                                id: 'segecom/sspdf',
                                label: 'SEGECOM/SSPDF - Subsecretaria de Escolas de Gestão Compartilhada',
                            },
                            {
                                id: 'suag/sspdf',
                                label: 'SUAG/SSPDF - Subsecretaria de Administração Geral',
                            },
                            {
                                id: 'suegep/pcdf',
                                label: 'SUEGEP/PCDF - Subsecretaria de Ensino e Gestão de Pessoas',
                            },
                            {
                                id: 'smt/sspdf',
                                label: 'SMT/SSPDF - Subsecretaria de Modernização Tecnológica',
                            },
                        ],
                        type: 'string',
                        value: '',
                    },
                    {
                        label: 'Data Abertura',
                        keyName: 'DT_CADASTRO',
                        operator: 'data exata',
                        operators: ['data exata', 'entre'],
                        type: 'date',
                        value: '',
                    },
                    {
                        label: 'Movimentação Último Estado',
                        keyName: 'TB_HISTORICO_ESTADO.0.DT_CADASTRO',
                        operator: 'data exata',
                        operators: ['data exata', 'entre'],
                        type: 'date',
                        value: '',
                    },
                    {
                        label: 'Estado - PAF',
                        keyName: 'TB_HISTORICO_ESTADO.0.DS_ESTADO',
                        operator: 'contem',
                        operators: ['contem', 'tem um dos'],
                        type: 'string',
                        useList: [
                            { id: 'Pendente', label: 'Pendente' },
                            { id: 'Iniciado', label: 'Iniciado' },
                            { id: 'Finalizado', label: 'Finalizado' },
                        ],
                        value: '',
                    },
                    {
                        label: 'RISP',
                        keyName: 'NO_RISP',
                        operator: 'contem',
                        operators: ['contem', 'tem um dos'],
                        type: 'string',
                        useList: [
                            { id: 'RISP LESTE', label: 'RISP LESTE' },
                            { id: 'RISP METROPOLITANA', label: 'RISP METROPOLITANA' },
                            { id: 'RISP OESTE', label: 'RISP OESTE' },
                            { id: 'RISP SUL', label: 'RISP SUL' },
                        ],
                        value: '',
                    },
                    {
                        label: 'Tipo',
                        keyName: 'NO_TIPO_DEVOLUTIVA',
                        operator: 'contem',
                        operators: ['contem', 'tem um dos'],
                        type: 'string',
                        useList: [
                            {
                                id: 'POLUIÇÃO SONORA',
                                label: 'POLUIÇÃO SONORA',
                            },
                            {
                                id: 'POLICIAMENTO OSTENSIVO',
                                label: 'POLICIAMENTO OSTENSIVO',
                            },
                            {
                                id: 'CARCAÇA',
                                label: 'CARCAÇA',
                            },
                            {
                                id: 'ILUMINAÇÃO PÚBLICA',
                                label: 'ILUMINAÇÃO PÚBLICA',
                            },
                            {
                                id: 'SINALIZAÇÃO TRÂNSITO',
                                label: 'SINALIZAÇÃO TRÂNSITO',
                            },
                            {
                                id: 'MELHORIA DO ASFALTO',
                                label: 'MELHORIA DO ASFALTO',
                            },
                            {
                                id: 'POLICIAMENTO INVESTIGATIVO',
                                label: 'POLICIAMENTO INVESTIGATIVO',
                            },
                            {
                                id: 'PODA DE ÁRVORE',
                                label: 'PODA DE ÁRVORE',
                            },
                            {
                                id: 'TRÁFICO DE DROGAS',
                                label: 'TRÁFICO DE DROGAS',
                            },
                            {
                                id: 'DESORDEM SOCIAL',
                                label: 'DESORDEM SOCIAL',
                            },
                            {
                                id: 'CALÇAMENTO',
                                label: 'CALÇAMENTO',
                            },
                            {
                                id: 'INVASÃO DE TERRA',
                                label: 'INVASÃO DE TERRA',
                            },
                            {
                                id: 'FISCALIZAÇÃO DE TRÂNSITO',
                                label: 'FISCALIZAÇÃO DE TRÂNSITO',
                            },
                            {
                                id: 'ENGENHARIA DE TRÂNSITO',
                                label: 'ENGENHARIA DE TRÂNSITO',
                            },
                            {
                                id: 'OUTROS',
                                label: 'OUTROS',
                            },
                        ],
                        value: '',
                    },
                ]}
                columnSize={11}
                mediaQueryLG={{
                    all: 3,
                    action: 9,
                }}
            /> */}
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
