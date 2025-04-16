import React from 'react'
import { Box, LinearProgress as MuiLinearProgress, LinearProgressProps, Typography } from '@mui/material'

export function LinearProgress(props: LinearProgressProps) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <MuiLinearProgress variant='determinate' {...props} />
            </Box>
            <Box sx={{ minWidth: 3 }}>
                <Typography variant='body2' color='text.secondary'>{`${Math.round(props.value || 100)}%`}</Typography>
            </Box>
        </Box>
    )
}
