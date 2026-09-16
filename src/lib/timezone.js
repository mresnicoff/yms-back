// La operación de YMS es siempre en Buenos Aires (UTC-3, sin horario de
// verano), sin importar en qué zona horaria corra el servidor (Vercel
// corre en UTC). Cualquier fecha/hora "de pared" que venga expresada como
// horario de Buenos Aires (por ejemplo, el horario laboral 08:00-17:00, o
// una fecha suelta tipo "2026-09-20") debe convertirse explícitamente a su
// instante UTC real usando el offset de Buenos Aires, en vez de asumir "Z"
// (UTC) o la zona horaria local del proceso.
const BUENOS_AIRES_OFFSET = "-03:00";
const BUENOS_AIRES_OFFSET_MS = 3 * 60 * 60 * 1000;

/**
 * Normaliza una hora de pared a formato "HH:mm:ss.SSS", aceptando tanto
 * "HH:mm" (lo que guarda DockGroupSchedule) como el formato completo.
 */
function normalizeTime(timeStr) {
  const [hh = "00", mm = "00", rest] = timeStr.split(":");

  if (rest === undefined) {
    return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:00.000`;
  }

  return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:${
    rest.includes(".") ? rest : `${rest}.000`
  }`;
}

/**
 * Construye un Date que representa la fecha/hora indicada tal como se
 * vive en Buenos Aires, devolviendo el instante UTC correcto.
 *
 * @param {string} dateStr - fecha en formato "YYYY-MM-DD"
 * @param {string} timeStr - hora en formato "HH:mm" o "HH:mm:ss.SSS" (default medianoche)
 */
function buenosAiresDateTime(dateStr, timeStr = "00:00:00.000") {
  return new Date(`${dateStr}T${normalizeTime(timeStr)}${BUENOS_AIRES_OFFSET}`);
}

/**
 * Dado un instante (Date), devuelve sus componentes de fecha "de pared"
 * en Buenos Aires (año, mes, día, día de la semana), sin importar en qué
 * zona horaria corra el servidor. Como Buenos Aires no tiene horario de
 * verano, restar 3 horas y leer los componentes en UTC es siempre correcto.
 */
function getBuenosAiresDateParts(date) {
  const shifted = new Date(date.getTime() - BUENOS_AIRES_OFFSET_MS);

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    // 0 = domingo ... 6 = sábado
    weekday: shifted.getUTCDay()
  };
}

/**
 * Igual que getBuenosAiresDateParts, pero devuelve directamente el string
 * "YYYY-MM-DD" de la fecha de pared en Buenos Aires.
 */
function getBuenosAiresDateString(date) {
  const { year, month, day } = getBuenosAiresDateParts(date);
  const pad = (n) => String(n).padStart(2, "0");

  return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * Día de la semana (0 = domingo ... 6 = sábado) de una fecha suelta
 * "YYYY-MM-DD", sin ambigüedad de zona horaria (se arma con hora UTC del
 * mediodía para no cruzar de día por redondeos).
 */
function getWeekdayFromDateString(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay();
}

module.exports = {
  BUENOS_AIRES_OFFSET,
  buenosAiresDateTime,
  getBuenosAiresDateParts,
  getBuenosAiresDateString,
  getWeekdayFromDateString
};
