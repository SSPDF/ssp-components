import React, { FormEvent, useContext, useEffect } from 'react'
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
import DropFileUpload from '../form/file/DropFileUpload'
import { Box, Button } from '@mui/material'
import Table from '../form/table/Table'

import '../../css/globals.css'
import FetchAutoComplete from '../form/input/FetchAutoComplete'
import { PDFIcon, TrashIcon } from '../icons/icons'
import { MODAL } from '../modal/Modal'
import FormProvider from '../providers/FormProvider'
import { toast } from 'react-toastify'
import { FormContext } from '../../context/form'
import NavBar from '../navbar/NavBar'
import TabNavBar from '../navbar/TabNavBar'

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

export default function Teste() {
    return (
        <Box bgcolor='#F9F9F9' py={4}>
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
            />
            <TabNavBar
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

            <Table
                fetchFunc={() => fetch('http://localhost:7171/table')}
                useKC={false}
                tableName='Teste'
                columns={[
                    {
                        keyName: 'CO_SEQ_DEVOLUTIVA_CADASTRO',
                        title: 'Procolo',
                    },
                ]}
                action={() => <></>}
                filters={{
                    dt: [
                        {
                            keyName: 'DT_DEMANDA',
                            name: 'Intervalo de data',
                            type: 'date-interval',
                        },
                    ],
                }}
                columnSize={6}
            />
        </Box>
    )
}
