# Arquitectura de URLs y redirecciones 301

Documento operativo para migrar `https://www.aikido-duran.com/` desde Wix a la nueva
web Astro. Define la arquitectura objetivo y el destino conceptual de las URLs antiguas.

> **Superseded en los datos por `10-inventario-wix.md` (2026-09-21).** Ese documento trae el
> crawl real: 34 URLs del sitemap + 3 paginas vivas que el sitemap no lista + el PDF, y
> **corrige tres destinos de este mapa** —`/parcerias`, `/enlaces-es` y `/links-fr`, que
> apuntaban a anchors inexistentes en `/dojo` cuando la rejilla de parceiros vive en la
> Home—. Este documento sigue siendo el diseño y las reglas tecnicas; el 10 es el dato.
>
> > Este mapa no se activa hasta que exista y haya sido verificado el destino. Antes del
> lanzamiento se cruza nuevamente contra el sitemap de Wix, el crawl de 34 URLs y el
> export de Search Console. Las rutas marcadas **por confirmar** no deben convertirse en
> reglas de producción basándose solamente en su nombre probable.

## Decisiones vigentes

- La dirección visual oficial es ADR-0010: web tradicional de dojo, hero audiovisual,
  cabecera institucional y contenido práctico en HTML.
- La Home resume las áreas del sitio; no sustituye las landing pages con intención de
  búsqueda propia.
- No redirigir indiscriminadamente a `/`. Horarios, Aikido, profesor y contacto deben
  aterrizar en contenido equivalente.
- Portugués es el idioma canónico sin prefijo. Español, francés e inglés usan `/es/`,
  `/fr/` y `/en/`.
- La versión inglesa no existe en el Wix: será contenido nuevo y no recibe redirects
  desde URLs antiguas.

## Sitemap objetivo

```text
/
├── /aulas/          horarios, cuotas, sedes, niños y aula experimental
│   ├── /aulas/adultos/    contenido, medios y formulario para adultos
│   └── /aulas/criancas/  contenido, medios y formulario para familias
├── /aikido/         disciplina, principios, historia y Morihei Ueshiba
├── /dojo/           espacio, comunidad y resumen del profesor
│   └── /professor-pablo-duran/  trayectoria, formación, docencia y linaje
├── /contactos/      direcciones, transporte y formulario
└── /outras-artes/   Iaido, Shiatsu y Tai Chi
```

Equivalentes por idioma:

| Concepto | Portugués | Español | Francés | Inglés |
|---|---|---|---|---|
| Home | `/` | `/es/` | `/fr/` | `/en/` |
| Aulas | `/aulas/` | `/es/clases/` | `/fr/cours/` | `/en/classes/` |
| Adultos | `/aulas/adultos/` | `/es/clases/adultos/` | `/fr/cours/adultes/` | `/en/classes/adults/` |
| Niños | `/aulas/criancas/` | `/es/clases/ninos/` | `/fr/cours/enfants/` | `/en/classes/children/` |
| Aikido | `/aikido/` | `/es/aikido/` | `/fr/aikido/` | `/en/aikido/` |
| Dojo | `/dojo/` | `/es/dojo/` | `/fr/dojo/` | `/en/dojo/` |
| Pablo Durán | `/professor-pablo-duran/` | `/es/profesor-pablo-duran/` | `/fr/professeur-pablo-duran/` | `/en/teacher-pablo-duran/` |
| Contacto | `/contactos/` | `/es/contacto/` | `/fr/contact/` | `/en/contact/` |
| Otras artes | `/outras-artes/` | no publicada hoy | no publicada hoy | no publicada hoy |

Las cuatro secciones centrales de la Home enlazan a Aikido, Aulas, Dojo y Contacto.
Otras Artes queda fuera de ese relato principal, pero conserva URL por su intención
distinta. Agenda fue retirada por ADR-0012.

## Matriz de redirects

### Inicio

| Origen Wix | Destino | Estado del origen |
|---|---|---|
| `/` | `/` | confirmado |
| `/iniciopt` | `/` | confirmado |
| `/inicioes` | `/es/` | confirmado |
| `/accueil-fr` | `/fr/` | confirmado |

### Aulas, horarios, niños y conversión

