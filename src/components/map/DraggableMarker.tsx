'use client'
import { icon, LatLngExpression, Marker as MarketType } from 'leaflet'
import { ReactElement, useEffect, useMemo, useRef, useState } from 'react'
import { Marker, Popup, useMapEvents } from 'react-leaflet'

import React from 'react'

interface DraggableMarkerProps {
    startCoord: LatLngExpression
    draggable?: boolean
    // eslint-disable-next-line no-unused-vars
    onChange?: (coord: LatLngExpression) => void
    children?: ReactElement
    showPopup?: boolean
    fixedPosition?: boolean
}

export default function DraggableMarker({ ...props }: DraggableMarkerProps) {
    const [position, setPosition] = useState<LatLngExpression>(props.startCoord)
    const markerRef = useRef<MarketType>(null)

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current
                if (marker != null) {
                    setPosition(marker.getLatLng())
                }
            },
        }),
        []
    )

    useMapEvents({
        click(e) {
            if (props.fixedPosition) return

            setPosition({ lat: e.latlng.lat, lng: e.latlng.lng })
        },
    })

    useEffect(() => {
        if (!position) return

        if (markerRef.current) {
            markerRef.current.closePopup()

            if (props.showPopup) markerRef.current.openPopup()
        }

        if (props.onChange) props.onChange(position)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position, props.onChange])

    return (
        <Marker icon={redIcon} draggable={props.draggable} eventHandlers={eventHandlers} position={position} ref={markerRef}>
            <Popup className='custom-popup'>{props.children}</Popup>
        </Marker>
    )
}

//#region Marker Icon
const redIcon = icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'leaflet-red-marker',
})
//#endregion
