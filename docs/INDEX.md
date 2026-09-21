# INDEX

Mapa de ADRs y specs. **Empeza aca.** Cada fila tiene lo suficiente para decidir si
abrir el archivo o no — no leas todo: lee la fila y abri lo que corresponda.

**Al crear un ADR o una spec, agregar la fila aca en el mismo commit.** Un indice
desactualizado es peor que no tenerlo.

## ADR — decisiones

| # | Fecha | Decision | Estado | Archivos |
|---|---|---|---|---|
| [0001](adr/0001-stack.md) | 2026-09-17 | Astro estatico + Vercel + Neon + R2; sitio publico sin dependencia de runtime | aceptada | `docs/adr/0001-stack.md` |
| [0002](adr/0002-contenido.md) | 2026-09-17 | Contenido = JSON en el repo, commiteado por el backoffice; git es el versionado | aceptada | `docs/adr/0002-contenido.md` |
| [0003](adr/0003-facturacion.md) | 2026-09-17 | Emision propia de facturas; PDF a R2 y envio por Resend, sin proveedor certificado | aceptada | `docs/adr/0003-facturacion.md` |
| [0004](adr/0004-direccion-visual.md) | 2026-09-17 | Cinco pantallas, estructura multilingue simetrica y estetica editorial japonesa con indigo | aceptada para prototipo | `docs/adr/0004-direccion-visual.md` |
| [0005](adr/0005-direccion-visual-dojo.md) | 2026-09-17 | Segunda dirección: silencio, proporción de dojo, sumi/washi y bermellón; supersede la expresión visual de 0004 | aceptada para prototipo | `docs/adr/0005-direccion-visual-dojo.md` |
| [0006](adr/0006-home-zen-modular.md) | 2026-09-17 | Home continua y modular: ma, proporciones contenidas, rojo óxido y ninguna imagen dominante | aceptada para prototipo | `docs/adr/0006-home-zen-modular.md` |
| [0007](adr/0007-home-alternativa-b.md) | 2026-09-17 | Alternativa B con acento rojo concentrado y comparación estática A/B | propuesta comparativa | `docs/adr/0007-home-alternativa-b.md` |
| [0008](adr/0008-home-paisaje.md) | 2026-09-17 | Alternativa C como paisaje continuo: sol, montaña, tierra, dojo y umbral | propuesta comparativa | `docs/adr/0008-home-paisaje.md` |
| [0009](adr/0009-direccion-paisaje.md) | 2026-09-17 | Diseño C elegido; paisaje extendido como gramática oficial de las cinco pantallas | aceptada | `docs/adr/0009-direccion-paisaje.md` |
| [0010](adr/0010-direccion-tradicional.md) | 2026-09-18 | Dirección tradicional, fotográfica e informativa; datos prácticos en HTML | aceptada | `docs/adr/0010-direccion-tradicional.md` |
| [0011](adr/0011-audiencias-y-formularios.md) | 2026-09-18 | Aulas separa Adultos/Niños y cada audiencia o disciplina conserva contenido, medios y formulario propios | aceptada | `docs/adr/0011-audiencias-y-formularios.md` |
| [0012](adr/0012-retirar-agenda.md) | 2026-09-18 | Agenda desaparece; sus URLs se mapean individualmente a destinos semánticos vivos | aceptada | `docs/adr/0012-retirar-agenda.md` |
| [0013](adr/0013-pagina-profesor.md) | 2026-09-18 | Pablo Durán tiene página canónica propia, enlazada desde Dojo, para conservar historia e intención de búsqueda | aceptada | `docs/adr/0013-pagina-profesor.md` |
| [0014](adr/0014-iconos-idioma-redes.md) | 2026-09-18 | Selector con banderas accesibles y redes sociales sólo con URL oficial verificada | aceptada | `docs/adr/0014-iconos-idioma-redes.md` |
| [0015](adr/0015-auth-backoffice.md) | 2026-09-18 | Un unico admin con email y contraseña, sesion opaca en Neon y reset por Resend; supersede la fila Auth del 0001 | aceptada | `docs/adr/0015-auth-backoffice.md` |
| [0016](adr/0016-ubicacion-backoffice.md) | 2026-09-18 | El BO vive en `/admin` con noindex y guard por Host; el subdominio `bo.` se activa por variable de entorno | aceptada | `docs/adr/0016-ubicacion-backoffice.md` |
| [0017](adr/0017-dojos-entidad.md) | 2026-09-18 | Los dojos son una entidad en `content/dojos.json` con NAP, coordenadas y horarios estructurados; no van a la DB | aceptada | `docs/adr/0017-dojos-entidad.md` |
| [0018](adr/0018-geo-motores-generativos.md) | 2026-09-18 | GEO = generative engine optimization: datos estructurados, capa factual citable y crawlers de IA permitidos; nada sin evidencia | aceptada | `docs/adr/0018-geo-motores-generativos.md` |
| [0019](adr/0019-galerias-audiencias.md) | 2026-09-19 | Galerías de audiencias como contenido estructurado, responsive y sin JavaScript | aceptada | `docs/adr/0019-galerias-audiencias.md` |
| [0020](adr/0020-accesos-audiencias-home.md) | 2026-09-19 | La Home expone Adultos y Crianças como accesos principales directos, sin obligar a pasar por Aulas | aceptada | `docs/adr/0020-accesos-audiencias-home.md` |
| [0021](adr/0021-identidad-azul.md) | 2026-09-20 | El acento de marca pasa del rojo óxido al azul `#0099ff`; supersede la paleta de acento de 0006 y 0010 | aceptada | `docs/adr/0021-identidad-azul.md` |
| [0022](adr/0022-eventos-y-escolas.md) | 2026-09-20 | Eventos y Escolas vuelven como páginas propias en los 4 idiomas; supersede la parte de 0012 que dejaba los eventos sin destino | aceptada | `docs/adr/0022-eventos-y-escolas.md` |
| [0023](adr/0023-jerarquia-equipo-docente.md) | 2026-09-21 | En `/dojo` el equipo docente deja de ser cuatro secciones iguales: Pablo Durán protagonista y los otros tres en fichas compactas | aceptada | `docs/adr/0023-jerarquia-equipo-docente.md` |
| [0024](adr/0024-parcerias-en-rejilla.md) | 2026-09-21 | Parcerias como rejilla estática de 5 logos por fila, sin recuadro; supersede el carrusel CSS de la spec 0026 | aceptada | `docs/adr/0024-parcerias-en-rejilla.md` |
| [0025](adr/0025-publicacion-backoffice.md) | 2026-09-21 | El BO publica commiteando a `main`: backend por modo de ejecución, orden canónico del schema y concurrencia por blob sha | aceptada | `docs/adr/0025-publicacion-backoffice.md` |
| [0026](adr/0026-frontera-editor-home.md) | 2026-09-21 | El BO edita contenido y no estructura: el menú sale del editor; las tarjetas de audiencia y los medios de la Home entran | aceptada | `docs/adr/0026-frontera-editor-home.md` |

