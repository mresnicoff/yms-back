const prisma = require("../../lib/prisma");
const { AppError, requireFields } = require("../../lib/errors");

async function createAppointment(data) {

  requireFields(data, {
    supplierId: "Proveedor",
    vehicleTypeId: "Tipo de vehículo",
    warehouseId: "Depósito",
    dockGroupId: "Tipo de dock",
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

  // Comparación de instantes reales: es correcta sin importar en qué
  // zona horaria corra el servidor, siempre que el horario elegido haya
  // sido calculado en hora de Buenos Aires (ver slot.service.js).
  if (parsedStartTime.getTime() < Date.now()) {
    throw new AppError("No se puede reservar un turno en el pasado.");
  }

  return await prisma.$transaction(async (tx) => {

    const [dockGroup, vehicleType, warehouse, supplier] = await Promise.all([
      tx.dockGroup.findUnique({ where: { id: dockGroupId } }),
      tx.vehicleType.findUnique({ where: { id: vehicleTypeId } }),
      tx.warehouse.findUnique({ where: { id: warehouseId } }),
      tx.supplier.findUnique({ where: { id: supplierId } })
    ]);

    if (!dockGroup) {
      throw new AppError("El tipo de dock seleccionado no existe.");
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

    const minutes =
      operationType === "LOAD"
        ? vehicleType.loadingMinutes
        : vehicleType.unloadingMinutes;

    if (!minutes || minutes <= 0) {
      throw new AppError(
        "El tipo de vehículo no tiene configurada una duración válida para esta operación."
      );
    }

    const endTime = new Date(
      parsedStartTime.getTime() + minutes * 60 * 1000
    );

    const capacity = await tx.dock.count({
      where: {
        groupId: dockGroupId,
        active: true
      }
    });

    // Todos los turnos del dock group (cualquier tipo de operación)
    // comparten los mismos docks físicos, así que la capacidad se
    // calcula por superposición de horario, no por igualdad exacta de
    // startTime ni por tipo de operación.
    const overlapping = await tx.appointment.count({
      where: {
        dockGroupId,
        status: {
          not: "CANCELLED"
        },
        startTime: {
          lt: endTime
        },
        endTime: {
          gt: parsedStartTime
        }
      }
    });

    if (overlapping >= capacity) {
      throw new AppError("No hay capacidad disponible para ese horario.");
    }

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