import React, { useContext } from 'react'
import { FormContext } from '../../../context/form'
import { Box, Grid, InputLabel, Paper, Typography } from '@mui/material'
import get from 'lodash.get'
import { ElevatorSharp, ErrorOutline } from '@mui/icons-material'

function getChildrenNames(children: JSX.Element[]): string[] {
    let arr: string[] = []

    children.forEach((x) => {
        if (!x.props) return

        if (x.props.children) {
            const childrenArr = getChildrenNames(Array.isArray(x.props.children) ? x.props.children : [x.props.children])
            arr = arr.concat(childrenArr)
            return
        }

        if (x.props.name) {
            arr.push(x.props.name as string)
            return
        }
    })

    return arr
}

export default function RequiredCheckBoxGroup({ customText = 'Selecione pelo menos 1 opção', ...props }: { name: string; children: JSX.Element | JSX.Element[]; customText?: string }) {
    const context = useContext(FormContext)!

    return (
        <Grid container sx={{ border: get(context.errors, props.name) ? '2px solid #d32f2f' : '', padding: 1, borderRadius: 2 }}>
            <input
                key={1}
                type='text'
                {...context.formRegister(props.name, {
                    validate: (v, i) => {
                        const names = getChildrenNames(Array.isArray(props.children) ? props.children : [props.children])

                        let canContinue = false

                        names.forEach((x, i) => {
                            const nameValue = context.formGetValues(x)

                            if (nameValue) {
                                canContinue = true
                            }

                        })

                        if (!canContinue) return customText

                        return true
                    },
                })}
                hidden
            />
            {props.children}
            {get(context.errors, props.name) && (
                <Grid item xs={12}>
                    <Box
                        sx={{
                            backgroundColor: '#FFEBEE',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            marginTop: 1,
                            border: '1px solid #FFCDD2',
                            color: 'error.main',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <ErrorOutline fontSize='small' />
                        <Typography variant='caption' color='inherit' fontWeight={600} fontSize={14}>
                            {get(context.errors, props.name)?.message as string}
                        </Typography>
                    </Box>
                </Grid>
            )}
        </Grid>
    )
}
