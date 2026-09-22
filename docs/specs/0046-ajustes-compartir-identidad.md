---
spec: 0046
fecha: 2026-09-21
estado: cerrada
resumen: Dos bloques mas en /admin/ajustes —la imagen para compartir y la identidad para buscadores— que llenan el og:image que no existe y sacan del codigo el bloque de JSON-LD que leen los motores generativos.
disjunta: no
archivos: src/pages/admin/ajustes.astro, src/components/admin/FormularioAjustes.astro, src/lib/{ajustes,ajustes-edicion,medios,site}.ts, src/components/{Seo,TeacherView}.astro, src/pages/llms.txt.ts, content/site.json
---

# 0046 — Compartir e identidad, en Ajustes

> Lo ultimo de la capa SEO/GEO que el cliente no puede tocar.

## Problema

1. **No hay `og:image` ni `twitter:card`.** Comprobado en el HTML construido: de `og:` solo
   hay `title`, `description`, `url`, `type`, `site_name` y `locale`. Compartir cualquiera
   de las 44 paginas en WhatsApp, Facebook o LinkedIn da un enlace **sin imagen**.
2. **El bloque de identidad del JSON-LD esta escrito en el codigo.** `ORG` en `site.ts`
   —`Aikido-Durán`, `Aikido`, `Lisboa`, `PT`, `Pablo Durán`,
   `5.º Dan Aikikai, Hombu Dojo Tóquio`— y el `Person` de `TeacherView` con su
   `knowsAbout`. Es **exactamente** el bloque que un motor generativo lee para saber quien
   es el dojo, y es lo unico de la capa GEO (ADR-0018) sin editor.
3. El comentario de `site.ts` decia "PENDIENTE DEL CLIENTE" para esos datos. Con la spec
   0044 el telefono y el email ya salieron; el resto sigue adentro.

## Alcance

**Entra:**

- **Bloque 05 · Imagen para compartir** en Ajustes: una imagen, en **1200×630 JPEG**
  (`variante=social`), y `og:image`, `og:image:width/height`, `twitter:card` y
  `twitter:image` en `Seo.astro`. Vacio: no se emite ninguna etiqueta, como hoy.
- **Bloque 06 · Identidad para buscadores**: nombre alternativo, ciudad, pais, nombre del
  profesor, su titulo y los temas (`knowsAbout`, una linea por tema).
- `sportsClubJsonLd`, el `Person` de `/professor-pablo-duran` y `/llms.txt` leen esos
  campos.

**No entra:**

- **"Dojo da Luz".** Es la marca y se queda en el codigo: lo confirmo el cliente.
- **Una imagen para compartir por pagina.** Una sola para el sitio. Cuarenta y cuatro
  campos de imagen para que el cliente cargue cuarenta y cuatro veces lo mismo es la
  pantalla que rechazo el ADR-0029.
- **Generar la imagen automaticamente** con el titulo de cada pagina. Es tentador y es otra
  spec: necesita render de texto en el servidor.
- **Validar el JSON-LD contra un validador externo.** Se comprueba que parsea y que los
  campos estan; lo demas es una herramienta de Google.

## El layout, campo por campo

Se suman al final de la pantalla que ya existe:

| # | Bloque | Campos |
|---|---|---|
| 05 | **Imagen para compartir** | una imagen (1200×630) |
| 06 | **Identidad para buscadores** | Nombre alternativo · Ciudad · País · Profesor · Título del profesor · Temas (uno por línea) |

El bloque 06 lleva una línea de ayuda que explica para qué sirve, porque es el único de la
pantalla que **no se ve en la página**:

> Esto no se ve en el sitio: es lo que leen Google y los asistentes de IA para saber quién
> es el dojo. Cambiarlo no cambia ninguna página.

## Diseño

`content/site.json` gana dos claves, en el orden del schema:

```jsonc
{
  "marca": { "logo": …, "favicon": …, "acento": …, "compartir": null },
  "identidad": {
    "nombreAlternativo": "Aikido-Durán",
    "ciudad": "Lisboa",
    "pais": "PT",
    "profesor": "Pablo Durán",
    "profesorTitulo": "5.º Dan Aikikai, Hombu Dojo Tóquio",
    "temas": ["Aikido", "Aikikai", "Aikido para crianças"]
  }
}
```

- `ORG` deja de ser una constante y pasa a derivarse de `getAjustes()`. `name` y `sport`
  siguen fijos: la marca y la disciplina no son ajustes.
- `medios.ts` gana `variante: 'social'` → **1200×630 JPEG** con recorte centrado
  (`fit: 'cover'`). No WebP: Facebook y WhatsApp lo soportan de forma despareja y una
  imagen de previsualizacion que falla no se nota hasta que alguien comparte el enlace.
- El `knowsAbout` de `/professor` sale de `identidad.temas`: es el mismo dato.

## Archivos

| Archivo | Acción |
|---|---|
| `src/lib/ajustes.ts` | editar (`marca.compartir`, `identidad`) |
| `src/lib/ajustes-edicion.ts` | editar (los campos nuevos) |
| `src/components/admin/FormularioAjustes.astro` | editar (bloques 05 y 06) |
| `src/lib/medios.ts` | editar (`variante: 'social'`, 1200×630 JPEG) |
| `src/components/Seo.astro` | editar (`og:image`, `twitter:card`) |
| `src/lib/site.ts` | editar (`ORG` desde el contenido) |
| `src/components/TeacherView.astro` | editar (`name`, `knowsAbout` desde el contenido) |
| `src/pages/llms.txt.ts` | editar (usa el `ORG` derivado) |
| `content/site.json` | editar (migración con los valores de hoy) |

### Disjunta?

**No** con la 0047: las dos tocan `medios.ts` y `ajustes*.ts`. **Sí** con la 0045 y la 0048.
Si se hacen las dos, **0047 primero**: cambia cómo se sube, y esta sólo agrega una variante.

## Verificación

- [ ] `astro check` 0/0/0, tests sin regresiones, build 44 rutas.
- [ ] Con `site.json` repitiendo los valores de hoy, **el JSON-LD de las 44 páginas queda
      byte a byte igual** — es lo que prueba que la migración no inventó nada.
- [ ] Cargar una imagen para compartir: aparece `og:image` en las 44, la imagen servida
      mide **1200×630** y es JPEG. Vaciarla: no queda ninguna etiqueta `og:image`.
- [ ] Cambiar el nombre alternativo: cambia en el JSON-LD de las 44 **y** en `/llms.txt`.
- [ ] Cambiar los temas: cambia el `knowsAbout` de las 4 páginas del profesor.
- [ ] El JSON-LD sigue siendo **un solo bloque por página** y parsea.
- [ ] Un campo obligatorio vacío → 422 nombrando el campo.

## Abierto

Nada bloqueante. Queda anotado que la imagen para compartir es una sola para el sitio: si
alguna vez se quiere una por página, el lugar natural es el bloque SEO de cada editor, y
son diez campos más.
