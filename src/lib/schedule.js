const { AppError } = require("./errors");

// 0 = domingo ... 6 = sábado, mismo criterio que Date.getDay().
const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

const WEEKDAY_LABELS = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado"
};

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Valida y normaliza el horario semanal recibido del módulo de warehouses:
 * un array de exactamente 7 entradas, una por día de la semana, cada una
 * con { weekday, closed, startTime, endTime }. Si closed es false, exige
 * startTime/endTime en formato "HH:MM" y que startTime < endTime.
 *
 * Devuelve el array normalizado (weekday como Number, horarios null si
 * closed) listo para persistir.
 */
function validateWeeklySchedules(schedules) {
  if (!Array.isArray(schedules) || schedules.length !== 7) {
    throw new AppError(
      "El horario de atención debe tener exactamente los 7 días de la semana."
    );
  }

  const seenWeekdays = new Set();

  const normalized = schedules.map((entry) => {
    const weekday = Number(entry?.weekday);

    if (!WEEKDAYS.includes(weekday)) {
      throw new AppError(
        `Día de la semana inválido en el horario: ${entry?.weekday}.`
      );
    }

    if (seenWeekdays.has(weekday)) {
      throw new AppError(
        `El día ${WEEKDAY_LABELS[weekday]} está repetido en el horario.`
      );
    }

    seenWeekdays.add(weekday);

    const closed = Boolean(entry?.closed);

    if (closed) {
      return {
        weekday,
        closed: true,
        startTime: null,
        endTime: null
      };
    }

    const { startTime, endTime } = entry;

    if (!TIME_REGEX.test(startTime) || !TIME_REGEX.test(endTime)) {
      throw new AppError(
        `El horario del día ${WEEKDAY_LABELS[weekday]} no es válido. Usá el formato HH:MM.`
      );
    }

    if (startTime >= endTime) {
      throw new AppError(
        `El horario del día ${WEEKDAY_LABELS[weekday]} es inválido: el inicio debe ser antes que el fin.`
      );
    }

    return {
      weekday,
      closed: false,
      startTime,
      endTime
    };
  });

  if (seenWeekdays.size !== 7) {
    throw new AppError(
      "El horario de atención debe cubrir los 7 días de la semana, sin repetir ninguno."
    );
  }

  return normalized;
}

/**
 * Horario por defecto: los 7 días de 08:00 a 17:00 (comportamiento
 * histórico, antes de que el horario fuera configurable).
 */
function defaultWeeklySchedules() {
  return WEEKDAYS.map((weekday) => ({
    weekday,
    closed: false,
    startTime: "08:00",
    endTime: "17:00"
  }));
}

module.exports = {
  WEEKDAYS,
  WEEKDAY_LABELS,
  validateWeeklySchedules,
  defaultWeeklySchedules
};
