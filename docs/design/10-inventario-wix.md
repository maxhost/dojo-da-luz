# Inventario del Wix y matriz de redirects definitiva

> Crawl del 2026-09-21 contra `https://www.aikido-duran.com`. **Esto es el dato**; el
> documento 09 es el diseño. Donde los dos difieran, manda este, y la diferencia esta
> anotada.

## Como se obtuvo

1. `robots.txt` → no declara `Sitemap:`.
2. `/sitemap.xml` → indice que apunta a `/pages-sitemap.xml`.
3. `/pages-sitemap.xml` → **34 URLs**, todas con `lastmod: 2026-09-13`.
4. Las 34 crawleadas una por una: **todas devuelven `200`**.
5. Probadas a mano las rutas que el documento 09 daba por confirmadas o por confirmar y
   **no estaban en el sitemap**.

## Lo que el sitemap no dice

**El sitemap de Wix esta incompleto.** Tres paginas responden `200` y no figuran en el:

| Ruta | `<title>` | Como aparecio |
|---|---|---|
| `/contactospt` | Aikido Lisboa \| Dojo da Luz \| **Onde estamos** | el documento 09 la daba por confirmada |
| `/atualidadept` | Aikido Lisboa \| Dojo da Luz \| **Actualidade** | idem |
| `/enseignant-fr` | **Pablo Durán** | el documento 09 la dejaba "por confirmar"; `/professeur-fr` da 404 |

Mas el PDF que el documento 09 ya citaba, que sigue vivo:
`/_files/ugd/ae7240_bf5b66ead42f42c189d64ba5bbbb3f47.pdf` → `200`, `application/pdf`,
**6,7 MB**.

**Total conocido: 38 origenes** (34 + 3 + 1 PDF).

Se probaron ademas catorce rutas plausibles mas —`/videos`, `/fotos`, `/agenda`,
`/contacto`, `/partenaires-fr`, `/galeria`…— y **ninguna** responde `200`. Aun asi, el
inventario **no se puede declarar completo sin el export de Search Console**: el sitemap ya
demostro que miente por omision, y una pagina vieja con backlinks puede no estar enlazada
desde ningun lado. Ese export lo tiene el cliente y es el ultimo paso antes de lanzar.

## El host canonico esta medido

```
http://aikido-duran.com/       301 → https://aikido-duran.com/
https://aikido-duran.com/      301 → https://www.aikido-duran.com/
http://www.aikido-duran.com/   301 → https://www.aikido-duran.com/
https://www.aikido-duran.com/  200
```

**El canonico es `www`**, y es lo que ya dice `astro.config.mjs` (ADR-0043).

## Un defecto del sitio actual que el nuevo ya no tiene

**Las 34 paginas del Wix declaran `<html lang="es">`**, incluidas las portuguesas y las
francesas. El sitio nuevo emite `pt-PT`, `es`, `fr` y `en` con `hreflang` reciproco. No es
una tarea: es una mejora que ya esta hecha y conviene no perderla de vista al comparar.

## Matriz definitiva

Reglas: `301` permanente, **un solo salto**, sin comodines, y **ningun destino que devuelva
404 o apunte a un anchor inexistente** — los anchors de esta tabla estan verificados contra
el HTML construido.

### No necesitan regla

`/` y `/outras-artes` son las mismas rutas en el sitio nuevo: las sirve el build.

### Inicio

| Origen | Destino |
|---|---|
| `/iniciopt` | `/` |
| `/inicioes` | `/es/` |
| `/accueil-fr` | `/fr/` |

### Aulas y conversion

| Origen | Destino |
|---|---|
| `/horarios-e-preospt` | `/aulas/` |
| `/horarios-tarifases` | `/es/clases/` |
| `/horaires-et-tarifs-fr` | `/fr/cours/` |
| `/aula-experimental` | `/aulas/adultos/#aula-experimental` |
| `/criancas` | `/aulas/criancas/` |

### Aikido, videos y lecturas

| Origen | Destino | Por que |
|---|---|---|
| `/aikidopt` | `/aikido/` | |
| `/aikidoes` | `/es/aikido/` | |
| `/akido-fr` | `/fr/aikido/` | typo historico del origen, se preserva |
| `/videospt` | `/aikido/` | videos historicos de Aikido |
| `/videos-es` | `/es/aikido/` | idem |
| `/videos-fr` | `/fr/aikido/` | idem |
| `/lectura-es` | `/es/aikido/` | bibliografia de la disciplina |
| `/lecture-fr` | `/fr/aikido/` | idem |
| el PDF de 6,7 MB | `/fr/aikido/` | lo que ya decia el documento 09 |

### Dojo, profesor y galerias

| Origen | Destino | Por que |
|---|---|---|
| `/dojo-da-luz-pt` | `/dojo/` | |
| `/dojo-da-luz-es` | `/es/dojo/` | |
| `/dojo-da-luz-fr` | `/fr/dojo/` | |
| `/prefessorpt` | `/professor-pablo-duran/` | typo historico, se preserva |
| `/profesores` | `/es/profesor-pablo-duran/` | |
| `/enseignant-fr` | `/fr/professeur-pablo-duran/` | **fuera del sitemap** |
| `/fotospt` | `/dojo/` | la galeria depende del dojo |
| `/fotos-es` | `/es/dojo/` | idem |
| `/photos-fr` | `/fr/dojo/` | idem |

### Contacto

| Origen | Destino |
|---|---|
| `/contactospt` | `/contactos/` |
| `/contacto-es` | `/es/contacto/` |
| `/coordonnees-fr` | `/fr/contact/` |

### Actualidad y eventos

| Origen | Destino |
|---|---|
| `/eventos-e-destaquespt` | `/eventos/` |
| `/atualidadept` | `/eventos/` |
| `/actualidad-es` | `/es/eventos/` |
| `/actualit-fr` | `/fr/evenements/` |

### Parcerias y enlaces — **corrige el documento 09**

| Origen | Destino segun 09 | Destino real |
|---|---|---|
| `/parcerias` | `/dojo/#parcerias` | **`/#parcerias`** |
| `/enlaces-es` | `/es/dojo/#colaboraciones` | **`/es/#parcerias`** |
| `/links-fr` | `/fr/dojo/#partenaires` | **`/fr/#parcerias`** |

La rejilla de parceiros vive en la **Home** desde el ADR-0024, no en `/dojo`. Los anchors
`#colaboraciones` y `#partenaires` **no existen en ninguna pagina del sitio**; `#parcerias`
existe en las cuatro homes (verificado en el HTML construido). Redirigir a lo que decia 09
seria mandar tres URLs con backlinks a un anchor inexistente, que es justo lo que las
reglas tecnicas de ese mismo documento prohiben.

## Anchors verificados

| Anchor | Existe en |
|---|---|
| `#parcerias`, `#aulas`, `#dojo`, `#umbral` | las 4 homes |
| `#aula-experimental` | `/aulas/` y `/aulas/adultos/` (4 idiomas) |
| `#horarios`, `#quotas`, `#criancas`, `#faq` | `/aulas/` |
| `#pablo-duran` | `/dojo/` |

## Lo que falta antes de lanzar

1. **Export de Search Console** del cliente: es la unica fuente que puede cerrar el
   inventario, porque el sitemap ya demostro estar incompleto.
2. Decidir si `/outras-artes` del Wix y la del sitio nuevo cuentan el mismo contenido — la
   ruta coincide, asi que no hay redirect, pero el contenido si cambia.
