const prisma = require("../../lib/prisma");
const { AppError, requireFields } = require("../../lib/errors");
const { fetchViajes } = require("../../lib/snowflake");
const { buenosAiresDateTime } = require("../../lib/timezone");

// No hace falta un polling constante: alcanza con consultar Snowflake cada
// vez que un operador entra a la pantalla de Check-In (sincronización
// automática, sin botón). Si ya se sincronizó hace menos de una hora, no
// tiene sentido volver a pegarle a Snowflake.
const SYNC_COOLDOWN_MS = 60 * 60 * 1000;

// Duración provisoria del turno mientras no se conoce el tipo de
// vehículo (Infolog no lo manda; se completa recién en el Check-In). Una
// vez hecho el Check-In, lo que importa para la operación real son los
// tiempos de arrivalTime / DockOperation, no este estimado.
const DURACION_PROVISORIA_MIN = 60;

function parseFechaCarga(fechaCarga) {
  // Viene como "DD/MM/YYYY" desde Snowflake (TO_CHAR del script de
  // referencia).
  if (!fechaCarga || typeof fechaCarga !== "string") return null;

  const [day, month, year] = fechaCarga.split("/");

  if (!day || !month || !year) return null;

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

async function findOrCreateSupplierForCliente({ codCliente, nombreCliente }) {

  const codigo = (codCliente || "").trim() || "SIN_CODIGO";
  const taxId = `INFOLOG-${codigo}`;

  const existing = await prisma.supplier.findUnique({
    where: { taxId }
  });

  if (existing) return existing;

  return prisma.supplier.create({
    data: {
      name: (nombreCliente || "").trim() || `Cliente Infolog ${codigo}`,
      taxId
    }
  });

}

async function resolveDockGroupId({ warehouseId, dockGroupId }) {

  if (dockGroupId) {

    const dockGroup = await prisma.dockGroup.findUnique({
      where: { id: dockGroupId }
    });

    if (!dockGroup || dockGroup.warehouseId !== warehouseId) {
      throw new AppError(
        "El tipo de dock indicado no pertenece a este depósito."
      );
    }

    return dockGroup.id;

  }

  // Sin un dock group explícito, se usa el primero activo del depósito.
  // Asunción a confirmar si Fátima termina teniendo más de un dock group
  // relevante para los viajes de Infolog.
  const defaultDockGroup = await prisma.dockGroup.findFirst({
    where: { warehouseId, active: true },
    orderBy: { code: "asc" }
  });

  if (!defaultDockGroup) {
    throw new AppError(
      "El depósito no tiene ningún tipo de dock activo para asignar los viajes de Infolog."
    );
  }

  return defaultDockGroup.id;

}

/**
 * Sincroniza los viajes de Infolog (Snowflake) contra los Appointments de
 * YMS, on-demand (sin polling): se llama cuando un operador está por hacer
 * un Check-In. Idempotente por externalTripId (NUMTOU) y no toca turnos
 * que ya avanzaron más allá de SCHEDULED.
 */
async function syncInfologTrips(data) {

  requireFields(data, {
    warehouseId: "Depósito"
  });

  const { warehouseId, dockGroupId, force } = data;

  const warehouse = await prisma.warehouse.findUnique({
    where: { id: warehouseId }
  });

  if (!warehouse) {
    throw new AppError("El depósito indicado no existe.");
  }

  if (
    !force &&
    warehouse.infologLastSyncedAt &&
    Date.now() - new Date(warehouse.infologLastSyncedAt).getTime() <
      SYNC_COOLDOWN_MS
  ) {
    return {
      skipped: true,
      reason: "synced_recently",
      lastSyncedAt: warehouse.infologLastSyncedAt
    };
  }

  const resolvedDockGroupId = await resolveDockGroupId({
    warehouseId,
    dockGroupId
  });

  const rows = await fetchViajes({
    actividad: process.env.INFOLOG_ACTIVIDAD || "001",
    dias: Number(process.env.INFOLOG_DIAS_ADELANTE) || 30
  });

  const summary = {
    skipped: false,
    totalFetched: rows.length,
    created: 0,
    updated: 0,
    unchanged: 0,
    skippedNoDateTime: 0,
    skippedNoTripId: 0,
    errors: []
  };

  for (const row of rows) {

    try {

      if (!row.NUMTOU) {
        summary.skippedNoTripId += 1;
        continue;
      }

      const externalTripId = String(row.NUMTOU);

      const fechaIso = parseFechaCarga(row.FECHA_CARGA);

      if (!fechaIso || !row.HORA_CARGA) {
        summary.skippedNoDateTime += 1;
        continue;
      }

      const startTime = buenosAiresDateTime(fechaIso, row.HORA_CARGA);
      const endTime = new Date(
        startTime.getTime() + DURACION_PROVISORIA_MIN * 60 * 1000
      );

      const supplier = await findOrCreateSupplierForCliente({
        codCliente: row.COD_CLIENTE,
        nombreCliente: row.NOMBRE_CLIENTE
      });

      const existing = await prisma.appointment.findUnique({
        where: { externalTripId }
      });

      if (!existing) {

        await prisma.appointment.create({
          data: {
            supplierId: supplier.id,
            warehouseId,
            dockGroupId: resolvedDockGroupId,
            operationType: "LOAD",
            startTime,
            endTime,
            status: "SCHEDULED",
            externalTripId
          }
        });

        summary.created += 1;
        continue;

      }

      if (existing.status !== "SCHEDULED") {
        // Ya se hizo Check-In (o se completó/canceló) sobre este viaje:
        // no se pisa nada, el viaje queda como está.
        summary.unchanged += 1;
        continue;
      }

      await prisma.appointment.update({
        where: { id: existing.id },
        data: {
          supplierId: supplier.id,
          startTime,
          endTime
        }
      });

      summary.updated += 1;

    } catch (error) {

      summary.errors.push({
        numtou: row.NUMTOU,
        message: error.message
      });

    }

  }

  await prisma.warehouse.update({
    where: { id: warehouseId },
    data: { infologLastSyncedAt: new Date() }
  });

  summary.lastSyncedAt = new Date();

  return summary;

}

module.exports = {
  syncInfologTrips
};
