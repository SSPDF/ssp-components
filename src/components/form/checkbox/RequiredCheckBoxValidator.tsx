import React, { useContext } from 'react'
import { FormContext } from '../../../context/form'
import { Box, Grid, InputLabel, Paper, Typography } from '@mui/material'
import get from 'lodash.get'

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
        <Grid container sx={{ border: get(context.errors, props.name) ? '2px solid #a51c30' : '', padding: 1, borderRadius: 2 }}>
            <input
                type='text'
                {...context.formRegister(props.name, {
                    validate: (v, f) => {
                        const names = getChildrenNames(Array.isArray(props.children) ? props.children : [props.children])

                        let canContinue = false

                        names.forEach((x) => {
                            const nameValue = context.formGetValues(x)

                            if (nameValue) canContinue = true
                        })

                        if (!canContinue) return customText

                        return true
                    },
                })}
                hidden
            />
            {props.children}
            <Grid item xs={12}>
                <Typography sx={{ color: '#a51c30', fontSize: 16, paddingLeft: 1 }}>{get(context.errors, props.name)?.message as string}</Typography>
            </Grid>
        </Grid>
    )
}
