# Inventario de contenido editable

Este documento es el contrato funcional del backoffice. Incluye SEO, labels de interfaz,
texto visible, enlaces, imágenes y estados vacíos. Los campos compuestos se validan con
schemas reutilizables. Un bloque opcional vacío no se renderiza.

Tipos admitidos: texto corto, texto largo, lista, imagen y enlace.

## Global

| Pantalla | Sección | Campo | Tipo | Límite | Obligatorio |
|---|---|---|---|---|:---:|
| Global | SEO | `siteName` | texto corto | 40 caracteres | Sí |
| Global | SEO | `defaultDescription` | texto corto | 160 caracteres | Sí |
| Global | Cabecera | `brandEyebrow` | texto corto | 20 caracteres | Sí |
| Global | Cabecera | `brandName` | texto corto | 40 caracteres | Sí |
| Global | Cabecera | `menuLabel` | texto corto | 16 caracteres | Sí |
| Global | Navegación | `navItems[]` — label + página | lista | 5 ítems; label 24 caracteres | Sí |
| Global | Idiomas | `languageLabel` | texto corto | 20 caracteres | Sí |
| Global | Footer | `legalDescription` | texto corto | 100 caracteres | Sí |
| Global | Footer | `footerLinks[]` — label + enlace | lista | 8 ítems | No |
| Global | Footer | `copyright` | texto corto | 80 caracteres | Sí |
| Global | Accesibilidad | `skipLinkLabel` | texto corto | 40 caracteres | Sí |

## Inicio

| Pantalla | Sección | Campo | Tipo | Límite | Obligatorio |
|---|---|---|---|---|:---:|
| Inicio | SEO | `seoTitle` | texto corto | 60 caracteres | Sí |
| Inicio | SEO | `seoDescription` | texto corto | 155 caracteres | Sí |
| Inicio | Hero | `kicker` | texto corto | 45 caracteres | Sí |
| Inicio | Hero | `title` | texto corto | 55 caracteres | Sí |
| Inicio | Hero | `lead` | texto largo | 180 caracteres | Sí |
| Inicio | Hero | `primaryCtaLabel` | texto corto | 32 caracteres | Sí |
| Inicio | Hero | `primaryCtaUrl` | enlace | 1 URL | Sí |
| Inicio | Sedes | `sectionKicker` | texto corto | 30 caracteres | Sí |
| Inicio | Sedes | `sectionTitle` | texto corto | 60 caracteres | Sí |
| Inicio | Sedes | `locations[]` — nombre, término SEO, espacio, resumen, enlace | lista | exactamente 2; Benfica y Lumiar; resumen 90 caracteres | Sí |
| Inicio | Aikido | `practiceKicker` | texto corto | 30 caracteres | Sí |
| Inicio | Aikido | `practiceTitle` | texto corto | 55 caracteres | Sí |
| Inicio | Aikido | `practiceBody` | texto largo | 420 caracteres | Sí |
| Inicio | Aikido | `practiceLinkLabel` | texto corto | 55 caracteres | Sí |
| Inicio | Aikido | `practiceLinkUrl` | enlace | 1 URL interna | Sí |
| Inicio | Profesor | `teacherImage` | imagen | 1; mínimo 900×1200 | Sí |
| Inicio | Profesor | `teacherImageAlt` | texto corto | 140 caracteres | Sí |
| Inicio | Profesor | `teacherName` | texto corto | 50 caracteres | Sí |
| Inicio | Profesor | `teacherCredential` | texto corto | 90 caracteres | Sí |
| Inicio | Profesor | `teacherSummary` | texto largo | 420 caracteres | Sí |
| Inicio | Profesor | `teacherLinkLabel` | texto corto | 50 caracteres | Sí |
| Inicio | Profesor | `teacherLinkUrl` | enlace | 1 URL interna | Sí |
| Inicio | Dojo | `practiceImage` | imagen | 1; mínimo 1200×800 | Sí |
| Inicio | Dojo | `practiceImageAlt` | texto corto | 140 caracteres | Sí |
| Inicio | Actividad | `featuredEvent` — fecha, título, lugar, extracto, enlace | lista | 0–1; extracto 180 caracteres | No |
| Inicio | CTA final | `trialTitle` | texto corto | 55 caracteres | Sí |
| Inicio | CTA final | `trialBody` | texto largo | 260 caracteres | Sí |
| Inicio | CTA final | `trialCtaLabel` | texto corto | 30 caracteres | Sí |
| Inicio | CTA final | `trialCtaUrl` | enlace | 1 URL interna | Sí |

## Clases

