// Datos de demo para filmar el video de YMSPro.
//
// Uso (desde C:\proyectos\yms-back, con DATABASE_URL en el .env):
//   node prisma/demo-seed.js                 -> libera docks viejos y carga la demo
//   node prisma/demo-seed.js --clean         -> borra todo lo de la demo
//   node prisma/demo-seed.js --solo-liberar  -> solo libera los docks trabados
//
// Opcional: DEMO_PHONE=1123643945 para que el chofer "Martín" reciba el
// WhatsApp real cuando se le asigne un dock en el video.
//
// Todo lo que crea lleva el código "DEMO" (depósito DEMO, docks DEMO-D*,
// patentes DEMO*, CUIT 30999990*), así --clean no toca nada más.

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const PHONE = process.env.DEMO_PHONE || "1123643945";

// Argentina no usa horario de verano: Buenos Aires = UTC-3 todo el año.
const nowBA = new Date(Date.now() - 3 * 3600 * 1000);
const Y = nowBA.getUTCFullYear();
const M = nowBA.getUTCMonth();
const D = nowBA.getUTCDate();
const at = (hh, mm = 0, dia = 0) => new Date(Date.UTC(Y, M, D - dia, hh + 3, mm));

async function limpiar() {
  const wh = await prisma.warehouse.findUnique({ where: { code: "DEMO" } });

  if (wh) {
    const appts = await prisma.appointment.findMany({
      where: { warehouseId: wh.id },
      select: { id: true }
    });
    const apptIds = appts.map((a) => a.id);

    const checkIns = await prisma.checkIn.findMany({
      where: { appointmentId: { in: apptIds } },
      select: { id: true }
    });
    const ciIds = checkIns.map((c) => c.id);

    const ops = await prisma.dockOperation.findMany({
      where: { checkInId: { in: ciIds } },
      select: { id: true }
    });
    const opIds = ops.map((o) => o.id);

    await prisma.dispatch.deleteMany({ where: { dockOperationId: { in: opIds } } });
    await prisma.dockOperation.deleteMany({ where: { id: { in: opIds } } });
    await prisma.atraco.deleteMany({ where: { checkInId: { in: ciIds } } });
    await prisma.checkIn.deleteMany({ where: { id: { in: ciIds } } });
    await prisma.appointment.deleteMany({ where: { id: { in: apptIds } } });

    const groups = await prisma.dockGroup.findMany({
      where: { warehouseId: wh.id },
      select: { id: true }
    });
    const gIds = groups.map((g) => g.id);

    await prisma.dockSchedule.deleteMany({ where: { dock: { groupId: { in: gIds } } } });
    await prisma.dock.deleteMany({ where: { groupId: { in: gIds } } });
    await prisma.dockGroupSchedule.deleteMany({ where: { dockGroupId: { in: gIds } } });
    await prisma.dockGroup.deleteMany({ where: { id: { in: gIds } } });
    await prisma.warehouse.delete({ where: { id: wh.id } });
  }

  await prisma.truck.deleteMany({ where: { plate: { startsWith: "DEMO" } } });
  await prisma.driver.deleteMany({ where: { licenseNumber: { startsWith: "DEMO" } } });
  await prisma.supplier.deleteMany({ where: { taxId: { startsWith: "30999990" } } });

  console.log("🧹 Demo borrada");
}

// Docks que quedaron "ocupados" de pruebas viejas: cierra la operación y
// libera el dock. Solo toca operaciones de más de 12 horas sin terminar.
async function liberarDocksViejos() {
  const limite = new Date(Date.now() - 12 * 3600 * 1000);

  const viejas = await prisma.dockOperation.findMany({
    where: { status: { not: "FINISHED" }, startedAt: { lt: limite } },
    include: { checkIn: true }
  });

  for (const op of viejas) {
    await prisma.dockOperation.update({
      where: { id: op.id },
      data: { status: "FINISHED", finishedAt: new Date() }
    });
    await prisma.appointment.update({
      where: { id: op.checkIn.appointmentId },
      data: { status: "COMPLETED" }
    });
  }

  const ocupados = await prisma.dock.findMany({
    where: { status: "OCCUPIED", code: { not: { startsWith: "DEMO" } } },
    include: { operations: { where: { status: { not: "FINISHED" } } } }
  });

  let liberados = 0;
  for (const dock of ocupados) {
    if (dock.operations.length === 0) {
      await prisma.dock.update({ where: { id: dock.id }, data: { status: "FREE" } });
      liberados++;
    }
  }

  console.log(`🔓 Operaciones viejas cerradas: ${viejas.length} · docks liberados: ${liberados}`);
}

