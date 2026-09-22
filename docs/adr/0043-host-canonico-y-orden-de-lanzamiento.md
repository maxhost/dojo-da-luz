---
adr: 0043
fecha: 2026-09-21
estado: aceptada
resumen: El host canonico es www.aikido-duran.com, medido contra el sitio actual; y los 301 se despliegan antes de mover el DNS, no despues, porque el DNS es el interruptor que apaga el Wix.
---

# 0043 — El host canonico y el orden del lanzamiento

## Contexto

El sitio nuevo vive en `dojo-da-luz.vercel.app` y el dominio real es `aikido-duran.com`,
que hoy sirve el Wix. Las 44 paginas construidas ya emiten `canonical`, `hreflang` y
`og:url` contra `https://www.aikido-duran.com` (`site` en `astro.config.mjs`), asi que hoy
**cada pagina declara que su version buena esta en un dominio que le devuelve 404**:
verificado, `/aulas`, `/dojo` y `/professor-pablo-duran` dan 404 alli; solo `/` responde.

Dos preguntas: **que host es el canonico** y **en que orden se hace el cambio**.

## Decision 1 — `www`, y esta medido

```
http://aikido-duran.com/       301 -> https://aikido-duran.com/
https://aikido-duran.com/      301 -> https://www.aikido-duran.com/
http://www.aikido-duran.com/   301 -> https://www.aikido-duran.com/
https://www.aikido-duran.com/  200
```

El sitio actual **ya consolida todo en `www`**, y ese es el host que acumulo el
posicionamiento y los backlinks. Se conserva:

- `www.aikido-duran.com` es el canonico. El apex `aikido-duran.com` redirige `301` a `www`.
- `astro.config.mjs` **no se toca**: ya dice eso. Los 44 canonical, los `hreflang` y el
  `og:url` se vuelven correctos por si solos el dia que el DNS apunte a Vercel.
- `dojo-da-luz.vercel.app` sigue existiendo y **no se indexa**, porque sus paginas
  canonicalizan al dominio real. Es la unica ventaja del estado actual: no hay contenido
  duplicado compitiendo.

No se elige el apex aunque sea mas corto: cambiar de host canonico obliga a Google a
reasignar autoridad entre dos hosts y no compra nada.

## Decision 2 — los 301 van primero

**El DNS es el interruptor.** En el momento en que `www.aikido-duran.com` apunte a Vercel,
el Wix deja de responder y **las 38 URLs viejas caen en el sitio nuevo**. Si los redirects
no estan desplegados, todas devuelven 404 el mismo minuto y se pierde lo que esas URLs
tengan acumulado.

Orden obligatorio:

1. **Redirects y `sitemap.xml` desplegados y probados** contra `dojo-da-luz.vercel.app`
   (spec 0045). Se pueden verificar antes del cambio: una regla `/iniciopt` → `/` funciona
   igual en cualquier host.
2. Export de Search Console del cliente y crawl final. El sitemap del Wix **ya demostro
   estar incompleto** —tres paginas vivas no figuran en el (doc 10)—, asi que el inventario
   no se declara cerrado con el sitemap solo.
3. Dominio agregado en Vercel y DNS cambiado por el cliente.
4. Verificacion de las 38 reglas **contra el dominio real**, sitemap enviado a Search
   Console y `robots.txt` con su linea `Sitemap:`.

## Consecuencias

- El paso 3 lo hace el cliente y no bloquea nada de lo anterior: todo el trabajo tecnico se
  puede terminar y probar antes de tener acceso al DNS.
- Los redirects viven en la configuracion de Astro, que el adapter de Vercel traduce a
  redirects de plataforma: se resuelven antes de la funcion, no cuestan invocacion y no
  dependen de que el build este sano.
- **Hay una ventana inevitable**: entre el cambio de DNS y la propagacion, parte del mundo
  ve el Wix y parte el sitio nuevo. Ninguna de las dos respuestas es un error, asi que la
  ventana es aceptable y no se intenta coordinar.
- Mantener los 301 **indefinidamente**. No se borran "cuando Google los procese": un
  backlink de 2015 sigue trayendo gente.
