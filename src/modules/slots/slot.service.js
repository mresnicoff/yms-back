const prisma = require("../../lib/prisma");
const { AppError, requireFields } = require("../../lib/errors");


const getAvailableSlots = async (params) => {

  requireFields(params, {
    dockGroupId: "Dock Group",
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

  const workStart = new Date(`${date}T08:00:00.000Z`);
  const workEnd = new Date(`${date}T17:00:00.000Z`);

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
      active: true,
    
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

  const appointments = await prisma.appointment.findMany({
    where: {
      dockGroupId,
      operationType,
      status: {
        not: "CANCELLED"
      }
    }
  });

  const reservationsBySlot = {};

  appointments.forEach((appointment) => {
    const key = appointment.startTime.toISOString();

    reservationsBySlot[key] =
      (reservationsBySlot[key] || 0) + 1;
  });

  const slots = [];

  let current = new Date(workStart);

  while (true) {
    const slotEnd = new Date(
      current.getTime() + durationMinutes * 60 * 1000
    );

    if (slotEnd > workEnd) {
      break;
    }

    const key = current.toISOString();

    const reserved = reservationsBySlot[key] || 0;

    slots.push({
      time: current.toISOString(),
      capacity,
      reserved,
      available: capacity - reserved
    });

    current = slotEnd;
  }

  return slots;
};

module.exports = {
  getAvailableSlots
};