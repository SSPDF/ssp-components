import React from 'react'
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
import { Box } from '@mui/material'
import Table from '../form/table/Table'

import '../../css/globals.css'

const token = `eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKdWI2dTBpX2JmQjd3OVdnX1VBQkxrMDA2ajRSa2FhamU0SFU4NHNFdEtBIn0.eyJleHAiOjE3MDg5Nzk4OTksImlhdCI6MTcwODk3NjkzMiwiYXV0aF90aW1lIjoxNzA4OTc2ODk5LCJqdGkiOiIwYzUxMDIwYi1lNGExLTRiNmItYjVmMS1kMmM5MzU3MzdkNTMiLCJpc3MiOiJodHRwczovL2htZ3Npc3RlbWFzZXh0ZXJub3Muc3NwLmRmLmdvdi5ici9rZXljbG9hay9yZWFsbXMvZXZlbnRvcyIsImF1ZCI6WyJldmVudG8tZnJvbnQtZGV2IiwiZXZlbnRvcy1iYWNrZW5kLWRldiIsImV2ZW50b3MtYmFja2VuZCJdLCJzdWIiOiJjZTE0YTE3Yi1jZWI3LTRlYjUtOTk2Yy1iMGMyNTVmM2QyNmMiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJldmVudG9zLWZyb250Iiwibm9uY2UiOiIxMzRiNzNkNi0xNTM2LTQ0MDgtODVjOS0zYWRiZDUwOTI0ZGMiLCJzZXNzaW9uX3N0YXRlIjoiZjE1NmUzZTUtMDhiYS00ZmNmLWFiZDktMjNmYmQ4YThlOTE5IiwiYWNyIjoiMCIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2htZ2V2ZW50b3NleHRlcm5vLnNzcC5kZi5nb3YuYnIiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbInZpZXdlciIsImNhZGFzdHJvLWFjYW8tZXZlbnRvcyIsImFkbWluIiwidXNlciIsImV2ZW50b3NfaW9hLXBtZGYiXX0sInJlc291cmNlX2FjY2VzcyI6eyJldmVudG8tZnJvbnQtZGV2Ijp7InJvbGVzIjpbImNhZGFzdHJvLWFjYW8tZXZlbnRvcyIsImV2ZW50b3MtdXNlciIsImV2ZW50b3Mtdmlld2VyIiwiZXZlbnRvcy1hZG1pbiJdfSwiZXZlbnRvcy1mcm9udCI6eyJyb2xlcyI6WyJjYWRhc3Ryby1hY2FvLWV2ZW50b3MiLCJldmVudG9zLXVzZXIiLCJldmVudG9zLXZpZXdlciIsImV2ZW50b3MtYWRtaW4iXX0sImV2ZW50b3MtYmFja2VuZC1kZXYiOnsicm9sZXMiOlsiY2FkYXN0cm8tYWNhby1ldmVudG9zIiwiZXZlbnRvcy11c2VyIiwiZXZlbnRvcy12aWV3ZXIiLCJldmVudG9zLWFkbWluIl19LCJldmVudG9zLWJhY2tlbmQiOnsicm9sZXMiOlsiY2FkYXN0cm8tYWNhby1ldmVudG9zIiwiZXZlbnRvcy11c2VyIiwiZXZlbnRvcy12aWV3ZXIiLCJldmVudG9zLWFkbWluIl19fSwic2NvcGUiOiJvcGVuaWQgcGhvbmUgcHJvZmlsZSBlbWFpbCIsInNpZCI6ImYxNTZlM2U1LTA4YmEtNGZjZi1hYmQ5LTIzZmJkOGE4ZTkxOSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IlBlZGluIDA1NTE5NDI5MTYyIiwicGhvbmVfbnVtYmVyIjoiNjE5OTMwNTg0MjMiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiIwNTUxOTQyOTE2MiIsImdpdmVuX25hbWUiOiJQZWRpbiIsImZhbWlseV9uYW1lIjoiMDU1MTk0MjkxNjIiLCJlbWFpbCI6ImdhaXRhY2hpMEBnbWFpbC5jb20ifQ.jdPY6UxGy2WSDZQvMi_gUo0bqprqAUMC0TEfxyt-TGutB3Bx7uoDiDb6Sv7VR4yb1tmOEC4DPtIsbn_dZRmcUjimCfrMFU67u_KWdvUa8-QeIZGWOnfSZCjH7gA_lph4r-7nRMETD1iDF73vxdhT4uRHMajK1VzGNxCtQL0qLPMoxkSLBiEDEnIJi1zFg_J27rb4UirAJ4O3AKFgmdYYm4csvasmEZftU1123KnJhWvO31W-CEvONxySeuVD4SL1mWdUSe9tuBS__4PPkVaJ7L8IXuVTGij6O6DnxNy14HRFs1ZmWw3Pjh1KgRtEiFIRcAsNeTugWBInQk6GcSP7uA`

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

export default function Teste() {
    return (
        <Box bgcolor='#F9F9F9' py={4}>
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
                        title: 'Movimentacao',
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