import React, { useContext, useEffect, useState } from 'react'
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

export default function RequiredCheckBoxGroup({
    customText = 'Selecione pelo menos 1 opção',
    ...props
}: {
    name: string
    children: JSX.Element
    customText?: string
    content: JSX.Element | JSX.Element[]
    nameList: string[]
}) {
    const [firstTime, setFirstTime] = useState(false)
    const [showAfterFirst, setAfterFirst] = useState(true)

    const context = useContext(FormContext)!
    const children = React.cloneElement(props.children, {
        onChange: () => {
            if (firstTime) {
                const name = children.props.name as string
                const value = !context.formGetValues(name)

                if (value) setAfterFirst(false)
            }
        },
    })

    return (
        <Grid container sx={{ padding: 1, borderRadius: 2 }}>
            <input
                type='text'
                {...context.formRegister(props.name, {
                    validate: (v, f) => {
                        if (firstTime && showAfterFirst) return true
                        const names = getChildrenNames(Array.isArray(props.children) ? props.children : [props.children])

                        let canContinue = false

                        names.forEach((x) => {
                            const nameValue = context.formGetValues(x)

                            if (nameValue) canContinue = true
                        })

                        if (!canContinue) {
                            setFirstTime(true)
                            setAfterFirst(true)

                            return customText
                        }

                        return true
                    },
                })}
                hidden
            />
            {children}
            <Grid item xs={12}>
                {firstTime && showAfterFirst && (
                    <>
                        <Typography sx={{ color: '#a51c30', fontSize: 16 }}>Você tem a opção de baixar e preencher o termo e enviar</Typography>
                        {props.content}
                    </>
                )}
            </Grid>
        </Grid>
    )
}
