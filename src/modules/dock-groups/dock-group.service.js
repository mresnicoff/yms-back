const prisma = require("../../lib/prisma");
const { AppError, requireFields } = require("../../lib/errors");
const {
  validateWeeklySchedules,
  defaultWeeklySchedules
} = require("../../lib/schedule");

// Listado público: lo usa el formulario de turnos, por eso solo muestra
// dock groups activos y no necesita traer docks/horarios.
async function getAll() {

  return prisma.dockGroup.findMany({
    where: {
      active: true
    },
    include: {
      warehouse: true
    },
    orderBy: {
      name: "asc"
    }
  });

}

// Listado para el módulo de administración de warehouses: incluye
// inactivos, y trae docks + horario semanal completo.
async function getAllAdmin(warehouseId) {

  return prisma.dockGroup.findMany({
    where: warehouseId ? { warehouseId } : {},
    include: {
      warehouse: true,
      docks: {
        orderBy: { code: "asc" }
      },
      schedules: {
        orderBy: { weekday: "asc" }
      }
    },
    orderBy: {
      name: "asc"
    }
  });

}

async function getById(id) {

  const dockGroup = await prisma.dockGroup.findUnique({
    where: { id },
    include: {
      warehouse: true,
      docks: {
        orderBy: { code: "asc" }
      },
      schedules: {
        orderBy: { weekday: "asc" }
      }
    }
  });

  if (!dockGroup) {
    throw new AppError("El dock group indicado no existe.", 404);
  }

  return dockGroup;

}

async function create(data) {

  requireFields(data, {
    warehouseId: "Depósito",
    code: "Código",
    name: "Nombre"
  });

  const { warehouseId, code, name, description, assignmentMode, schedules } =
    data;

  const warehouse = await prisma.warehouse.findUnique({
    where: { id: warehouseId }
  });

  if (!warehouse) {
    throw new AppError("El depósito indicado no existe.");
  }

  const existingCode = await prisma.dockGroup.findUnique({
    where: { code }
  });

  if (existingCode) {
    throw new AppError("Ya existe un dock group con ese código.");
  }

  if (assignmentMode && !["AUTO", "MANUAL"].includes(assignmentMode)) {
    throw new AppError("El modo de asignación indicado no es válido.");
  }

  const normalizedSchedules = validateWeeklySchedules(
    schedules && schedules.length ? schedules : defaultWeeklySchedules()
  );

  return prisma.dockGroup.create({
    data: {
      warehouseId,
      code,
      name,
      description: description || null,
      assignmentMode: assignmentMode || "AUTO",
      schedules: {
        create: normalizedSchedules
      }
    },
    include: {
      schedules: {
        orderBy: { weekday: "asc" }
      },
      docks: true
    }
  });

}

async function update(id, data) {

  const dockGroup = await prisma.dockGroup.findUnique({
    where: { id }
  });

  if (!dockGroup) {
    throw new AppError("El dock group indicado no existe.", 404);
  }

  const { code, name, description, assignmentMode, active, schedules } = data;

  if (code && code !== dockGroup.code) {

    const existingCode = await prisma.dockGroup.findUnique({
      where: { code }
    });

    if (existingCode) {
      throw new AppError("Ya existe un dock group con ese código.");
    }

  }

  if (assignmentMode && !["AUTO", "MANUAL"].includes(assignmentMode)) {
    throw new AppError("El modo de asignación indicado no es válido.");
  }

  const normalizedSchedules = schedules
    ? validateWeeklySchedules(schedules)
    : null;

  return prisma.$transaction(async (tx) => {

    if (normalizedSchedules) {

      // Reemplazamos las 7 filas del horario semanal completas: es más
      // simple y seguro que tratar de upsertear cada día individualmente.
      await tx.dockGroupSchedule.deleteMany({
        where: { dockGroupId: id }
      });

      await tx.dockGroupSchedule.createMany({
        data: normalizedSchedules.map((entry) => ({
          ...entry,
          dockGroupId: id
        }))
      });

    }

    return tx.dockGroup.update({
      where: { id },
      data: {
        ...(code !== undefined ? { code } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined
          ? { description: description || null }
          : {}),
        ...(assignmentMode !== undefined ? { assignmentMode } : {}),
        ...(active !== undefined ? { active: Boolean(active) } : {})
      },
      include: {
        schedules: {
          orderBy: { weekday: "asc" }
        },
        docks: {
          orderBy: { code: "asc" }
        }
      }
    });

  });

}

module.exports = {
  getAll,
  getAllAdmin,
  getById,
  create,
  update
};
