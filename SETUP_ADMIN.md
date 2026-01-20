# Configuración del Sistema de Autenticación y Roles

## Pasos para Configurar el Usuario Administrador

### 1. Crear Usuario Admin en Supabase Auth

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Navega a **Authentication** > **Users**
3. Haz clic en **Add User** > **Create new user**
4. Completa:
   - **Email**: `admin@prestamistas.com` (o el que prefieras)
   - **Password**: Crea una contraseña segura
   - **Auto Confirm User**: Activa esta opción
5. Haz clic en **Create User**
6. **Copia el UUID del usuario** (lo necesitarás en el siguiente paso)

### 2. Crear Usuario Admin en la Tabla usuarios

1. Ve a **SQL Editor** en Supabase
2. Ejecuta el siguiente script, reemplazando los valores:

```sql
INSERT INTO usuarios (id, email, nombre, apellido, rol, activo)
VALUES (
  'TU_UUID_AQUI'::uuid,  -- Reemplaza con el UUID copiado en el paso 1
  'admin@prestamistas.com',  -- O el email que usaste
  'Administrador',
  'Sistema',
  'admin',
  true
)
ON CONFLICT (email) DO UPDATE
SET rol = 'admin', activo = true;
```

### 3. Configurar Políticas RLS (Opcional pero Recomendado)

Para mayor seguridad, ejecuta el script `supabase/rls_policies.sql` en el SQL Editor:

1. Abre el archivo `supabase/rls_policies.sql`
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Ejecuta el script

**Nota**: Las políticas RLS pueden ser complejas. Si prefieres, puedes deshabilitarlas temporalmente para desarrollo:

```sql
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE prestamos DISABLE ROW LEVEL SECURITY;
ALTER TABLE pagos DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion DISABLE ROW LEVEL SECURITY;
```

## Funcionalidades por Rol

### Administrador (admin)
- ✅ Acceso completo a todas las funcionalidades
- ✅ Puede crear, editar y eliminar usuarios prestamistas
- ✅ Ve todos los clientes, préstamos y pagos de todos los prestamistas
- ✅ Acceso a configuración del sistema
- ✅ Puede gestionar usuarios

### Prestamista
- ✅ Ve solo sus propios clientes
- ✅ Ve solo sus propios préstamos
- ✅ Ve solo los pagos de sus préstamos
- ✅ Puede crear, editar y eliminar sus propios registros
- ❌ No puede ver datos de otros prestamistas
- ❌ No puede gestionar usuarios
- ❌ No puede acceder a configuración

### Operador
- Similar a prestamista (puede ajustarse según necesidades)

## Flujo de Trabajo

1. **Admin inicia sesión** con sus credenciales
2. **Admin crea usuarios prestamistas** desde la sección "Usuarios"
3. **Cada prestamista inicia sesión** y solo ve sus propios datos
4. **Los prestamistas crean clientes y préstamos** que quedan asociados a ellos
5. **El admin puede ver todo** para supervisión y reportes

## Seguridad

- Las contraseñas se almacenan de forma segura en Supabase Auth
- Los datos se filtran automáticamente según el rol del usuario
- El middleware protege las rutas y redirige a login si no hay sesión
- Las políticas RLS (si están habilitadas) proporcionan seguridad adicional a nivel de base de datos

## Troubleshooting

### Error: "No tienes permisos"
- Verifica que el usuario tenga el rol correcto en la tabla `usuarios`
- Asegúrate de que el email coincida exactamente con el de Supabase Auth

### Error: "Usuario no encontrado"
- Verifica que el usuario exista en Supabase Auth
- Verifica que el usuario exista en la tabla `usuarios`
- El sistema intentará crear el usuario automáticamente si falta en la tabla

### No puedo crear usuarios
- Solo los usuarios con rol `admin` pueden crear usuarios
- Verifica que estés logueado como administrador

### Los prestamistas ven datos de otros
- Verifica que los registros tengan el campo `created_by` correcto
- Verifica que las políticas RLS estén configuradas correctamente
- Revisa los filtros en los componentes (deben usar `created_by`)
