---
spec: 0020
fecha: 2026-09-18
estado: cerrada
resumen: Los dojos pasan a content/dojos.json con NAP, coordenadas y horarios estructurados; la home renderiza las tarjetas desde ahi y emite JSON-LD por sede.
disjunta: si
archivos: content/dojos.json, src/lib/content.ts, src/lib/dojos.ts, src/lib/i18n.ts, src/lib/site.ts, src/components/HomeView.astro, content/{pt,es,fr,en}/home.json
---

# 0020 — Dojos como entidad

## Problema

Los dojos son texto libre repetido en cuatro idiomas y tres paginas. Cambiar un horario
son doce ediciones sin garantia de coherencia, y no hay ningun dato estructurado: ni calle,
ni coordenadas, ni horas. La seccion `02 · A terra` de la home muestra `"Manhã · almoço ·
noite"`, que no sirve ni para una tabla ni para `openingHours`.

Sin esto el backoffice no puede "crear un dojo": no hay entidad que crear. El modelo esta
decidido en el ADR-0017.

## Alcance

**Entra:**

- `content/dojos.json`: los dojos existentes migrados, con los campos duros que hoy se
  conocen y `null` en los que faltan (calle, codigo postal, coordenadas, telefono).
- `dojosSchema` en `src/lib/content.ts` y carga validada igual que el resto del contenido:
  un JSON invalido **rompe el build**.
- `src/lib/dojos.ts`: `getDojos()` (solo activos, ordenados), `getDojo(slug)` y
  `formatHorario(horario, locale)`.
- Etiquetas de dias y audiencias por idioma en `src/lib/i18n.ts`. Las horas no se traducen.
- `HomeView.astro`: la seccion `02 · A terra` renderiza los dojos activos.
- `src/lib/site.ts`: `SportsActivityLocation` por dojo, con `address`, `geo` y
  `openingHoursSpecification` **solo con los campos presentes**.
- `content/*/home.json`: se elimina `places.items`; quedan los textos traducibles de la
  seccion.

**No entra:**

- El backoffice. Este archivo se edita a mano hasta la spec 0021.
- Migrar Aulas y Contacto a la entidad (siguen con sus `venues` propios): es otra spec, y
  mezclarlas convierte esto en un refactor de seis componentes.
- Pagina propia por dojo (`/dojo/benfica`). Hoy ninguna URL vieja apunta ahi.
- Inventar direcciones. Lo que el cliente no confirmo se queda en `null`.

## Diseño

Forma del archivo, exacta (ver ADR-0017 para el porque):

```jsonc
{
  "dojos": [
    {
      "slug": "benfica",
      "estado": "activo",
      "orden": 1,
      "nombre": "Benfica",
      "dojo": "Dojo da Luz",
      "direccion": { "calle": null, "codigoPostal": null, "localidad": "Lisboa", "pais": "PT" },
      "geo": null,
      "telefono": null,
      "transporte": [],
      "horarios": [
        { "audiencia": "adultos", "dias": ["lun", "mie"], "desde": "19:30", "hasta": "21:00" }
      ],
      "i18n": { "pt": { "nota": null }, "es": { "nota": null }, "fr": { "nota": null }, "en": { "nota": null } }
    }
  ]
}
```

Invariantes que valida el schema:

- `slug` unico, `^[a-z0-9-]+$`.
- `estado` ∈ `activo | archivado`. `getDojos()` devuelve solo activos.
- `audiencia` ∈ `adultos | criancas`, alineado con las paginas que ya existen.
- `dias` ∈ `lun mar mie jue vie sab dom`, sin repetidos, al menos uno.
- `desde` y `hasta` en `HH:MM` 24h, y `hasta > desde`.
- `i18n` tiene las cuatro claves de idioma. Falta una → build roto: es la misma regla que
  ya protege los hreflang reciprocos.
- Al menos un dojo activo.

La tarjeta de la home muestra: nombre, dojo, horarios formateados por idioma y, cuando
existan, calle y transporte. **Si un campo es `null` no se renderiza la etiqueta vacia.**

## Archivos

| Archivo | Accion |
|---|---|
| `content/dojos.json` | crear |
| `src/lib/content.ts` | editar (schema + carga del archivo no localizado) |
| `src/lib/dojos.ts` | crear |
| `src/lib/i18n.ts` | editar (etiquetas de dias y audiencias) |
| `src/lib/site.ts` | editar (JSON-LD por sede) |
| `src/components/HomeView.astro` | editar (seccion 02) |
| `content/pt/home.json` | editar (quitar `places.items`) |
| `content/es/home.json` | editar |
| `content/fr/home.json` | editar |
| `content/en/home.json` | editar |

### Disjunta?

**Si** respecto de 0019, que no toca ninguno de estos archivos. **No** respecto de 0021,
que consume `dojosSchema` y `getDojos()`: 0021 va despues.

## Verificacion

- [ ] `npm run typecheck` limpio.
- [ ] `npm run build` emite las mismas 36 rutas.
- [ ] `rg 'places\.items' src content` no devuelve nada.
- [ ] El HTML de las 4 homes contiene el nombre y el horario de cada dojo activo, y ninguna
      mencion de los archivados.
- [ ] Poner `"estado": "archivado"` en un dojo y rebuildear lo saca de las 4 homes.
- [ ] Un `desde` mayor que `hasta`, o un `slug` repetido, **rompe el build** con mensaje que
      nombra el campo.
- [ ] El JSON-LD de la home parsea y contiene un `SportsActivityLocation` por dojo activo,
      sin claves con `null`.
- [ ] Las horas se ven identicas en los cuatro idiomas; los dias, traducidos.

## Abierto

Del cliente, y **no bloquea**: calles, codigos postales, telefono y coordenadas de las tres
sedes quedan en `null` hasta que lleguen. El dia que lleguen es un cambio de datos, no de
codigo — que es justamente lo que esta spec compra.
