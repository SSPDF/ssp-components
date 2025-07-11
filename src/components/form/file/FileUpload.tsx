import CameraAltIcon from '@mui/icons-material/CameraAlt'
import ClearIcon from '@mui/icons-material/Clear'
import Delete from '@mui/icons-material/Delete'
import DoneIcon from '@mui/icons-material/Done'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import PictureAsPdf from '@mui/icons-material/PictureAsPdf'
import { Box, Button, CircularProgress, Grid, InputLabel, Paper, TableContainer, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Stack } from '@mui/system'
import get from 'lodash.get'
import React, { FormEvent, useCallback, useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../context/auth'
import { FormContext } from '../../../context/form'

interface FileState {
    id: number
    name: string
    loading: boolean
    error: boolean
    file: File
}

function bytesToMegabytes(bytes: number): number {
    const megabytes = bytes / (1024 * 1024)
    return megabytes
}

export default function FileUpload({
    name,
    tipoArquivo,
    title,
    required = false,
    multiple = false,
    apiURL,
    route = '',
    sizeLimit = 4,
    xs = 12,
    sm,
    md,
}: {
    name: string
    tipoArquivo: string
    title: string
    apiURL: string
    route?: string
    required?: boolean
    multiple?: boolean
    sizeLimit?: number
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
    // const [filesError, setFilesError] = useState<number[]>([])

    const [errorMsg, setErrorMsg] = useState('')

    const onFile = useCallback(
        (e: FormEvent) => {
            const newFiles = (e.target as HTMLInputElement).files!
            const filesTo = Object.keys(newFiles).map((key: number | string) => newFiles[key as number])

            setFiles([
                ...files,
                ...filesTo
                    .filter((file) => {
                        if (bytesToMegabytes(file.size) > sizeLimit) {
                            setErrorMsg(`Por favor, escolha um arquivo com tamanho inferior a ${sizeLimit} MB`)

                            setTimeout(() => {
                                setErrorMsg('')
                            }, 3000)

                            return false
                        }

                        return true
                    })
                    .map((file, index) => {
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
                                if (!res.ok) {
                                    removeFile(id)
                                    return
                                }

                                res.json().then((j: any) => {
                                    if (j.status && j.status.status === 200) {
                                        const fileIdFromApi = get(j, route, j)[0]
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
                                        removeFile(id)
                                    }
                                })
                            })
                            .catch((err) => {
                                removeFile(id)
                            })

                        return { id: id, name: file.name, loading: true, error: false, file: file }
                    }),
            ])
        },
        [files, context]
    )

    const removeFile = (id: number, hideMsg?: boolean, fileId?: number) => {
        setFiles(files.filter((x) => x.id !== id))

        if (fileId) context.setFilesUid((fId) => fId.filter((idd) => idd.CO_SEQ_ARQUIVO !== fileId))

        if (!hideMsg) {
            setErrorMsg('Erro ao enviar arquivo. Tente novamente mais tarde')

            setTimeout(() => {
                setErrorMsg('')
            }, 3000)
        }
    }

    const deleteFile = (e: FormEvent, id: number) => {
        if (Object.keys(fileIds).includes(id.toString())) {
            fetch(`${apiURL}/${fileIds[id]}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            })
                .then((res) => {
                    if (!res.ok) removeFile(id, true, fileIds[id])

                    if (res.status === 200) {
                        removeFile(id, true, fileIds[id])
                    }
                })
                .catch((err) => console.log(err))
        }
    }

    useEffect(() => {
        const dt = new DataTransfer()

        files.forEach((x) => {
            dt.items.add(x.file)
        })

        context?.formSetValue(name!, dt.files)
    }, [files, context, name])

    useEffect(() => {
        return () => {
            context.setFilesUid((files) => files.filter((x) => x.CO_TIPO_ARQUIVO !== parseInt(tipoArquivo)))
        }
    }, [])

    return (
        <Grid
            sx={{ width: '100%' }}
            size={{
                xs: xs,
                sm: sm,
                md: md
            }}>
            <InputLabel required={required} sx={{ marginBottom: 2, textTransform: 'capitalize' }}>
                {title}
            </InputLabel>
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
                                            {filesLoaded.includes(x.id) ? <DoneIcon sx={{ fill: '#06d6a0' }} /> : <CircularProgress size={22} sx={{ color: 'black' }} />}
                                            <PictureAsPdf color='error' />
                                            <Typography fontWeight={600}>{x.name}</Typography>
                                        </Stack>
                                    </Box>
                                    <Box>
                                        {filesLoaded.includes(x.id) && (
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
                {errorMsg && (
                    <>
                        <Typography variant='caption' color='#e53935' fontWeight={600} fontSize={14} paddingTop={2}>
                            {errorMsg}
                        </Typography>
                        <br />
                    </>
                )}
                {get(context?.errors, name!) && (
                    <Typography variant='caption' color='#e53935' fontWeight={600} fontSize={14}>
                        * O campo de arquivo é obrigatório
                    </Typography>
                )}
            </Box>
        </Grid>
    );
}
