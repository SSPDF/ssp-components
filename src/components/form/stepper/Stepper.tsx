import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import SaveIcon from '@mui/icons-material/Save'
import { LoadingButton } from '@mui/lab'
import { Box, Button, MobileStepper, Stack, useMediaQuery, useTheme } from '@mui/material'
import React, { FormEvent, ReactElement, useContext, useRef, useState } from 'react'
import { FieldValues } from 'react-hook-form'
import { toast } from 'react-toastify'
import { FormContext } from '../../../context/form'
import { SspComponentsProvider } from '../../providers/SspComponentsProvider'
import CheckBox from '../checkbox/CheckBox'
import CheckBoxWarning from '../checkbox/CheckBoxWarning'
import RequiredCheckBoxGroup from '../checkbox/RequiredCheckBoxValidator'
import DatePicker from '../date/DatePicker'
import TimePicker from '../date/TimePicker'
import DropFileUpload from '../file/DropFileUpload'
import FileUpload from '../file/FileUpload'
import { Input } from '../input/Input'
import MultInput from '../input/MultInput'
import Table from '../table/Table'
import { StepperBlock } from './StepperBlock'

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

export function Teste() {
    return (
        <Box bgcolor='#F9F9F9' py={4}>
            {/* <NewTable
                    fetchFunc={() => fetch('http://localhost:7171/table')}
                    useKC={false}
                    tableName='Teste'
                    columns={[
                        {
                            keyName: 'protocolo',
                            title: 'Procolo',
                        },
                    ]}
                    action={() => <></>}
                    columnSize={8}
                /> */}
            <Table
                fetchFunc={() => fetch('http://localhost:7171/table')}
                useKC={false}
                tableName='Teste'
                columns={[
                    {
                        keyName: 'protocolo',
                        title: 'Procolo',
                    },
                    {
                        keyName: 'titulo',
                        title: 'Titulo',
                    },
                    {
                        keyName: 'local',
                        title: 'Local',
                    },
                    {
                        keyName: 'data_abertura',
                        title: 'Data Abertura',
                    },
                    {
                        keyName: 'movimentacao_ultimo_estado',
                        title: 'Movimentacao_ultimo_estado',
                    },
                    {
                        keyName: 'estado',
                        title: 'Estado',
                    },
                ]}
                action={() => <></>}
                filters={{
                    protocolo: [
                        {
                            keyName: 'protocolo',
                            name: 'Protocolo',
                            type: 'a-z',
                        },
                    ],
                }}
                columnSize={6}
            />
        </Box>
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
            toast('Formulário incompleto!', { type: 'warning', theme: 'light' })
            return
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const nextCheck = async (e: FormEvent) => {
        const result = await context!.formTrigger(getKeys(context.formGetValues(), activeStep))

        if (!result) {
            e.preventDefault()

            toast('Formulário incompleto!', { type: 'warning', theme: 'light' })
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
        </Box>
    )
}

export default React.memo(Stepper)
