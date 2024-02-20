import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import SaveIcon from '@mui/icons-material/Save'
import { LoadingButton } from '@mui/lab'
import { Alert, Box, Button, MobileStepper, Snackbar, Stack, Step, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { FormEvent, ReactElement, useContext, useRef, useState } from 'react'
import { FormContext } from '../../../context/form'
import { FieldValues } from 'react-hook-form'
import { StepperBlock } from './StepperBlock'
import { Input } from '../input/Input'
import FetchAutoComplete from '../input/FetchAutoComplete'
import RequiredCheckBoxGroup from '../checkbox/RequiredCheckBoxValidator'
import CheckBox from '../checkbox/CheckBox'
import Table from '../table/Table'
import { FixedAutoComplete } from '../input/FixedAutoComplete'
import MultInput from '../input/MultInput'

const getKeys = (values: any, id: number) => {
    if (!values || Object.keys(values).length <= 0) return []
    if (!values[id]) return []

    let keys = Object.keys(values[id]).map((x) => `${id}.${x}`)
    if (values.files) keys = [...keys, ...Object.keys(values.files).map((x) => `files.${x}`)]

    return keys
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

const list = [
    {
        id: 0,
        label: 'Nada',
    },
    {
        id: 1,
        label: 'Nada 2',
    },
]

export function Teste() {
    return (
        <>
            {/* <Table
                columnSize={11}
                action={() => <></>}
                tableName='Evento'
                multipleDataPath='dtTableArr'
                csv={{ fileName: 'Eventos' }}
                isPublic={true}
                columns={[
                    {
                        keyName: 'coSeqEventoExterno',
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
                    },
                ]}
                statusKeyName='stEventoExterno'
                csvButtonTitle='Baixar Eventos CSV'
                csvCustomKeyNames={{
                    noTableRa: 'RA',
                    protocoloProcessosei: 'Protocolo / Processo SEI',
                    coSeqEventoExterno: 'Protocolo',
                    noEvento: 'Nome do Evento',
                    dtCadastro: 'Data de Solicitação',
                    dtTableInicio: 'Data de Início',
                    hrTableInicio: 'Hora de Início',
                    dsEnderecoLocal: 'Endereço',
                    nuPublicoMaximo: 'Público Máximo',
                    nuProcessoFormatadoSei: 'Processo SEI',
                    stTableStatus: 'Status do Evento',
                    dtTableDates: 'Datas Cadastradas (Inicio | Termino)',
                    dsTableNaturezas: 'Naturezas',
                    stAcaoTransito: 'Ações de Trânsito',
                }}
                csvExcludeKeysCSV={['dtTableDates']}
                csvExcludeKeys={['rlEventoData', 'stEventoExterno', 'dtTableArr']}
                fetchFunc={() => fetch('http://localhost:7171/table')}
                // filtros
                filters={{
                    Protocolo: [
                        {
                            keyName: 'coSeqEventoExterno',
                            type: 'a-z',
                            name: 'Ordernar em ordem crescente',
                        },
                        {
                            keyName: 'coSeqEventoExterno',
                            type: 'z-a',
                            name: 'Ordernar em ordem decrescente',
                        },
                    ],
                    Nome: [
                        {
                            keyName: 'noEvento',
                            type: 'a-z',
                            name: 'Ordernar em ordem crescente',
                        },
                        {
                            keyName: 'noEvento',
                            type: 'z-a',
                            name: 'Ordernar em ordem decrescente',
                        },
                    ],
                    Datas: [
                        {
                            type: 'date-interval',
                            keyName: 'dtTableDates',
                            name: 'Intervalo de Data',
                        },
                        {
                            type: 'data-a-z',
                            keyName: 'dtTableDates',
                            name: 'Data crescente',
                        },
                        {
                            type: 'data-z-a',
                            keyName: 'dtTableDates',
                            name: 'Data decrescente',
                        },
                    ],
                    Local: [
                        {
                            keyName: 'dsEnderecoLocal',
                            type: 'a-z',
                            name: 'Ordernar em ordem crescente',
                        },
                        {
                            keyName: 'dsEnderecoLocal',
                            type: 'z-a',
                            name: 'Ordernar em ordem decrescente',
                        },
                    ],
                    'Ato Público': [
                        {
                            type: 'items',
                            keyName: 'dsTableNaturezas',
                            name: '',
                            referenceKey: 'coSeqEventoExterno',
                            options: [
                                {
                                    key: 'atopublico',
                                    color: 'purple',
                                    name: 'Somente Ato Público',
                                },
                                {
                                    key: 'carnavalesco',
                                    color: 'red',
                                    name: 'Somente Carnavalesco',
                                },
                            ],
                        },
                    ],
                    RA: [
                        {
                            keyName: 'noTableRa',
                            type: 'a-z',
                            name: 'Ordernar em ordem crescente',
                        },
                        {
                            keyName: 'noTableRa',
                            type: 'z-a',
                            name: 'Ordernar em ordem decrescente',
                        },
                        {
                            type: 'items',
                            keyName: 'noTableRa',
                            name: '',
                            referenceKey: 'coSeqEventoExterno',
                            options: [
                                'água quente',
                                'águas claras',
                                'arapoanga',
                                'arniqueira',
                                'brazlândia',
                                'candangolândia',
                                'ceilândia',
                                'cruzeiro',
                                'fercal',
                                'gama',
                                'guará',
                                'itapoã',
                                'jardim botânico',
                                'lago norte',
                                'lago sul',
                                'núcleo bandeirante',
                                'paranoá',
                                'park way',
                                'planaltina',
                                'plano piloto',
                                'recanto das emas',
                                'riacho fundo',
                                'riacho fundo ii',
                                'samambaia',
                                'santa maria',
                                'são sebastião',
                                'scia/estrutural',
                                'sia',
                                'sobradinho',
                                'sobradinho ii',
                                'sol nascente e pôr do sol',
                                'sudoeste/octogonal',
                                'taguatinga',
                                'varjão',
                                'vicente pires',
                            ].map((x) => ({
                                key: x,
                                color: 'black',
                                name: x.toUpperCase(),
                            })),
                        },
                    ],
                    'Público Máximo': [
                        {
                            keyName: 'nuPublicoMaximo',
                            type: 'a-z',
                            name: 'Ordernar em ordem crescente',
                        },
                        {
                            keyName: 'nuPublicoMaximo',
                            type: 'z-a',
                            name: 'Ordernar em ordem decrescente',
                        },
                    ],
                    'Data de Solicitação': [
                        {
                            type: 'data-a-z',
                            keyName: 'dtCadastro',
                            name: 'Ordem crescente',
                        },
                        {
                            type: 'data-z-a',
                            keyName: 'dtCadastro',
                            name: 'Ordem decrescente',
                        },
                    ],
                    Status: [
                        {
                            type: 'items',
                            keyName: 'stEventoExterno',
                            name: '',
                            referenceKey: 'coSeqEventoExterno',
                            options: [
                                {
                                    key: 'p',
                                    color: '#F59E0B',
                                    name: 'EM ANÁLISE',
                                },
                                {
                                    key: 'a',
                                    color: '#0EA5E9',
                                    name: 'CADASTRADO',
                                },
                                {
                                    key: 'c',
                                    color: '#a1a1a1',
                                    name: 'CANCELADO',
                                },
                                {
                                    key: 'r',
                                    color: '#EF4444',
                                    name: 'REPROVADO',
                                },
                                {
                                    key: 'l',
                                    color: '#22C55E',
                                    name: 'LICENCIADO',
                                },
                                {
                                    key: 'fp',
                                    color: '#991b1b',
                                    name: 'FORA DO PRAZO',
                                },
                            ],
                        },
                    ],
                }}
            /> */}
            <Stepper>
                <StepperBlock title='Testando'>
                    <Box bgcolor='pink'>
                        <Input name='teste' type='input' />
                        <FixedAutoComplete name='haha' title='Testing' list={list} required />

                        <MultInput name='haha' />
                    </Box>
                </StepperBlock>
            </Stepper>
        </>
    )
}

export function Stepper({
    debugLog = false,
    test = false,
    testConfig = {},
    ...props
}: {
    children: ReactElement | ReactElement[]
    debugData?: (data: FieldValues) => void
    debugLog?: boolean
    test?: boolean
    testConfig?: { [key: number]: { [key: string]: string | number | boolean } }
}) {
    const length = Array.isArray(props.children) ? props.children.length : 1
    const context = useContext(FormContext)!
    // next button ref
    const nRef = useRef<HTMLButtonElement | null>(null)
    const theme = useTheme()

    const [activeStep, setActiveStep] = useState(0)

    const [canPass, setCanPass] = useState(false)

    const blocks = Array.isArray(props.children) ? props.children : [props.children]
    const stepperBlocks = blocks.map((x, idx) => {
        return React.cloneElement(x, { ...x.props, prefix: idx })
    })
    const maxSteps = length

    const handleNext = async () => {
        if (debugLog) console.log(context.formGetValues())

        // console.log('valores conferidos', getKeys(context.formGetValues(), activeStep), context.formGetValues(getKeys(context.formGetValues(), activeStep)))

        const result = await context.formTrigger(getKeys(context.formGetValues(), activeStep))

        if (!result) {
            setCanPass(true)
            return
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const nextCheck = async (e: FormEvent) => {
        const result = await context!.formTrigger(getKeys(context.formGetValues(), activeStep))

        if (!result) {
            e.preventDefault()
            setCanPass(true)
            return
        }
    }
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const preencher = () => {
        Object.keys(testConfig).forEach((id, idx) => {
            const obj = testConfig[Number(id)]

            Object.keys(obj).forEach((x) => {
                context.formUnregister(`${id}.${x}`)
                context.formSetValue(`${id}.${x}`, obj[x])
            })

            if (idx < Object.keys(testConfig).length - 1) {
                sleep(100).then(() => {
                    const bt = nRef.current!

                    nRef.current?.click()
                })
            }
        })
    }

    return (
        <Box>
            {test && (
                <Stack direction='row' justifyContent='end'>
                    <Button variant='contained' color='error' onClick={preencher}>
                        EXCLUIR BANCO PRODUÇÃO
                    </Button>
                </Stack>
            )}
            <Stack sx={{ padding: 2, marginBottom: 10 }}>
                <Box>
                    {stepperBlocks.map((b, index) => (
                        <Box key={'formsB' + index} hidden={!(activeStep === index)}>
                            {stepperBlocks[index]}
                        </Box>
                    ))}
                </Box>

                <MobileStepper
                    variant='text'
                    steps={maxSteps}
                    // position='bottom'
                    position={useMediaQuery(theme.breakpoints.only('xs')) ? 'bottom' : 'static'}
                    activeStep={activeStep}
                    sx={{ paddingTop: 2, paddingBottom: 4, paddingX: 0 }}
                    backButton={
                        <Button variant='contained' startIcon={<KeyboardArrowLeft />} onClick={handleBack} disabled={activeStep === 0} sx={{ textTransform: 'none' }}>
                            Voltar
                        </Button>
                    }
                    nextButton={
                        activeStep < maxSteps - 1 ? (
                            <Button variant='contained' endIcon={<KeyboardArrowRight />} onClick={handleNext} sx={{ textTransform: 'none' }} ref={nRef}>
                                Próximo
                            </Button>
                        ) : (
                            <Box>
                                <LoadingButton
                                    variant='contained'
                                    type='submit'
                                    loading={context.submiting}
                                    loadingPosition='start'
                                    startIcon={<SaveIcon />}
                                    onClick={(e) => nextCheck(e)}
                                    sx={{ textTransform: 'none', backgroundColor: '#22C55E', '&:hover': { backgroundColor: '#48cf7a' } }}
                                >
                                    <span>Salvar</span>
                                </LoadingButton>
                            </Box>
                        )
                    }
                />
            </Stack>
            <Snackbar
                open={canPass}
                autoHideDuration={3000}
                onClose={() => setCanPass(false)}
                anchorOrigin={{
                    horizontal: 'center',
                    vertical: 'bottom',
                }}
                resumeHideDuration={0}
            >
                <Alert severity='warning' onClose={(e) => setCanPass(false)}>
                    <Typography>Formulário incompleto!</Typography>
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default React.memo(Stepper)
