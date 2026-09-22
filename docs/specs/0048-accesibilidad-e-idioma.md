---
spec: 0048
fecha: 2026-09-21
estado: cerrada
resumen: Los dos aria-label del navbar estan en castellano en las 44 paginas y los nombres de idioma van sin acentos; se traducen y se acentuan, que es lo que leen los lectores de pantalla y Google.
disjunta: si
archivos: src/lib/i18n.ts, src/layouts/Base.astro, src/components/SocialLinks.astro
---

# 0048 — Accesibilidad e idioma del borde

> La spec mas chica del proyecto, y la unica que arregla algo que se lee **solo** con un
> lector de pantalla.

## Problema

Salio de la auditoria del 2026-09-21, que recorrio el HTML de las 44 paginas preguntando de
donde venia cada texto:

1. **`aria-label="Principal"` y `aria-label="Idioma"`** estan escritos en castellano en
   `Base.astro` y se emiten **en las 44 paginas**, incluidas las portuguesas, las francesas
   y las inglesas. Son los nombres de los dos `<nav>`: lo primero que anuncia un lector de
   pantalla al entrar en la navegacion. En la pagina inglesa dice "Idioma".
2. **`LOCALE_NAME` va sin acentos**: `Portugues`, `Espanol`, `Francais`. Se usa en el
   `aria-label`, el `title` y el texto `sr-only` de los cuatro selectores de idioma de cada
   pagina — **y tambien en las pestañas del backoffice**, donde el cliente las lee.
3. **`aria-label="Facebook — Dojo da Luz"`** se arma con una plantilla en castellano-neutro
   que no se traduce. Es menor y se deja anotado, no se cambia: el nombre de la red y el de
   la marca son nombres propios en los cuatro idiomas.

Nada de esto lo ve un `astro check` ni una captura de pantalla: son atributos.

## Alcance

**Entra:**

- Los dos `aria-label` de `<nav>` pasan a estar **en los cuatro idiomas**, junto a los
  otros textos de accesibilidad que ya viven en `i18n.ts`.
- `LOCALE_NAME` gana los acentos: **Português, Español, Français, English**.

**No entra:**

- **Las etiquetas del menu.** Confirmado por el cliente: se quedan en `i18n.ts` y no se
  convierten en contenido. Son los nombres de las ocho paginas del sitio, no contenido
  editable (ADR-0026).
- **`aria-label` de las redes.** Nombres propios.
- **Llevar estos textos al backoffice.** Son tres palabras por idioma que no cambian nunca;
  un campo en una pantalla costaria mas que la linea de codigo.

## Diseño

Los dos rotulos van a `i18n.ts`, al lado de `NAV_LABELS`, porque son de la misma
naturaleza: vocabulario de la interfaz, no contenido.

```ts
export const NAV_ARIA: Record<Locale, { principal: string; idioma: string }> = {
  pt: { principal: 'Principal', idioma: 'Idioma' },
  es: { principal: 'Principal', idioma: 'Idioma' },
  fr: { principal: 'Principale', idioma: 'Langue' },
  en: { principal: 'Main',       idioma: 'Language' },
}
```

En portugues y español la palabra coincide, y **esta escrito igual en las cuatro filas a
proposito**: una tabla completa se lee de un golpe y no obliga a nadie a recordar que dos
idiomas comparten valor.

`LOCALE_NAME` con acentos toca de paso las pestañas del BO, que hoy dicen "Portugues".
Es la misma correccion y no hace falta separarla.

## Archivos

| Archivo | Acción |
|---|---|
| `src/lib/i18n.ts` | editar (`NAV_ARIA`, acentos en `LOCALE_NAME`) |
| `src/layouts/Base.astro` | editar (los cuatro `aria-label`: dos de escritorio y dos del menú móvil) |

### Disjunta?

**Sí.** No comparte archivos con 0045, 0046 ni 0047.

## Verificación

- [ ] `astro check` 0/0/0, tests sin regresiones, build 44 rutas.
- [ ] En el HTML construido: **cero** `aria-label="Idioma"` en las 11 páginas inglesas y las
      11 francesas, y el valor correcto en cada idioma. Hoy hay 44 en castellano.
- [ ] `Português`, `Español` y `Français` con acento en los selectores de las 44 páginas.
- [ ] Las pestañas del backoffice muestran los cuatro nombres acentuados.
- [ ] **Las 44 páginas comparadas pixel a pixel contra el build anterior**: los `aria-label`
      no se pintan, así que la única diferencia visible permitida son los tres nombres de
      idioma del `sr-only`, que tampoco se ven. Esperado: **0 diferencias**.

## Abierto

Nada. Es la spec que no tiene decisiones.
