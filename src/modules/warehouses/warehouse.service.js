const prisma = require("../../lib/prisma");
const { AppError, requireFields } = require("../../lib/errors");

// Listado público: lo usan los formularios (ej. crear turno), por eso solo
// muestra warehouses activos.
async function getAll() {

  return prisma.warehouse.findMany({
    where: {
      active: true
    },
    orderBy: {
      name: "asc"
    }
  });

}

// Listado para el módulo de administración: incluye inactivos y trae los
// dock groups anidados (con sus horarios y cantidad de docks) para que la
// pantalla de warehouses pueda mostrar todo de un saque.
async function getAllAdmin() {

  return prisma.warehouse.findMany({
    include: {
      dockGroups: {
        include: {
          schedules: {
            orderBy: { weekday: "asc" }
          },
          docks: {
            orderBy: { code: "asc" }
          }
        },
        orderBy: { name: "asc" }
      }
    },
    orderBy: {
      name: "asc"
    }
  });

}

async function getById(id) {

  const warehouse = await prisma.warehouse.findUnique({
    where: { id },
    include: {
      dockGroups: {
        include: {
          schedules: {
            orderBy: { weekday: "asc" }
          },
          docks: {
            orderBy: { code: "asc" }
          }
        },
        orderBy: { name: "asc" }
      }
    }
  });

  if (!warehouse) {
    throw new AppError("El depósito indicado no existe.", 404);
  }

  return warehouse;

}

async function create(data) {

  requireFields(data, {
    code: "Código",
    name: "Nombre"
  });

  const { code, name, address, checkoutMode } = data;

  const existing = await prisma.warehouse.findUnique({
    where: { code }
  });

  if (existing) {
    throw new AppError("Ya existe un depósito con ese código.");
  }

  if (checkoutMode && !["DISPATCH", "CLIENT_PALLETS"].includes(checkoutMode)) {
    throw new AppError("El modo de Check-Out indicado no es válido.");
  }

  return prisma.warehouse.create({
    data: {
      code,
      name,
      address: address || null,
      ...(checkoutMode ? { checkoutMode } : {})
    }
  });

}

async function update(id, data) {

  const warehouse = await prisma.warehouse.findUnique({
    where: { id }
  });

  if (!warehouse) {
    throw new AppError("El depósito indicado no existe.", 404);
  }

  const { code, name, address, active, checkoutMode } = data;

  if (code && code !== warehouse.code) {

    const existing = await prisma.warehouse.findUnique({
      where: { code }
    });

    if (existing) {
      throw new AppError("Ya existe un depósito con ese código.");
    }

  }

  if (checkoutMode && !["DISPATCH", "CLIENT_PALLETS"].includes(checkoutMode)) {
    throw new AppError("El modo de Check-Out indicado no es válido.");
  }

  return prisma.warehouse.update({
    where: { id },
    data: {
      ...(code !== undefined ? { code } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(address !== undefined ? { address: address || null } : {}),
      ...(active !== undefined ? { active: Boolean(active) } : {}),
      ...(checkoutMode !== undefined ? { checkoutMode } : {})
    }
  });

}

module.exports = {
  getAll,
  getAllAdmin,
  getById,
  create,
  update
};
