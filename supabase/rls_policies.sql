-- Políticas RLS (Row Level Security) para control de acceso

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA USUARIOS
-- ============================================

-- Funciones auxiliares para evitar recursión en RLS
CREATE OR REPLACE FUNCTION public.current_user_rol()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rol TEXT;
BEGIN
  SELECT rol INTO v_rol FROM public.usuarios WHERE id = auth.uid();
  RETURN v_rol;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.current_user_rol() = 'admin';
END;
$$;

REVOKE ALL ON FUNCTION public.current_user_rol() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_rol() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON usuarios FOR SELECT
  USING (auth.uid()::text = id::text OR public.is_admin());

-- Admins o auto-registro de prestamistas
CREATE POLICY "Solo admins pueden crear usuarios"
  ON usuarios FOR INSERT
  WITH CHECK (
    public.is_admin() OR
    (
      auth.role() = 'authenticated' AND
      email = auth.jwt()->>'email' AND
      rol = 'prestamista' AND
      activo = false
    )
  );

-- Los usuarios pueden actualizar su propio perfil (excepto rol)
CREATE POLICY "Usuarios pueden actualizar su perfil"
  ON usuarios FOR UPDATE
  USING (auth.uid()::text = id::text OR public.is_admin())
  WITH CHECK (
    -- Los usuarios no pueden cambiar su propio rol
    (auth.uid()::text = id::text AND rol = public.current_user_rol()) OR
    public.is_admin()
  );

-- Solo admins pueden eliminar usuarios
CREATE POLICY "Solo admins pueden eliminar usuarios"
  ON usuarios FOR DELETE
  USING (
    public.is_admin()
  );

-- ============================================
-- POLÍTICAS PARA CLIENTES
-- ============================================

-- Los prestamistas ven solo sus clientes, los admins ven todos
CREATE POLICY "Clientes visibles por creador o admin"
  ON clientes FOR SELECT
  USING (
    created_by::text = (SELECT id::text FROM usuarios WHERE email = auth.jwt()->>'email') OR
    (SELECT rol FROM usuarios WHERE email = auth.jwt()->>'email') = 'admin'
  );

-- Cualquier usuario autenticado puede crear clientes
CREATE POLICY "Usuarios autenticados pueden crear clientes"
  ON clientes FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    created_by::text = (SELECT id::text FROM usuarios WHERE email = auth.jwt()->>'email')
  );

-- Los prestamistas pueden actualizar solo sus clientes, los admins todos
CREATE POLICY "Clientes actualizables por creador o admin"
  ON clientes FOR UPDATE
  USING (
    created_by::text = (SELECT id::text FROM usuarios WHERE email = auth.jwt()->>'email') OR
    (SELECT rol FROM usuarios WHERE email = auth.jwt()->>'email') = 'admin'
  );

-- Los prestamistas pueden eliminar solo sus clientes, los admins todos
CREATE POLICY "Clientes eliminables por creador o admin"
  ON clientes FOR DELETE
  USING (
    created_by::text = (SELECT id::text FROM usuarios WHERE email = auth.jwt()->>'email') OR
    (SELECT rol FROM usuarios WHERE email = auth.jwt()->>'email') = 'admin'
  );

-- ============================================
-- POLÍTICAS PARA PRÉSTAMOS
-- ============================================

-- Los prestamistas ven solo sus préstamos, los admins ven todos
CREATE POLICY "Préstamos visibles por creador o admin"
  ON prestamos FOR SELECT
  USING (
    created_by::text = (SELECT id::text FROM usuarios WHERE email = auth.jwt()->>'email') OR
    (SELECT rol FROM usuarios WHERE email = auth.jwt()->>'email') = 'admin'
  );

-- Cualquier usuario autenticado puede crear préstamos
CREATE POLICY "Usuarios autenticados pueden crear préstamos"
  ON prestamos FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    created_by::text = (SELECT id::text FROM usuarios WHERE email = auth.jwt()->>'email')
  );

-- Los prestamistas pueden actualizar solo sus préstamos, los admins todos
CREATE POLICY "Préstamos actualizables por creador o admin"
  ON prestamos FOR UPDATE
  USING (
    created_by::text = (SELECT id::text FROM usuarios WHERE email = auth.jwt()->>'email') OR
    (SELECT rol FROM usuarios WHERE email = auth.jwt()->>'email') = 'admin'
  );

-- Los prestamistas pueden eliminar solo sus préstamos, los admins todos
CREATE POLICY "Préstamos eliminables por creador o admin"
  ON prestamos FOR DELETE
  USING (
    created_by::text = (SELECT id::text FROM usuarios WHERE email = auth.jwt()->>'email') OR
    (SELECT rol FROM usuarios WHERE email = auth.jwt()->>'email') = 'admin'
  );

-- ============================================
-- POLÍTICAS PARA PAGOS
-- ============================================

-- Los prestamistas ven pagos de sus préstamos, los admins ven todos
CREATE POLICY "Pagos visibles por prestamista o admin"
  ON pagos FOR SELECT
  USING (
    prestamo_id IN (
      SELECT id FROM prestamos 
      WHERE created_by::text = (SELECT id::text FROM usuarios WHERE email = auth.jwt()->>'email')
    ) OR
    (SELECT rol FROM usuarios WHERE email = auth.jwt()->>'email') = 'admin'
  );

-- Cualquier usuario autenticado puede crear pagos
CREATE POLICY "Usuarios autenticados pueden crear pagos"
  ON pagos FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    (
      prestamo_id IN (
        SELECT id FROM prestamos 
        WHERE created_by::text = (SELECT id::text FROM usuarios WHERE email = auth.jwt()->>'email')
      ) OR
      (SELECT rol FROM usuarios WHERE email = auth.jwt()->>'email') = 'admin'
    )
  );

-- Los prestamistas pueden actualizar pagos de sus préstamos, los admins todos
CREATE POLICY "Pagos actualizables por prestamista o admin"
  ON pagos FOR UPDATE
  USING (
    prestamo_id IN (
      SELECT id FROM prestamos 
      WHERE created_by::text = (SELECT id::text FROM usuarios WHERE email = auth.jwt()->>'email')
    ) OR
    (SELECT rol FROM usuarios WHERE email = auth.jwt()->>'email') = 'admin'
  );

-- Los prestamistas pueden eliminar pagos de sus préstamos, los admins todos
CREATE POLICY "Pagos eliminables por prestamista o admin"
  ON pagos FOR DELETE
  USING (
    prestamo_id IN (
      SELECT id FROM prestamos 
      WHERE created_by::text = (SELECT id::text FROM usuarios WHERE email = auth.jwt()->>'email')
    ) OR
    (SELECT rol FROM usuarios WHERE email = auth.jwt()->>'email') = 'admin'
  );

-- ============================================
-- POLÍTICAS PARA CONFIGURACIÓN
-- ============================================

-- Solo admins pueden ver y modificar configuración
CREATE POLICY "Solo admins pueden ver configuración"
  ON configuracion FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE email = auth.jwt()->>'email') = 'admin'
  );

CREATE POLICY "Solo admins pueden modificar configuración"
  ON configuracion FOR ALL
  USING (
    (SELECT rol FROM usuarios WHERE email = auth.jwt()->>'email') = 'admin'
  );

-- ============================================
-- STORAGE PARA AVATARES
-- ============================================

-- Crear bucket público para avatares (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir lectura pública de avatares
CREATE POLICY "Avatares públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Permitir subida/actualización/borrado a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden subir avatares"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar avatares"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden borrar avatares"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
