# Configuración de Supabase

## Pasos para configurar la base de datos

### 1. Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Anota la URL del proyecto y la clave anónima (anon key)

### 2. Ejecutar el script SQL

1. En el panel de Supabase, ve a **SQL Editor**
2. Abre el archivo `supabase/schema.sql` de este proyecto
3. Copia todo el contenido del archivo
4. Pégalo en el SQL Editor de Supabase
5. Haz clic en **Run** o presiona `Ctrl+Enter`

Este script creará:
- Todas las tablas necesarias (usuarios, clientes, préstamos, pagos, configuración, auditoria)
- Índices para mejorar el rendimiento
- Funciones para cálculos automáticos
- Triggers para actualización automática de campos
- Datos iniciales de configuración
- Campos de avatar en usuarios y clientes

### 3. Configurar variables de entorno

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Agrega las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

Puedes encontrar estos valores en:
- **Settings** → **API** en el panel de Supabase
- **Project URL** = `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key = `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Verificar la instalación

Después de ejecutar el script SQL, verifica que las tablas se crearon correctamente:

1. Ve a **Table Editor** en Supabase
2. Deberías ver las siguientes tablas:
   - `usuarios`
   - `clientes`
   - `prestamos`
   - `pagos`
   - `configuracion`
   - `auditoria`

### 5. Configurar políticas de seguridad (RLS)

Por defecto, Supabase tiene Row Level Security (RLS) habilitado. Para desarrollo, puedes:

**Opción A: Deshabilitar RLS (solo para desarrollo)**
```sql
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE prestamos DISABLE ROW LEVEL SECURITY;
ALTER TABLE pagos DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion DISABLE ROW LEVEL SECURITY;
```

**Opción B: Crear políticas (recomendado para producción)**
```sql
-- Permitir lectura y escritura para todos (ajustar según necesidades)
CREATE POLICY "Permitir todo en clientes" ON clientes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todo en prestamos" ON prestamos
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todo en pagos" ON pagos
  FOR ALL USING (true) WITH CHECK (true);
```

### 6. Datos de prueba (opcional)

Puedes insertar datos de prueba ejecutando:

```sql
-- Insertar un usuario de prueba
INSERT INTO usuarios (email, nombre, apellido, rol) VALUES
  ('admin@prestamistas.com', 'Admin', 'Sistema', 'admin');

-- Insertar un cliente de prueba
INSERT INTO clientes (documento_identidad, nombre, apellido, telefono, email) VALUES
  ('12345678', 'Juan', 'Pérez', '555-1234', 'juan@example.com');
```

### 5.1 Configurar storage para avatares

1. En el panel de Supabase, ve a **SQL Editor**
2. Abre el archivo `supabase/rls_policies.sql`
3. Copia y ejecuta también la sección **STORAGE PARA AVATARES**

Esto crea:
- Un bucket público `avatars`
- Políticas para leer y subir imágenes de perfil

## Estructura de las tablas

### usuarios
- Información de usuarios del sistema
- Roles: admin, prestamista, operador

### clientes
- Información completa de clientes
- Documento de identidad único

### prestamos
- Préstamos con cálculo automático de intereses
- Estados: activo, pagado, vencido, cancelado, moroso
- Actualización automática de saldos

### pagos
- Registro de pagos
- Actualización automática de saldos pendientes en préstamos

### configuracion
- Parámetros configurables del sistema
- Valores por defecto para tasas y plazos

### auditoria
- Registro de cambios (opcional, para futuras implementaciones)

## Funciones automáticas

El sistema incluye funciones que se ejecutan automáticamente:

1. **calcular_monto_total**: Calcula el monto total con intereses
2. **actualizar_monto_pendiente**: Actualiza saldos después de cada pago
3. **update_updated_at_column**: Actualiza timestamps automáticamente

## Troubleshooting

### Error: "relation does not exist"
- Asegúrate de haber ejecutado el script SQL completo
- Verifica que estás conectado al proyecto correcto

### Error: "permission denied"
- Configura las políticas RLS o deshabilítalas para desarrollo
- Verifica que la clave anónima sea correcta

### Error: "invalid input syntax"
- Verifica que los tipos de datos coincidan
- Revisa que las fechas estén en formato correcto (YYYY-MM-DD)

## Soporte

Si encuentras problemas, verifica:
1. Que el script SQL se ejecutó completamente sin errores
2. Que las variables de entorno están correctamente configuradas
3. Que las políticas RLS permiten las operaciones necesarias
