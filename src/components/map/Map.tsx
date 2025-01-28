'use client'
import { Box, BoxProps } from '@mui/material'
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
    // eslint-disable-next-line no-unused-vars
    onCoordsChange?: (coords: any) => void
    pulseMarkerList?: LatLngExpression[]
    popupContent?: ReactElement
    style?: BoxProps
}

export function Map(props: MapProps) {
    return (
        <Box borderRadius={2} border='2px solid #c7c7c7' overflow='hidden' {...props.style}>
            <MapContainer center={props.firstCoords} zoom={19} scrollWheelZoom style={{ height: '75vh', width: '100%' }}>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                {props.pulseMarkerList && props.pulseMarkerList.map((coord, idx) => <AnimatedMarker key={JSON.stringify(coord) + idx} coords={coord} />)}
                <DraggableMarker startCoord={props.firstCoords} onChange={props.onCoordsChange} showPopup={typeof props.popupContent !== 'undefined'}>
                    {props.popupContent}
                </DraggableMarker>
            </MapContainer>
        </Box>
    )
}
