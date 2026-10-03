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
    // Semi-acoplado de este viaje (flujo Fátima/Infolog). Opcional: solo
    // se usa cuando el turno lo requiere.
    semiTruckId,
    createdById,
    driverId
  } = data;

  if (semiTruckId && semiTruckId === truckId) {
    throw new AppError(
      "El semi-acoplado no puede ser el mismo vehículo que el tractor."
    );
  }

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

    const [truck, driver, semiTruck] = await Promise.all([
      tx.truck.findUnique({ where: { id: truckId } }),
      tx.driver.findUnique({ where: { id: driverId } }),
      semiTruckId
        ? tx.truck.findUnique({ where: { id: semiTruckId } })
        : Promise.resolve(null)
    ]);

    if (!truck) {
      throw new AppError("El camión indicado no existe.");
    }

    if (!driver) {
      throw new AppError("El chofer indicado no existe.");
    }

    if (semiTruckId && !semiTruck) {
      throw new AppError("El semi-acoplado indicado no existe.");
    }

    const checkIn =
      await tx.checkIn.create({
        data: {
          appointmentId,
          truckId,
          semiTruckId: semiTruckId || null,
          createdById,
          driverId,
          arrivalTime: new Date()
        }
      });

    // Los turnos que vienen de Infolog no traen tipo de vehículo (no es un
    // dato que mande la interfase): se completa acá, con el del camión
    // elegido, igual que el resto de los datos de este Check-In.
    await tx.appointment.update({
      where: {
        id: appointmentId
      },
      data: {
        status: "WAITING_DOCK",
        ...(appointment.vehicleTypeId
          ? {}
          : { vehicleTypeId: truck.vehicleTypeId })
      }
    });

    return checkIn;
  });
};

module.exports = {
  createCheckIn
};