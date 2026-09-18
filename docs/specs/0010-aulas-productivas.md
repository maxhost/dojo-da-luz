---
spec: 0010
fecha: 2026-09-18
estado: implementada
resumen: Crear la página Aulas en cuatro idiomas con horarios, cuotas, niños y primera clase como HTML semántico.
disjunta: no
archivos: src/lib/i18n.ts, src/lib/content.ts, src/components/ClassesView.astro, src/components/HomeView.astro, src/pages/aulas/index.astro, src/pages/[lang]/[page].astro, content/*/classes.json, docs/INDEX.md, docs/TASKS.md
---

# 0010 — Aulas productivas

## Problema

Horarios, cuotas, clases infantiles y aula experimental están dispersos entre varias
URLs del Wix. La información principal de adultos está encerrada en un PDF/póster. La
nueva arquitectura necesita un destino real antes de poder redirigir esas URLs.

## Alcance

**Entra:**

- Crear `classes` como segundo `PageKey`, con slugs localizados: `/aulas`,
  `/es/clases`, `/fr/cours`, `/en/classes`.
- Crear un schema Zod y cuatro JSON de contenido.
- Transcribir como HTML los datos operativos verificados en el Wix/PDF vigente:
  - temporada septiembre 2026–junio 2027;
  - Benfica: adultos al mediodía y tarde, niños de lunes a viernes;
  - Encarnação: adultos y niños martes/jueves;
  - Pista Municipal Prof. Moniz Pereira: adultos y Buki Waza;
  - cuotas normal, infantil, reducida, anual, semestral, clase suelta y libre tránsito;
  - condiciones de verano, inscripción, armas y primera clase.
- Traducir esos mismos datos a es/fr/en sin alterar horarios ni importes.
- Mantener direcciones postales fuera: no están confirmadas.
- Seguir ADR-0010: hero fotográfico, jerarquía tradicional, paleta papel/tinta/rojo,
  bloques directos y cero JavaScript cliente.
- Incluir los anchors `#criancas` y `#aula-experimental` previstos por la matriz 301.
- Extender canonical/hreflang mediante la fuente única `ROUTES`.
- Enlazar el CTA de horarios de la Home al destino localizado de Aulas.
- Usar un único menú global localizado en Home y Aulas. Las páginas todavía no
  construidas apuntan temporalmente a su sección equivalente de la Home.

**No entra:**

- Activar redirects 301.
- Inventar direcciones, teléfono, email, aforo o requisitos no publicados.
- Implementar formularios o reservas; el CTA mantiene un destino pendiente explícito.
- Construir Aikido, Dojo, Contacto, Agenda u Otras artes.

## Diseño

La página se compone de:

1. Hero corto con título, temporada y acceso directo a horarios.
2. Horarios por sede en tarjetas semánticas; cada clase es texto, no tabla-imagen.
3. Cuotas en una grilla legible con notas de elegibilidad.
4. Bloque infantil con edades, pedagogía y horarios.
5. Bloque de primera clase con precio verificado y CTA.

`classesSchema` conserva cada línea operativa en campos estructurados. Los cuatro JSON
deben tener paridad de estructura y hechos.

## Archivos

| Archivo | Acción |
|---|---|
| `src/lib/i18n.ts` | editar: `PageKey` y slugs de classes |
| `src/lib/content.ts` | editar: schema y registro de classes |
| `content/{pt,es,fr,en}/classes.json` | crear |
| `src/components/ClassesView.astro` | crear |
| `src/components/HomeView.astro` | editar: CTA de horarios hacia Aulas localizada |
| `src/pages/aulas/index.astro` | crear |
| `src/pages/[lang]/[page].astro` | crear rutas localizadas de classes |
| `docs/INDEX.md` | registrar spec |
| `docs/TASKS.md` | actualizar estado tras verificación |

### Disjunta?

No. Comparte i18n, contenido y layout conceptual con las siguientes páginas. Se ejecuta
en serie y deja el patrón reutilizable para Aikido.

## Verificación

- [x] `npm run typecheck`: 0 errores, warnings o hints.
- [x] `npm run build` genera `/aulas`, `/es/clases`, `/fr/cours` y `/en/classes`.
- [x] Canonical y `hreflang` recíprocos verificados en las cuatro salidas HTML.
- [x] Horarios, importes y anchors presentes como texto en el HTML portugués.
- [x] Cero PDFs/pósters de horarios y cero JavaScript ejecutable nuevo.
- [x] CTA y navegación de Aulas en la Home apuntan al destino localizado.
- [x] Menú global idéntico en estructura para pt/es/fr/en; ninguna ruta de idioma se
  escribe a mano en los JSON.
- [x] `git diff --check` limpio.

## Fuentes verificadas

- Wix `/horarios-e-preospt` y su PDF
  `ae7240_2d3c2c3fa60b4246a0970ad7354cce23.pdf`.
- Wix `/criancas`.
- Wix `/aula-experimental`.

## Abierto no bloqueante

- CTA definitivo de inscripción/contacto: queda pendiente hasta tener email o formulario.
- Direcciones completas de las tres sedes: se incorporarán en Contacto al recibir NAP.
