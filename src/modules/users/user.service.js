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

  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      roleId
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

  return prisma.user.update({
    where: { id },
    data: {
      firstName,
      lastName,
      email,
      roleId,
      status
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
