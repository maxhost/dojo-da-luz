# Sistema de diseño — paisaje

## Concepto

El sitio narra un descenso: cielo → montaña → tierra → dojo → umbral. No es una
ilustración de fondo, sino una gramática espacial. Las formas se transforman entre
secciones y dan coherencia al contenido. Las demás pantallas toman un capítulo de ese
recorrido sin repetir toda la escena.

`Ma` funciona como intervalo con propósito. El paisaje deja respirar antes de introducir
información; no se aumenta el padding de manera arbitraria. La identidad japonesa nace de
proporción, precisión, ritmo y vacío, no de objetos decorativos.

## Paleta

| Token | Hex | Uso |
|---|---:|---|
| `ink` | `#1D1C19` | Texto, reglas principales y botones secundarios |
| `paper` | `#F7F5ED` | Fondo continuo |
| `line` | `#CFC9BC` | Estructuras secundarias y divisiones |
| `earth` | `#E7E2D7` | Plano de montaña o superficie puntual |
| `red` | `#A32D21` | Sol, transmisión y acción |

El rojo tiene tres responsabilidades: origen en Inicio, credenciales o hitos de
transmisión, y acción primaria. No se usa para rellenar secciones completas, salvo el
disco solar. Sin gradientes, sombras, transparencias decorativas ni otros acentos.

## Tipografía

- **Newsreader 400/600:** H1, H2, citas y marca.
- **IBM Plex Sans 400/600:** cuerpo, navegación, datos y controles.
- WOFF2 autohospedado, subset latino; presupuesto máximo total 88 KB.
- Japonés excepcional: pila del sistema. Sólo identifica conceptos reales y nunca
  sustituye un texto traducido.

| Estilo móvil | Tamaño / línea | Peso |
|---|---|---|
| H1 | 52 / 51 px | Newsreader 400 |
| H2 | 42 / 44 px | Newsreader 400 |
| H3 | 24 / 30 px | Newsreader 400 |
| Cuerpo principal | 17 / 30 px | Plex Sans 400 |
| Cuerpo secundario | 16 / 28 px | Plex Sans 400 |
| Link/control | 14 / 22 px | Plex Sans 600 |
| Rótulo de sección | 12 / 18 px, tracking .12em | Plex Sans 600 |
| Pie redundante | 12 / 18 px | Plex Sans 400 |

Nunca se baja de 12 px. El cuerpo usa al menos 70 % de `ink` sobre `paper`.

## Geometría

- Base móvil: 375 px, margen lateral 20 px.
- Desktop: 12 columnas, gap 24 px, máximo 1280 px.
- Módulos recurrentes: 1:2, 3:2 para práctica y 3:4 para retrato.
- 38,2/61,8 se admite para balance de masas; no es regla universal ni símbolo japonés.
- Separación vertical: 96 px móvil y 128–160 px desktop.
- Reglas: 1 px `line`; ejes activos 1–2 px `ink` o `red`.

## SVG y transformación

- SVG inline, estático y `aria-hidden="true"` cuando sea decorativo.
- El contenido mantiene orden y sentido si el SVG no carga.
- Sin texto esencial dentro de SVG.
- `viewBox` obligatorio; `preserveAspectRatio` elegido por forma.
- No animación, morphing, parallax ni scroll hijacking.
- Sol sin rayos, descentrado y recortado: no reproduce una bandera.
- Montaña abstracta: máximo tres planos y ninguna silueta literal de Fuji.

## Fotografía

- Real, monocroma o muy desaturada; contraste moderado.
- Inicio: práctica 3:2 y retrato pequeño 3:4 dentro del dojo.
- Ninguna imagen ocupa sola el viewport.
- `width`, `height`, foco editorial y alt configurables.
- AVIF/WebP; sin carruseles ni overlays de texto.

## Componentes

- `SunOrigin`: disco y eje de descenso.
- `MountainPlane`: arista y plano de transición.
- `GroundPath`: línea y nodos de sede.
- `DojoFrame`: marco abierto para contenido humano.
- `ThresholdCTA`: cierre y acción primaria.
- `SectionLabel`: 12/18 px, nunca microtipografía.
- `VideoFacade`: miniatura, duración, proveedor y acción.
- `ScheduleTable`: HTML visible y responsive.

Estos nombres describen funciones compositivas; no obligan a que cada pantalla use todos.

## Accesibilidad

- Contraste WCAG AA como mínimo.
- Foco rojo de 2 px con offset de 3 px.
- Controles táctiles de 44×44 px como mínimo.
- `prefers-reduced-motion` no es necesario para el paisaje porque no se anima.
- El recorrido visual coincide con el orden DOM.
