const prisma = require("../../lib/prisma");
const { AppError, requireFields } = require("../../lib/errors");

async function createAppointment(data) {

  requireFields(data, {
    supplierId: "Proveedor",
    vehicleTypeId: "Tipo de vehículo",
    warehouseId: "Depósito",
    dockGroupId: "Dock Group",
    operationType: "Tipo de operación",
    startTime: "Horario"
  });

  const {
    supplierId,
    vehicleTypeId,
    warehouseId,
    dockGroupId,
    operationType,
    startTime
  } = data;

  const parsedStartTime = new Date(startTime);

  if (Number.isNaN(parsedStartTime.getTime())) {
    throw new AppError("El horario seleccionado no es válido.");
  }

  return await prisma.$transaction(async (tx) => {

    const [dockGroup, vehicleType, warehouse, supplier] = await Promise.all([
      tx.dockGroup.findUnique({ where: { id: dockGroupId } }),
      tx.vehicleType.findUnique({ where: { id: vehicleTypeId } }),
      tx.warehouse.findUnique({ where: { id: warehouseId } }),
      tx.supplier.findUnique({ where: { id: supplierId } })
    ]);

    if (!dockGroup) {
      throw new AppError("El Dock Group seleccionado no existe.");
    }

    if (!vehicleType) {
      throw new AppError("El tipo de vehículo seleccionado no existe.");
    }

    if (!warehouse) {
      throw new AppError("El depósito seleccionado no existe.");
    }

    if (!supplier) {
      throw new AppError("El proveedor seleccionado no existe.");
    }

    const capacity = await tx.dock.count({
      where: {
        groupId: dockGroupId,
        active: true
      }
    });

    const reserved = await tx.appointment.count({
      where: {
        dockGroupId,
        startTime: parsedStartTime,
        status: {
          not: "CANCELLED"
        }
      }
    });

    if (reserved >= capacity) {
      throw new AppError("No hay capacidad disponible para ese horario.");
    }

    const minutes =
      operationType === "LOAD"
        ? vehicleType.loadingMinutes
        : vehicleType.unloadingMinutes;

    const endTime = new Date(parsedStartTime);

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
          startTime: parsedStartTime,
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