## Specs — que se construye

| # | Fecha | Spec | Estado | Disjunta? | Archivos |
|---|---|---|---|---|---|
| [0001](specs/0001-scaffold.md) | 2026-09-17 | Scaffold Astro: i18n 4 idiomas, contenido JSON validado, head de SEO completo | implementada | si | `package.json`, `src/**`, `content/**` |
| [0002](specs/0002-infra.md) | 2026-09-17 | Infra de deploy: adapter Vercel, Neon en Frankfurt, migracion inicial y /api/health | implementada | si | `astro.config.mjs`, `db/**`, `src/lib/db.ts`, `src/pages/api/**` |
| [0003](specs/0003-home-mockup.md) | 2026-09-17 | Mockup movil estatico de la home con Tailwind y cero JavaScript | implementada | si | `src/pages/mockup.astro` |
| [0004](specs/0004-home-alternative.md) | 2026-09-17 | Alternativa creativa de home y selector HTML entre propuestas A/B | implementada | si | `src/components/DesignSwitcher.astro`, `src/pages/mockup*.astro` |
| [0005](specs/0005-home-landscape.md) | 2026-09-17 | Home como paisaje narrativo SVG y selector A/B/C | implementada | si | `src/components/DesignSwitcher.astro`, `src/pages/mockup-c.astro` |
| [0006](specs/0006-consolidar-diseno-c.md) | 2026-09-17 | Consolidar C, retirar A/B y alinear la documentación del sistema | implementada | no | `src/pages/mockup*.astro`, `docs/design/**` |
| [0007](specs/0007-home-productiva.md) | 2026-09-17 | Migrar el Diseño C de /mockup/ a la home productiva con JSON validado; retirar /mockup/ | implementada | no | `src/components/HomeView.astro`, `src/layouts/Base.astro`, `src/lib/content.ts`, `content/*/home.json` |
| [0008](specs/0008-home-tradicional.md) | 2026-09-18 | Home tradicional de dojo con aulas y horarios como HTML semántico | implementada | no | `src/components/HomeView.astro`, `src/layouts/Base.astro`, `src/styles/global.css` |
| [0009](specs/0009-hero-video.md) | 2026-09-18 | Video de Aikido en el hero y contenido centrado | implementada | no | `src/components/HomeView.astro` |
| [0010](specs/0010-aulas-productivas.md) | 2026-09-18 | Aulas en cuatro idiomas con horarios, cuotas, niños y primera clase en HTML | implementada | no | `src/lib/i18n.ts`, `src/lib/content.ts`, `src/components/ClassesView.astro`, `src/pages/**`, `content/*/classes.json` |
| [0011](specs/0011-traducciones-home.md) | 2026-09-18 | Traducciones completas de la Home en español, francés e inglés | implementada | si | `content/{es,fr,en}/home.json` |
| [0012](specs/0012-aulas-audiencias.md) | 2026-09-18 | Landing pages Adultos/Niños y formularios contextuales en cuatro idiomas | implementada | no | `src/**`, `content/*/{adults,children}.json` |
| [0013](specs/0013-aikido-productivo.md) | 2026-09-18 | Aikido en cuatro idiomas con historia, principios, O-Sensei y acceso por audiencia | implementada | no | `src/**`, `content/*/aikido.json` |
| [0014](specs/0014-dojo-contacto.md) | 2026-09-18 | Dojo y Contacto en cuatro idiomas con profesor, linaje, sedes, transporte y formulario | implementada | no | `src/**`, `content/*/{dojo,contact}.json` |
| [0015](specs/0015-outras-artes.md) | 2026-09-18 | Otras Artes en cuatro idiomas con Shiatsu, Iaido, Tai Chi y formularios específicos | implementada | no | `src/**`, `content/*/other-arts.json` |
| [0016](specs/0016-cta-hero-audiencias.md) | 2026-09-18 | CTA de clase experimental en los heroes de Adultos y Niños, reutilizando su modal contextual | implementada | no | `src/components/AudienceView.astro` |
| [0017](specs/0017-profesor-pablo-duran.md) | 2026-09-18 | Página localizada de Pablo Durán, enlace desde Dojo y destinos 301 actualizados | implementada | no | `src/**`, `content/*/{dojo,teacher}.json`, `docs/design/09-arquitectura-urls-y-redirects.md` |
| [0018](specs/0018-iconos-idioma-redes-handoff.md) | 2026-09-18 | Iconos accesibles de idioma, redes verificadas y handoff para Claude Code | implementada | no | `src/layouts/Base.astro`, `src/components/SocialLinks.astro`, `docs/HANDOFF-CLAUDE-CODE.md` |
| [0019](specs/0019-backoffice-auth.md) | 2026-09-18 | Backoffice en `/admin`: login de un solo admin, sesion en Neon, rate limit y noindex | cerrada | si | `db/migrations/0002_admin.sql`, `src/lib/{auth,admin}.ts`, `src/middleware.ts`, `src/pages/admin/**` |
| [0020](specs/0020-dojos-entidad.md) | 2026-09-18 | Dojos en `content/dojos.json` con horarios estructurados; la home los renderiza y emite JSON-LD por sede | implementada | si | `content/dojos.json`, `src/lib/{dojos,content,i18n,site}.ts`, `src/components/HomeView.astro`, `content/*/home.json` |
| [0021](specs/0021-editor-home-dojos.md) | 2026-09-18 | El BO edita la Home en 4 idiomas y hace CRUD de dojos; publica commiteando a `main` via API de GitHub | implementada | no | `src/lib/{publish,forms,dojos-edicion}.ts`, `src/pages/admin/**`, `src/components/admin/**`, `content/**` |
| [0022](specs/0022-reset-password.md) | 2026-09-18 | Recuperacion de contraseña por email con Resend, token de un solo uso y expulsion de sesiones | borrador | no | `db/migrations/0003_admin_reset.sql`, `src/lib/email.ts`, `src/pages/admin/{recuperar,restablecer}.astro` |
| [0023](specs/0023-capa-geo.md) | 2026-09-19 | Capa GEO: resumen citable en Home, Q&A con `FAQPage` en Aulas/Adultos/Niños, robots con crawlers de IA y `/llms.txt` | implementada | no | `src/lib/{content,site}.ts`, `src/components/{HomeView,ClassesView,AudienceView}.astro`, `src/pages/llms.txt.ts`, `public/robots.txt`, `content/**` |
| [0024](specs/0024-galerias-audiencias.md) | 2026-09-19 | Adultos y Crianças incorporan una galería responsive de seis medios editable desde el contenido | implementada | no | `src/lib/content.ts`, `src/components/AudienceView.astro`, `content/*/{adults,children}.json`, `docs/**` |
| [0025](specs/0025-accesos-audiencias-home.md) | 2026-09-19 | Accesos directos y destacados a Adultos y Crianças desde la Home | implementada | no | `src/components/HomeView.astro`, `src/lib/content.ts`, `content/*/home.json`, `docs/**` |
| [0026](specs/0026-eventos-escolas-identidad.md) | 2026-09-20 | Eventos y Escolas en 4 idiomas, parceiros en la Home, Instagram verificado e identidad azul | implementada | no | `src/lib/{i18n,content}.ts`, `src/components/**`, `src/pages/{eventos,escolas}/**`, `content/*/{home,events,schools}.json` |
| [0027](specs/0027-jerarquia-equipo-docente.md) | 2026-09-21 | Jerarquía del equipo docente en `/dojo`: Pablo Durán protagonista y tres fichas compactas en una sola sección | implementada | si | `src/components/DojoView.astro`, `docs/**` |
| [0028](specs/0028-parcerias-en-rejilla.md) | 2026-09-21 | Parcerias deja el carrusel y pasa a rejilla estática de cinco por fila, sin recuadro blanco | implementada | si | `src/components/HomeView.astro`, `src/styles/global.css`, `docs/**` |
| [0029](specs/0029-editor-home-medios.md) | 2026-09-21 | El editor de Home deja el menú fijo y gana las tarjetas de audiencia y los tres medios de la portada | implementada | si | `src/lib/{content,forms}.ts`, `src/components/**`, `src/pages/admin/paginas/home.astro`, `content/*/home.json` |
| [0030](specs/0030-medios-r2.md) | 2026-09-21 | Subida de imágenes a R2 desde el BO: WebP de 1600 px, clave por hash del contenido y URL pública en el JSON | implementada, sin verificar contra R2 | si | `src/lib/{r2,medios}.ts`, `src/pages/admin/medios/**`, `package.json` |

