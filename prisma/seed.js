const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding...");

  const warehouse = await prisma.warehouse.create({
    data: {
      code: "CD-BA",
      name: "Centro de Distribución Buenos Aires",
      address: "Buenos Aires"
    }
  });

  const mpGroup = await prisma.dockGroup.create({
    data: {
      code: "MP",
      name: "Recepción Materias Primas",
      warehouseId: warehouse.id
    }
  });

  const ptGroup = await prisma.dockGroup.create({
    data: {
      code: "PT",
      name: "Expedición Producto Terminado",
      warehouseId: warehouse.id
    }
  });

  await prisma.dock.createMany({
    data: [
      {
        code: "D01",
        description: "Dock MP 1",
        groupId: mpGroup.id,
        operationType: "UNLOAD"
      },
      {
        code: "D02",
        description: "Dock MP 2",
        groupId: mpGroup.id,
        operationType: "UNLOAD"
      },
      {
        code: "D03",
        description: "Dock MP 3",
        groupId: mpGroup.id,
        operationType: "UNLOAD"
      },
      {
        code: "D04",
        description: "Dock PT 1",
        groupId: ptGroup.id,
        operationType: "LOAD"
      },
      {
        code: "D05",
        description: "Dock PT 2",
        groupId: ptGroup.id,
        operationType: "LOAD"
      }
    ]
  });

  await prisma.vehicleType.createMany({
    data: [
      {
        name: "UTILITARIO",
        loadingMinutes: 30,
        unloadingMinutes: 30
      },
      {
        name: "CAMION",
        loadingMinutes: 45,
        unloadingMinutes: 45
      },
      {
        name: "SEMI",
        loadingMinutes: 60,
        unloadingMinutes: 60
      },
      {
        name: "BITREN",
        loadingMinutes: 90,
        unloadingMinutes: 90
      }
    ]
  });

  await prisma.supplier.createMany({
    data: [
      {
        name: "Clorox",
        taxId: "30712345678",
        email: "logistica@clorox.com"
      },
      {
        name: "Unilever",
        taxId: "30712345679",
        email: "logistica@unilever.com"
      },
      {
        name: "P&G",
        taxId: "30712345680",
        email: "logistica@pg.com"
      }
    ]
  });
const pgSupplier =
  await prisma.supplier.findFirst({
    where: {
      name: "P&G"
    }
  });


  const adminRole = await prisma.role.create({
  data: {
    code: "ADMIN",
    name: "Administrador"
  }
});

const plannerRole = await prisma.role.create({
  data: {
    code: "PLANNER",
    name: "Planificador"
  }
});

const yardRole = await prisma.role.create({
  data: {
    code: "YARD_OPERATOR",
    name: "Operador de Playa"
  }
});

const gateRole = await prisma.role.create({
  data: {
    code: "GATE_OPERATOR",
    name: "Operador de Porteria"
  }
});

const supplierRole = await prisma.role.create({
  data: {
    code: "SUPPLIER",
    name: "Proveedor"
  }
});
await prisma.user.create({
  data: {
    firstName: "Juan",
    lastName: "Proveedor",
    email: "jperez@pg.com",
    passwordHash: "pg123",
    roleId: supplierRole.id,
    supplierId: pgSupplier.id
  }
});

await prisma.user.create({
  data: {
    firstName: "System",
    lastName: "Administrator",
    email: "admin@yms.com",
    passwordHash: "admin123",
    roleId: adminRole.id
  }
});

await prisma.user.createMany({
  data: [
    {
      firstName: "Juan",
      lastName: "Planner",
      email: "planner@yms.com",
      passwordHash: "planner123",
      roleId: plannerRole.id
    },
    {
      firstName: "Pedro",
      lastName: "Gate",
      email: "gate@yms.com",
      passwordHash: "gate123",
      roleId: gateRole.id
    },
    {
      firstName: "Luis",
      lastName: "Yard",
      email: "yard@yms.com",
      passwordHash: "yard123",
      roleId: yardRole.id
    }
  ]
});

  console.log("✅ Seed finalizado");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });