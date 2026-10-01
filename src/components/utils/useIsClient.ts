import { useEffect, useState } from 'react'

/**
 * `false` no servidor **e no primeiro render do cliente**; `true` depois da montagem.
 *
 * Serve para ler APIs do browser (`localStorage`) durante o render sem quebrar o SSR
 * e sem mismatch de hidratação: o primeiro render do cliente fica igual ao HTML do
 * servidor, e o estado salvo entra no render seguinte (UPGRADE_PLAN.md 5.11).
 */
export function useIsClient() {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    return isClient
}
