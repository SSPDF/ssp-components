import { Button, Grid, Stack, Typography } from '@mui/material'
import { FileDownload } from '@mui/icons-material'
import React, { useContext } from 'react'
import { AuthContext } from '../../context/auth'

export function File({ title, name, md, fileURL, fileExt = 'pdf' }: { title: string; fileURL: string; name: string; md?: number; fileExt?: string }) {
    const { user } = useContext(AuthContext)

    return (
        <Grid paddingBottom={3} paddingRight={3} {...{ md }}>
            <Stack
                spacing={1}
                sx={{
                    backgroundColor: '#F8FAFC',
                    paddingY: 1,
                    paddingX: 3,
                    borderRadius: 2,
                    border: 1,
                    borderColor: '#CBD5E1',
                }}
            >
                <Typography fontWeight={600} sx={{ textAlign: 'center' }}>
                    {title}
                </Typography>
                <Stack direction='row' spacing={2} alignItems='center'>
                    <FileDownload sx={{ fill: 'red' }} />
                    <Typography>{name}</Typography>
                </Stack>
                <Stack alignItems='center'>
                    <Button
                        variant='outlined'
                        color='error'
                        size='small'
                        endIcon={<FileDownload />}
                        onClick={() =>
                            fetch(fileURL, {
                                method: 'GET',
                                headers: {
                                    Authorization: `Bearer ${user?.token}`,
                                },
                            })
                                .then((res) => res.blob())
                                .then((blob) => {
                                    var file = window.URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = file

                                    a.download = name.split('.')[0] + `.${fileExt}`
                                    a.click()
                                })
                        }
                    >
                        Baixar
                    </Button>
                </Stack>
            </Stack>
        </Grid>
    )
}
