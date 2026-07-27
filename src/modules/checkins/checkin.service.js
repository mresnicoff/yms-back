const prisma = require("../../lib/prisma");

const createCheckIn = async ({
  appointmentId,
  truckId,
  createdById,
  driverId
}) => {
  return prisma.$transaction(async (tx) => {

    const appointment =
      await tx.appointment.findUnique({
        where: {
          id: appointmentId
        }
      });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (appointment.status !== "SCHEDULED") {
      throw new Error(
        `Appointment status is ${appointment.status}`
      );
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