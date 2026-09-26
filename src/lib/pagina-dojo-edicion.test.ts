import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dojoDesdeForm } from './pagina-dojo-edicion.ts'

/**
 * `photoFoco` en cada profesor de "04 · Otros profesores" (spec 0052, ADR-0048), mismo
 * campo que en `/eventos` — la forma ya se prueba a fondo en `eventos-edicion.test.ts`
 * contra el `focoSchema` compartido. Aca solo se prueba que `dojoDesdeForm` lo lea.
 */

function form(campos: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [clave, valor] of Object.entries(campos)) fd.append(clave, valor)
  return fd
}

test('dojoDesdeForm lee photoFoco de cada profesor', () => {
  const datos = dojoDesdeForm(
    form({
      'teachers[0].name': 'Javier',
      'teachers[0].credentials': '3º Dan',
      'teachers[0].paragraphs': 'Parrafo uno',
      'teachers[0].photo': 'https://ejemplo.test/javier.webp',
      'teachers[0].photoAlt': 'Javier',
      'teachers[0].photoFoco': '50% 12%',
    }),
  ) as any

  assert.equal(datos.teachers[0].photoFoco, '50% 12%')
})

test('sin photoFoco en el form, dojoDesdeForm lo lee vacio (el recorte queda como esta hoy)', () => {
  const datos = dojoDesdeForm(
    form({
      'teachers[0].name': 'Javier',
      'teachers[0].credentials': '3º Dan',
      'teachers[0].paragraphs': 'Parrafo uno',
      'teachers[0].photo': 'https://ejemplo.test/javier.webp',
      'teachers[0].photoAlt': 'Javier',
    }),
  ) as any

  assert.equal(datos.teachers[0].photoFoco, '')
})
