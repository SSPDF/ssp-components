import React, { useContext } from 'react'
import { FormContext } from '../../../context/form'
import { Box, Grid, InputLabel, Paper, Typography } from '@mui/material'
import get from 'lodash.get'
import { ElevatorSharp } from '@mui/icons-material'

function getChildrenNames(children: JSX.Element[]): string[] {
    console.log('ENTROU NO getChildrenNames')
    let arr: string[] = []

    children.forEach((x) => {
        console.log('ENTROU NO forEach DO getChildrenNames - VALOR DE x: ', x)
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
                            console.log("todos os value", context.formGetValues())
                                console.log("Erro validação");
                                console.log("names", names);
                                console.log("x", x);
                                console.log('i', i)
                                console.log("nameValue", nameValue);


                                console.log('Erro validação')

                            

                            console.log(`ENTROU NO forEach DO return - VALOR DE names: ${names} - VALOR ATUAL: ${x} - INDEX: ${i}`)
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
