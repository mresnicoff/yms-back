const prisma = require("../../lib/prisma");
const bcrypt = require("bcryptjs");
const { AppError, requireFields } = require("../../lib/errors");

const SELECT_SAFE_FIELDS = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  status: true,
  roleId: true,
  supplierId: true,
  createdAt: true,
  updatedAt: true,
  role: {
    select: {
      id: true,
      code: true,
      name: true
    }
  },
  supplier: {
    select: {
      id: true,
      name: true
    }
  }
};

const getAll = async () => {

  return prisma.user.findMany({
    select: SELECT_SAFE_FIELDS,
    orderBy: [
      { firstName: "asc" },
      { lastName: "asc" }
    ]
  });

};

const getRoles = async () => {

  return prisma.role.findMany({
    orderBy: {
      name: "asc"
    }
  });

};

// El rol Proveedor siempre debe quedar asociado a un Supplier (para que
// el usuario solo pueda ver/pedir turnos de ese proveedor). Para
// cualquier otro rol, el usuario no debe quedar ligado a ningún proveedor.
const resolveSupplierId = async (role, data) => {

  if (role.code !== "SUPPLIER") {
    return null;
  }

  if (!data.supplierId) {
    throw new AppError("Para el rol Proveedor hay que seleccionar o crear un proveedor.");
  }

  const supplier = await prisma.supplier.findUnique({
    where: { id: data.supplierId }
  });

  if (!supplier) {
    throw new AppError("El proveedor seleccionado no existe.");
  }

  return supplier.id;

};

const create = async (data) => {

  requireFields(data, {
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Email",
    password: "Contraseña",
    roleId: "Rol"
  });

  const { firstName, lastName, email, password, roleId } = data;

  if (password.length < 6) {
    throw new AppError("La contraseña debe tener al menos 6 caracteres.");
  }

  const role = await prisma.role.findUnique({
    where: { id: roleId }
  });

  if (!role) {
    throw new AppError("El rol seleccionado no existe.");
  }

  const existing = await prisma.user.findUnique({
    where: { email }
  });

  if (existing) {
    throw new AppError("Ya existe un usuario con ese email.");
  }

  const supplierId = await resolveSupplierId(role, data);

  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      roleId,
      supplierId
    },
    select: SELECT_SAFE_FIELDS
  });

};

const update = async (id, data, requestingUserId) => {

  requireFields(data, {
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Email",
    roleId: "Rol",
    status: "Estado"
  });

  const { firstName, lastName, email, roleId, status } = data;

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new AppError("El usuario no existe.", 404);
  }

  const isSelf = requestingUserId && requestingUserId === id;

  if (isSelf && status !== "ACTIVE") {
    throw new AppError("No podés desactivar o bloquear tu propio usuario.");
  }

  const role = await prisma.role.findUnique({
    where: { id: roleId }
  });

  if (!role) {
    throw new AppError("El rol seleccionado no existe.");
  }

  if (isSelf && role.code !== "ADMIN") {
    throw new AppError("No podés quitarte a vos mismo el rol de administrador.");
  }

  const emailOwner = await prisma.user.findUnique({
    where: { email }
  });

  if (emailOwner && emailOwner.id !== id) {
    throw new AppError("Ya existe otro usuario con ese email.");
  }

  const supplierId = await resolveSupplierId(role, data);

  return prisma.user.update({
    where: { id },
    data: {
      firstName,
      lastName,
      email,
      roleId,
      status,
      supplierId
    },
    select: SELECT_SAFE_FIELDS
  });

};

const resetPassword = async (id, data) => {

  requireFields(data, {
    password: "Contraseña nueva"
  });

  const { password } = data;

  if (password.length < 6) {
    throw new AppError("La contraseña debe tener al menos 6 caracteres.");
  }

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new AppError("El usuario no existe.", 404);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id },
    data: {
      passwordHash
    }
  });

  return { message: "Contraseña actualizada correctamente." };

};

module.exports = {
  getAll,
  getRoles,
  create,
  update,
  resetPassword
};
