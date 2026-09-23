import { Alert, Box, Button, Container, Divider, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { DatePicker, FormProvider, GenericFormProvider, GenericInput, Input, MODAL, Table } from '@ssplib/react-components'

/**
 * Página de fumaça: exercita os dois sistemas de formulário, a tabela, o
 * date picker e o modal — tudo com o MUI vindo DESTE app, não da lib.
 */

const dadosTabela = [
    { id: '1', nome: 'Maria Souza', data: '10/03/2025', status: 'ATIVO' },
    { id: '2', nome: 'João Lima', data: '11/03/2025', status: 'INATIVO' },
]

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
    return (
        <Paper variant='outlined' sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom>
                {titulo}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {children}
        </Paper>
    )
}

/**
 * Os componentes `Generic*` consomem o contexto nativo do react-hook-form, que o
 * `GenericFormProvider` da lib fornece (exportado a partir da 0.1.0 — ver
 * UPGRADE_PLAN.md 5.10).
 */
function FormularioRhf({ onSubmit, enviado }: { onSubmit: (d: unknown) => void; enviado: unknown }) {
    return (
        <GenericFormProvider onSubmit={onSubmit}>
            <Stack spacing={2}>
                <GenericInput name='email' type='email' title='E-mail' required />
                <Button type='submit' variant='contained'>
                    Enviar
                </Button>
                {!!enviado && <pre>{JSON.stringify(enviado, null, 2)}</pre>}
            </Stack>
        </GenericFormProvider>
    )
}

export default function Home() {
    const [enviadoCustom, setEnviadoCustom] = useState<unknown>(null)
    const [enviadoRhf, setEnviadoRhf] = useState<unknown>(null)

    return (
        <Container maxWidth='md' sx={{ py: 5 }}>
            <Stack spacing={3}>
                <Box>
                    <Typography variant='h4'>smoke-app</Typography>
                    <Typography color='text.secondary'>@ssplib/react-components consumido como um app real consome.</Typography>
                </Box>

                <Alert severity='info'>
                    Os botões e bordas abaixo precisam estar <b>roxos</b> (#6d28d9, o tema deste app). Se aparecerem azuis, há duas cópias de @mui/material na árvore e o ThemeProvider do app não
                    está alcançando os componentes da lib.
                </Alert>

                <Secao titulo='FormProvider + Input (contexto customizado)'>
                    <FormProvider onSubmit={(d) => setEnviadoCustom(d)}>
                        <Stack spacing={2}>
                            <Input name='nome' type='input' title='Nome' required />
                            <Input name='cpf' type='cpf' title='CPF' />
                            <Input name='celular' type='phone' title='Celular' />
                            <DatePicker name='dataFato' title='Data do fato' />
                            <Button type='submit' variant='contained'>
                                Enviar
                            </Button>
                            {!!enviadoCustom && <pre>{JSON.stringify(enviadoCustom, null, 2)}</pre>}
                        </Stack>
                    </FormProvider>
                </Secao>

                <Secao titulo='GenericInput (contexto do react-hook-form)'>
                    <FormularioRhf onSubmit={setEnviadoRhf} enviado={enviadoRhf} />
                </Secao>

                <Secao titulo='Table com dados estáticos'>
                    <FormProvider onSubmit={() => {}}>
                        <Table
                            id='tabela-fumaca'
                            tableName='Pessoa'
                            useKC={false}
                            columnSize={6}
                            itemCount={10}
                            initialData={dadosTabela}
                            columns={[
                                { keyName: 'id', title: 'id' },
                                { keyName: 'nome', title: 'Nome' },
                                { keyName: 'data', title: 'Data' },
                                { keyName: 'status', title: 'Status' },
                            ]}
                            action={() => (
                                <Button size='small' variant='contained'>
                                    detalhes
                                </Button>
                            )}
                        />
                    </FormProvider>
                </Secao>

                <Secao titulo='MODAL'>
                    <Button
                        variant='contained'
                        onClick={() =>
                            MODAL.open(
                                <Stack spacing={1} sx={{ p: 3, bgcolor: 'white', borderRadius: 2 }}>
                                    <Typography variant='h6'>Modal da lib</Typography>
                                    <Typography>Renderizado pelo portal do SspComponentsProvider.</Typography>
                                </Stack>,
                            )
                        }
                    >
                        Abrir modal
                    </Button>
                </Secao>
            </Stack>
        </Container>
    )
}
