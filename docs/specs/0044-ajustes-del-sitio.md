---
spec: 0044
fecha: 2026-09-21
estado: cerrada
resumen: Pantalla /admin/ajustes con logo, favicon, color de acento, contacto, redes y las lineas del pie; el acento pasa a ser un token del tema y el pie sale de los 44 archivos de contenido.
disjunta: no
archivos: src/pages/admin/ajustes.astro, src/components/admin/{FormularioAjustes,CampoColor,CampoImagen}.astro, src/lib/{ajustes,ajustes-edicion,medios,schemas,site}.ts, src/layouts/Base.astro, src/components/{SocialLinks,Seo}.astro, src/components/*View.astro, src/styles/global.css, content/site.json, content/*/*.json
---

# 0044 — Los ajustes del sitio

> La pantalla que no es una pagina: lo que se repite en las 44.

## Problema

Los cinco de siempre, medidos:

1. **El pie esta escrito 44 veces** (`chrome.footerNote` en once archivos × cuatro idiomas).
   **Encarnação cerro y sigue en el pie de todo el sitio**, aunque ya salio de `/aulas` y de
   `/contactos`.
2. **El telefono y el email del pie son inventados** —`+351 000 000 000`,
   `ola@dojodaluz.example`— y estan en produccion.
3. **Las dos URLs de redes** estan dentro de `SocialLinks.astro`.
4. **El logo** es un `<span>` con 合気, no una imagen.
5. **No hay favicon**, y el color de acento esta escrito **74 veces** con tres derivados mas
   (18 + 5 + 4) que nadie podria editar por separado.

## Alcance

**Entra:**

- Pantalla `/admin/ajustes`, **un solo formulario sin pestañas de idioma** (un telefono no
  se traduce), que publica `content/site.json` en un commit con control por `sha`.
- Logo y favicon subibles, en **256 px** (`variante=icono` en el subidor).
- **Color de acento** editable, con los **tres** tonos derivados calculados (ADR-0041).
- Telefono, email y direccion; las dos URLs de redes.
- **Las lineas del pie, por idioma**, como texto libre de un renglon por linea.
- `chrome.footerNote` **se borra** de los once schemas, de los 44 archivos y de las diez
  pantallas de edicion; el `<slot name="footer-note">` desaparece de las diez vistas.
- El telefono, el email y las redes entran al JSON-LD.

**No entra:**

- **El encabezado.** Bajada del logo, boton de menu y "saltar al contenido" siguen en cada
  pagina: se pidio sacar el pie (ADR-0042).
- **El color del backoffice.** Se queda azul (ADR-0041).
- **Validar el contraste del acento.** El cliente ve el resultado y lo corrige.
- **Datos de contacto reales.** No los tengo y no se inventan: los campos quedan **vacios**,
  que es mejor que el placeholder que hay hoy publicado. El cliente los escribe.
- **El nombre "Dojo da Luz"** y el `og:site_name`. No es un ajuste, es la marca.

## El layout, campo por campo

Una sola columna, tres bloques y el pie:

| # | Bloque | Campos |
|---|---|---|
| 01 | **Marca** | Logo (imagen 256 px, se puede dejar vacío) · Favicon (imagen 256 px) · **Color de acento** |
| 02 | **Contacto** | Teléfono (lo que se ve) · Teléfono para el enlace · Email · Dirección |
| 03 | **Redes** | Facebook (URL) · Instagram (URL) |
| 04 | **Pie de página** | cuatro recuadros, uno por idioma, con las líneas del pie |

El color se ve asi — el cuadrado es el selector nativo del navegador y el texto al lado es
el mismo valor escrito, sincronizados en los dos sentidos:

```
  Color de acento *
  Se usa en los botones, los antetítulos y los bordes de todo el sitio.
  ┌────┐  ┌───────────┐
  │████│  │ #0099ff   │
  └────┘  └───────────┘
  Los tonos claro, oscuro y tenue de la marca salen de este color.
```

El pie, uno por idioma, con lo que hoy esta escrito 44 veces:

