import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined'
import { Box, Grid, Stack } from '@mui/material'
import Typography from '@mui/material/Typography'
import React, { ReactElement, useContext } from 'react'
import Switch from '../switch/Switch'
import { FormContext } from '../../../context/form'

function childrenTree(component: ReactElement, prefix: number, idx: number): ReactElement {
    if (!component.props) return component

    const children = component.props.children as ReactElement | ReactElement[]

    if (!children)
        return React.cloneElement(component, {
            ...component.props,
            name: `${prefix}.${component.props.name}`,
            key: component.props.name ? `${prefix}.${component.props.name}` : `noListing-${idx}-${prefix}-${component.props.name}`,
        })

    let newChildren: ReactElement | ReactElement[]

    if (Array.isArray(children)) {
        let c: ReactElement[] = []

        children.forEach((x, cIdx: number) => {
            c.push(childrenTree(x, prefix, idx + (cIdx + 1)))
        })
        newChildren = c
    }
    //
    else {
        newChildren = childrenTree(children, prefix, idx + 1)
    }

    const newComponent = React.cloneElement(component, {
        ...component.props,
        children: newChildren,
        name: `${prefix}.${component.props.name}`,
        key: component.props.name ? `${prefix}.${component.props.name}` : `noListing-${idx}-${prefix}-${component.props.name}`,
    })

    return newComponent
}

interface StepperBlockProps {
    title: string
    prefix?: number
    children: JSX.Element | JSX.Element[]
    optional?: boolean
    optionalMessage?: string | JSX.Element
    overrideSwitchNo?: string
    overrideSwitchYes?: string
    defaultChecked?: boolean
}

export function StepperBlock({ optional = false, title, prefix = 0, optionalMessage, defaultChecked, ...props }: StepperBlockProps) {
    const context = useContext(FormContext)!
    const switchName = `switch-${prefix}`

    const fields = Array.isArray(props.children) ? props.children : [props.children]
    const cloneChildren = fields.map((x, index) => {
        return x && childrenTree(x, prefix, index)
    })

    return (
        <Box>
            <Grid size={12}>
                <Stack direction='row' justifyContent='space-between'>
                    <Stack direction='row' spacing={2}>
                        <Box sx={{ marginTop: 0.6 }}>
                            <Stack sx={{ backgroundColor: '#E6F8EB', borderRadius: '100%', height: '35px', width: '35px' }} justifyContent='center' alignItems='center'>
                                <ContentPasteOutlinedIcon sx={{ height: '18px', fill: '#01BA35' }} />
                            </Stack>
                        </Box>
                        <Typography
                            variant='h6'
                            fontWeight={600}
                            fontSize={28}
                            fontFamily='Inter'
                            sx={{
                                color: '#1E293B',
                                paddingBottom: 4,
                            }}
                        >
                            {title}
                        </Typography>
                    </Stack>
                    <Box hidden={!optional}>
                        <Switch name={switchName} defaultChecked={optional ? defaultChecked : true} overrideNo={props.overrideSwitchNo} overrideYes={props.overrideSwitchYes} />
                    </Box>
                </Stack>
            </Grid>
            <Stack spacing={2}>
                {!optional ? (
                    <Grid container spacing={1}>
                        {cloneChildren}
                    </Grid>
                ) : !context.formWatch(switchName) ? (
                    <Stack justifyContent='center' alignItems='center'>
                        <Typography fontFamily='Inter' fontSize={22} paddingY={8} textAlign='center'>
                            {optionalMessage ? (
                                optionalMessage
                            ) : (
                                <>
                                    <b>{title}</b> é opcional. <br />
                                    Marque a opção acima caso haja necessidade.
                                </>
                            )}
                        </Typography>
                    </Stack>
                ) : (
                    <Grid container spacing={1}>
                        {cloneChildren}
                    </Grid>
                )}
            </Stack>
        </Box>
    );
}

export default React.memo(StepperBlock)
