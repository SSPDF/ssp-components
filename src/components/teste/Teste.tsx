import { Box, Button, Stack } from '@mui/material'
import React, { useContext, useRef, useState } from 'react'
import CheckBox from '../form/checkbox/CheckBox'
import CheckBoxWarning from '../form/checkbox/CheckBoxWarning'
import RequiredCheckBoxGroup from '../form/checkbox/RequiredCheckBoxValidator'
import DatePicker from '../form/date/DatePicker'
import TimePicker from '../form/date/TimePicker'
import DropFileUpload from '../form/file/DropFileUpload'
import FileUpload from '../form/file/FileUpload'
import Input from '../form/input/Input'
import MultInput from '../form/input/MultInput'
import Stepper from '../form/stepper/Stepper'
import StepperBlock from '../form/stepper/StepperBlock'
import Table from '../form/table/Table'
import { Map } from '../map'

import { FormContext } from '../../context/form'
import '../../css/globals.css'
import FetchAutoComplete from '../form/input/FetchAutoComplete'
import { FixedAutoComplete } from '../form/input/FixedAutoComplete'
import get from 'lodash.get'
import dayjs from 'dayjs'

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
    const l = [{ id: 'ata', label: 'ata' }]
    const [value, setValue] = useState<any>(l[0])
    const ref = useRef<DocumentFragment | null>(null)

    const [show, setShow] = useState(false)

    // const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    //     setValue(newValue)
    // }

    const valor = {
        id: 14,
        label: 'CONSEG PARANOÁ',
    }

    return (
        <Box bgcolor='#F9F9F9'>
            <FixedAutoComplete
                name='motivoDesliga'
                title='Motivo para não registrar ocorrência'
                list={[
                    {
                        id: 1,
                        label: 'Agradecimento',
                    },
                    {
                        id: 2,
                        label: 'Engano',
                    },
                ]}
                required={true}
            />
            {/* <Input type='input' name='test' title='Teste' required /> */}
            {/* <Table
                id='admin'
                useKC={false}
                columnSize={11}
                tableName='Evento'
                action={(prop) => <></>}
                collapsedSize={59}
                dataPath='body.data'
                csvConfig={{
                    fileName: 'Eventos',
                }}
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
                        title: 'Nome do Evento',
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
                    },
                ]}
                fetchFunc={() => fetch('http://localhost:7171/table')}
                mediaQueryLG={{
                    all: 3.5,
                    action: 1,
                }}
                // filtros
                filtersFunc={{
                    datas: (value) => {
                        const new_value = value.split(' | ').map((x) => x.split(' - ')[0])
                        return new_value
                    },
                }}
                filters={[
                    {
                        label: 'Protocolo',
                        keyName: 'coSeqEventoExterno',
                        operator: 'igual',
                        operators: ['igual', 'maior que', 'menor que'],
                        type: 'number',
                        value: '',
                    },
                    {
                        label: 'Local',
                        keyName: 'dsEnderecoLocal',
                        operator: 'contem',
                        operators: ['igual', 'contem'],
                        type: 'string',
                        value: '',
                    },
                    {
                        label: 'Data da Solicitação',
                        keyName: 'dtCadastro',
                        operator: 'data exata',
                        operators: ['data exata', 'entre'],
                        type: 'date',
                        value: '',
                    },
                    {
                        label: 'Nome do Evento',
                        keyName: 'noEvento',
                        operator: 'contem',
                        operators: ['igual', 'contem'],
                        type: 'string',
                        value: '',
                    },
                    {
                        label: 'Público Máximo',
                        keyName: 'nuPublicoMaximo',
                        operator: 'igual',
                        operators: ['igual', 'maior que', 'menor que'],
                        type: 'number',
                        value: '',
                    },
                    {
                        label: 'Processo SEI',
                        keyName: 'nuProcessoFormatadoSei',
                        operator: 'igual',
                        operators: ['igual', 'contem'],
                        type: 'string',
                        value: '',
                    },
                    {
                        label: 'Natureza',
                        keyName: 'dsTableNaturezas',
                        operator: 'contem',
                        operators: ['contem', 'tem um dos'],
                        type: 'string',
                        useList: [
                            { id: 'feirasExposicoes', label: 'Feiras e Exposições' },
                            { id: 'carnavalesco', label: 'Carnavalesco' },
                            { id: 'shows', label: 'Shows' },
                            { id: 'religioso', label: 'Religioso' },
                            { id: 'atoPublico', label: 'Ato Público' },
                            { id: 'cultural', label: 'Cultural' },
                            { id: 'social', label: 'Social' },
                            { id: 'corporativo', label: 'Corporativo' },
                            { id: 'promocional', label: 'Promocional' },
                            { id: 'festaJunina', label: 'Festa Junina' },
                            { id: 'semFinsLucrativos', label: 'Sem Fins Lucrativos' },
                            { id: 'esportivo', label: 'Esportivo' },
                        ],
                        value: '',
                    },
                    {
                        label: 'Status do Evento',
                        keyName: 'stEventoExterno',
                        operator: 'igual',
                        operators: ['igual', 'tem um dos'],
                        type: 'string',
                        useList: [
                            { id: 'P', label: 'Em Análise' },
                            { id: 'A', label: 'Cadastrado' },
                            { id: 'C', label: 'Cancelado' },
                            { id: 'R', label: 'Com Pendência' },
                            { id: 'FP', label: 'Fora do Prazo' },
                            { id: 'E', label: 'Alteração Solicitada' },
                            { id: 'NR', label: 'Não Cadastrado' },
                        ],
                        value: '',
                    },
                    {
                        label: 'Datas',
                        keyName: 'dtTableDates',
                        operator: 'tem a data',
                        operators: ['tem a data', 'data inicio', 'data fim', 'entre'],
                        type: 'dates',
                        customFunc: 'datas',
                        value: '',
                    },
                ]}
                orderBy={[
                    {
                        label: 'Protocolo',
                        key: 'coSeqEventoExterno',
                        type: 'number',
                    },
                ]}
            /> */}
            {/* <Map
                firstCoords={{ lat: -15.780919186447452, lng: -47.908317328037604 }}
                mapStyle={{ height: '400px', width: '500px' }}
                onCoordsChange={(c) => {
                    console.log(c)
                }}
                fixedPosition
            /> */}

            {/* <DropFileUpload apiURL='#' name='teste' title='Input' tipoArquivo='0' /> */}

            {/* <FixedAutoComplete name='quartel2' title='Quartel' customLoadingText='Carregando quarteis' list={l} watchValue={value} required />
            <Button variant='contained' onClick={(e) => setValue(undefined)}>
                Teste
            </Button> */}
            {/* <Stepper>
                <StepperBlock title='Teste 1'>
                    <Input name='nome1' type='input' title='Nome 1' required />
                </StepperBlock>

                <StepperBlock title='Teste 2' optional>
                    <Input name='nome2' type='input' title='Nome 2' required />
                </StepperBlock>

                <StepperBlock title='Teste 3'>
                    <Input name='nome3' type='input' title='Nome 3' required />
                </StepperBlock>
            </Stepper> */}
            {/* <Stepper>
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
            </Stepper> */}
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
                        keyName: 'CO_EIXO_SEGURANCA_INTEGRAL',
                        title: 'Eixo Segurança Integral',
                    },
                ]}
                filters={[
                    {
                        label: 'Eixo',
                        keyName: 'CO_EIXO_SEGURANCA_INTEGRAL',
                        operator: 'igual',
                        operators: ['igual', 'tem um dos'],
                        useList: [
                            {
                                id: 1,
                                label: 'Cidade Mais Segura',
                            },
                            {
                                id: 2,
                                label: 'Escola Mais Segura',
                            },
                            {
                                id: 3,
                                label: 'Cidadão Mais Seguro',
                            },
                            {
                                id: 4,
                                label: 'Mulher Mais Segura',
                            },
                            {
                                id: 5,
                                label: 'Servidor Mais Seguro',
                            },
                        ] as any,
                        type: 'string',
                        value: '',
                    },
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
                    //     operators: ['data exata', 'entre'],
                    //     type: 'date',
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
                    //     label: 'Público Máximo',
                    //     keyName: 'nuPublicoMaximo',
                    //     operator: 'igual',
                    //     operators: ['igual', 'maior que', 'menor que'],
                    //     type: 'number',
                    //     value: '',
                    // },
                    // {
                    //     label: 'Processo SEI',
                    //     keyName: 'nuProcessoFormatadoSei',
                    //     operator: 'igual',
                    //     operators: ['igual', 'contem'],
                    //     type: 'string',
                    //     value: '',
                    // },
                    // {
                    //     label: 'Natureza',
                    //     keyName: 'dsTableNaturezas',
                    //     operator: 'contem',
                    //     operators: ['contem', 'tem um dos'],
                    //     type: 'string',
                    //     useList: [
                    //         { id: 'feirasExposicoes', label: 'Feiras e Exposições' },
                    //         { id: 'carnavalesco', label: 'Carnavalesco' },
                    //         { id: 'shows', label: 'Shows' },
                    //         { id: 'religioso', label: 'Religioso' },
                    //         { id: 'atoPublico', label: 'Ato Público' },
                    //         { id: 'cultural', label: 'Cultural' },
                    //         { id: 'social', label: 'Social' },
                    //         { id: 'corporativo', label: 'Corporativo' },
                    //         { id: 'promocional', label: 'Promocional' },
                    //         { id: 'festaJunina', label: 'Festa Junina' },
                    //         { id: 'semFinsLucrativos', label: 'Sem Fins Lucrativos' },
                    //     ],
                    //     value: '',
                    // },
                    // {
                    //     label: 'Status do Evento',
                    //     keyName: 'stEventoExterno',
                    //     operator: 'contem',
                    //     operators: ['contem', 'tem um dos'],
                    //     type: 'string',
                    //     useList: [
                    //         { id: 'P', label: 'Em Análise' },
                    //         { id: 'A', label: 'Cadastrado' },
                    //         { id: 'C', label: 'Cancelado' },
                    //         { id: 'R', label: 'Com Pendência' },
                    //         { id: 'FP', label: 'Fora do Prazo' },
                    //         { id: 'E', label: 'Alteração Pendente' },
                    //     ],
                    //     value: '',
                    // },
                    // {
                    //     label: 'Datas',
                    //     keyName: 'dtTableDates',
                    //     operator: 'tem a data',
                    //     operators: ['tem a data', 'data inicio', 'data fim', 'entre'],
                    //     type: 'dates',
                    //     customFunc: 'datas',
                    //     value: '',
                    // },
                ]}
                action={() => (
                    <>
                        <Button variant='contained'>Teste</Button>
                    </>
                )}
                orderBy={[
                    {
                        label: 'Protocolo',
                        key: 'CO_SEQ_DEVOLUTIVA_CADASTRO',
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
