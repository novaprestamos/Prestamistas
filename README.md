# Sistema de Prestamistas

Sistema completo de gestión de préstamos con módulos separados para clientes, préstamos, pagos, reportes y configuración.

## Características

- ✅ **Gestión de Clientes**: CRUD completo de clientes con información detallada
- ✅ **Gestión de Préstamos**: Crear y administrar préstamos con cálculo automático de intereses
- ✅ **Gestión de Pagos**: Registrar pagos y seguimiento automático de saldos
- ✅ **Dashboard**: Vista general con estadísticas y préstamos vencidos
- ✅ **Reportes**: Generación de reportes por rango de fechas con exportación CSV
- ✅ **Configuración**: Parámetros configurables del sistema
- ✅ **Base de Datos Supabase**: Esquema completo con triggers y funciones

## Tecnologías

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Supabase** - Base de datos PostgreSQL
- **date-fns** - Manejo de fechas
- **Lucide React** - Iconos

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd Prestamistas
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crea un archivo `.env.local` en la raíz del proyecto con:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

4. Configurar Supabase:
   - Crea un proyecto en [Supabase](https://supabase.com)
   - Ejecuta el script SQL en `supabase/schema.sql` en el SQL Editor de Supabase
   - Copia la URL y la clave anónima a tu archivo `.env.local`

5. Ejecutar el servidor de desarrollo:
```bash
npm run dev
```

6. Abrir [http://localhost:3000](http://localhost:3000) en tu navegador

## Estructura del Proyecto

```
Prestamistas/
├── app/                    # Páginas de Next.js
│   ├── clientes/
│   ├── prestamos/
│   ├── pagos/
│   ├── reportes/
│   └── configuracion/
├── modules/                # Módulos separados
│   ├── clientes/
│   ├── prestamos/
│   ├── pagos/
│   ├── dashboard/
│   ├── reportes/
│   └── configuracion/
├── components/             # Componentes reutilizables
│   └── layout/
├── lib/                    # Utilidades y configuración
│   └── supabase.ts
└── supabase/               # Scripts SQL
    └── schema.sql
```

## Módulos

### 1. Clientes
- Crear, editar y eliminar clientes
- Búsqueda por nombre, apellido o documento
- Información completa: contacto, dirección, ocupación, referencias

### 2. Préstamos
- Crear préstamos con cálculo automático de intereses (simple o compuesto)
- Visualización de estado y progreso de pago
- Filtros por estado (activo, pagado, vencido, etc.)
- Cálculo automático de fecha de vencimiento

### 3. Pagos
- Registrar pagos con diferentes métodos
- Filtro por mes
- Actualización automática de saldos pendientes
- Búsqueda por cliente o número de recibo

### 4. Dashboard
- Estadísticas generales del sistema
- Total de clientes, préstamos activos
- Montos prestados, pendientes y recuperados
- Lista de préstamos vencidos

### 5. Reportes
- Generación de reportes por rango de fechas
- Exportación a CSV
- Resumen de préstamos y pagos

### 6. Configuración
- Parámetros configurables del sistema
- Tasas de interés por defecto
- Configuración de plazos

## Base de Datos

El esquema incluye las siguientes tablas:

- **usuarios**: Usuarios del sistema
- **clientes**: Información de clientes
- **prestamos**: Préstamos registrados
- **pagos**: Pagos realizados
- **configuracion**: Parámetros del sistema
- **auditoria**: Registro de cambios (opcional)

### Funciones y Triggers

- Cálculo automático de monto total del préstamo
- Actualización automática de saldos pendientes
- Actualización de estado de préstamos (activo, pagado, vencido)
- Timestamps automáticos (created_at, updated_at)

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Ejecutar linter

## Características Técnicas

- **Interés Simple**: `Monto Total = Principal × (1 + (Tasa/100) × (Días/30))`
- **Interés Compuesto**: `Monto Total = Principal × (1 + Tasa/100)^(Días/30)`
- Actualización automática de estados basada en fechas de vencimiento
- Validación de datos en frontend y backend
- Diseño responsive con Tailwind CSS

## Próximas Mejoras

- [ ] Autenticación de usuarios
- [ ] Notificaciones de préstamos vencidos
- [ ] Gráficos y visualizaciones avanzadas
- [ ] Exportación a PDF
- [ ] Historial de cambios
- [ ] Multi-idioma

## Licencia

Este proyecto es de uso privado.
