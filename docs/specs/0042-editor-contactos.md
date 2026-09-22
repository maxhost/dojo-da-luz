---
spec: 0042
fecha: 2026-09-21
estado: cerrada
resumen: Editor de /contactos con los textos, las etiquetas del formulario y las lineas de como llegar; las sedes pasan a salir de la entidad de dojos y dejan de editarse desde esta pagina.
disjunta: no
archivos: src/pages/admin/paginas/contactos.astro, src/components/admin/FormularioContactos.astro, src/lib/{contactos-edicion,schemas,traduccion}.ts, src/components/ContactView.astro, content/*/contact.json
---

# 0042 — Editor de /contactos

> Octavo editor con el molde de la spec 0037. Con este, **todas las paginas de contenido del
> sitio tienen editor**.

## Problema

`/contactos` no se puede editar, y arrastra el unico resto de la migracion a la entidad de
dojos:

1. **Las tres sedes estan duplicadas en `contact.venues`**, repetidas en los cuatro idiomas.
   **Encarnação cerro** —su dojo esta `archivado` en la entidad y ya no aparece ni en
   `/aulas` ni en la Home— y aca **sigue publicada**, con su metro y sus diez minutos a pie.
   Es la fila 6f de TASKS, a medias desde la spec 0034.
2. **Los cinco textos del borde estan escritos dentro de `ContactView.astro`** (el array
   `ui`), como en las seis paginas anteriores antes de sus specs.
3. **Las etiquetas del formulario** —Nombre, Email, Asunto, Mensaje, el boton y la linea que
   explica que todavia no envia— no se pueden tocar.
4. Defecto latente: el numero de cada sede se pinta con `0{index + 1}`, el mismo `010` que
   ya se corrigio en tres paginas.

## Alcance

**Entra:**

- Pagina `/admin/paginas/contactos` con el contrato de siempre: cuatro pestañas de idioma,
  portugues manda la estructura (ADR-0030), marca "sin traducir", aviso de conflicto por
  `sha`, publicar PT escribe los cuatro archivos en un commit.
- **La portada**: antetitulo, titular y bajada.
- **Como se llega a cada sede**: un recuadro por dojo **activo**, con sus lineas de
  transporte, traducibles (ADR-0038).
- **Aulas particulares**: titulo y texto.
- **El formulario**: su titulo, las cuatro etiquetas, **el texto del boton** y la linea que
  explica que el envio esta pendiente.
- Los cinco textos del borde pasan al contenido.
- **Las sedes pasan a salir de `content/dojos.json`** y `contact.venues` se borra.
- Se corrige el `0{index + 1}`.

**No entra:**

- **Los dojos.** Ni su nombre, ni cuales son, ni en que orden. Salen de la entidad y se
  editan en **Dojos** (ADR-0038). En esta pantalla el nombre del dojo es un rotulo que no
  se puede tocar, puesto ahi para saber de cual son las lineas que se estan escribiendo.
- **Que el formulario envie.** Hoy el boton esta desactivado y debajo dice por que: falta
  el email o el endpoint del dojo. Es otra tarea, y no se arregla con un editor — ver
  "Abierto".
- **El menu**: sale de `siteNav(locale)`.
- **Una foto de portada.** Esta pagina tiene una franja azul plana, no una portada con
  imagen, y cambiarlo no se pidio.

## El layout, campo por campo

Orden de la pantalla = orden de la pagina publica.

| # | Bloque | Campos |
|---|---|---|
| — | Cabecera y pie | Bajada del logo · Botón de menú · Saltar al contenido · Pie: zonas · Pie: tipo de organización |
| — | SEO | Título de la página (rec. 60) · Descripción (rec. 155) |
| 01 | Portada | Antetítulo · Titular · Bajada |
| 02 | Cómo llegar | un recuadro **por dojo activo**: líneas de transporte, una por línea |
| 03 | Clases particulares | Título · Texto |
| 04 | Formulario | Título · Nombre · Email · Asunto · Mensaje · **Texto del botón** · Aviso de envío pendiente |

**El bloque 02 no edita dojos.** Se ve así, y el nombre en negrita **no es un campo**:

```
┌──────────────────────────────────────────────────────────┐
│ Benfica · Dojo da Luz                                    │
│ Cómo llegar (una línea por entrada):                     │
│   [ Igreja de Benfica                                 ]  │
│   [ Autocarros 716, 729, 746 e 758                    ]  │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ Lumiar · Núcleo Lumiar                                   │
│   [ Metro Ameixoeira · linha amarela                  ]  │
│   [ Autocarro 703                                     ]  │
└──────────────────────────────────────────────────────────┘

  Los dojos se dan de alta, se archivan y se ordenan en «Dojos».
```

**Hay dos recuadros y no tres**: Encarnação está archivado, así que deja de aparecer en la
página y en el editor. Si mañana se reactiva, vuelven los tres solos.

**Las líneas de transporte sí se traducen** —*Autocarros* / *Autobuses* / *Bus*— y por eso
viven en el contenido de cada idioma y no en la ficha del dojo, que se guarda una sola vez.

## Diseño

Octavo uso del modulo generico de la spec 0037. Lo propio de esta pagina es
`contactos-edicion.ts`.

Schema (`contactSchema`, migracion de los cuatro archivos en el mismo commit):

```ts
z.object({
  seo, chrome,
  eyebrow, title, lead,
  // Las sedes salen de content/dojos.json (ADR-0038). Aca solo como se llega, por slug.
  transport: z.record(z.string(), z.array(z.string().min(1))),
  privateTitle, privateText, formTitle,
  fields: z.object({ name, email, subject, message, submit, pending }),
})
```

**`transport` es un mapa, no una lista**, y por eso **no entra en `listas`**: las claves las
pone la entidad —el formulario pinta una por dojo activo— asi que los cuatro idiomas las
tienen iguales sin necesidad de propagar nada. Indexar por `slug` y no por posicion es lo
que hace que reordenar los dojos no desalinee las lineas.

`LISTAS_CONTACTOS` queda vacia y `SEMBRADOS_CONTACTOS` tambien: esta pagina **no tiene ni
una foto ni una lista de largo libre**. Es la unica de las ocho.

`ContactView.astro` deja de tener el array `ui`, pinta las tarjetas con `getDojos()` y
numera con `padStart(2, '0')`.

## Archivos

| Archivo | Acción |
|---|---|
| `src/lib/contactos-edicion.ts` | crear (descriptor + `FormData` → datos) |
| `src/components/admin/FormularioContactos.astro` | crear |
| `src/pages/admin/paginas/contactos.astro` | crear |
| `src/lib/schemas.ts` | editar (`contactSchema`) |
| `src/lib/traduccion.ts` | editar (`LISTAS_CONTACTOS`, `SEMBRADOS_CONTACTOS`) |
| `src/components/ContactView.astro` | editar (chrome, sedes desde la entidad, numeración) |
| `src/pages/admin/index.astro` | editar (entrada nueva) |
| `content/*/contact.json` | editar (migración: `chrome`, `venues` → `transport`) |

### Disjunta?

**No.** Toca `schemas.ts` y `traduccion.ts`, compartidos con las specs 0035 a 0041.

## Verificación

Hecha el 2026-09-21 con el BO corriendo (`scripts/sesion-temporal.mjs`, backend `disco`),
no por lectura:

- [x] `astro check` **0/0/0**, `npm test` **39/39**, `npm run build` **44 rutas**.
- [x] La pantalla abre en 200 con los seis bloques y **dos** recuadros de "cómo llegar" —
      Benfica y Lumiar—. Encarnação, archivado, no se pinta: viaja en un campo oculto.
      **Cero campos de imagen**: es la única página sin una sola foto.
- [x] Cambiar las líneas de Benfica en español se publicó sin tocar el portugués, y las de
      Encarnação siguieron guardadas.
- [x] Un POST forjado desde español con un `slug` inventado guarda la clave pero **la página
      no la pinta**: la vista solo lee las de los dojos activos.
- [x] **Archivar Lumiar desde el editor de Dojos dejó `/contactos` con una sola tarjeta** —y
      `/aulas` con una sola sede—; publicar `/contactos` en ese estado, mandando el
      formulario tal como lo pinta el editor, **conservó sus dos líneas**; reactivarlo
      devolvió la tarjeta con las líneas intactas.
- [x] Comparación del HTML construido contra `HEAD` con el hash del CSS neutralizado:
      **44 páginas, 4 distintas**, exactamente las de `/contactos`. Comparadas palabra por
      palabra, lo único que cambia es la tarjeta de Encarnação, que desaparece entera, y el
      antetítulo de la segunda, que pasa de *"Lumiar / Ameixoeira"* a *"Lumiar"* — el
      `nombre` que tiene el dojo en la entidad. El dato no se pierde: la primera línea de
      cómo llegar dice *"Metro Ameixoeira"*.

Dos cosas se corrigieron **por haberlas verificado y no por haberlas leído**:

1. El primer intento de archivar un dojo por HTTP devolvió `303` y **no archivó nada**: al
   endpoint le falta el `sha` y sin él contesta con un `?fallo=` en la query. La primera
   lectura de "dos tarjetas" no probaba nada. Con el `sha` del listado, archiva.
2. Publicar reescribía el bloque `transport` entero en el diff aunque no hubiera cambiado
   una línea: los campos ocultos de los dojos archivados se pintan antes que los visibles,
   así que el orden de las claves salía del formulario. Ahora se ordenan alfabéticamente
   antes de guardar — el orden canónico es del schema (ADR-0025), y un `record` no lo fija
   solo.

## Decidido

- Las sedes salen de la entidad; `contact.venues` se borra (ADR-0038).
- Cómo llegar se queda en el contenido traducible, indexado por `slug`.
- El editor no da de alta ni archiva dojos: eso es **Dojos**.

## Abierto

**El formulario sigue sin enviar.** El botón está desactivado y la línea de abajo lo
explica. Necesita una decisión que no es de contenido: a qué email llega, con qué servicio
—Resend ya está en el stack (ADR-0003)— y qué protección contra spam. Es una spec propia.

Y queda anotado: el `seo.description` de `/contactos` y el pie de las ocho páginas siguen
nombrando **Encarnação**. Ahora son texto editable desde el backoffice; lo corrige el
cliente cuando quiera.
