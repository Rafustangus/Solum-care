# Solum-care

PWA para que los estudios de tatuaje acompañen la curación de sus clientes: planes de cuidados, evidencias fotográficas, checklist diario y comunicación por notas.

> **Estado:** demo funcional con datos locales. No hay backend ni cuentas reales: todo se guarda en el navegador (`localStorage` e IndexedDB). La versión publicada se genera con `VITE_DEMO_MODE=true` para poder revisar ambos roles.

## Qué incluye

- **Vista cliente:** día y progreso de curación, checklist diario, galería de fotos, guía de cuidados, notas con el estudio, avisos e incidencias.
- **Vista estudio:** lista de clientes con estado, alta de clientes, editor de plan (1–90 días), pautas de curación reutilizables, revisión de fotos, feed de evidencias y ajustes de marca, equipo y recordatorios.
- **Acceso:** los tatuadores crean la ficha del cliente y generan un código de activación de 6 dígitos; solo los clientes se registran con ese código.
- **Foto obligatoria:** cuando toca evidencia, la app lo avisa y bloquea la navegación hasta subirla, con salida alternativa por WhatsApp o email.
- **PWA:** instalable en móvil y escritorio, funcionamiento offline básico y notificaciones locales del sistema.
- **Responsive:** bottom nav en móvil/tablet y sidebar con vista dividida en escritorio.

## Probar la demo

Cuentas incluidas en `src/lib/demo.js`:

| Rol | Email | Contraseña |
| --- | --- | --- |
| Cliente (Lucía) | `lucia@example.com` | `Lucia2026!` |
| Estudio (Mara) | `mara@solumcare.app` | `Solum2026!` |

En modo demo también hay accesos rápidos en la pantalla de acceso y un cambiador Cliente/Estudio dentro de Ajustes. Los datos se reinician limpiando el almacenamiento del sitio.

## Desarrollo

Requiere **Node 24** (ver `.nvmrc`; `package.json` declara `>= 24`).

```bash
npm install
npm run dev
```

La app queda en `http://localhost:5173`. Para probar el build de producción:

```bash
npm run build
npm run preview
```

### Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm run preview` | Compilación y vista previa |
| `npm test` / `npm run test:watch` | Tests unitarios y de UI |
| `npm run lint` | ESLint y comprobación de imports relativos |
| `npm run verify` | Lint + tests + build + auditoría de producción |
| `npm run audit:prod` | Auditoría de dependencias de producción |
| `npm run perf:measure` | Medición con Chromium headless (requiere `dev`/`preview` y puerto 9222) |

## Estructura

```
src/components/  shell responsive, navegación y componentes de UI reutilizables
src/features/     pantallas por rol: auth, cliente, estudio, notas y ajustes
src/context/      estado global de datos, sesión, marca y notificaciones
src/lib/          lógica pura: fechas, curación, pautas del estudio, validación, notas y datos demo
src/services/     persistencia local, foto y fachada de autenticación
```

Supabase está preparado pero desconectado; `src/services/auth.js` es la fachada que permite sustituir la autenticación local en el futuro.

## Despliegue

- `.github/workflows/ci.yml` ejecuta `npm run verify` en cada push a `main` y en pull requests.
- `.github/workflows/deploy-pages.yml` compila con `VITE_DEMO_MODE=true` y publica `dist/` en GitHub Pages desde `main`.
- Para activarlo: **Settings → Pages → Source: GitHub Actions**. Las variables y secretos documentados en `.env.example` solo hacen falta al conectar servicios reales; **no se exponen claves en el cliente**.

## Privacidad

Las fotos y los datos de la demo permanecen en el dispositivo: no se suben a ningún servidor. Los trabajadores del navegador permiten el uso offline básico; al borrar los datos del sitio se pierde la demo guardada.

## Licencia

Copyright (c) 2026 Rafael Alarcón (Rafustangus). Todos los derechos reservados.

El código, el diseño, los logotipos, las imágenes y los textos de este proyecto son propiedad exclusiva de su autor. No se permite copiar, modificar, distribuir, publicar ni utilizar total o parcialmente el proyecto sin autorización escrita previa. Consulta [`LICENSE`](LICENSE).
