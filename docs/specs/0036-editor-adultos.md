---
spec: 0036
fecha: 2026-09-21
estado: cerrada
resumen: Editores separados de /aulas/adultos y /aulas/criancas, con galeria de largo libre donde cada medio es una foto subida o un video de YouTube, el grid publico se adapta a la cantidad y portugues siembra las imagenes a los cuatro idiomas.
disjunta: no
archivos: src/pages/admin/paginas/{adultos,criancas}.astro, src/components/admin/{FormularioAudiencia,EditorAudiencia,TablaMedios}.astro, src/lib/{audiencia-edicion,audiencia-pantalla,youtube,traduccion,schemas,forms}.ts, src/components/AudienceView.astro, src/pages/admin/index.astro, content/*/{adults,children}.json

---

# 0036 — Editores de Adultos y Criancas

> El layout campo por campo de esta spec lo aprobo el cliente el 2026-09-21 antes de que
> se escribiera una linea de codigo. Es el procedimiento que funciono con `/aulas` despues
> de tres pantallas rechazadas.

## Problema

`/aulas/adultos` y `/aulas/criancas` no se pueden editar. Todo su texto —titular, parrafos,
los cuatro datos de la franja oscura, las preguntas frecuentes, los textos de los botones—
vive en `content/<idioma>/{adults,children}.json` y cambiar una coma es un commit a mano en
cuatro archivos.

Tres cosas mas, especificas de estas paginas:

1. **La galeria tiene exactamente seis medios y no puede tener otra cantidad**
   (`gallerySchema` dice `.length(6)`), con un mosaico calculado para seis.
2. **El unico video de las ocho galerias es un mp4 de stock de Pexels**, ajeno al dojo, y
   no hay forma de poner uno propio sin alojar un mp4 y su portada.
3. **La foto de portada esta repetida en los cuatro idiomas** sin nada que los ate: existe
   el estado "cambiada en tres de cuatro" y ninguna validacion lo puede ver.

Ademas, cinco textos visibles de estas paginas **no estan en el contenido**: la bajada del
logo, el boton de menu, el "saltar al contenido" y las dos lineas del pie estan escritos
dentro de `AudienceView.astro`. En `/aulas` los mismos cinco si se editan.

## Alcance

**Entra:**

- **Dos paginas de administracion separadas**: `/admin/paginas/adultos` y
  `/admin/paginas/criancas`, con su propia entrada en el panel. Editan pantallas distintas
  aunque el formulario sea el mismo. Cuatro pestañas de idioma en CSS, boton "Publicar" por
  idioma y aviso de conflicto por `sha`, calcado de `/admin/paginas/aulas`.
- **Portugues manda la estructura** (ADR-0030) en las cinco listas: parrafos, objetivos,
  datos, medios de la galeria y preguntas frecuentes.
- **Portugues siembra las imagenes** (ADR-0032): la portada y los medios solo se cambian en
  la pestaña PT y se copian a los cuatro archivos al publicar. En es/fr/en la miniatura se
  ve pero no se puede cambiar.
- **Galeria de largo libre** (ADR-0031): "Añadir imagen", "Añadir video" y un "Quitar" por
  fila, sin minimo ni maximo. Cero medios = la seccion no se pinta.
- **Video de YouTube**: se pega el enlace (`watch?v=`, `youtu.be/`, `shorts/`, `embed/`), se
  guarda normalizado, la miniatura la trae YouTube y el reproductor se carga al tocarlo.
- **Grid publico adaptativo** segun la cantidad de medios (tabla en el ADR-0031).
- **Los cinco textos de cabecera y pie pasan al contenido** como `chrome`, con la misma
  forma que ya tienen en `classes.json`.
- **La franja oscura de datos queda a mano**: tabla libre de Etiqueta y Valor, no se
  engancha a las fichas de dojo. Decision del cliente.

**No entra:**

- **El menu.** Los ocho enlaces salen de `siteNav(locale)`: no hay campo que editar.
- **`formUrl`**, el destino del boton de la aula experimental. Mismo criterio que la spec
  0035: un destino mal escrito deja el modal en blanco sin avisar.
- **Subir videos propios.** Ver ADR-0031.
- **Enganchar la franja de datos a `dojos.json`.** Tres de sus cuatro filas repiten a mano
  horarios que `/aulas` ya saca de las fichas de dojo. El cliente eligio texto libre; queda
  anotado en TASKS como duplicado conocido.
- **`content/media.json`.** No se toca: las portadas de Adultos y Criancas no entran ahi
  (ADR-0032).

## El layout, campo por campo

Orden de la pantalla = orden de la pagina publica. Cada bloque es un `fieldset`, como en
`/aulas`. Es identico en los dos editores; cambia el archivo que escribe.

| # | Bloque | Campos |
|---|---|---|
| 00 | Cabecera y pie | Bajada del logo · Botón de menú · Saltar al contenido · Pie: zonas · Pie: tipo de organización |
| 01 | SEO | Título de la página (rec. 60) · Descripción (rec. 155) |
| 02 | Portada | Antetítulo · Titular · Bajada · **Texto del botón** · Foto de portada *(sembrada)* · Descripción de la foto |
| 03 | Texto y "O que se trabalha" | Párrafos *(tabla)* · Título de la lista · Lo que se trabaja *(tabla)* |
| 04 | Franja oscura de datos | Tabla Etiqueta / Valor |
| 05 | Galería | Rótulo · Título · Introducción · **tabla de medios** |
| 06 | Perguntas frequentes | Rótulo · Título · tabla Pregunta / Respuesta |
| 07 | Aula experimental | Título · Texto · Enlace "abrir en ventana nueva" · Texto para cerrar |

El texto del boton esta **una sola vez**, en la seccion 02: en la pagina aparece dos veces
—en la portada y en la franja azul— pero es el mismo campo (`trialLabel`).

La tabla de medios, una fila por medio:

```
┌ Imagen ──────────────────────────────────────────────┐
│ [ miniatura: se toca y sube ]                        │
│ Descripción: [ texto                              ]  │
│                                          Quitar      │
└──────────────────────────────────────────────────────┘

┌ Vídeo de YouTube ────────────────────────────────────┐
│ Enlace: [ https://www.youtube.com/watch?v=…       ]  │
│ [ miniatura que trae YouTube ]                       │
│ Descripción: [ texto                              ]  │
│                                          Quitar      │
└──────────────────────────────────────────────────────┘
```

El tipo se elige al crear la fila y no se cambia despues: para pasar de foto a video se
quita la fila y se añade la otra. Un enlace que no es de YouTube da error **en la fila**.

## Diseño

### Dónde vive cada cosa

Todo en `content/<idioma>/{adults,children}.json`. **No hay archivo compartido nuevo**
(ADR-0032). El schema de la galeria queda:

```ts
items: z.array(z.discriminatedUnion('type', [
  z.object({ type: z.literal('image'),   src: z.url(),        alt: z.string().min(1) }),
  z.object({ type: z.literal('youtube'), url: urlDeYoutube(), alt: z.string().min(1) }),
]))
```

`urlDeYoutube()` es `z.url()` mas un `refine` que exige que `idDeYoutube(url)` devuelva
algo. El id no se guarda: se extrae al renderizar, de la misma URL que se ve en el editor.

### Sembrado

`propagarEstructura(pt, otro, listas, sembrados)` gana un cuarto argumento. Un campo
sembrado se copia de PT **siempre**, no solo en filas nuevas:

```ts
export const SEMBRADOS_AUDIENCIA = [
  'photo',
  'gallery.items[].type',
  'gallery.items[].src',
  'gallery.items[].url',
]
```

`type` va sembrado a proposito: una fila no puede ser foto en portugues y video en ingles.
Las rutas con `[]` se aplican fila por fila; las claves que no existen en esa fila se
saltean. La marca "sin traducir" no cambia de forma: compara la fila entera, y como lo
sembrado es identico, termina comparando la descripcion.

### El grid público y el vídeo

Reglas en el ADR-0031. El video es una `<button>` con la miniatura de
`i.ytimg.com/vi/<id>/hqdefault.jpg` y un play encima; al tocarla se reemplaza por el
`iframe` de `youtube-nocookie.com/embed/<id>?autoplay=1`. Sin JavaScript, la miniatura es
un enlace al video.

### Las dos pantallas

Un solo formulario, dos rutas. El POST y la lectura de los cuatro archivos viven en
`src/lib/audiencia-pantalla.ts`, parametrizados por `pagina: 'adults' | 'children'`, para
que cada `.astro` sea una pagina corta y no una copia de 170 lineas.

## Archivos

| Archivo | Acción |
|---|---|
| `src/lib/youtube.ts` | crear |
| `src/lib/audiencia-edicion.ts` | crear (form → datos, guardar, sembrado) |
| `src/lib/audiencia-pantalla.ts` | crear (POST + lectura de los 4 archivos) |
| `src/components/admin/EditorAudiencia.astro` | crear (pestañas) |
| `src/components/admin/FormularioAudiencia.astro` | crear |
| `src/components/admin/TablaMedios.astro` | crear |
| `src/pages/admin/paginas/{adultos,criancas}.astro` | crear |
| `src/lib/schemas.ts` | editar (`gallerySchema`, `audienceEntrySchema` con `chrome`) |
| `src/lib/traduccion.ts` | editar (`LISTAS_AUDIENCIA`, `SEMBRADOS_AUDIENCIA`, sembrado) |
| `src/components/AudienceView.astro` | editar (chrome, grid adaptativo, YouTube) |
| `src/pages/admin/index.astro` | editar (dos entradas nuevas) |
| `content/*/{adults,children}.json` | editar (migración: `chrome`, borrar el mp4) |

### Disjunta?

**No.** Toca `schemas.ts`, `traduccion.ts` y `forms.ts`, compartidos con las specs
0032/0033/0035. Serializar con cualquier trabajo sobre el editor de Home (fila 6o).

## Verificación

- [ ] Test de `youtube.ts`: las cuatro formas de enlace dan el mismo id; una URL que no es
      de YouTube no valida.
- [ ] Test de `traduccion.ts`: un campo sembrado cambiado en PT pisa el de es/fr/en, y el
      texto traducido de esa misma fila **no** se pisa.
- [ ] `astro check` en 0/0/0, `npm test` en verde, `npm run build` sin errores.
- [ ] **Con el BO corriendo** (`scripts/sesion-temporal.mjs`), no por lectura del código:
      añadir una foto desde la computadora, añadir un vídeo de YouTube, quitar uno,
      publicar en portugués y ver los cuatro archivos en un commit.
- [ ] La página pública con 1, 2, 4 y 7 medios: mirar el grid en cada caso.
- [ ] El `<iframe>` de YouTube **no** aparece en el HTML construido:
      `grep -rL "youtube-nocookie" .vercel/output/static/aulas/adultos/index.html`.

## Abierto

Nada bloqueante. Lo que queda anotado para después:

- La franja de datos repite a mano horarios que ya salen de `dojos.json`. Decidido: a mano.
- `formUrl` sigue fuera del editor hasta que exista la spec de formularios.
