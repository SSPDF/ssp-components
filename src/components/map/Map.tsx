'use client'
import { Box, SxProps, Theme } from '@mui/material'
import { MapContainer, TileLayer } from 'react-leaflet'
import DraggableMarker from './DraggableMarker'

import React from 'react'

import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet/dist/leaflet.css'
import { LatLngExpression } from 'leaflet'
import AnimatedMarker from './AnimatedMarker'
import { ReactElement } from 'react'

export interface MapProps {
    firstCoords: any

    onCoordsChange?: (coords: any) => void
    pulseMarkerList?: LatLngExpression[]
    popupContent?: ReactElement
    /**
     * Estilos do contêiner do mapa, no formato do `sx` (ex.: `{ minWidth: 400, height: 400 }`).
     * Até a 0.4.0 era `BoxProps` espalhado no `Box`; o MUI 9 tirou as system props do `Box`, e
     * medidas passadas assim sumiriam sem erro. Por isso agora vai para o `sx`.
     */
    style?: SxProps<Theme>
    mapStyle?: React.CSSProperties
    fixedPosition?: boolean
}

export function Map(props: MapProps) {
    return (
        <Box
            sx={[
                {
                    borderRadius: 2,
                    border: '2px solid #c7c7c7',
                    overflow: 'hidden',
                },
                ...(Array.isArray(props.style) ? props.style : [props.style]),
            ]}
        >
            <MapContainer center={props.firstCoords} zoom={19} scrollWheelZoom style={props.mapStyle}>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                {props.pulseMarkerList && props.pulseMarkerList.map((coord, idx) => <AnimatedMarker key={JSON.stringify(coord) + idx} coords={coord} />)}
                <DraggableMarker startCoord={props.firstCoords} onChange={props.onCoordsChange} showPopup={typeof props.popupContent !== 'undefined'} fixedPosition={props.fixedPosition}>
                    {props.popupContent}
                </DraggableMarker>
            </MapContainer>
        </Box>
    )
}
