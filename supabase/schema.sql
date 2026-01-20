-- Tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT,
  documento_identidad TEXT UNIQUE,
  celular TEXT,
  pais TEXT DEFAULT 'Colombia',
  region TEXT DEFAULT 'Antioquia',
  ciudad TEXT,
  direccion TEXT,
  sexo TEXT CHECK (sexo IN ('masculino', 'femenino', 'otro')),
  fecha_nacimiento DATE,
  rol TEXT DEFAULT 'prestamista' CHECK (rol IN ('admin', 'prestamista', 'operador')),
  activo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_identidad TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  fecha_nacimiento DATE,
  estado_civil TEXT,
  ocupacion TEXT,
  referencias TEXT,
  notas TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id)
);

-- Tabla de préstamos
CREATE TABLE IF NOT EXISTS prestamos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  monto_principal DECIMAL(15, 2) NOT NULL CHECK (monto_principal > 0),
  tasa_interes DECIMAL(5, 2) NOT NULL CHECK (tasa_interes >= 0),
  tipo_interes TEXT DEFAULT 'simple' CHECK (tipo_interes IN ('simple', 'compuesto')),
  plazo_dias INTEGER NOT NULL CHECK (plazo_dias > 0),
  fecha_inicio DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  monto_total DECIMAL(15, 2) NOT NULL,
  monto_pagado DECIMAL(15, 2) DEFAULT 0,
  monto_pendiente DECIMAL(15, 2) NOT NULL,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'pagado', 'vencido', 'cancelado', 'moroso')),
  frecuencia_pago TEXT DEFAULT 'diario' CHECK (frecuencia_pago IN ('diario', 'semanal', 'quincenal', 'mensual')),
  descripcion TEXT,
  garantia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id)
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestamo_id UUID NOT NULL REFERENCES prestamos(id) ON DELETE CASCADE,
  monto DECIMAL(15, 2) NOT NULL CHECK (monto > 0),
  fecha_pago DATE NOT NULL,
  tipo_pago TEXT DEFAULT 'normal' CHECK (tipo_pago IN ('normal', 'adelantado', 'parcial', 'completo')),
  metodo_pago TEXT DEFAULT 'efectivo' CHECK (metodo_pago IN ('efectivo', 'transferencia', 'cheque', 'tarjeta')),
  numero_recibo TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id)
);

-- Tabla de configuración
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  tipo TEXT DEFAULT 'texto' CHECK (tipo IN ('texto', 'numero', 'booleano', 'fecha')),
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reportes/auditoría
CREATE TABLE IF NOT EXISTS auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla TEXT NOT NULL,
  registro_id UUID,
  accion TEXT NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  usuario_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_clientes_documento ON clientes(documento_identidad);
CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo);
CREATE INDEX IF NOT EXISTS idx_prestamos_cliente ON prestamos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_prestamos_estado ON prestamos(estado);
CREATE INDEX IF NOT EXISTS idx_prestamos_fecha_vencimiento ON prestamos(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_pagos_prestamo ON pagos(prestamo_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla ON auditoria(tabla);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prestamos_updated_at BEFORE UPDATE ON prestamos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracion_updated_at BEFORE UPDATE ON configuracion
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular monto total del préstamo
CREATE OR REPLACE FUNCTION calcular_monto_total(
  p_monto_principal DECIMAL,
  p_tasa_interes DECIMAL,
  p_plazo_dias INTEGER,
  p_tipo_interes TEXT
)
RETURNS DECIMAL AS $$
DECLARE
  v_monto_total DECIMAL;
BEGIN
  IF p_tipo_interes = 'simple' THEN
    v_monto_total := p_monto_principal * (1 + (p_tasa_interes / 100) * (p_plazo_dias / 30.0));
  ELSE
    -- Interés compuesto (mensual)
    v_monto_total := p_monto_principal * POWER(1 + (p_tasa_interes / 100), p_plazo_dias / 30.0);
  END IF;
  
  RETURN ROUND(v_monto_total, 2);
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar monto_pendiente después de un pago
CREATE OR REPLACE FUNCTION actualizar_monto_pendiente()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE prestamos
  SET monto_pagado = (
    SELECT COALESCE(SUM(monto), 0)
    FROM pagos
    WHERE prestamo_id = NEW.prestamo_id
  ),
  monto_pendiente = monto_total - (
    SELECT COALESCE(SUM(monto), 0)
    FROM pagos
    WHERE prestamo_id = NEW.prestamo_id
  ),
  estado = CASE
    WHEN monto_total - (
      SELECT COALESCE(SUM(monto), 0)
      FROM pagos
      WHERE prestamo_id = NEW.prestamo_id
    ) <= 0 THEN 'pagado'
    WHEN fecha_vencimiento < CURRENT_DATE AND monto_total - (
      SELECT COALESCE(SUM(monto), 0)
      FROM pagos
      WHERE prestamo_id = NEW.prestamo_id
    ) > 0 THEN 'vencido'
    ELSE 'activo'
  END
  WHERE id = NEW.prestamo_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar monto_pendiente
CREATE TRIGGER trigger_actualizar_monto_pendiente
  AFTER INSERT OR UPDATE OR DELETE ON pagos
  FOR EACH ROW EXECUTE FUNCTION actualizar_monto_pendiente();

-- Datos iniciales de configuración
INSERT INTO configuracion (clave, valor, tipo, descripcion) VALUES
  ('tasa_interes_default', '5.0', 'numero', 'Tasa de interés por defecto (%)'),
  ('dias_plazo_default', '30', 'numero', 'Días de plazo por defecto'),
  ('moneda', 'Pesos', 'texto', 'Moneda del sistema'),
  ('empresa_nombre', 'Sistema de Prestamistas', 'texto', 'Nombre de la empresa')
ON CONFLICT (clave) DO NOTHING;
