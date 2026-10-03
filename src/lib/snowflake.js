const snowflake = require("snowflake-sdk");

/**
 * Cliente de Snowflake para traer los viajes de Infolog (flujo Fátima).
 * Adaptado del script de referencia que pasó el equipo de Infolog:
 * consulta DB_PRD_PROCESSING.FGE50CECBA.STG_GETOUE/STG_GETOUD, filtrando
 * por actividad y por una ventana de días hacia adelante desde "ahora" en
 * hora de Buenos Aires.
 *
 * Credenciales SIEMPRE desde variables de entorno (nunca hardcodeadas acá):
 * SNOW_ACCOUNT, SNOW_USERNAME, SNOW_PASSWORD, SNOW_WAREHOUSE, SNOW_ROLE,
 * y opcionalmente SNOW_DATABASE / SNOW_SCHEMA si la cuenta los requiere
 * para conectar.
 */

function getConnection() {

  const required = [
    "SNOW_ACCOUNT",
    "SNOW_USERNAME",
    "SNOW_PASSWORD",
    "SNOW_WAREHOUSE"
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno de Snowflake: ${missing.join(", ")}`
    );
  }

  return snowflake.createConnection({
    account: process.env.SNOW_ACCOUNT,
    username: process.env.SNOW_USERNAME,
    password: process.env.SNOW_PASSWORD,
    warehouse: process.env.SNOW_WAREHOUSE,
    role: process.env.SNOW_ROLE || undefined,
    database: process.env.SNOW_DATABASE || undefined,
    schema: process.env.SNOW_SCHEMA || undefined
  });

}

function connect(connection) {
  return new Promise((resolve, reject) => {
    connection.connect((err, conn) => {
      if (err) return reject(err);
      resolve(conn);
    });
  });
}

function execute(connection, sqlText) {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText,
      complete: (err, stmt, rows) => (err ? reject(err) : resolve(rows))
    });
  });
}

function destroy(connection) {
  return new Promise((resolve) => {
    connection.destroy(() => resolve());
  });
}

// Solo letras, números y espacios: ACTIVIDAD es un código interno (ej.
// "001"), nunca un valor que escriba un usuario final de YMS.
function sanitizeActividad(actividad) {
  if (!actividad) return "";
  if (!/^[A-Za-z0-9 ]*$/.test(actividad)) {
    throw new Error("Código de actividad inválido.");
  }
  return actividad;
}

function buildViajesQuery({ actividad, dias, incluirHoyPasado }) {

  const actividadSegura = sanitizeActividad(actividad);
  const diasSeguro = Number.isInteger(dias) ? dias : 30;

  const filtroActividad = actividadSegura
    ? `AND o.ACTIVIDADES LIKE '%${actividadSegura}%'`
    : "";

  const filtroHoy = incluirHoyPasado
    ? ""
    : "AND (v.DATLIV > lim.HOY OR o.HORA_NUM IS NULL OR o.HORA_NUM > lim.HORA_AHORA)";

  const lim = `
  lim AS (
    SELECT TO_NUMBER(TO_CHAR(a.AHORA::DATE, 'YYYYMMDD')) AS HOY,
           TO_NUMBER(TO_CHAR(a.AHORA, 'HH24MISS')) AS HORA_AHORA,
           TO_NUMBER(TO_CHAR(DATEADD(day, ${diasSeguro}, a.AHORA::DATE), 'YYYYMMDD')) AS TOPE
    FROM (SELECT CONVERT_TIMEZONE('America/Argentina/Buenos_Aires', CURRENT_TIMESTAMP()) AS AHORA) a
  )`;

  return `
  WITH ${lim},
  tours AS (
    SELECT TRY_TO_NUMBER(TRIM(TO_VARCHAR(e."NUMTOU"))) AS NUMTOU,
           TRY_TO_NUMBER(TRIM(TO_VARCHAR(e."TOULIV"))) AS RUTA,
           TRY_TO_NUMBER(TRIM(TO_VARCHAR(e."DATLIV"))) AS DATLIV,
           TRY_TO_NUMBER(TRIM(TO_VARCHAR(e."MAJCRE"))) AS INGRESO,
           TRIM(TO_VARCHAR(e."ETATOU")) AS ETATOU,
           TRY_TO_NUMBER(TRIM(TO_VARCHAR(e."CUMCOL1"))) AS CAJAS,
           TRY_TO_NUMBER(TRIM(TO_VARCHAR(e."CUMCOL2"))) AS CAJAS_2,
           TRY_TO_NUMBER(TRIM(TO_VARCHAR(e."DATEXP"))) AS DATEXP
    FROM DB_PRD_PROCESSING.FGE50CECBA.STG_GETOUE e
    CROSS JOIN lim
    WHERE TRY_TO_NUMBER(TRIM(TO_VARCHAR(e."DATLIV"))) BETWEEN lim.HOY AND lim.TOPE
  ),
  ord AS (
    SELECT v.NUMTOU,
           MAX(TRY_TO_NUMBER(TRIM(TO_VARCHAR(d."HEULIV")))) AS HORA_NUM,
           LISTAGG(DISTINCT TRIM(TO_VARCHAR(d."CODACT")), ',') AS ACTIVIDADES,
           LISTAGG(DISTINCT TRIM(TO_VARCHAR(d."CODCLI")), ' / ') AS COD_CLIENTE,
           LISTAGG(DISTINCT TRIM(TO_VARCHAR(d."NOMCLI")), ' / ') AS NOMBRE_CLIENTE,
           LISTAGG(DISTINCT TRIM(TO_VARCHAR(d."ETALIV")), ',') AS ESTADO_ORDENES
    FROM DB_PRD_PROCESSING.FGE50CECBA.STG_GETOUD d
    JOIN tours v ON TRY_TO_NUMBER(TRIM(TO_VARCHAR(d."NUMTOU"))) = v.NUMTOU
    GROUP BY v.NUMTOU
  )
  SELECT v.RUTA AS N_RUTA,
         TO_CHAR(TRY_TO_DATE(TO_VARCHAR(v.INGRESO), 'YYYYMMDD'), 'DD/MM/YYYY') AS INGRESO_SISTEMA,
         TO_CHAR(TRY_TO_DATE(TO_VARCHAR(v.DATLIV), 'YYYYMMDD'), 'DD/MM/YYYY') AS FECHA_CARGA,
         SUBSTR(LPAD(TO_VARCHAR(o.HORA_NUM), 6, '0'), 1, 2) || ':' ||
           SUBSTR(LPAD(TO_VARCHAR(o.HORA_NUM), 6, '0'), 3, 2) AS HORA_CARGA,
         v.ETATOU AS ESTADO_VIAJE,
         o.ESTADO_ORDENES,
         o.COD_CLIENTE,
         o.NOMBRE_CLIENTE,
         v.CAJAS AS CAJAS_PENDIENTES,
         v.CAJAS_2,
         v.DATEXP,
         v.NUMTOU
  FROM tours v
  CROSS JOIN lim
  LEFT JOIN ord o ON o.NUMTOU = v.NUMTOU
  WHERE 1 = 1
    ${filtroActividad}
    ${filtroHoy}
  ORDER BY v.DATLIV, o.HORA_NUM NULLS LAST, v.RUTA
  `;

}

/**
 * Trae los viajes de Infolog pendientes de carga, dentro de la ventana de
 * `dias` días hacia adelante. No valida disponibilidad de slots: eso lo
 * resuelve la cola de YMS en el Check-In/asignación de dock.
 */
async function fetchViajes({ actividad = "001", dias = 30, incluirHoyPasado = false } = {}) {

  const connection = getConnection();

  try {

    await connect(connection);

    const rows = await execute(
      connection,
      buildViajesQuery({ actividad, dias, incluirHoyPasado })
    );

    return rows;

  } finally {

    await destroy(connection);

  }

}

module.exports = {
  fetchViajes
};
