import { Grid, Typography, Box } from '@mui/material'
import React from 'react'

export function Category({ title }: { title: string }) {
    return (
        <Grid paddingY={1} marginTop={1} marginBottom={3} size={12}>
            <Typography textTransform='uppercase' fontWeight={600}>
                {title}
            </Typography>
            <Box sx={{ backgroundColor: '#94A3B8', height: 6, borderRadius: 1 }}></Box>
        </Grid>
    );
}
