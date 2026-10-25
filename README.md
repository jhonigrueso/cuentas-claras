# Cuentas Claras

Aplicación web de finanzas personales para el taller con adultos de una comunidad de Yumbo, Colombia.
Funciona desde el celular, sin login ni servidor: **todos los datos se guardan en el `localStorage` del navegador** (clave `cuentas-claras-v1`).

Proyecto de Servicio Social Unadista – UNAD · Yonni Fernando Grueso Caicedo · Ingeniería de Sistemas

## Tecnologías

- Next.js 16 (App Router, `output: "export"` → sitio estático en `out/`)
- React 19 + TypeScript
- Tailwind CSS 4
- Recharts (gráfica de dona)

## Cómo correrlo

Requiere Node.js 20.9 o superior.

```bash
npm install        # instala las dependencias
npm run dev        # abre http://localhost:3000
```

Otros comandos:

```bash
npm run build      # genera el sitio estático en la carpeta out/
npm start          # sirve la carpeta out/ para probar la versión final
npm run lint       # revisa el código
node scripts/generar-iconos.mjs   # vuelve a generar los íconos PNG
```

Para probar en el celular mientras desarrollas: conecta el celular al mismo Wi-Fi, corre `npm run dev -- -H 0.0.0.0`
y abre `http://IP-DE-TU-PC:3000` en el celular.

### Si quisieras crear el proyecto desde cero

```bash
npx create-next-app@latest cuentas-claras --ts --tailwind --app --src-dir --eslint --import-alias "@/*"
cd cuentas-claras
npm install recharts
```

…y luego copiar las carpetas `src/`, `public/` y `scripts/` y el archivo `next.config.ts` de este repositorio.

## Publicarlo gratis en Vercel

1. Crea una cuenta gratuita en <https://vercel.com> (puedes entrar con GitHub).
2. Sube este proyecto a un repositorio de GitHub:
   ```bash
   git add .
   git commit -m "Cuentas Claras"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/cuentas-claras.git
   git push -u origin main
   ```
3. En Vercel: **Add New… → Project**, elige el repositorio y pulsa **Deploy**.
   No hay que cambiar nada: Vercel detecta Next.js y la exportación estática.
4. En un minuto tendrás una dirección como `https://cuentas-claras.vercel.app`. Cada `git push` publica una versión nueva.

Alternativa sin GitHub: `npx vercel` desde la carpeta del proyecto y seguir las preguntas.

Como el sitio es 100 % estático, también puedes subir la carpeta `out/` a Netlify, GitHub Pages o cualquier hosting.

## Instalar en el celular

Abre la dirección en Chrome → menú **⋮** → **Agregar a la pantalla principal**.
En iPhone (Safari): botón **Compartir** → **Agregar a inicio**.

## Estructura

```
src/
  app/                 Rutas: / (Inicio), /registrar, /movimientos, /deudas, /metas, /ayuda
    layout.tsx         Encabezado, barra inferior, pie de página y proveedores
    globals.css        Tema de colores y estilos base (Tailwind)
  components/
    vistas/            Contenido interactivo de cada página ("use client")
    FormularioMovimiento.tsx, Modal.tsx, ModalConfirmar.tsx, MenuAjustes.tsx, …
  context/
    DatosContext.tsx   Estado global (useReducer) + lectura/guardado automático en localStorage
    ToastContext.tsx   Mensajes de confirmación
  lib/
    tipos.ts           Tipos Movimiento, Deuda, Meta
    almacenamiento.ts  Lectura/escritura segura de localStorage (try/catch)
    calculos.ts        Resúmenes, gastos hormiga, fondo de emergencia, bola de nieve / avalancha, consejos
    categorias.ts      Categorías con ícono y color
    formato.ts         Pesos colombianos ($1.250.000) y fechas
    csv.ts             Exportación "Descargar mis datos"
    datosEjemplo.ts    Datos para la demostración del taller
public/
  manifest.json, icons/
```

## Notas

- La primera vez la app muestra una pantalla de bienvenida que pide el nombre (sin contraseña). El nombre se guarda
  en `perfil.nombre`, junto con los datos, se muestra en el encabezado («Hola, María 👋») y se cambia en
  ⚙️ Ajustes → Cambiar mi nombre. «Borrar todos los datos» también borra el nombre y vuelve a la bienvenida.

- El saldo de cada deuda se calcula como *saldo inicial − abonos*. Cada abono es un gasto fijo en «Deudas y créditos»;
  si borras ese gasto en Movimientos, el saldo de la deuda vuelve a subir.
- Si compilas (`npm run build`) en **Windows**, Next.js 16 guarda mal algunos archivos de prefetch
  (`__next.*.txt`) y verás errores 404 en la consola al probar `out/`. La app funciona igual, y el problema no ocurre
  en Vercel, que compila en Linux.