| Origen Wix | Destino | Estado del origen |
|---|---|---|
| `/horarios-e-preospt` | `/aulas/` | confirmado; typo histórico que debe preservarse |
| `/aula-experimental` | `/aulas/adultos/#aula-experimental` | confirmado; validar formulario de adultos |
| `/criancas` | `/aulas/criancas/` | confirmado; conservar contenido, fotos y conversión infantil |
| `/horarios-tarifases` | `/es/clases/` | confirmado |
| `/horaires-et-tarifs-fr` | `/fr/cours/` | confirmado |

`/aulas/` debe contener en HTML el resumen de adultos, niños, horarios, cuotas,
descuentos y sedes activas. No reemplaza las landing pages de audiencia: Adultos y
Niños conservan propuesta, medios, preguntas frecuentes y conversión propias.

### Formularios por contexto

- Los CTA no comparten un destino genérico. Adultos, niños, Iaido y Tai Chi abren su
  formulario específico.
- Se permite un modal reutilizable con formulario externo cargado al abrir. Debe incluir
  foco gestionado, cierre por teclado, título accesible y enlace directo de fallback.
- Aikido infantil confirmado:
  `https://docs.google.com/forms/d/e/1FAIpQLSfN-rw5gQ82gukAPdRKHsFkXvcjtogv7gWqgELtnek_6i2Biw/viewform`.
- Tai Chi confirmado:
  `https://docs.google.com/forms/d/e/1FAIpQLSclYRerVbnP0yIJ70o7NUgfporjBYQLuuxb2zhBhGb-BwDTbg/viewform`.
- Iaido confirmado mediante el shortlink vigente:
  `https://forms.gle/jbVZnR31896h7p826`.
- Adultos usa el formulario integrado en `/aula-experimental`. Sus campos no aparecen en
  el HTML rastreable: deben inventariarse visualmente o desde Wix y hay que confirmar el
  canal de recepción antes de reemplazarlo por un formulario propio.

### Aikido

| Origen Wix | Destino | Estado del origen |
|---|---|---|
| `/aikidopt` | `/aikido/` | confirmado |
| `/aikidoes` | `/es/aikido/` | confirmado |
| `/akido-fr` | `/fr/aikido/` | confirmado; typo histórico que debe preservarse |
| `/_files/ugd/ae7240_bf5b66ead42f42c189d64ba5bbbb3f47.pdf` | `/fr/aikido/` | PDF indexado confirmado |

La página reúne introducción, principios, origen, Morihei Ueshiba, el significado del
dojo, quién puede practicar y beneficios. La explicación de Aikido infantil vive aquí;
los horarios infantiles viven en Aulas.

### Dojo y profesor

| Origen Wix | Destino | Estado del origen |
|---|---|---|
| `/dojo-da-luz-pt` | `/dojo/` | confirmado |
| `/prefessorpt` | `/professor-pablo-duran/` | confirmado; typo histórico que debe preservarse |
| `/dojo-da-luz-es` | `/es/dojo/` | confirmado |
| `/profesores` | `/es/profesor-pablo-duran/` | confirmado |
| `/dojo-da-luz-fr` | `/fr/dojo/` | confirmado |
| ruta francesa de Enseignant | `/fr/professeur-pablo-duran/` | **origen por confirmar en crawl** |

Dojo presenta el espacio y un resumen del profesor. La página canónica de Pablo Durán
conserva su trayectoria, formación en el Dojo de la Roseraie, experiencia docente y
linaje pedagógico. Los enlaces internos apuntan directamente a la nueva URL.

### Contacto y SEO local

| Origen Wix | Destino | Estado del origen |
|---|---|---|
| `/contactospt` | `/contactos/` | confirmado |
| `/contacto-es` | `/es/contacto/` | confirmado |
| `/coordonnees-fr` | `/fr/contact/` | confirmado |

Cada sede activa debe tener nombre, dirección postal completa, transporte, mapa,
teléfono/email y vínculo a sus horarios. No inventar NAP. Generar JSON-LD sólo cuando
el cliente confirme los datos.

### Actualidad y videos retirados

