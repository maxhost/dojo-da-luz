---
adr: 0001
fecha: 2026-09-17
estado: aceptada
resumen: Astro estatico + Vercel + Neon + R2. Sitio publico sin dependencia de runtime con la DB.
---

# 0001 — Stack

## Contexto

Rediseño de aikido-duran.com (hoy Wix). ~200 visitas/90 dias, ~4 facturas/mes, 4 idiomas.
Prioridad declarada del cliente, en orden: **carga hiper rapida**, **mantener SEO**,
**mejorar GEO**. Backoffice de un solo admin.

## Decision

| Capa | Eleccion | Por que |
|---|---|---|
| Framework | **Astro**, `output: 'static'` | Cero JS por defecto. El sitio publico no tiene interactividad; no se paga el runtime de un framework de UI por paginas que son texto e imagenes. |
| Backoffice | Rutas `/admin` en el mismo proyecto Astro, `prerender = false`, islas React solo ahi | Un repo, un deploy. El JS del admin no toca el bundle publico. |
| Hosting | **Vercel** | Decision del cliente (ver Riesgos). |
| DB | **Neon Postgres** | Solo alumnos y facturas. El contenido NO vive aca (ver ADR-0002). |
| Storage | **Cloudflare R2** | Imagenes y PDFs de factura. Egress gratis. |
| Email | **Resend** | 3k/mes gratis. Requiere DKIM/SPF en el dominio. |
| Auth | Magic link por email, 1 admin, sin roles ni registro | Es una persona. Cualquier cosa mas es andamiaje. |

## Alternativas descartadas

- **Next.js** — ~70kB de runtime React en paginas sin interactividad. El backoffice es
  ~6 pantallas de CRUD; no justifica el costo en el lado publico.
- **Cloudflare Pages/Workers** — tecnicamente equivalente y su free tier permite uso
  comercial explicitamente. Descartado por preferencia del cliente, no por tecnica.

## Riesgos aceptados

**Vercel Hobby prohibe uso comercial**, y lo define como cualquier deployment usado para
beneficio financiero de cualquiera involucrado en la produccion del proyecto, *incluido un
consultor pago escribiendo el codigo*. El cliente evaluo el riesgo y decidio seguir en
Hobby.

Mitigacion estructural: con `output: 'static'` el sitio publico es HTML plano y el unico
codigo atado a Vercel son los endpoints de `/admin`. Si Vercel suspende el deployment, la
migracion a Cloudflare Pages es de horas, no de dias. **Por eso no se usa ninguna API
propietaria de Vercel** (ni ISR, ni middleware, ni image optimization) — ver ADR-0002.