```
  Português                         Español
  ┌──────────────────────────────┐  ┌──────────────────────────────┐
  │ Benfica · Lumiar · Encarnação│  │ Benfica · Lumiar · Encarnação│
  │ Associação sem fins lucrativos│ │ Asociación sin fines de lucro│
  └──────────────────────────────┘  └──────────────────────────────┘
  Una línea por renglón. Vacío: el pie no muestra nada.
```

**Vacio = no se pinta**, en todos los campos: sin Facebook no hay icono, sin telefono no hay
linea, sin logo vuelve el circulo con 合気.

## Diseño

`content/site.json` — un archivo, como `dojos.json` y `partners.json`:

```jsonc
{
  "marca":    { "logo": null, "favicon": null, "acento": "#0099ff" },
  "contacto": { "telefono": null, "telefonoEnlace": null, "email": null, "direccion": null },
  "redes":    { "facebook": "https://…", "instagram": "https://…" },
  "pie": { "pt": ["Benfica · Lumiar · Encarnação", "Associação…"], "es": […], "fr": […], "en": […] }
}
```

- `src/lib/ajustes.ts` — schema + `getAjustes()`, con el JSON importado en el build como
  `partners.ts`. Un archivo roto rompe el build, no produccion.
- `src/lib/ajustes-edicion.ts` — `leerAjustes()` / `guardarAjustes()`, calcado de
  `partners-edicion.ts`.
- `Base.astro` — emite `html:root{--color-acento:…}`, pinta el logo o el circulo, el pie
  desde `ajustes.pie[locale]` y la direccion desde `ajustes.contacto`.
- `Seo.astro` — `<link rel="icon">` solo si hay favicon; `site.ts` suma `telephone`, `email`
  y `sameAs` al JSON-LD.
- `global.css` — `@theme` con los cuatro tokens (ADR-0041).
- `medios.ts` — `variante=icono` → `w256.webp`; `CampoImagen` gana la prop y la manda.

## Archivos

| Archivo | Acción |
|---|---|
| `content/site.json` | crear (semilla con lo que hoy esta escrito en el codigo) |
| `src/lib/ajustes.ts` | crear (schema + `getAjustes`) |
| `src/lib/ajustes-edicion.ts` | crear (leer/guardar con `sha`) |
| `src/components/admin/FormularioAjustes.astro` | crear |
| `src/components/admin/CampoColor.astro` | crear |
| `src/pages/admin/ajustes.astro` | crear |
| `src/styles/global.css` | editar (`@theme` con los cuatro tokens) |
| `src/layouts/Base.astro` | editar (variable del acento, logo, pie, direccion, 10 hex → tokens) |
| `src/components/SocialLinks.astro` | editar (URLs desde el contenido) |
| `src/components/Seo.astro`, `src/lib/site.ts` | editar (favicon, `telephone`/`email`/`sameAs`) |
| `src/components/*View.astro` (10) | editar (hex → tokens, fuera el `slot="footer-note"`) |
| `src/lib/schemas.ts` | editar (`chromeSchema` pierde `footerNote`) |
| `src/components/admin/Formulario*.astro` (10) | editar (fuera los dos campos del pie) |
| `src/lib/{aulas,audiencia,aikido,pagina-dojo,eventos,outras-artes,escolas,contactos,professor}-edicion.ts`, `forms.ts` | editar (fuera `footerNote` del `desdeForm`) |
| `src/lib/medios.ts`, `src/pages/admin/medios/subir.ts`, `src/components/admin/CampoImagen.astro` | editar (variante de 256 px) |
| `content/*/*.json` (44) | editar (fuera `chrome.footerNote`) |
| `src/pages/admin/index.astro` | editar (entrada nueva) |

### Disjunta?

**No.** Toca `Base.astro`, `global.css`, `schemas.ts` y las diez vistas y los diez
formularios: es la spec menos disjunta de todas.

## Verificación

Hecha el 2026-09-21. La señal principal **no es el HTML** —cambian los nombres de clase, el
pie y el `<head>`— sino **capturas de pantalla de las 44 paginas comparadas pixel a pixel**,
con Chrome headless contra el build servido.

- [x] `astro check` **0/0/0** (119 archivos), `npm test` **39/39**, `npm run build`
      **44 rutas**.
