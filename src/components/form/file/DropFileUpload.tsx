import CameraAltIcon from '@mui/icons-material/CameraAlt'
import ClearIcon from '@mui/icons-material/Clear'
import Delete from '@mui/icons-material/Delete'
import DoneIcon from '@mui/icons-material/Done'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import PictureAsPdf from '@mui/icons-material/PictureAsPdf'
import { Box, Button, CircularProgress, Grid, InputLabel, LinearProgress, LinearProgressProps, Paper, TableContainer, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Stack } from '@mui/system'
import get from 'lodash.get'
import React, { FormEvent, useCallback, useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../context/auth'
import { FormContext } from '../../../context/form'
import { useDropzone } from 'react-dropzone'
import axios, { AxiosProgressEvent, AxiosResponse } from 'axios'

interface FileState {
    id: number
    name: string
    size: number
    loading: boolean
    error: boolean
    file: File
}

function bytesToMegabytes(bytes: number): number {
    const megabytes = bytes / (1024 * 1024)
    return megabytes
}

function bytesToKBorMB(bytes: number): string {
    const KB = 1024
    const MB = 1024 * KB

    if (bytes < MB) {
        const KBValue = bytes / KB
        return `${KBValue.toFixed(1)}KB`
    } else {
        const MBValue = bytes / MB
        return `${MBValue.toFixed(1)}MB`
    }
}

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant='determinate' {...props} />
            </Box>
            <Box sx={{ minWidth: 3 }}>
                <Typography variant='body2' color='text.secondary'>{`${Math.round(props.value)}%`}</Typography>
            </Box>
        </Box>
    )
}

export default function DropFileUpload({
    name,
    tipoArquivo,
    title,
    required = false,
    multiple = false,
    apiURL,
    sizeLimit = 4,
    xs = 12,
    sm,
    md,
    tstToken = '',
}: {
    name: string
    tipoArquivo: string
    title: string
    apiURL: string
    tstToken?: string
    required?: boolean
    multiple?: boolean
    sizeLimit?: number
    xs?: number
    sm?: number
    md?: number
}) {
    const { getRootProps, getInputProps } = useDropzone({
        multiple,
        onDrop: (dropFiles) => {
            const fileList: FileState[] = []
            setProgress(-1)

            dropFiles
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
                .forEach((file, index) => {
                    let id: number = Date.now() + index

                    // fetch API

                    const fd = new FormData()

                    fd.append('files', file)
                    fd.append('tipoArquivo', tipoArquivo)

                    axios
                        .post(apiURL, fd, {
                            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!)
                                setProgress(percentCompleted)

                                if (percentCompleted >= 100) {
                                    setFiles((f) => [...f, { id: id, name: file.name, loading: true, error: false, file: file, size: file.size }])
                                }
                            },
                            headers: { Authorization: `Bearer ${tstToken === '' ? (user ? user.token : '') : tstToken}` },
                        })
                        .then((res: AxiosResponse<any, any>) => {
                            if (res.status > 200) {
                                const fileIdFromApi = res.data.data[0]
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
                                setProgress(-1)
                                removeFile(id)
                            }
                        })
                        .catch((err) => {
                            setProgress(-1)
                            removeFile(id)
                        })
                })
        },
    })
    const context = useContext(FormContext)!
    const { user } = useContext(AuthContext)

    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.only('xs'))

    const [progress, setProgress] = useState(-1)
    const [files, setFiles] = useState<FileState[]>([])
    const [filesLoaded, setFilesLoaded] = useState<number[]>([])
    const [fileIds, setFilesIds] = useState<{ [key: number]: number }>({})
    // const [filesError, setFilesError] = useState<number[]>([])

    const [errorMsg, setErrorMsg] = useState('')

    const removeFile = (id: number, hideMsg?: boolean, fileId?: number) => {
        setFiles(files.filter((x) => x.id !== id))

        if (fileId) context.setFilesUid((fId) => fId.filter((idd) => idd.CO_SEQ_ARQUIVO !== fileId))

        if (!hideMsg) {
            setErrorMsg('Erro ao enviar arquivo. Verifique o formato e tente mais tarde.')

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
                    Authorization: `Bearer ${tstToken === '' ? (user ? user.token : '') : tstToken}`,
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
        <Grid item {...{ xs, sm, md }} sx={{ width: '100%' }}>
            <Box bgcolor='white' p={2} borderRadius='8px' color='#1E293B'>
                <InputLabel required={required} sx={{ marginBottom: 2, textTransform: 'capitalize' }}>
                    {title}
                </InputLabel>
                <Stack
                    {...getRootProps({ className: 'dropzone' })}
                    bgcolor='#EFEFEF'
                    justifyContent='center'
                    alignItems='center'
                    textAlign='center'
                    borderRadius='6px'
                    py={8}
                    border='solid 1.5px #989898'
                    sx={{
                        borderStyle: 'dashed',
                        cursor: 'pointer',
                    }}
                >
                    <input
                        {...getInputProps()}
                        {...context.formRegister(name, {
                            validate: (v, f) => {
                                if ((v.length && filesLoaded.length) <= 0 && required) return 'O campo de arquivo é obrigatório'
                            },
                        })}
                    />
                    <Stack spacing={2} alignItems='center'>
                        <Box>
                            <Typography fontWeight={600} fontSize={18}>
                                Arraste seus arquivos até aqui
                            </Typography>
                            <Typography>ou selecione arquivos que estão no seu computador</Typography>
                        </Box>
                        <Button
                            variant='contained'
                            sx={{
                                backgroundColor: '#64748B',
                                pointerEvents: 'none',
                                borderRadius: '8px',
                                width: 'fit-content',
                            }}
                        >
                            Selecionar
                        </Button>
                        <Typography fontWeight={300}>Tamanho máximo por arquivo {sizeLimit}MB</Typography>
                    </Stack>
                </Stack>

                <Typography pt={2} fontSize={16} fontWeight={600}>
                    Você selecionou {files.length} arquivo{files.length > 1 ? 's' : ''}.
                </Typography>

                <Stack width='100%' marginTop={1} spacing={1}>
                    {files.map((x) => (
                        <Stack direction='row' justifyContent='space-between' border='solid 1px #E2E8F0' borderRadius={2} p={1}>
                            <Stack direction='row'>
                                <Stack direction='row' justifyContent='center' alignItems='center' minWidth={30} pr={1.5}>
                                    <img src='icons/file-pdf.svg' />
                                </Stack>
                                <Stack>
                                    <Typography fontWeight={600}>{x.name}</Typography>
                                    <Typography fontSize={14}>{bytesToKBorMB(x.size)}</Typography>
                                </Stack>
                            </Stack>

                            <Button
                                size='small'
                                startIcon={<img src='icons/trash.svg' />}
                                variant='contained'
                                onClick={(e) => deleteFile(e, x.id)}
                                sx={{
                                    height: 40,
                                    backgroundColor: '#DE3F50',
                                    borderRadius: '8px',
                                }}
                            >
                                Remover
                            </Button>
                        </Stack>
                    ))}

                    {progress > 0 && progress < 100 && (
                        <LinearProgressWithLabel
                            value={progress}
                            sx={{
                                backgroundColor: '#103D6A',
                                '.MuiLinearProgress-bar': {
                                    backgroundColor: '#BDDDFA',
                                },
                            }}
                        />
                    )}
                </Stack>

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
    )
}
