-- Script para crear el usuario administrador inicial
-- IMPORTANTE: Ejecuta este script DESPUÉS de crear el usuario en Supabase Auth

-- Reemplaza 'admin@prestamistas.com' con el email del admin que creaste en Supabase Auth
-- y ejecuta este script en el SQL Editor de Supabase

-- Primero, obtén el ID del usuario de Supabase Auth
-- Puedes encontrarlo en Authentication > Users en el panel de Supabase

-- Ejemplo: Si el email del admin es admin@prestamistas.com
INSERT INTO usuarios (id, email, nombre, apellido, rol, activo)
VALUES (
  -- Reemplaza este UUID con el ID real del usuario de Supabase Auth
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@prestamistas.com',
  'Administrador',
  'Sistema',
  'admin',
  true
)
ON CONFLICT (email) DO UPDATE
SET rol = 'admin', activo = true;

-- NOTA: Para obtener el ID del usuario de Supabase Auth:
-- 1. Ve a Authentication > Users en el panel de Supabase
-- 2. Encuentra el usuario admin que creaste
-- 3. Copia su UUID
-- 4. Reemplaza '00000000-0000-0000-0000-000000000000' con ese UUID
-- 5. Ejecuta este script

-- Alternativamente, puedes usar esta función para crear el admin automáticamente
-- después de que el usuario se registre en Supabase Auth:

-- CREATE OR REPLACE FUNCTION create_admin_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO usuarios (id, email, nombre, apellido, rol, activo)
--   VALUES (
--     NEW.id,
--     NEW.email,
--     COALESCE(NEW.raw_user_meta_data->>'nombre', 'Admin'),
--     COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
--     'admin',
--     true
--   )
--   ON CONFLICT (email) DO UPDATE
--   SET rol = 'admin';
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   WHEN (NEW.email = 'admin@prestamistas.com')
--   EXECUTE FUNCTION create_admin_user();