| Pantalla | Sección | Campo | Tipo | Límite | Obligatorio |
|---|---|---|---|---|:---:|
| Clases | SEO | `seoTitle` | texto corto | 60 caracteres | Sí |
| Clases | SEO | `seoDescription` | texto corto | 155 caracteres | Sí |
| Clases | Intro | `title` | texto corto | 65 caracteres | Sí |
| Clases | Intro | `lead` | texto largo | 260 caracteres | Sí |
| Clases | Sedes | `locations[]` — nombre, título SEO, descripción | lista | 3; descripción 260 caracteres | Sí |
| Clases | Sedes | `locations[].address` | texto corto | 160 caracteres | Sí |
| Clases | Sedes | `locations[].transport[]` | lista | 5; 80 caracteres/ítem | No |
| Clases | Sedes | `locations[].mapLabel` | texto corto | 30 caracteres | Sí |
| Clases | Sedes | `locations[].mapUrl` | enlace | 1 por sede | Sí |
| Clases | Horarios | `locations[].schedule[]` — día, hora, público, profesor, disciplina | lista | 20 filas/sede; 50 caracteres/celda | Sí |
| Clases | Precios | `seasonLabel` | texto corto | 60 caracteres | Sí |
| Clases | Precios | `plans[]` — nombre, frecuencia, precio, nota | lista | 10; nota 120 caracteres | Sí |
| Clases | Precios | `discounts[]` | lista | 6; 100 caracteres/ítem | No |
| Clases | Precios | `summerNotice` | texto largo | 220 caracteres | No |
| Clases | Adultos | `adultsTitle` | texto corto | 50 caracteres | Sí |
| Clases | Adultos | `adultsBody` | texto largo | 600 caracteres | Sí |
| Clases | Adultos | `adultsImage` | imagen | 1 | No |
| Clases | Adultos | `adultsImageAlt` | texto corto | 140 caracteres | No |
| Clases | Niños | `childrenTitle` | texto corto | 60 caracteres | Sí |
| Clases | Niños | `childrenBody` | texto largo | 700 caracteres | Sí |
| Clases | Niños | `ageRange` | texto corto | 40 caracteres | Sí |
| Clases | Niños | `childrenGoals[]` | lista | 6; 100 caracteres/ítem | Sí |
| Clases | Niños | `childrenImage` | imagen | 1 | Sí |
| Clases | Niños | `childrenImageAlt` | texto corto | 140 caracteres | Sí |
| Clases | Otras artes | `otherPracticesTitle` | texto corto | 50 caracteres | Sí |
| Clases | Otras artes | `otherPractices[]` — nombre, intro, responsable, horario, precio, CTA | lista | 0–4; intro 500 caracteres | No |
| Clases | Primera clase | `trialConditions[]` | lista | 6; 120 caracteres/ítem | Sí |
| Clases | Primera clase | `trialCtaLabel` | texto corto | 30 caracteres | Sí |
| Clases | Primera clase | `trialCtaUrl` | enlace | 1 URL interna | Sí |

## Aikido

| Pantalla | Sección | Campo | Tipo | Límite | Obligatorio |
|---|---|---|---|---|:---:|
| Aikido | SEO | `seoTitle` | texto corto | 60 caracteres | Sí |
| Aikido | SEO | `seoDescription` | texto corto | 155 caracteres | Sí |
| Aikido | Hero | `title` | texto corto | 70 caracteres | Sí |
| Aikido | Hero | `lead` | texto largo | 220 caracteres | Sí |
| Aikido | Hero | `image` | imagen | 1 | Sí |
| Aikido | Hero | `imageAlt` | texto corto | 140 caracteres | Sí |
| Aikido | Definición | `definitionTitle` | texto corto | 55 caracteres | Sí |
| Aikido | Definición | `definitionBody` | texto largo | 900 caracteres | Sí |
| Aikido | Principios | `principles[]` — título + explicación | lista | 4–6; explicación 180 caracteres | Sí |
| Aikido | Origen | `historyTitle` | texto corto | 50 caracteres | Sí |
| Aikido | Origen | `timeline[]` — fecha, título, texto | lista | 4–7; texto 260 caracteres | Sí |
| Aikido | Linaje | `lineageTitle` | texto corto | 50 caracteres | Sí |
| Aikido | Linaje | `lineage[]` — nombre, grado/rol, biografía | lista | 4–6; biografía 350 caracteres | Sí |
| Aikido | Videos | `videosTitle` | texto corto | 50 caracteres | Sí |
| Aikido | Videos | `videos[]` — título, persona, año, duración, URL, miniatura, alt | lista | 0–4 | No |
| Aikido | Videos | `playLabel` | texto corto | 30 caracteres | Sí |
| Aikido | CTA | `ctaTitle` | texto corto | 60 caracteres | Sí |
| Aikido | CTA | `ctaBody` | texto largo | 220 caracteres | Sí |
| Aikido | CTA | `ctaLabel` | texto corto | 30 caracteres | Sí |
| Aikido | CTA | `ctaUrl` | enlace | 1 URL interna | Sí |

## Dojo