async function vehiculo(name, loadingMinutes, unloadingMinutes) {
  return (
    (await prisma.vehicleType.findUnique({ where: { name } })) ||
    (await prisma.vehicleType.create({ data: { name, loadingMinutes, unloadingMinutes } }))
  );
}

async function cargarDemo() {
  await limpiar();

  const wh = await prisma.warehouse.create({
    data: { code: "DEMO", name: "Depósito Demo", address: "Parque industrial, Buenos Aires" }
  });

  const grupo = await prisma.dockGroup.create({
    data: {
      code: "DEMO-REC",
      name: "Carga y Descarga",
      warehouseId: wh.id,
      assignmentMode: "AUTO"
    }
  });

  await prisma.dockGroupSchedule.createMany({
    data: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
      dockGroupId: grupo.id,
      weekday,
      startTime: "06:00",
      endTime: "22:00",
      closed: false
    }))
  });

  const docks = [];
  for (let i = 1; i <= 4; i++) {
    docks.push(
      await prisma.dock.create({
        data: { code: `DEMO-D${i}`, description: `Dock ${i}`, groupId: grupo.id }
      })
    );
  }

  const camion = await vehiculo("CAMION", 45, 45);
  const semi = await vehiculo("SEMI", 60, 60);
  const utilitario = await vehiculo("UTILITARIO", 30, 30);

  const proveedores = [];
  for (const [i, nombre] of [
    "Distribuidora Norte",
    "Lácteos del Sur",
    "Bebidas Pampa",
    "Limpieza Total",
    "Golosinas Río"
  ].entries()) {
    proveedores.push(
      await prisma.supplier.create({
        data: { name: nombre, taxId: `3099999000${i}`, email: `demo${i}@example.com` }
      })
    );
  }

  const choferes = [];
  for (const [i, [nombre, apellido, tel]] of [
    ["Carlos", "Gómez", "1155550101"],
    ["Luis", "Fernández", "1155550102"],
    ["Ramiro", "Acosta", "1155550103"],
    ["Diego", "Sosa", "1155550104"],
    ["Martín", "Demo", PHONE],
    ["Pablo", "Ibáñez", "1155550105"],
    ["Hugo", "Peralta", "1155550106"],
    ["Raúl", "Domínguez", "1155550107"]
  ].entries()) {
    choferes.push(
      await prisma.driver.create({
        data: { firstName: nombre, lastName: apellido, phone: tel, licenseNumber: `DEMO-${i + 1}` }
      })
    );
  }

  const camiones = [];
  const tipos = [semi, camion, semi, utilitario, camion, semi, camion, semi];
  for (let i = 0; i < 8; i++) {
    camiones.push(
      await prisma.truck.create({
        data: { plate: `DEMO${String(i + 1).padStart(2, "0")}`, vehicleTypeId: tipos[i].id }
      })
    );
  }

  // Estados que usa el sistema: la operación de dock está ASSIGNED desde que
  // se asigna el dock hasta que se libera (FINISHED). El Atraco es el
  // momento en que el camión estaciona en el dock.
  const plan = [
    // Ya despachados hoy (uno puntual, uno que llegó tarde)
    { p: 0, c: 0, op: "UNLOAD", h: 7, status: "COMPLETED", llegada: [6, 52], dock: 0, ini: [7, 5], atraco: [7, 12], fin: [7, 58] },
    { p: 1, c: 1, op: "LOAD", h: 8, status: "COMPLETED", llegada: [8, 25], dock: 1, ini: [8, 40], atraco: [8, 47], fin: [9, 35] },
    // En muelle ahora
    { p: 2, c: 2, op: "UNLOAD", h: 9, status: "ASSIGNED", llegada: [8, 48], dock: 0, ini: [9, 2], atraco: [9, 9] },
    { p: 3, c: 3, op: "LOAD", h: 9, m: 30, status: "ASSIGNED", llegada: [9, 50], dock: 1, ini: [10, 10] },
    // En cola (esperan dock)
    { p: 4, c: 4, op: "UNLOAD", h: 10, status: "WAITING_DOCK", llegada: [9, 55] },
    { p: 0, c: 5, op: "UNLOAD", h: 10, m: 30, status: "WAITING_DOCK", llegada: [10, 12] },
    // Turnos futuros
    { p: 1, c: 6, op: "LOAD", h: 12, status: "SCHEDULED" },
    { p: 2, c: 7, op: "UNLOAD", h: 14, status: "SCHEDULED" }
  ];

  const crear = async (t, n, dia = 0) => {
    const inicio = at(t.h, t.m || 0, dia);
    const vt = tipos[t.c];
    const mins = t.op === "LOAD" ? vt.loadingMinutes : vt.unloadingMinutes;
    const appStatus =
      t.status === "ASSIGNED" ? "IN_OPERATION" : t.status;

    const appt = await prisma.appointment.create({
      data: {
        supplierId: proveedores[t.p].id,
        vehicleTypeId: vt.id,
        warehouseId: wh.id,
        dockGroupId: grupo.id,
        operationType: t.op,
        startTime: inicio,
        endTime: new Date(inicio.getTime() + mins * 60000),
        status: appStatus
      }
    });

    if (!t.llegada) return;

    const ci = await prisma.checkIn.create({
      data: {
        appointmentId: appt.id,
        truckId: camiones[t.c].id,
        driverId: choferes[t.c].id,
        arrivalTime: at(t.llegada[0], t.llegada[1], dia)
      }
    });

    if (t.dock === undefined) return;

    const finalizada = t.status === "COMPLETED";

    const dop = await prisma.dockOperation.create({
      data: {
        dockId: docks[t.dock].id,
        checkInId: ci.id,
        startedAt: at(t.ini[0], t.ini[1], dia),
        finishedAt: finalizada ? at(t.fin[0], t.fin[1], dia) : null,
        status: finalizada ? "FINISHED" : "ASSIGNED"
      }
    });

    if (t.atraco) {
      await prisma.atraco.create({
        data: {
          checkInId: ci.id,
          cunasColocadas: 2,
          llavesOk: true,
          horaAtraco: at(t.atraco[0], t.atraco[1], dia),
          clienteFinal: "Supermercados Demo",
          receptor: "Operador 1",
          auditor: "Auditor 1",
          cargador: "Cargador 1"
        }
      });
    }

    if (finalizada) {
      await prisma.dispatch.create({
        data: {
          dockOperationId: dop.id,
          routeSheetNumber: `HR-${1000 + n}`,
          sealNumbers: [`P${5000 + n}`, `P${6000 + n}`],
          checkedOutAt: at(t.fin[0], t.fin[1], dia)
        }
      });
    } else {
      await prisma.dock.update({ where: { id: docks[t.dock].id }, data: { status: "OCCUPIED" } });
    }
  };

  for (const [n, t] of plan.entries()) await crear(t, n);

  // Historia de los últimos 3 días para que el reporte de tiempos tenga
  // datos: mezcla de camiones puntuales y con demora.
  const historia = [
    // [proveedor, camión, op, hora turno, min de llegada vs turno, espera playa, min a atraco, min en dock]
    [0, 0, "UNLOAD", 7, -8, 10, 6, 45],
    [1, 1, "LOAD", 8, 3, 18, 7, 58],
    [2, 2, "UNLOAD", 9, 22, 12, 5, 50],
    [3, 3, "LOAD", 10, -2, 40, 8, 70],
    [4, 4, "UNLOAD", 11, 35, 25, 6, 52],
    [0, 5, "UNLOAD", 13, 0, 15, 5, 48]
  ];

  let k = 100;
  for (const dia of [1, 2, 3]) {
    for (const [p, c, op, h, desvio, espera, aDock, enDock] of historia) {
      const llegada = new Date(at(h, 0, dia).getTime() + desvio * 60000);
      const ini = new Date(llegada.getTime() + espera * 60000);
      const atr = new Date(ini.getTime() + aDock * 60000);
      const fin = new Date(atr.getTime() + enDock * 60000);

      const hh = (d) => {
        const l = new Date(d.getTime() - 3 * 3600 * 1000);
        return [l.getUTCHours(), l.getUTCMinutes()];
      };

      await crear(
        {
          p, c, op, h, status: "COMPLETED",
          llegada: hh(llegada), dock: c % 4, ini: hh(ini), atraco: hh(atr), fin: hh(fin)
        },
        k++,
        dia
      );
    }
  }

  console.log("✅ Demo cargada: depósito DEMO, 4 docks, 5 proveedores, 8 turnos de hoy + 18 de los últimos 3 días");
  console.log(`   Chofer "Martín Demo" (WhatsApp ${PHONE}) está en la cola para asignarle dock en vivo.`);
}

async function main() {
  const arg = process.argv[2];

  if (arg === "--clean") return limpiar();
  if (arg === "--solo-liberar") return liberarDocksViejos();

  await liberarDocksViejos();
  await cargarDemo();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
