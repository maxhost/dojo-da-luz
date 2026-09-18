# Handoff para Claude Code — rediseño público

Fecha de corte: 2026-09-18.

Este archivo resume el lote completo que está en el working tree y todavía no fue
commiteado ni enviado. Antes de tocar código, leer `docs/TASKS.md`, `docs/INDEX.md`, las
ADR 0010–0014 y las specs 0008–0018. No reconstruir decisiones a partir del chat.

## Resultado actual

- Sitio Astro con dirección tradicional, fotográfica e informativa inspirada en un dojo.
- Home con hero de vídeo, texto centrado y contenido práctico rastreable.
- Cuatro idiomas simétricos: portugués, español, francés e inglés.
- 36 rutas prerenderizadas.
- Contenido editorial y horarios en JSON validado por Zod y renderizado como HTML.
- Canonical y `hreflang` recíprocos generados desde `src/lib/i18n.ts`.
- Menú global localizado mediante `siteNav()`.
- Selector de idioma por banderas; conserva nombre accesible, `hreflang`, `lang` y
  `aria-current`.
- Facebook oficial en cabecera desktop, menú móvil y pie mediante
  `src/components/SocialLinks.astro`.

## Sitemap productivo

| Concepto | PT | ES | FR | EN |
|---|---|---|---|---|
| Home | `/` | `/es/` | `/fr/` | `/en/` |
| Aulas | `/aulas/` | `/es/clases/` | `/fr/cours/` | `/en/classes/` |
| Adultos | `/aulas/adultos/` | `/es/clases/adultos/` | `/fr/cours/adultes/` | `/en/classes/adults/` |
| Niños | `/aulas/criancas/` | `/es/clases/ninos/` | `/fr/cours/enfants/` | `/en/classes/children/` |
| Aikido | `/aikido/` | `/es/aikido/` | `/fr/aikido/` | `/en/aikido/` |
| Dojo | `/dojo/` | `/es/dojo/` | `/fr/dojo/` | `/en/dojo/` |
| Pablo Durán | `/professor-pablo-duran/` | `/es/profesor-pablo-duran/` | `/fr/professeur-pablo-duran/` | `/en/teacher-pablo-duran/` |
| Contacto | `/contactos/` | `/es/contacto/` | `/fr/contact/` | `/en/contact/` |
| Otras artes | `/outras-artes/` | `/es/otras-artes/` | `/fr/autres-arts/` | `/en/other-arts/` |

Agenda fue retirada deliberadamente por ADR-0012 y no debe reconstruirse.

## Páginas y comportamiento

- `HomeView.astro`: home tradicional con vídeo de Pexels en el hero.
- `ClassesView.astro`: resumen de horarios, cuotas y accesos a Adultos/Niños.
- `AudienceView.astro`: landings de Adultos y Niños. Cada una tiene CTA en hero y al
  final; ambos abren un solo modal contextual.
- `AikidoView.astro`: historia, principios, fundador y accesos por audiencia.
- `DojoView.astro`: espacio, resumen de Pablo Durán y linaje. Enlaza directamente a la
  biografía localizada.
- `TeacherView.astro`: biografía, cronología, formación, docencia, linaje y JSON-LD
  `Person` de Pablo Durán.
- `ContactView.astro`: sedes y transporte; formulario visible todavía sin endpoint.
- `OtherArtsView.astro`: Shiatsu, Iaido y Tai Chi con información y formularios propios.
- `FormModal.astro`: carga el iframe externo sólo al abrir el diálogo.

## Formularios

- Niños: Google Form confirmado en `content/*/children.json`.
- Iaido: `https://forms.gle/jbVZnR31896h7p826`.
- Tai Chi: Google Form confirmado en `content/*/other-arts.json`.
- Adultos: todavía apunta temporalmente a la página Wix `/aula-experimental`; debe
  reemplazarse antes de activar su redirect.
- Contacto: visible pero sin envío hasta confirmar email y endpoint.

## Redes sociales

- Facebook oficial verificado:
  `https://www.facebook.com/aikidopabloduran/`.
- Instagram y YouTube no tienen URL oficial verificada en las fuentes revisadas. No
  añadir iconos vacíos ni adivinar handles; incorporarlos a `SocialLinks.astro` cuando el
  cliente entregue las URLs.

## Redirects

La matriz completa y las reglas están en
`docs/design/09-arquitectura-urls-y-redirects.md`. No materializar redirects todavía:
primero falta completar el crawl final de las 34 URLs y revisar Search Console.

Cambio importante del último lote:

- `/prefessorpt` → `/professor-pablo-duran/`
- `/profesores` → `/es/profesor-pablo-duran/`
- la URL francesa de Enseignant, aún por identificar →
  `/fr/professeur-pablo-duran/`

Agenda se resuelve URL por URL hacia destinos semánticos o `410`; nunca mediante un
redirect masivo a Home.

## Verificación ya ejecutada

```sh
npm run typecheck
npm run build
git diff --check
```

Resultado del corte:

- Astro check: 0 errores, 0 warnings, 0 hints.
- Build: 36 rutas prerenderizadas.
- Las 36 páginas contienen cuatro idiomas en desktop y móvil.
- Las 36 páginas contienen Facebook en cabecera desktop, menú móvil y pie.
- Canonical/hreflang de las páginas nuevas verificados en el HTML generado.
- JSON-LD `Person` de las cuatro páginas de Pablo Durán parseado correctamente.

## Estado y pendientes reales

Revisar `docs/TASKS.md`; no asumir que “sitio público completo” equivale a “listo para
lanzar”. Siguen pendientes:

1. Crawl final de Wix y export de Search Console.
2. Implementación y prueba automatizada de redirects 301/410.
3. `sitemap.xml` y `robots.txt` finales.
4. Endpoint del formulario de Contacto y sustitución del formulario Wix de Adultos.
5. Moradas, teléfono y redes restantes confirmadas por el cliente para SEO local.
6. Deploy, variables de entorno y prueba de `/api/health` en producción.

## Checklist de revisión y push

Claude Code debe revisar el working tree completo, incluidos los archivos sin seguimiento;
no usar comandos destructivos ni descartar cambios. Secuencia sugerida:

```sh
git status --short
npm ci
npm run typecheck
npm run build
git diff --check
git diff --stat
git add content docs src package.json package-lock.json astro.config.mjs db
git status --short
git diff --cached --check
git commit -m "feat: rediseña sitio público multilingüe"
git push
```

Antes de `git add`, confirmar con `git status` si existen archivos ajenos a este lote. El
push requiere que el remoto y la rama sean los correctos; no forzar ni reescribir
historial.
