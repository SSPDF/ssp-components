import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import SaveIcon from '@mui/icons-material/Save'
import { LoadingButton } from '@mui/lab'
import { Alert, Box, Button, MobileStepper, Snackbar, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { FormEvent, ReactElement, useContext, useState } from 'react'
import { FormContext } from '../../../context/form'
import { FieldValues } from 'react-hook-form'

const getKeys = (values: any, id: number) => {
    if (!values || Object.keys(values).length <= 0) return []
    if (!values[id]) return []

    let keys = Object.keys(values[id]).map((x) => `${id}.${x}`)
    if (values.files) keys = [...keys, ...Object.keys(values.files).map((x) => `files.${x}`)]

    return keys
}

export function Stepper(props: { children: ReactElement | ReactElement[]; debugData?: (data: FieldValues) => void }) {
    const length = Array.isArray(props.children) ? props.children.length : 1
    const context = useContext(FormContext)!
    const theme = useTheme()

    const [activeStep, setActiveStep] = useState(0)

    const [canPass, setCanPass] = useState(false)

    const blocks = Array.isArray(props.children) ? props.children : [props.children]
    const stepperBlocks = blocks.map((x, idx) => {
        return React.cloneElement(x, { ...x.props, prefix: idx })
    })
    const maxSteps = length

    const handleNext = async () => {
        const result = await context.formTrigger(getKeys(context.formGetValues(), activeStep))

        if (!result) {
            setCanPass(true)
            console.log('teste: ', context.formGetValues())
            return
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const nextCheck = async (e: FormEvent) => {
        const result = await context!.formTrigger(getKeys(context.formGetValues(), activeStep))

        if (!result) {
            e.preventDefault()
            setCanPass(true)
            console.log('teste: ', context.formGetValues())
            return
        }
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    return (
        <Box>
            <Box sx={{ padding: 2, marginBottom: 10 }}>
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
                    position={useMediaQuery(theme.breakpoints.only('xs')) ? 'bottom' : 'static'}
                    activeStep={activeStep}
                    sx={{ paddingX: useMediaQuery(theme.breakpoints.only('xs')) ? 2 : 0, paddingTop: 2, paddingBottom: 4 }}
                    backButton={
                        <Button variant='contained' startIcon={<KeyboardArrowLeft />} onClick={handleBack} disabled={activeStep === 0} sx={{ textTransform: 'none' }}>
                            Back
                        </Button>
                    }
                    nextButton={
                        activeStep < maxSteps - 1 ? (
                            <Button variant='contained' endIcon={<KeyboardArrowRight />} onClick={handleNext} sx={{ textTransform: 'none' }}>
                                Next
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
            </Box>
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
