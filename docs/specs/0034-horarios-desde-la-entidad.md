---
spec: 0034
fecha: 2026-09-21
estado: cerrada
resumen: La seccion Horarios de /aulas deja de ser texto copiado en cuatro idiomas y pasa a salir de la entidad de dojos, como ya hace la Home; archivar un dojo lo saca de /aulas.
disjunta: no
archivos: src/components/ClassesView.astro, src/lib/content.ts, content/*/classes.json
---

# 0034 — Los horarios de /aulas salen de la entidad de dojos

## Problema

La seccion "Horários" de `/aulas` pinta tres tarjetas, una por sede, con las clases de esa
sede adentro. **Son dojos, no horarios.** Y no salen de `content/dojos.json`: salen de
`schedule.venues`, escrito a mano y repetido en los cuatro `classes.json`.

Se esta viendo roto en produccion ahora mismo. El dojo de **Encarnação cerro y se archivo
desde el backoffice** el 2026-09-21 (commit `f147c2e`):

| Pagina | Que muestra |
|---|---|
| `/` | Benfica y Lumiar — usa `getDojos()`, que filtra los archivados |
| `/aulas` | Benfica, **Encarnação** y Lumiar — usa su copia congelada |

Las dos paginas del mismo sitio se contradicen, y el backoffice no tiene forma de arreglarlo:
archivar un dojo no toca `/aulas`. Es la fila 6f de `docs/TASKS.md`, abierta desde el
2026-09-18.

## Alcance

**Entra:**

- `ClassesView.astro` pinta las tarjetas de sede desde `getDojos()`, con `formatAudiencia`
  y `formatHorario`, igual que `HomeView.astro`.
- `schedule.venues` sale de `classesSchema` y de los cuatro `content/<locale>/classes.json`.
- `schedule.label`, `schedule.title` y `schedule.intro` se quedan: son texto de la seccion,
  no datos de sede.

**No entra:**

- **Los textos en prosa que nombran Encarnação.** Quedan como estan, por decision del
  cliente: pasan a ser editables con la spec 0035 y los corrige el admin desde el BO. La
  lista exacta esta abajo, para que no se pierda.
- `/contactos` (`contact.venues`). Mismo problema, pero la entidad no tiene `transporte` y
  sumarlo es otra decision. Sigue abierto en la fila 6f.
- Cualquier cambio de composicion: las tarjetas se ven igual, solo cambia de donde salen
  los datos.

## Diseño

El mapeo de `Dojo` a lo que la tarjeta ya mostraba:

| Hoy (`venue`) | Con la entidad (`dojo`) |
|---|---|
| `venue.area` — el rotulo `01 · Benfica` | `dojo.nombre` |
| `venue.name` — el `<h3>` | `dojo.instalacion ?? dojo.dojo` |
| `venue.classes[].audience` | `formatAudiencia(horario, locale)` |
| `venue.classes[].time` | `formatHorario(horario, locale)` |

`instalacion ?? dojo` reproduce exactamente el HTML de hoy: Benfica y Encarnação tienen
`instalacion: null` y mostraban "Dojo da Luz"; Lumiar tiene `instalacion: "Pista de
Atletismo Municipal Prof. Moniz Pereira"` y mostraba eso.

La numeracion `0{index + 1}` se mantiene y ahora cuenta dojos activos: con Encarnação
archivado quedan `01 · Benfica` y `02 · Lumiar`.

Los dias y las horas ya se traducen a los cuatro idiomas en `src/lib/dojos.ts`
(`formatDias`, `DIA_LABEL`, `AUDIENCIA_LABEL`): no hay texto nuevo que traducir.

### Prosa que sigue nombrando Encarnação

No la toca esta spec. La corrige el admin desde el BO cuando exista la spec 0035:

| Archivo (x4 idiomas) | Ruta | Editable con 0035 |
|---|---|---|
| `classes.json` | `seo.description` | si |
| `classes.json` | `chrome.footerNote.areas` | si |
| `classes.json` | `children.facts[2]` | si |
| `classes.json` | `qa.items[2].respuesta` ("três locais") | si |
| `classes.json` | `qa.items[3].respuesta` | si |
| `adults.json` | `seo.description`, `facts[1]`, `qa.items[1].respuesta` | **no** — `/aulas/adultos` no tiene editor |
| `children.json` | `seo.description`, `qa.items[1].respuesta` | **no** |
| `home.json` | `seo.description`, `resumen[0]`, `places.lead` | si — editor de Home ya existe |
| `contact.json` | `seo.description`, `venues[2]` | **no** |

## Archivos

| Archivo | Accion |
|---|---|
| `src/components/ClassesView.astro` | editar — importar `getDojos`/`format*`, reemplazar el `map` de `venues` |
| `src/lib/content.ts` | editar — sacar `venues` de `classesSchema` |
| `content/pt/classes.json` | editar — sacar `schedule.venues` |
| `content/es/classes.json` | editar — idem |
| `content/fr/classes.json` | editar — idem |
| `content/en/classes.json` | editar — idem |

### Disjunta?

**No.** Colisiona con la spec 0035, que toca `src/lib/content.ts` y los cuatro
`content/*/classes.json`. **Se serializan: 0034 primero.** Si 0035 escribiera el editor
antes, tendria que ofrecer una tabla de sedes que esta spec borra.

## Verificacion

- [ ] `npm test` verde
- [ ] `astro check` en 0 errores
- [ ] `npm run build` construye las 44 rutas
- [ ] En `/aulas` construido, la seccion Horários muestra **dos** tarjetas, `01 · Benfica`
      y `02 · Lumiar`, y **no** aparece `Encarnação` dentro de `id="horarios"`
- [ ] El HTML de las tarjetas de Benfica y Lumiar dice lo mismo que antes: "Dojo da Luz" y
      "Pista de Atletismo Municipal Prof. Moniz Pereira", con sus horarios
- [ ] Las cuatro `/aulas` (pt/es/fr/en) construyen y muestran los dias traducidos
- [ ] Reactivar Encarnação en `content/dojos.json` lo hace volver a `/aulas` sin tocar
      `classes.json` — es la prueba de que la seccion quedo enganchada a la entidad

## Abierto

Nada que bloquee. `/contactos` y las paginas de audiencia siguen con su copia: es la fila
6f, que esta spec reduce pero no cierra.
