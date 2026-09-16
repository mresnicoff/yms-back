const prisma = require("../../lib/prisma");
const { AppError, requireFields } = require("../../lib/errors");
const {
  buenosAiresDateTime,
  getWeekdayFromDateString
} = require("../../lib/timezone");


const getAvailableSlots = async (params) => {

  requireFields(params, {
    dockGroupId: "Tipo de dock",
    vehicleTypeId: "Tipo de vehículo",
    operationType: "Tipo de operación",
    date: "Fecha"
  });

  const {
    dockGroupId,
    vehicleTypeId,
    operationType,
    date
  } = params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AppError("La fecha indicada no es válida.");
  }

  // El horario de atención es configurable por dock group y por día de la
  // semana (módulo de warehouses), siempre interpretado en hora de Buenos
  // Aires más allá de en qué zona horaria corra el servidor.
  const weekday = getWeekdayFromDateString(date);

  const daySchedule = await prisma.dockGroupSchedule.findUnique({
    where: {
      dockGroupId_weekday: {
        dockGroupId,
        weekday
      }
    }
  });

  if (!daySchedule || daySchedule.closed) {
    return [];
  }

  const workStart = buenosAiresDateTime(date, daySchedule.startTime);
  const workEnd = buenosAiresDateTime(date, daySchedule.endTime);

  if (Number.isNaN(workStart.getTime()) || Number.isNaN(workEnd.getTime())) {
    throw new AppError("La fecha indicada no es válida.");
  }

  const vehicleType = await prisma.vehicleType.findUnique({
    where: {
      id: vehicleTypeId
    }
  });

  if (!vehicleType) {
    throw new AppError("El tipo de vehículo indicado no existe.");
  }

  const docks = await prisma.dock.findMany({
    where: {
      groupId: dockGroupId,
      active: true
    }
  });

  if (!docks.length) {
    return [];
  }

  const capacity = docks.length;

  const durationMinutes =
    operationType === "LOAD"
      ? vehicleType.loadingMinutes
      : vehicleType.unloadingMinutes;

  if (!durationMinutes || durationMinutes <= 0) {
    throw new AppError(
      "El tipo de vehículo no tiene configurada una duración válida para esta operación."
    );
  }

  // Todos los turnos del dock group (sin importar el tipo de operación)
  // compiten por los mismos docks físicos, así que traemos todos los que
  // se superponen con la jornada, no solo los del tipo de operación
  // consultado.
  const appointments = await prisma.appointment.findMany({
    where: {
      dockGroupId,
      status: {
        not: "CANCELLED"
      },
      startTime: {
        lt: workEnd
      },
      endTime: {
        gt: workStart
      }
    },
    select: {
      startTime: true,
      endTime: true
    }
  });

  const now = new Date();

  const slots = [];

  let current = new Date(workStart);

  while (true) {
    const slotEnd = new Date(
      current.getTime() + durationMinutes * 60 * 1000
    );

    if (slotEnd > workEnd) {
      break;
    }

    // No ofrecer horarios que ya pasaron (comparando instantes reales,
    // así que es correcto sin importar la zona horaria del servidor).
    if (current.getTime() > now.getTime()) {

      const reserved = appointments.filter(
        (appointment) =>
          appointment.startTime < slotEnd &&
          appointment.endTime > current
      ).length;

      slots.push({
        time: current.toISOString(),
        capacity,
        reserved,
        available: capacity - reserved
      });

    }

    current = slotEnd;
  }

  return slots;
};

module.exports = {
  getAvailableSlots
};
