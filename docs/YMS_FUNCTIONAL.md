YMS - PROJECT STATUS

==================================================
OBJETIVO
==================================================

Desarrollar un YMS (Yard Management System) para gestionar:

- Turnos
- Ingreso de camiones
- Cola de espera
- Asignación de docks
- Operaciones de carga y descarga
- Liberación automática de docks

==================================================
ARQUITECTURA OPERATIVA
==================================================

Warehouse
    |
    v
DockGroup
    |
    v
Dock

Ejemplo:

CD-BA

MP
- D01
- D02
- D03

PT
- D04
- D05

==================================================
ENTIDADES PRINCIPALES
==================================================

Warehouse
- Centro logístico.

DockGroup
- Agrupa docks de una misma operación.
- Ejemplos:
  - MP (Recepción Materia Prima)
  - PT (Expedición Producto Terminado)

Dock
- Muelle físico.

Estados:
- FREE
- OCCUPIED
- OUT_OF_SERVICE

VehicleType
- Define duración estándar.

Ejemplos:

SEMI
LOAD = 45 min
UNLOAD = 60 min

BITREN
LOAD = 60 min
UNLOAD = 90 min

Supplier
- Proveedor.

Truck
- Camión físico.
- Relacionado con VehicleType.

==================================================
SLOT ENGINE
==================================================

Endpoint:

GET /api/slots

Calcula:

- capacity
- reserved
- available

Capacity:

Cantidad de docks activos del DockGroup.

Ejemplo:

MP
- D01
- D02
- D03

Capacity = 3

Reserved:

Cantidad de appointments del horario.

Available:

capacity - reserved

==================================================
NO OVERBOOKING
==================================================

Regla validada.

Si:

capacity = 3
reserved = 3

No se pueden crear más reservas.

Pruebas ejecutadas:

Reserva 1 = OK
Reserva 2 = OK
Reserva 3 = OK
Reserva 4 = RECHAZADA

==================================================
APPOINTMENT
==================================================

Representa una reserva.

Contiene:

- Supplier
- VehicleType
- Warehouse
- DockGroup
- OperationType
- StartTime
- EndTime
- Status

==================================================
ESTADOS DE APPOINTMENT
==================================================

Disponibles:

- SCHEDULED
- CHECKED_IN
- WAITING_DOCK
- IN_OPERATION
- COMPLETED
- CANCELLED
- NO_SHOW

Flujo actual:

SCHEDULED
    |
    v
WAITING_DOCK
    |
    v
IN_OPERATION
    |
    v
COMPLETED

==================================================
CHECK IN
==================================================

Endpoint:

POST /api/checkins

Acciones:

- Crear CheckIn
- Registrar ArrivalTime
- Registrar CreatedById
- Appointment -> WAITING_DOCK

==================================================
COLA FIFO
==================================================

No existe tabla Queue.

La cola se construye usando:

Appointment.status = WAITING_DOCK

Orden:

CheckIn.arrivalTime ASC

Regla:

Primer camión en ingresar
=
Primer camión en recibir Dock

==================================================
CONSULTA DE COLA
==================================================

Endpoint:

GET /api/dock-operations/queue/:dockGroupId

Devuelve:

- Camiones esperando
- Ordenados FIFO
- Por DockGroup

==================================================
ASIGNACION DE DOCK
==================================================

Endpoint:

POST /api/dock-operations/assign

Proceso:

1. Buscar Dock FREE
2. Asignar Dock
3. Crear DockOperation
4. Dock -> OCCUPIED
5. Appointment -> IN_OPERATION

==================================================
DOCK OPERATION
==================================================

Estados:

- ASSIGNED
- IN_PROGRESS
- FINISHED

Actualmente utilizados:

- ASSIGNED
- FINISHED

==================================================
FINALIZACION DE OPERACION
==================================================

Endpoint:

POST /api/dock-operations/finish

Proceso:

1. DockOperation -> FINISHED
2. Dock -> FREE
3. Appointment -> COMPLETED

==================================================
REASIGNACION FIFO AUTOMATICA
==================================================

Implementada.

Cuando se libera un dock:

1. Buscar primer WAITING_DOCK
2. Del mismo DockGroup
3. Crear nueva DockOperation
4. Appointment -> IN_OPERATION
5. Dock -> OCCUPIED

Resultado:

La cola avanza automáticamente
sin intervención manual.

==================================================
AUDITORIA
==================================================

CheckIn

Campos:

- createdById
- arrivalTime

Permite saber:

- Quién realizó el ingreso

DockOperation

Campos:

- assignedById
- startedAt
- finishedAt

Permite saber:

- Quién asignó el dock
- Cuándo inició
- Cuándo finalizó

==================================================
MODULOS IMPLEMENTADOS
==================================================

- appointments
- checkins
- dock-operations
- slots
- warehouses

==================================================
ENDPOINTS DISPONIBLES
==================================================

Slots

GET /api/slots

Appointments

POST /api/appointments

CheckIns

POST /api/checkins

Dock Operations

POST /api/dock-operations/assign

GET /api/dock-operations/queue/:dockGroupId

POST /api/dock-operations/finish

==================================================
FUNCIONALIDADES VALIDADAS
==================================================

OK PostgreSQL
OK Prisma
OK Seed
OK Roles
OK Users
OK Warehouses
OK DockGroups
OK Docks
OK VehicleTypes
OK Trucks
OK Suppliers

OK Slot Engine
OK Capacity Calculation
OK Reserved Calculation
OK Available Calculation

OK No Overbooking

OK Appointment Creation

OK Check In

OK FIFO Waiting Queue

OK Dock Assignment

OK Dock Occupancy

OK Finish Dock Operation

OK Dock Release

OK Automatic FIFO Reassignment

==================================================
ARQUITECTURA OPERATIVA ACTUAL
==================================================

Appointment
    |
    v
SCHEDULED

CheckIn
    |
    v
WAITING_DOCK

Assign Dock
    |
    v
IN_OPERATION

Finish Operation
    |
    v
COMPLETED

Liberar Dock
    |
    v
Buscar Cola FIFO
    |
    v
Reasignar Automáticamente

==================================================
PROXIMA ITERACION
==================================================

Seguridad:

- Login
- JWT
- Authentication Middleware
- Authorization Middleware
- Roles
- Permissions

Roles previstos:

- ADMIN
- PLANNER
- GATE_OPERATOR
- YARD_OPERATOR

==================================================
ESTADO GENERAL
==================================================

MVP OPERATIVO COMPLETO

Reserva de Turno
       |
       v
Check In
       |
       v
Cola FIFO
       |
       v
Asignación de Dock
       |
       v
Operación
       |
       v
Finalización
       |
       v
Liberación de Dock
       |
       v
Reasignación Automática FIFO

USER ↔ SUPPLIER

Un Supplier puede tener múltiples Users.

Un User puede pertenecer a un Supplier.

Los Appointments serán creados por usuarios con rol SUPPLIER.

Todo
1. Revisar seed
2. Agregar rol SUPPLIER
3 modificar POST /api/appointments para que un supplier no pueda hacer un appointment para otro supplier debe tomar req.user.supplierId
3. Crear usuario proveedor de prueba
4. Login
5. JWT
6. Auth Middleware
7. Authorization por roles
8. Appointment utilizando req.user