**"Disjunta?"** = si el trabajo no comparte archivos con otra spec abierta. Es lo que
habilita paralelizar. Lo decide la spec, no el orquestador en runtime.

## Diseño de producto

| Documento | Contenido |
|---|---|
| [Índice de rediseño](design/README.md) | Principios y mapa de la documentación de diseño |
| [Auditoría y arquitectura](design/01-auditoria-arquitectura.md) | Diagnóstico, cinco pantallas, descartes y SEO visible |
| [Wireframes](design/02-wireframes.md) | Secciones mobile-first y transformación desktop |
| [Sistema de diseño](design/03-sistema-diseno.md) | Paleta, tipografía, grilla, imagen y componentes |
| [Cabecera y navegación](design/04-cabecera-navegacion.md) | Contrato responsive, accesibilidad e i18n |
| [Inventario de contenido](design/05-inventario-contenido.md) | Contrato exhaustivo del backoffice |
| [Datos pendientes](design/06-datos-pendientes.md) | Información a solicitar al cliente |
| [Preview local](design/07-preview-local.md) | Ejecución y verificación del mockup |
| [Investigación de composición](design/08-investigacion-composicion.md) | Ma, proporción áurea, módulo japonés y rojo |
| [Arquitectura de URLs y redirects](design/09-arquitectura-urls-y-redirects.md) | Sitemap objetivo, matriz 301 por idioma, reglas para PDFs/410 y gate de lanzamiento |
| [Handoff para Claude Code](HANDOFF-CLAUDE-CODE.md) | Estado integral del working tree, rutas, formularios, verificaciones, pendientes y checklist de push |

## Convenciones

- **ADR** = una decision y su motivo. Se escribe cuando la decision se toma, no despues.
  Inmutable: si cambia, se escribe uno nuevo que supersede al viejo.
- **Spec** = que se va a construir, cerrada **antes** de tocar codigo. Ver
  `specs/TEMPLATE.md`.
- Numeracion correlativa de 4 digitos. No se reusan numeros.
- Frontmatter obligatorio con `fecha` y `resumen` de una linea: es lo que se lee sin
  abrir el archivo.
