// La operación de YMS es siempre en Buenos Aires (UTC-3, sin horario de
// verano), sin importar en qué zona horaria corra el servidor (Vercel
// corre en UTC). Cualquier fecha/hora "de pared" que venga expresada como
// horario de Buenos Aires (por ejemplo, el horario laboral 08:00-17:00, o
// una fecha suelta tipo "2026-09-20") debe convertirse explícitamente a su
// instante UTC real usando el offset de Buenos Aires, en vez de asumir "Z"
// (UTC) o la zona horaria local del proceso.
const BUENOS_AIRES_OFFSET = "-03:00";

/**
 * Construye un Date que representa la fecha/hora indicada tal como se
 * vive en Buenos Aires, devolviendo el instante UTC correcto.
 *
 * @param {string} dateStr - fecha en formato "YYYY-MM-DD"
 * @param {string} timeStr - hora en formato "HH:mm:ss.SSS" (default medianoche)
 */
function buenosAiresDateTime(dateStr, timeStr = "00:00:00.000") {
  return new Date(`${dateStr}T${timeStr}${BUENOS_AIRES_OFFSET}`);
}

module.exports = {
  BUENOS_AIRES_OFFSET,
  buenosAiresDateTime
};