- [x] **Migracion visualmente neutra.** Con `site.json` repitiendo lo que decia el contenido:
      **23 paginas cambian solo un tono del acento** (5/255 en un canal) y **21 ademas bajan
      4 px el segundo renglon del pie** —eran dos valores distintos, `leading-6` en cuatro
      vistas y el de por defecto en seis, unificados—. **Cero diferencias inesperadas.**
- [x] **Estado final** (telefono y email vaciados): las mismas 44, **19 + 25**, y la unica
      banda nueva es la del pie sin las dos lineas de relleno — comprobada mirando el recorte
      antes/despues, no el conteo.
- [x] **La captura de la Home no es determinista**: el `<video>` del hero da 864.704 pixeles
      distintos **entre dos capturas del mismo build**. Probado, y por eso esa banda
      (`y 100–787` de las cuatro homes) se excluye en vez de explicarse.
- [x] El CSS construido define los cuatro tokens, y **ningun componente publico conserva**
      `#0099ff`, `#b3e5ff`, `#006eb8`, `#d6f0ff` ni `#cceeff`. Los que quedan en el bundle
      son del backoffice, que no sigue el color a proposito.
- [x] **Acento `#b34700` desde el BO** → en `/professor-pablo-duran` el borde del navbar da
      `#b34700`, el celeste pasa a `#e8c8b3` y el texto del boton a `#813300` —los tres
      calculados—, con **0 pixeles** de los tres azules viejos. El BO sigue azul: no emite el
      override.
- [x] **Logo** → `<img class="size-14 …">` en lugar del circulo, `合気` desaparece y el
      nombre "Dojo da Luz" sigue al lado (comprobado en la captura del navbar). Vaciarlo
      devuelve el circulo.
- [x] **Favicon** → `<link rel="icon" href="…">` en la pagina; sin favicon no hay etiqueta.
- [x] **Facebook vacio** → 0 iconos en las tres posiciones (navbar, menu movil, pie) y
      Instagram sigue en 3, sin ningun enlace roto.
- [x] **Telefono y email** → en el pie y en el JSON-LD, que sigue siendo **un solo bloque
      parseable** con `telephone`, `email` y `sameAs`.
- [x] **Sacar Encarnação del pie portugues** → las **once** paginas portuguesas de una sola
      publicacion. Lo que queda nombrandola son `seo.description` y dos parrafos de la Home,
      que son contenido de pagina y tienen su editor.
- [x] Sin cambios → *"No había cambios"*. Hex invalido → **422** nombrando el campo. `sha`
      viejo → **409** sin pisar nada.
- [x] Sin cookie, `/admin/ajustes` → 302 con `X-Robots-Tag` (el guard es el del middleware).

**Lo que no se pudo verificar local:** la subida a R2 del logo y el favicon. Las claves de R2
solo existen en Vercel (`vercel env ls` las lista en Production), asi que el endpoint
contesta `Falta configurar R2` en `astro dev`. El plumbing de la variante **si** esta
comprobado —el endpoint la acepta y el campo la manda— y **la WebP de 256 px se verifica en
produccion despues del deploy**, que es donde vive la credencial.

## Encontrado al verificar, y no arreglado aca

**El boton del cierre de la Home abre `mailto:EMAIL-PENDENTE`.** Esta escrito en
`HomeView.astro:195` y sale en las cuatro homes de produccion: al tocarlo se abre el cliente
de correo con "EMAIL-PENDENTE" como destinatario. Lo encontre buscando `mailto:` en el build
final para comprobar que el pie ya no publica el email de relleno.

No se arregla en esta spec **a proposito**: el bloque hermano —`trial`, el de la clase de
prueba— ya paso a abrir el modal de formulario en la spec 0035 y el comentario del schema lo
dice; este quedo atras. Que haga lo mismo es una decision sobre formularios, no sobre
ajustes, y ahora que hay un campo de email en Ajustes hay **dos** salidas posibles. Es una
tarea de una linea y su decision de una frase, pero no es esta.

## Abierto

Los datos de contacto reales. Los campos salen vacios y el pie queda **sin telefono ni
email** hasta que el cliente los escriba — que es la unica opcion honesta: lo que hay hoy
publicado es un numero de relleno.
