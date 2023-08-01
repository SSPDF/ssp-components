import CameraAltIcon from '@mui/icons-material/CameraAlt'
import ClearIcon from '@mui/icons-material/Clear'
import Delete from '@mui/icons-material/Delete'
import DoneIcon from '@mui/icons-material/Done'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import PictureAsPdf from '@mui/icons-material/PictureAsPdf'
import { Box, Button, CircularProgress, FormLabel, Grid, Paper, TableContainer, Typography, useMediaQuery } from '@mui/material'
import { Stack } from '@mui/system'
import get from 'lodash.get'
import React, { FormEvent, useCallback, useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../context/auth'
import { FormContext } from '../../../context/form'
import { useTheme } from '@mui/material'

interface FileState {
    id: number
    name: string
    loading: boolean
    error: boolean
    file: File
}

export default function FileUpload({
    name,
    tipoArquivo,
    title,
    required = false,
    multiple = false,
    apiURL,
    xs = 12,
    sm,
    md,
}: {
    name: string
    tipoArquivo: string
    title: string
    apiURL: string
    required?: boolean
    multiple?: boolean
    xs?: number
    sm?: number
    md?: number
}) {
    const context = useContext(FormContext)!
    const { user } = useContext(AuthContext)

    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.only('xs'))

    const [files, setFiles] = useState<FileState[]>([])
    const [filesLoaded, setFilesLoaded] = useState<number[]>([])
    const [fileIds, setFilesIds] = useState<{ [key: number]: number }>({})
    const [filesError, setFilesError] = useState<number[]>([])

    const onFile = useCallback(
        (e: FormEvent) => {
            const newFiles = (e.target as HTMLInputElement).files!
            const filesTo = Object.keys(newFiles).map((key: number | string) => newFiles[key as number])

            setFiles([
                ...files,
                ...filesTo.map((file, index) => {
                    let id: number = Date.now() + index

                    // fetch API

                    const fd = new FormData()

                    fd.append('files', file)
                    fd.append('tipoArquivo', tipoArquivo)

                    fetch(apiURL, {
                        method: 'POST',
                        body: fd,
                        headers: {
                            Authorization: `Bearer ${user ? user.token : ''}`,
                        },
                    })
                        .then((res) => {
                            if (!res.ok) setFilesError((fl) => [...fl, id])

                            res.json().then((j: any) => {
                                if (j.status && j.status.status === 200) {
                                    const fileIdFromApi = j.data[0]
                                    const fileId: number = fileIdFromApi['coSeqArquivo']

                                    context.setFilesUid((fId) => [
                                        ...fId,
                                        {
                                            CO_SEQ_ARQUIVO: fileId,
                                            CO_TIPO_ARQUIVO: parseInt(tipoArquivo),
                                        },
                                    ])
                                    setFilesLoaded((fl) => [...fl, id])

                                    const f: { [key: number]: number } = {}
                                    f[id] = fileId
                                    setFilesIds((ids) => ({ ...ids, ...f }))
                                } else {
                                    setFilesError((fl) => [...fl, id])
                                }
                            })
                        })
                        .catch((err) => console.log(err))

                    return { id: id, name: file.name, loading: true, error: false, file: file }
                }),
            ])
        },
        [files, context]
    )

    const deleteFile = (e: FormEvent, id: number) => {
        if (filesError.includes(id)) {
            setFiles(files.filter((x) => x.id !== id))
            context.setFilesUid((fId) => fId.filter((idd) => idd.CO_SEQ_ARQUIVO !== id))
            return
        }

        if (Object.keys(fileIds).includes(id.toString())) {
            fetch(`${apiURL}/${fileIds[id]}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            })
                .then((res) => {
                    if (res.status === 200) {
                        setFiles(files.filter((x) => x.id !== id))
                        context.setFilesUid((fId) => fId.filter((idd) => idd.CO_SEQ_ARQUIVO !== id))
                    }
                })
                .catch((err) => console.log(err))
        }
    }

    useEffect(() => {
        const dt = new DataTransfer()

        files
            .filter((x) => !filesError.includes(x.id))
            .forEach((x) => {
                dt.items.add(x.file)
            })

        context?.formSetValue(name!, dt.files)
    }, [files, context, filesError, name])

    useEffect(() => {
        return () => {
            context.setFilesUid((files) => files.filter((x) => x.CO_TIPO_ARQUIVO !== parseInt(tipoArquivo)))
        }
    }, [])

    return (
        <Grid item {...{ xs, sm, md }} sx={{ width: '100%' }}>
            <FormLabel required={required} sx={{ marginBottom: 2, textTransform: 'capitalize' }}>
                {title}
            </FormLabel>
            <Box sx={{ backgroundColor: '#e2eafc', padding: 1, borderRadius: 1, marginTop: 1 }}>
                <input
                    id={name}
                    type='file'
                    multiple={multiple}
                    {...context?.formRegister(name!, {
                        validate: (v, f) => {
                            if ((v.length && filesLoaded.length) <= 0 && required) return 'O campo de arquivo é obrigatório'
                        },
                    })}
                    onChange={onFile}
                    accept='.pdf'
                    style={{ display: 'none' }}
                />
                <input
                    id={name + 'foto'}
                    type='file'
                    capture='environment'
                    multiple={multiple}
                    {...context?.formRegister(name!, {
                        validate: (v, f) => {
                            if ((v.length && filesLoaded.length) <= 0 && required) return 'O campo de arquivo é obrigatório'
                        },
                    })}
                    onChange={onFile}
                    accept='.jpg, .png, .jpeg'
                    style={{ display: 'none' }}
                />
                <Box
                    sx={{
                        display: {
                            sx: 'block',
                            md: 'flex',
                        },
                    }}
                >
                    <Box sx={{ width: '100%', marginRight: { xs: 0, md: 1 }, marginBottom: { xs: 1, md: 0 } }}>
                        {!multiple && files.length >= 1 ? (
                            <Button disabled={true} variant='contained' disableElevation startIcon={<InsertDriveFileIcon />} component='span' sx={{ textTransform: 'none' }} fullWidth>
                                Escolher Documento
                            </Button>
                        ) : (
                            <label htmlFor={name}>
                                <Button variant='contained' disableElevation startIcon={<InsertDriveFileIcon />} component='span' sx={{ textTransform: 'none' }} fullWidth>
                                    Escolher Documento
                                </Button>
                            </label>
                        )}
                    </Box>
                    <Box sx={{ width: '100%' }}>
                        {!multiple && files.length >= 1 ? (
                            <Button
                                disabled={true}
                                variant='contained'
                                disableElevation
                                startIcon={<CameraAltIcon />}
                                component='span'
                                sx={{ textTransform: 'none', backgroundColor: '#0096c7' }}
                                fullWidth
                            >
                                {isSmall ? 'Tirar Foto' : 'Escolher Imagem'}
                            </Button>
                        ) : (
                            <label htmlFor={name + 'foto'}>
                                <Button variant='contained' disableElevation startIcon={<CameraAltIcon />} component='span' sx={{ textTransform: 'none', backgroundColor: '#0096c7' }} fullWidth>
                                    {isSmall ? 'Tirar Foto' : 'Escolher Imagem'}
                                </Button>
                            </label>
                        )}
                    </Box>
                </Box>
                <Typography fontWeight={600} paddingY={1} color='black'>
                    Você selecionou {files.length} arquivo{files.length > 1 && 's'}
                </Typography>
                {files.length > 0 && (
                    <TableContainer component={Paper}>
                        <Stack direction='column'>
                            {files.map((x) => (
                                <Stack key={x.name} direction='row' justifyContent='space-between' padding={0.5}>
                                    <Box>
                                        <Stack direction='row' spacing={2}>
                                            {filesLoaded.includes(x.id) ? (
                                                <DoneIcon sx={{ fill: '#06d6a0' }} />
                                            ) : filesError.includes(x.id) ? (
                                                <ClearIcon sx={{ fill: 'red' }} />
                                            ) : (
                                                <CircularProgress size={22} sx={{ color: 'black' }} />
                                            )}
                                            <PictureAsPdf color='error' />
                                            <Typography fontWeight={600}>{x.name}</Typography>
                                        </Stack>
                                    </Box>
                                    <Box>
                                        {(filesLoaded.includes(x.id) || filesError.includes(x.id)) && (
                                            <Button
                                                variant='contained'
                                                size='small'
                                                sx={{ textTransform: 'none', backgroundColor: '#d1495b', '&:hover': { backgroundColor: '#c1121f' } }}
                                                onClick={(e) => deleteFile(e, x.id)}
                                                startIcon={<Delete />}
                                            >
                                                Remover
                                            </Button>
                                        )}
                                    </Box>
                                </Stack>
                            ))}
                        </Stack>
                    </TableContainer>
                )}
                {get(context?.errors, name!) && (
                    <Typography variant='caption' color='#e53935' fontWeight={600} fontSize={14} paddingTop={2}>
                        * O campo de arquivo é obrigatório
                    </Typography>
                )}
            </Box>
        </Grid>
    )
}
