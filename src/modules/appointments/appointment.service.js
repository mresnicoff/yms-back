const prisma = require("../../lib/prisma");

async function createAppointment({
  supplierId,
  vehicleTypeId,
  warehouseId,
  dockGroupId,
  operationType,
  startTime
}) {

  return await prisma.$transaction(async (tx) => {

    const capacity = await tx.dock.count({
      where: {
        groupId: dockGroupId,
        active: true
      }
    });

    const reserved = await tx.appointment.count({
      where: {
        dockGroupId,
        startTime: new Date(startTime),
        status: {
          not: "CANCELLED"
        }
      }
    });

    if (reserved >= capacity) {
      throw new Error("No capacity available for this slot");
    }

    const vehicleType = await tx.vehicleType.findUnique({
      where: {
        id: vehicleTypeId
      }
    });

    if (!vehicleType) {
      throw new Error("Vehicle type not found");
    }

    const minutes =
      operationType === "LOAD"
        ? vehicleType.loadingMinutes
        : vehicleType.unloadingMinutes;

    const endTime = new Date(startTime);

    endTime.setMinutes(
      endTime.getMinutes() + minutes
    );

    const appointment =
      await tx.appointment.create({
        data: {
          supplierId,
          vehicleTypeId,
          warehouseId,
          dockGroupId,
          operationType,
          startTime: new Date(startTime),
          endTime
        }
      });

    return appointment;
  });
}
async function getAppointments(user) {

  const where =
    user.role === "SUPPLIER"
      ? {
          supplierId:
            user.supplierId
        }
      : {};

  return prisma.appointment.findMany({
    where,
    include: {
      supplier: true,
      vehicleType: true,
      warehouse: true,
      dockGroup: true
    },
    orderBy: {
      startTime: "desc"
    }
  });

}


module.exports = {
  createAppointment,
  getAppointments
};