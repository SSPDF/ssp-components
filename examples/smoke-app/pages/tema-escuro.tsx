import { Container, Grid } from '@mui/material'
import { CheckBox, FormProvider, Input, Table } from '@ssplib/react-components'

/**
 * Campos e tabela da lib sob o tema escuro com variáveis CSS (ver `_app.tsx`). O
 * `verificar-tema-escuro.cjs` lê o HTML que o `next build` gerou para esta página.
 */
export default function TemaEscuro() {
    return (
        <Container sx={{ py: 4 }}>
            <FormProvider onSubmit={() => {}}>
                <Grid container spacing={2}>
                    <Input name='nome' title='Nome' md={6} />
                    <CheckBox name='aceite' title='Li e aceito' md={6} />
                </Grid>
                <Table id='tema-escuro' tableName='Pessoa' useKC={false} columnSize={4} initialData={[{ id: '1', nome: 'Maria' }]} columns={[{ keyName: 'nome', title: 'Nome' }]} action={() => null} />
            </FormProvider>
        </Container>
    )
}
