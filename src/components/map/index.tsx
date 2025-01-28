import dynamic from 'next/dynamic'

export const Map = dynamic(() => import('./Map').then((x) => x.Map), { ssr: false })
