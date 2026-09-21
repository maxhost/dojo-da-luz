import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mediaDesdeForm } from './forms.ts'
import { CLAVES_MEDIA, mediaSchema } from './media.ts'

/**
 * Las cinco imagenes de la portada son un archivo aparte, compartido por los cuatro idiomas
 * (spec 0032). Lo que se prueba es que se lean las cinco y que una vacia no publique una
 * Home sin foto: el schema del build las exige todas.
 */

const URLS = {
  heroPoster: 'https://ejemplo.test/portada.webp',
  adultsPhoto: 'https://ejemplo.test/adultos.webp',
  childrenPhoto: 'https://ejemplo.test/criancas.webp',
  dojoPhoto: 'https://ejemplo.test/dojo.webp',
  teacherPhoto: 'https://ejemplo.test/professor.webp',
}

function form(valores: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [clave, valor] of Object.entries(valores)) fd.append(clave, valor)
  return fd
}

test('se leen las cinco claves y ninguna de mas', () => {
  const leido = mediaDesdeForm(form({ ...URLS, 'dojo.photo': 'https://ejemplo.test/vieja.jpg' }))
  assert.deepEqual(Object.keys(leido).sort(), [...CLAVES_MEDIA].sort())
  assert.deepEqual(leido, URLS)
})

test('una imagen vacia no publica una portada sin foto', () => {
  const validado = mediaSchema.safeParse(mediaDesdeForm(form({ ...URLS, dojoPhoto: '' })))
  assert.equal(validado.success, false)
  assert.equal(validado.error!.issues[0]!.path.join('.'), 'dojoPhoto')
})

test('algo que no es una direccion falla en su campo', () => {
  const validado = mediaSchema.safeParse(mediaDesdeForm(form({ ...URLS, heroPoster: 'foto.jpg' })))
  assert.equal(validado.success, false)
  assert.equal(validado.error!.issues[0]!.path.join('.'), 'heroPoster')
})

test('el archivo que el build lee hoy es valido', async () => {
  const datos = await import('../../content/media.json', { with: { type: 'json' } })
  assert.equal(mediaSchema.safeParse(datos.default).success, true)
})
