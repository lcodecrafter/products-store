# MBST / Zara Challenge — Tareas de ejecución

Lista viva de commits-tarea. Cada tarea equivale a **un commit**. Seguimos el orden de arriba a abajo,
cerrando la actual antes de abrir la siguiente. Se pueden insertar tareas intermedias o reabrir cerradas
sin romper la trazabilidad del orden previsto.

## Cómo usar este archivo

- Estados: `[ ]` pendiente · `[~]` en progreso · `[x]` hecho.
- Solo **una** tarea en `[~]` a la vez. Al pasar de una a otra: se cierra la actual (`[x]`) y se abre la siguiente (`[~]`).
- Insertar entre medias: se añade con sufijo de orden (ej. `5.1`) para no renumerar el resto y conservar la historia.
- Reabrir: se cambia `[x]` → `[~]` y se anota el motivo en la línea de la tarea.
- El mensaje de commit va en inglés (conventional commits); la descripción en español.

## Tareas

- [x] **1. `chore: scaffold Vite + React 19 + TS + Router`**
      Boilerplate del proyecto: tooling (ESLint / Prettier / Husky pre-commit), estructura
      `api/` · `features/` · `shared/`, `.env.example` con `VITE_API_BASE_URL` y `VITE_API_KEY`.
      _Reabierta: migración npm → pnpm, React 18 → 19, y limpieza de `.oxlintrc.json` residual (ver §Registro)._

- [x] **2. `feat(tokens): CSS design token layer`**
      `tokens.css` con custom properties (color, spacing, tipografía, 3 breakpoints), reset global y
      `font-family: Helvetica, Arial, sans-serif`. Los valores dudosos de Claude Design se marcan como
      **provisionales** por comentario; los artefactos de frame (p. ej. padding 106px del botón) NO se
      encodean como tokens.

- [x] **3. `feat(api): typed client + types`**
      `api/client.ts` (capa de transporte: `ErrorEntity`, `ApiRequestError`, `request<T>` con `x-api-key`,
      `AbortController`, manejo de 401 / 404) y `api/products.ts` (capa de recursos: `ProductListItem`,
      `ProductDetail`, `ColorOption`, `StorageOption`, `getProducts` / `getProductById`).
      _Sin `api/types.ts` — cada capa es dueña de sus propios tipos, ver §Registro._
      **Incluye tests unitarios** de ambas capas (401, 404, `ErrorEntity`, request exitosa, query params).

- [x] **4. `feat(shared): layout shell + navbar + routing`**
      Navbar (logo → home, icono bag + contador), primitivos compartidos (Spinner, EmptyState, PriceTag)
      y las 3 rutas: `/`, `/product/:id`, `/cart`.
      **Incluye test unitario de `PriceTag`** (formateo de precio).

- [x] **5. `feat(catalog): responsive grid + product card`**
      Hook `useProducts`, fetch inicial `limit=20`, grid responsive (mobile 1 col / tablet 2 / desktop 5),
      estados loading y error. **Incluye sus tests.**

- [x] **5.1. `fix(catalog): normalize product card media`**
      Corrección visual post-commit de la tarjeta de catálogo: frame de imagen estable sin depender de las
      dimensiones intrínsecas de la API y eliminación del separador que no existe en la referencia.

- [x] **6. `feat(catalog): real-time search`**
      Buscador controlado + `useDebounce` (300ms) + `AbortController` para cancelar requests previas,
      contador de resultados y estado `0 RESULTS`. **Incluye sus tests.**

- [x] **7. `feat(cart): CartContext + pure cartReducer`**
      `cartReducer` puro (add / remove / clear) + persistencia en `localStorage` + badge del navbar.
      **Incluye tests del reducer aislado** (la señal SOLID más limpia del proyecto).

- [x] **8. `feat(detail): product detail view`**
      Hook `useProductDetail`, swatches de color (cambian imagen), toggles de storage (cambian precio),
      botón AÑADIR deshabilitado hasta color+storage, tabla de specs, productos similares y estado 404.
      **Incluye tests del gating del botón.**
      _Gaps verticales locales en `ProductDetail.module.css` (no tokens globales, no reutilizables):
      nombre→precio 11px, precio→storage 40px, storage label→cajas 22px, storage→color 32px,
      color→botón 40px — provisionales, ajustar en tarea 12._

- [x] **9. `feat(cart): cart view`**
      Líneas del carrito, eliminar producto, total, botón "Continuar comprando" y estado de carrito vacío.
      **Incluye tests de integración view+reducer** (total mostrado, estado carrito vacío).
      _Reabierta: la primera implementación no seguía el layout de fila del mockup (`docs/MBST-template.html`,
      vista `isCartView`) ni la captura real de tablet — fila imagen+info+"Eliminar" separada por hairline,
      footer con botón PAY. Se corrigió contra ambas referencias (ver §Registro)._

- [ ] **10. `feat(a11y): accessibility pass`**
      aria-labels (botón añadir, eliminar, navbar), navegación por teclado, estados de foco visibles,
      contraste y HTML semántico.

