const prisma = require("../../lib/prisma");


const getAvailableSlots = async ({
  dockGroupId,
  vehicleTypeId,
  operationType,
  date
}) => {
  const vehicleType = await prisma.vehicleType.findUnique({
    where: {
      id: vehicleTypeId
    }
  });

  if (!vehicleType) {
    throw new Error("Vehicle type not found");
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

  const workStart = new Date(`${date}T08:00:00.000Z`);
  const workEnd = new Date(`${date}T17:00:00.000Z`);

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