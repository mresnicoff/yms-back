const prisma = require("../../lib/prisma");
const { AppError, requireFields } = require("../../lib/errors");

async function listByGroup(dockGroupId) {

  requireFields({ dockGroupId }, { dockGroupId: "Dock group" });

  return prisma.dock.findMany({
    where: { groupId: dockGroupId },
    orderBy: { code: "asc" }
  });

}

async function create(data) {

  requireFields(data, {
    groupId: "Dock group",
    code: "Código"
  });

  const { groupId, code, description } = data;

  const dockGroup = await prisma.dockGroup.findUnique({
    where: { id: groupId }
  });

  if (!dockGroup) {
    throw new AppError("El dock group indicado no existe.");
  }

  const existing = await prisma.dock.findUnique({
    where: { code }
  });

  if (existing) {
    throw new AppError("Ya existe un dock con ese código.");
  }

  return prisma.dock.create({
    data: {
      groupId,
      code,
      description: description || null
    }
  });

}

// Alta rápida de varios docks a la vez (ej. los 28 docks de un warehouse
// nuevo), generando códigos secuenciales con un prefijo. Evita tener que
// crear uno por uno desde la UI.
async function createBulk(data) {

  requireFields(data, {
    groupId: "Dock group",
    prefix: "Prefijo",
    quantity: "Cantidad"
  });

  const { groupId, prefix, quantity, startNumber } = data;

  const dockGroup = await prisma.dockGroup.findUnique({
    where: { id: groupId }
  });

  if (!dockGroup) {
    throw new AppError("El dock group indicado no existe.");
  }

  const qty = Number(quantity);

  if (!Number.isInteger(qty) || qty <= 0 || qty > 200) {
    throw new AppError("La cantidad de docks debe ser un número entero entre 1 y 200.");
  }

  const start = Number.isInteger(Number(startNumber)) ? Number(startNumber) : 1;

  const codes = Array.from({ length: qty }, (_, index) => {
    const number = start + index;
    return `${prefix}${String(number).padStart(2, "0")}`;
  });

  const existing = await prisma.dock.findMany({
    where: { code: { in: codes } },
    select: { code: true }
  });

  if (existing.length > 0) {
    throw new AppError(
      `Ya existen docks con estos códigos: ${existing.map((d) => d.code).join(", ")}.`
    );
  }

  await prisma.dock.createMany({
    data: codes.map((code) => ({
      groupId,
      code
    }))
  });

  return listByGroup(groupId);

}

async function update(id, data) {

  const dock = await prisma.dock.findUnique({
    where: { id }
  });

  if (!dock) {
    throw new AppError("El dock indicado no existe.", 404);
  }

  const { code, description, active } = data;

  if (code && code !== dock.code) {

    const existing = await prisma.dock.findUnique({
      where: { code }
    });

    if (existing) {
      throw new AppError("Ya existe un dock con ese código.");
    }

  }

  if (active === false && dock.status === "OCCUPIED") {
    throw new AppError(
      "No se puede desactivar un dock que está ocupado. Finalizá la operación en curso primero."
    );
  }

  return prisma.dock.update({
    where: { id },
    data: {
      ...(code !== undefined ? { code } : {}),
      ...(description !== undefined ? { description: description || null } : {}),
      ...(active !== undefined ? { active: Boolean(active) } : {})
    }
  });

}

module.exports = {
  listByGroup,
  create,
  createBulk,
  update
};
