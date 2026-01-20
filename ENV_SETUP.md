# Configuración de Variables de Entorno

## Archivo .env

Tu archivo `.env` debe estar en la raíz del proyecto y tener el siguiente formato:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

## Importante

1. **No incluyas comillas** alrededor de los valores
2. **No dejes espacios** antes o después del signo `=`
3. El archivo debe llamarse exactamente `.env` (con el punto al inicio)
4. **Reinicia el servidor** después de modificar el archivo `.env`

## Ejemplo correcto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI4MCwiZXhwIjoxOTU0NTQzMjgwfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

## Dónde encontrar tus credenciales

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Haz clic en **Settings** (Configuración)
3. Selecciona **API** en el menú lateral
4. Encontrarás:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Verificar que funciona

Después de configurar el `.env`:

1. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Si ves errores sobre variables de entorno, verifica:
   - Que el archivo se llame `.env` (no `.env.txt` o `.env.local`)
   - Que las variables empiecen con `NEXT_PUBLIC_`
   - Que no haya espacios extra
   - Que los valores estén completos

## Nota de seguridad

El archivo `.env` está en `.gitignore`, por lo que no se subirá a Git. Esto es correcto para proteger tus credenciales.
