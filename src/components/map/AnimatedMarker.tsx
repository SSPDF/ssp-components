import L, { LatLngExpression } from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

const AnimatedMarker = ({ coords }: { coords: LatLngExpression }) => {
    const map = useMap()

    useEffect(() => {
        // Criar o ícone do marcador com HTML
        const markerElement = document.createElement('div')
        markerElement.style.position = 'relative'
        markerElement.style.width = '20px'
        markerElement.style.height = '20px'
        markerElement.style.backgroundColor = 'rgba(0, 100, 255, 0.6)'
        markerElement.style.borderRadius = '50%'
        markerElement.style.animation = 'sonarPulse 2s infinite'

        // Criar o efeito de pulso (onda ao redor)
        const pulseElement = document.createElement('div')
        pulseElement.style.position = 'absolute'
        pulseElement.style.top = '50%'
        pulseElement.style.left = '50%'
        pulseElement.style.width = '100%'
        pulseElement.style.height = '100%'
        pulseElement.style.backgroundColor = 'rgba(0, 100, 255, 0.4)'
        pulseElement.style.borderRadius = '50%'
        pulseElement.style.transform = 'translate(-50%, -50%) scale(1)'
        pulseElement.style.animation = 'sonarPulse 2s infinite'

        markerElement.appendChild(pulseElement)

        // Adicionar a animação no CSS global
        const keyframes = `
            @keyframes sonarPulse {
                0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.8;
                }
                100% {
                transform: translate(-50%, -50%) scale(2);
                opacity: 0;
                }
            }`
        const styleElement = document.createElement('style')
        styleElement.innerHTML = keyframes
        document.head.appendChild(styleElement)

        // Criar o marcador no mapa
        const marker = L.marker(coords, {
            icon: L.divIcon({
                className: '',
                html: markerElement.outerHTML,
                iconSize: [40, 40], // Define o tamanho do ícone
                iconAnchor: [0, 5], // Centraliza o ícone (metade do width e height)
            }),
        })

        marker.addTo(map)

        // Limpar marcador e estilos ao desmontar
        return () => {
            map.removeLayer(marker)
            document.head.removeChild(styleElement)
        }
    }, [map, coords])

    return null // Nenhum componente visível, já que o marcador é diretamente manipulado pelo Leaflet
}

export default AnimatedMarker
