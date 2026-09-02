const prisma = require("../../lib/prisma");
const { AppError, requireFields } = require("../../lib/errors");

const createCheckIn = async (data) => {

  requireFields(data, {
    appointmentId: "Turno",
    truckId: "Camión",
    driverId: "Chofer"
  });

  const {
    appointmentId,
    truckId,
    createdById,
    driverId
  } = data;

  return prisma.$transaction(async (tx) => {

    const appointment =
      await tx.appointment.findUnique({
        where: {
          id: appointmentId
        }
      });

    if (!appointment) {
      throw new AppError("El turno indicado no existe.");
    }

    if (appointment.status !== "SCHEDULED") {
      throw new AppError(
        `El turno ya no está disponible para check-in (estado: ${appointment.status}).`
      );
    }

    const [truck, driver] = await Promise.all([
      tx.truck.findUnique({ where: { id: truckId } }),
      tx.driver.findUnique({ where: { id: driverId } })
    ]);

    if (!truck) {
      throw new AppError("El camión indicado no existe.");
    }

    if (!driver) {
      throw new AppError("El chofer indicado no existe.");
    }

    const checkIn =
      await tx.checkIn.create({
        data: {
          appointmentId,
          truckId,
          createdById,
          driverId,
          arrivalTime: new Date()
        }
      });

    await tx.appointment.update({
      where: {
        id: appointmentId
      },
      data: {
        status: "WAITING_DOCK"
      }
    });

    return checkIn;
  });
};

module.exports = {
  createCheckIn
};