| Pantalla | Sección | Campo | Tipo | Límite | Obligatorio |
|---|---|---|---|---|:---:|
| Dojo | SEO | `seoTitle` | texto corto | 60 caracteres | Sí |
| Dojo | SEO | `seoDescription` | texto corto | 155 caracteres | Sí |
| Dojo | Intro | `title` | texto corto | 50 caracteres | Sí |
| Dojo | Intro | `associationBody` | texto largo | 700 caracteres | Sí |
| Dojo | Espacio | `spaceTitle` | texto corto | 50 caracteres | Sí |
| Dojo | Espacio | `spaceBody` | texto largo | 500 caracteres | Sí |
| Dojo | Espacio | `gallery[]` — imagen, alt, pie | lista | 3–8; pie 120 caracteres | Sí |
| Dojo | Profesor | `teacherName` | texto corto | 50 caracteres | Sí |
| Dojo | Profesor | `teacherCredential` | texto corto | 100 caracteres | Sí |
| Dojo | Profesor | `teacherBiography` | texto largo | 1800 caracteres | Sí |
| Dojo | Profesor | `teacherMilestones[]` — año + texto | lista | 4–8; texto 180 caracteres | Sí |
| Dojo | Profesor | `teacherPortrait` | imagen | 1 | Sí |
| Dojo | Profesor | `teacherPortraitAlt` | texto corto | 140 caracteres | Sí |
| Dojo | Pedagogía | `teachingTitle` | texto corto | 60 caracteres | Sí |
| Dojo | Pedagogía | `teachingPrinciples[]` — título + texto | lista | 3; texto 220 caracteres | Sí |
| Dojo | Novedades | `newsTitle` | texto corto | 50 caracteres | Sí |
| Dojo | Novedades | `news[]` — fecha, título, extracto, imagen, alt, enlace | lista | 0–3; extracto 240 caracteres | No |
| Dojo | Asociaciones | `partnersTitle` | texto corto | 55 caracteres | Sí |
| Dojo | Asociaciones | `partners[]` — nombre, logo, alt, enlace | lista | 0–8 | No |
| Dojo | Recursos | `institutionalLinks[]` — label + enlace | lista | 0–8 | No |
| Dojo | CTA | `ctaTitle` | texto corto | 55 caracteres | Sí |
| Dojo | CTA | `ctaLabel` | texto corto | 30 caracteres | Sí |
| Dojo | CTA | `ctaUrl` | enlace | 1 URL interna | Sí |

## Contacto

| Pantalla | Sección | Campo | Tipo | Límite | Obligatorio |
|---|---|---|---|---|:---:|
| Contacto | SEO | `seoTitle` | texto corto | 60 caracteres | Sí |
| Contacto | SEO | `seoDescription` | texto corto | 155 caracteres | Sí |
| Contacto | Intro | `title` | texto corto | 60 caracteres | Sí |
| Contacto | Intro | `lead` | texto largo | 300 caracteres | Sí |
| Contacto | Primera clase | `trialPrice` | texto corto | 30 caracteres | Sí |
| Contacto | Primera clase | `trialConditions` | texto largo | 300 caracteres | Sí |
| Contacto | Sedes | `locations[]` — nombre, dirección, transporte, mapa | lista | 3 | Sí |
| Contacto | Formulario | `formLabels` — sede, público, nombre, email, teléfono, mensaje | lista | 6; 30 caracteres/label | Sí |
| Contacto | Formulario | `audienceOptions[]` | lista | 2–4; 30 caracteres | Sí |
| Contacto | Formulario | `consentLabel` | texto largo | 220 caracteres | Sí |
| Contacto | Formulario | `submitLabel` | texto corto | 30 caracteres | Sí |
| Contacto | Formulario | `successMessage` | texto corto | 160 caracteres | Sí |
| Contacto | Formulario | `errorMessage` | texto corto | 160 caracteres | Sí |
| Contacto | Directo | `email` | enlace | 1 email | Sí |
| Contacto | Directo | `phone` | texto corto | 30 caracteres | No |
| Contacto | Directo | `responseTime` | texto corto | 100 caracteres | No |
| Contacto | Directo | `socialLinks[]` — red + enlace | lista | 0–5 | No |
| Contacto | Cómo llegar | `arrivalTitle` | texto corto | 50 caracteres | Sí |
| Contacto | Cómo llegar | `arrivalBody` | texto largo | 500 caracteres | Sí |
| Contacto | Cómo llegar | `staticMapImage` | imagen | 1 | No |
| Contacto | Cómo llegar | `staticMapAlt` | texto corto | 140 caracteres | No |

## Reglas de implementación

- Los límites se cuentan por Unicode code points, no bytes.
- Todo campo visible vive en JSON; rutas internas y atributos técnicos salen de código tipado.
- Campos por idioma deben compartir schema y cardinalidad estructural, no texto literal.
- `alt` es obligatorio cuando la imagen comunica contenido; decorativas usan `alt=""` desde código.
- Precio se guarda como texto localizado para presentación y como valor estructurado cuando el
  backoffice de facturación lo necesite; no se deduce uno del otro.
- Horarios no admiten HTML enriquecido ni imágenes.
- Enlaces externos exigen esquema `https:`; email admite `mailto:`.