- [ ] **11. `fix: mixed-content http images + clean console`**
      Mitigar las `imageUrl` en `http://` (mixed content bajo HTTPS) y dejar la consola libre de
      errores/advertencias.
      _Si se implementa como función pura (ej. `ensureHttps(url)`), incluye test unitario._

- [ ] **12. `refactor(tokens): correct token values after visual review`**
      Ajuste de los tokens que Claude Design fijó mal, contra los 3 breakpoints reales
      (mobile 393 / tablet 834 / desktop 1920; márgenes 16 / 40 / 100).

- [ ] **13. `docs: add README`**
      Dev/prod instructions, architecture, structure, discarded decisions (PLAN §4 table),
      and the environment note: `.env` is tracked only for reviewer convenience because the challenge API key is public;
      a normal project should commit only `.env.example`.

## Opcionales (al final, aislados)

- [ ] **O1. `ci: add GitHub Actions (lint + test)`**
      Workflow de lint + test en push.

- [ ] **O2. `chore: deploy config (Vercel/Netlify)`**
      Configuración de despliegue. Resolver antes el mixed-content de imágenes (tarea 11) para no dar
      una URL con warnings en consola.

## Registro de cambios de orden

_(Aquí anotamos inserciones intermedias y reaperturas: qué, cuándo y por qué, para conservar la trazabilidad.)_

- **Tarea 1 reabierta** (post-commit inicial `051b7a1`): usuario pidió pnpm en vez de npm, React 19 en vez de 18,
  y eliminar `.oxlintrc.json` (residuo del template de Vite 9, reemplazado por ESLint según PLAN.md §2). Decisión
  documentada en `docs/PLAN.md` §2. Commit original enmendado (aún no había commits posteriores que dependieran de él).

- **Tarea 2 retocada** (post-commit `4007add`): `--color-destructive` renombrado a `--color-danger` (nombre
  atado al texto del botón, no a la intención semántica del token); los `--detail-gap-*` se eliminaron de
  `tokens.css` por no ser reutilizables (específicos de `ProductDetail`, no primitivos del sistema) — su
  recordatorio pasa a la nota de la tarea 8. Commit original enmendado (tarea 3 aún sin trabajo real).

- **Tarea 3 — split de `api/client.ts`** (pre-commit, sin historial que romper): `PLAN.md` §2 prescribía
  `api/` con solo `client.ts` + `types.ts`, pero con la implementación real a la vista se decidió separar
  transporte (`client.ts`: `request<T>`, `ApiRequestError`) de recursos (`products.ts`: `getProducts`,
  `getProductById`) — mezclaban capas distintas en un mismo archivo. Con 2 endpoints la ganancia es marginal,
  pero mejora testabilidad aislada de cada capa; decisión del usuario tras discutirlo con el orquestador.

- **Tarea 3 — `api/types.ts` eliminado** (pre-commit, mismo hilo de revisión): tras el split anterior,
  `types.ts` seguía mezclando `ErrorEntity` (contrato de transporte) con los tipos de producto (contrato de
  recurso) — el mismo problema que ya se había resuelto en `client.ts`, pero un nivel más arriba. Se descartó
  explícitamente anidar `api/products/` como carpeta (un solo recurso no justifica subcarpeta, misma lógica de
  contención que descarta hexagonal/ports-adapters en `PLAN.md` §159); en su lugar cada tipo se co-ubicó con
  su único consumidor: `ErrorEntity` vive en `client.ts`, los tipos de producto en `products.ts`.

- **Tarea 4 — `--header-height` / `--header-padding-h` eliminados de `tokens.css`** (pre-commit, mismo hilo
  de revisión): estos dos tokens se habían añadido en el commit de la tarea 2 (`5632dfe`), pero con `Navbar`
  ya implementado se confirma que solo los consume `Navbar.module.css` — mismo problema ya resuelto una vez
  para `--detail-gap-*` (ver "Tarea 2 retocada" arriba): nombrado por el componente que los usa, no por un rol
  semántico reutilizable. Se corrige dentro del trabajo de la tarea 4 en vez de enmendar `5632dfe`, porque
  `1677158` (tarea 3) ya depende de ese commit y reescribir historia ya publicada por una eliminación de dos
  líneas de tokens no compensa el riesgo.

- **Tarea 5.1 insertada** (corrección visual post-commit de tarea 5): se pausa temporalmente la tarea 7 para
  mantener una sola tarea en progreso mientras se corrige la tarjeta de catálogo según la referencia visual.

- **Tarea 9 reabierta** (pre-commit, corrección visual): la primera pasada de `CartPage` no seguía la
  estructura de fila del prototipo (`docs/MBST-template.html`, bloque `isCartView`) ni la captura de tablet
  aportada por el usuario. Se corrige: fila imagen+info con "Eliminar" alineado al pie de la columna de texto,
  footer con `CONTINUE SHOPPING` / `TOTAL` / `PAY`. El botón `PAY` se agrega no funcional (sin endpoint de
  checkout en el enunciado) por decisión explícita del usuario, solo para paridad visual con el mockup.
  La cantidad por línea (`quantity`/`QTY`) no existe en el mockup original — el prototipo no contempla
  mismo-producto-repetido, cada `AÑADIR` crea una fila nueva — pero el usuario confirmó mantenerla por ser
  una mejora real sobre el enunciado.
