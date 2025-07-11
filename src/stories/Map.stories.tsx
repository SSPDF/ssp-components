import { Meta, StoryObj } from '@storybook/react-webpack5'
import { Map } from '../components/map/Map'
import { LatLng } from 'leaflet'

const meta: Meta<typeof Map> = {
    title: 'Base/Map',
    component: Map,
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Map>

export const Base: Story = {
    args: {
        firstCoords: new LatLng(-15, -47),
        style: {
            minWidth: '400px',
            width: '100%',
            height: '400px',
        },
    },
}
