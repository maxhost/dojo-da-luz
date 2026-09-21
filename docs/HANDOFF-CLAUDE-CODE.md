# Handoff — corte del 2026-09-21

Registro del ultimo corte cerrado, no lista de pendientes. **El estado real del proyecto
esta en `docs/TASKS.md`**; este archivo solo explica que se cerro por ultima vez y con
que se verifico.

## Que se cerro

Dos specs, ambas desplegadas y verificadas en produccion.

### Spec 0027 — jerarquia del equipo docente en `/dojo` (ADR-0023)

`/dojo` renderizaba cuatro profesores con la misma seccion a pantalla completa,
alternando el lado de la imagen y repitiendo el mismo retrato cuatro veces. Ahora es una
sola seccion con dos niveles: **Pablo Duran** protagonista (retrato `4/5` con marco azul,
nombre hasta `text-7xl`, biografia con filete lateral y boton a su pagina) y **Ines,
Miguel y Sofia** en tres fichas compactas sobre `#211e1b`. Sin rotulo «Equipo docente» ni
numeracion. Los cuatro idiomas heredan la jerarquia sin tocar contenido.

Vivio solo en `src/components/DojoView.astro`. Commit `335976d`, deployment
`dojo-da-hn4p4oqhm`.

### Spec 0028 — Parcerias en rejilla (ADR-0024)

El carrusel CSS mostraba 3 o 4 de los 8 parceiros a la vez, cada uno dentro de un recuadro
blanco con borde. Ahora es una rejilla estatica: los ocho juntos, **5 por fila** en
escritorio, 3 en tablet, 2 en movil, sin recuadro, en celdas `h-20` con `object-contain`.
Se fueron `PARTNER_CAROUSEL`, las reglas `.partner-carousel*`, el `@keyframes` y su bloque
`prefers-reduced-motion`.

`src/components/HomeView.astro` y `src/styles/global.css`. Commits `3dc5ba9` y `046adcc`,
deployment `dojo-da-uohuq04cs`.

## Los dos hallazgos que importan

**El blanco de los logos no esta en el CSS, esta en los archivos.** Se descargaron los
ocho: los tres PNG vienen con `hasAlpha: no` porque Wix los aplano al generarlos, y los
otros cinco son JPEG, que por formato no admiten transparencia. Pixeles de borde: seis en
`#ffffff` exacto, dos en `(247,247,247)` y `(245,244,242)`. Quitar `bg-white` del markup
no alcanzaba. Se neutraliza con `mix-blend-multiply` sobre el `#f6f1e8` de la seccion: el
blanco puro se vuelve el propio fondo. **No limpia las dos que no son blanco puro** — les
queda un rectangulo apenas visible que solo se arregla con los originales. Esto genero una
linea nueva en `CLAUDE.md`.

**El ancla de Ines lleva acento.** Es `#inês-martins`, porque el `id` sale de
`name.toLowerCase()`. Valido en HTML5 pero necesita percent-encoding en una URL. Es
heredado, identico antes y despues de la 0027: se dejo anotado, no se cambio.

## Deuda de producto abierta

Las dos son del cliente y estan en `docs/TASKS.md`:

- **Fila 11** — retratos reales de Ines, Miguel y Sofia. Hoy las tres fichas de `/dojo`
  muestran escenas de practica de wixstatic, no a la persona que nombran. Se sustituye el
  array `teacherPhotos` sin tocar la composicion.
- **Fila 12** — logos reales de los parceiros, con transparencia. Los ocho traen fondo
  blanco incrustado y tres son fotografias, no marcas.

## Procedencia de la 0027

Su codigo llego implementado desde otra herramienta, **sin spec previa**, contra el flujo
de `CLAUDE.md`. La spec y el ADR se escribieron despues, a partir del diff, y lo dejan
anotado en su encabezado. Se documenta el incumplimiento en vez de disimularlo.

## Verificacion ejecutada

```sh
npm run typecheck   # astro check: 48 archivos, 0 errores / 0 warnings / 0 hints
npm test            # 5/5
npm run build       # 44 index.html en .vercel/output/static
git diff --check    # limpio
```

No hay script `lint` en `package.json`: el gate es typecheck + test + build.

En produccion: `/dojo` y sus tres traducciones sirven un solo bloque de equipo docente;
las cuatro homes sirven 8 `<img>` de parceiro (antes 16) con `mix-blend-multiply`, 0
`bg-white`, 0 `aria-hidden`, y el CSS publicado ya no contiene `partner-carousel`.

## Como seguir

1. `docs/TASKS.md` → seccion **Siguiente**. El proximo de la cadena es la **spec 0021**:
   el editor de Home y CRUD de dojos en el backoffice. Necesita `GITHUB_TOKEN`.
2. Para empujar: `env -u GH_TOKEN -u GITHUB_TOKEN git push origin main` — la `GH_TOKEN`
   del shell esta vencida y tapa al token del keyring de `gh`.
3. Verificar siempre contra `dojo-da-luz.vercel.app`, nunca contra la URL del deployment
   (`*-maxhost27-6230s-projects.vercel.app` esta detras de Vercel Authentication y
   devuelve 302).
4. `vercel ls` cambia de linea segun el ancho de la salida: filtrar por el id del
   deployment (`grep dojo-da-xxxxx`), no por numero de linea.
