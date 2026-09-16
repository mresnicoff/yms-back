const prisma =
  require("../../lib/prisma");

const { AppError, requireFields } =
  require("../../lib/errors");

async function getAll() {

  return prisma.supplier.findMany({
    orderBy: {
      name: "asc"
    }
  });

}

async function create(data) {

  requireFields(data, {
    name: "Nombre del proveedor",
    taxId: "CUIT / Tax ID"
  });

  const { name, taxId, email } = data;

  const existing = await prisma.supplier.findUnique({
    where: { taxId }
  });

  if (existing) {
    throw new AppError("Ya existe un proveedor con ese CUIT / Tax ID.");
  }

  return prisma.supplier.create({
    data: {
      name,
      taxId,
      email: email || null
    }
  });

}

module.exports = {
  getAll,
  create
};
