/**
 * Mensagem da validação de `minDt`/`maxDt` dos pickers. Cita só os limites que existem: antes, com só
 * o `minDt`, a mensagem dizia "…e antes de undefined" (UPGRADE_PLAN.md 5.21e).
 */
export function mensagemDeIntervalo(minDt?: string, maxDt?: string) {
    if (minDt && maxDt) return `A data tem que estar entre ${minDt} e ${maxDt}`
    if (minDt) return `A data tem que ser a partir de ${minDt}`
    return `A data tem que ser até ${maxDt}`
}
