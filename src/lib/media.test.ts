import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mediaDesdeForm } from './forms.ts'
import { CLAVES_MEDIA, mediaSchema } from './media.ts'

/**
 * Las imagenes compartidas son un archivo aparte, el mismo para los cuatro idiomas
 * (spec 0032). Eran cinco de la portada; la spec 0035 sumo la de `/aulas`. Lo que se
 * prueba es que se lean todas las declaradas y ninguna de mas, y que una vacia no
 * publique una pagina sin foto: el schema del build las exige todas.
 */

const URLS = {
  heroPoster: 'https://ejemplo.test/portada.webp',
  heroVideo: 'https://ejemplo.test/portada.mp4',
  adultsPhoto: 'https://ejemplo.test/adultos.webp',
  childrenPhoto: 'https://ejemplo.test/criancas.webp',
  dojoPhoto: 'https://ejemplo.test/dojo.webp',
  teacherPhoto: 'https://ejemplo.test/professor.webp',
  classesHero: 'https://ejemplo.test/aulas.webp',
}

/** Las imagenes viajan con el prefijo `media.` dentro del formulario del idioma. */
function form(valores: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [clave, valor] of Object.entries(valores)) fd.append(`media.${clave}`, valor)
  return fd
}

test('se leen todas las claves declaradas y ninguna de mas', () => {
  const leido = mediaDesdeForm(form({ ...URLS, otroCampo: 'https://ejemplo.test/vieja.jpg' }))
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

test('el video de la portada vacio es valido: la portada se ve solo con el poster', () => {
  const validado = mediaSchema.safeParse(mediaDesdeForm(form({ ...URLS, heroVideo: '' })))
  assert.equal(validado.success, true)
})

test('el video de la portada con algo que no es una direccion falla en su campo', () => {
  const validado = mediaSchema.safeParse(mediaDesdeForm(form({ ...URLS, heroVideo: 'video.mp4' })))
  assert.equal(validado.success, false)
  assert.equal(validado.error!.issues[0]!.path.join('.'), 'heroVideo')
})

test('el archivo que el build lee hoy es valido', async () => {
  const datos = await import('../../content/media.json', { with: { type: 'json' } })
  assert.equal(mediaSchema.safeParse(datos.default).success, true)
})

/**
 * Publicar un idioma sin tocar las imagenes no tiene que escribir `media.json`. Lo que lo
 * garantiza es que el ciclo formulario → schema → JSON devuelva el archivo **byte a byte**:
 * el editor compara el texto y no publica si es igual.
 */
test('el ciclo no cambia el archivo cuando no se toco nada', async () => {
  const datos = await import('../../content/media.json', { with: { type: 'json' } })
  const actual = (datos.default ?? datos) as Record<string, string>

  const ida = mediaSchema.parse(mediaDesdeForm(form(actual)))
  const texto = JSON.stringify(ida, null, 2) + '\n'
  const enDisco = await import('node:fs/promises').then((fs) =>
    fs.readFile(new URL('../../content/media.json', import.meta.url), 'utf8'),
  )

  assert.equal(texto, enDisco)
})

/**
 * El 2026-09-25 publicar Home rompia con "classesHero: Invalid URL": la spec 0035 agrego
 * esa clave a `mediaSchema` pero `FormularioHome.astro` nunca la llevo, ni editable ni
 * oculta, y `media.json` se publica entero — 4 dias rota sin que nadie publicara Home.
 *
 * Esto no lo puede atrapar un test de `mediaDesdeForm` (ese ya prueba que lee bien lo que
 * el formulario manda): el bug era que el formulario no mandaba el campo. Se prueba leyendo
 * el `.astro` como texto — lo unico que puede fallar aca es que el nombre del campo no
 * aparezca, no que el layout cambie.
 *
 * Solo cubre `FormularioHome.astro`, que enumera cada campo a mano. `FormularioAulas.astro`
 * usa un loop sobre `CLAVES_MEDIA` para las que no le pertenecen (`media.${clave}`, no un
 * literal por clave) mas `media.classesHero` aparte para la suya: una clave nueva entra sola
 * por construccion, no hay nada que olvidar ahi.
 */
test('cada clave de CLAVES_MEDIA viaja en FormularioHome.astro', async () => {
  const fs = await import('node:fs/promises')
  const home = await fs.readFile(
    new URL('../components/admin/FormularioHome.astro', import.meta.url),
    'utf8',
  )

  for (const clave of CLAVES_MEDIA) {
    const nombre = `media.${clave}`
    assert.ok(home.includes(nombre), `"${nombre}" no aparece en FormularioHome.astro`)
  }
})