| Origen Wix | Destino | Estado del origen |
|---|---|---|
| `/atualidadept` | Home, Aulas o Dojo según el contenido | confirmar en crawl final |
| `/eventos-e-destaquespt` | `/eventos/` | confirmado; la página existe desde ADR-0022 |
| `/videospt` | `/aikido/` | confirmado; videos históricos de Aikido |
| ruta española de Actualidad | destino localizado por tema | **por confirmar en crawl** |
| `/actualit-fr` | destino localizado por tema | confirmado; clasificar contenidos |

No se crea Agenda ni se replica su contenido. Cada URL se redirige una sola vez hacia el
destino vivo más relacionado; no se envían todas automáticamente a la Home.

### Otras artes

| Origen Wix | Destino | Estado del origen |
|---|---|---|
| `/outras-artes` | `/outras-artes/` | confirmado |

No redirigir a Aikido: Iaido, Shiatsu y Tai Chi tienen intención, horarios y profesores
distintos. Si el cliente confirma que ya no se ofrecen, retirar enlaces y responder `410`
en vez de crear una equivalencia falsa.

### Parcerias, enlaces y galerías

| Origen Wix | Destino | Estado del origen |
|---|---|---|
| `/parcerias` | `/dojo/#parcerias` | confirmado |
| `/enlaces-es` | `/es/dojo/#colaboraciones` | confirmado |
| ruta francesa de Liens | `/fr/dojo/#partenaires` | **por confirmar en crawl** |
| galerías/fotos dependientes del dojo | página Dojo del mismo idioma | **inventariar antes de lanzar** |

## PDFs, archivos y URLs no equivalentes

1. Si el PDF contiene información que pasa a HTML, `301` a esa página HTML.
2. Si es un formulario sustituido por el flujo de primera clase, `301` a
   `/aulas/#aula-experimental` del idioma correcto.
3. Si es un documento histórico con backlinks y sigue siendo útil, conservarlo o crear
   una página HTML equivalente antes de redirigir.
4. Si no tiene reemplazo, valor ni backlinks, responder `410 Gone`.
5. Nunca enviar PDFs o URLs sin relación semántica a la Home.

## Reglas técnicas para Claude Code

- No implementar la matriz hasta completar el inventario exacto de 34 URLs.
- Usar redirects explícitos uno a uno; evitar comodines que puedan capturar rutas nuevas.
- Un solo salto: origen histórico → canonical final.
- `301` permanente, conservando query string cuando corresponda.
- Normalizar HTTPS, host canónico y slash final sin crear cadenas.
- No crear redirect hacia una ruta que todavía devuelve 404.
- No usar `200` con contenido duplicado ni soft-404.
- Todas las páginas finales llevan canonical autorreferente y `hreflang` recíproco.
- El sitemap XML sólo incluye URLs finales con `200`, nunca orígenes redirigidos.
- Cambiar enlaces internos para apuntar directamente al destino, no pasar por un 301.
- Probar cada regla con una tabla automatizada de `origen`, `status`, `location`.
- Mantener redirects durante varios años; preferiblemente de forma indefinida.

## Secuencia de construcción

Cada página requiere su propia spec cerrada antes de tocar código. Se construyen en serie
porque compartirán i18n, layout, navegación y schema de contenido.

1. Completar Aulas con Adultos, Niños y modal de formularios específicos
2. Aikido
3. Dojo
4. Contacto
5. Otras artes y sus formularios específicos
7. Completar traducciones y paridad razonada
8. Crawl final de Wix + Search Console
9. Implementar y probar los redirects
10. Sitemap XML, robots.txt, canonicals y auditoría `hreflang`

## Gate previo al lanzamiento

- [ ] Inventario de las 34 URLs antiguas, incluidos PDFs y variantes no enlazadas.
- [ ] Cada origen clasificado como `301`, conservar o `410`.
- [ ] Todos los destinos responden `200` y contienen información equivalente.
- [ ] Sin cadenas, loops ni redirects a anchors inexistentes.
- [ ] Enlaces internos, sitemap y canonicals usan URLs finales.
- [ ] `hreflang` recíproco validado en pt/es/fr/en y `x-default`.
- [ ] Export de Search Console revisado para no perder una URL con tráfico o backlinks.
- [ ] Prueba automatizada de status y `Location` completa.
