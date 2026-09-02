const prisma = require("../../lib/prisma");

const getAll = async () => {
  return prisma.documentType.findMany({
    where: {
      active: true
    },
    orderBy: {
      name: "asc"
    }
  });
};

const create = async (data) => {
  const { code, name, description } = data;

  // 1. Buscamos si ya existe un registro con ese mismo código (activo o inactivo)
  const existing = await prisma.documentType.findUnique({
    where: { code }
  });

  if (existing) {
    // Si existe pero estaba borrado (active: false), lo "reactivamos" y actualizamos sus datos
    if (!existing.active) {
      return prisma.documentType.update({
        where: { id: existing.id },
        data: {
          name,
          description,
          active: true
        }
      });
    }

    // Si ya existe y está activo, lanzamos un error que capture la controller
    throw new Error(`El código '${code}' ya está en uso por un tipo de documento activo.`);
  }

  // 2. Si no existía de antes, lo creamos normalmente
  return prisma.documentType.create({
    data: {
      code,
      name,
      description
    }
  });
};

const update = async (id, { code, name, description }) => {
  // Si se intenta cambiar el código en un update, validamos que no colisione con otro
  if (code) {
    const existing = await prisma.documentType.findUnique({
      where: { code }
    });

    if (existing && existing.id !== id) {
      throw new Error(`El código '${code}' ya pertenece a otro registro.`);
    }
  }

  return prisma.documentType.update({
    where: { id },
    data: {
      code,
      name,
      description
    }
  });
};

const remove = async (id) => {
  return prisma.documentType.update({
    where: { id },
    data: {
      active: false
    }
  });
};

module.exports = {
  getAll,
  create,
  update,
  remove
};