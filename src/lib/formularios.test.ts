import { test } from 'node:test'
import assert from 'node:assert/strict'
import { campoSchema, formularioSchema, formulariosSchema, getFormulario } from './formularios.ts'

/**
 * El catalogo de campos es cerrado (ADR-0046). Lo que se prueba aca es esa frontera: que un
 * tipo que no lleva opciones no pueda traerlas, que uno de seleccion no pueda quedarse sin
 * presentacion valida, y que dos elementos no compartan identificador — que es lo unico que
 * permite reordenar y traducir sin relacionar filas por posicion ni por texto.
 */

const cuatro = (texto: string) => ({ pt: texto, es: texto, fr: texto, en: texto })
const sinAyuda = { pt: null, es: null, fr: null, en: null }

const campo = (extra: Record<string, unknown>) => ({
  id: 'campo',
  type: 'text',
  required: true,
  label: cuatro('Nome'),
  help: sinAyuda,
  presentation: null,
  options: [],
  ...extra,
})

const opcion = (id: string) => ({ id, label: cuatro(id) })

test('un campo de texto no lleva opciones ni presentacion', () => {
  assert.equal(campoSchema.safeParse(campo({})).success, true)
  assert.equal(campoSchema.safeParse(campo({ options: [opcion('sim')] })).success, false)
  assert.equal(campoSchema.safeParse(campo({ presentation: 'radio' })).success, false)
})

test('seleccion unica: radio o select, y al menos una opcion', () => {
  const base = { type: 'singleChoice', options: [opcion('sim'), opcion('nao')] }

  assert.equal(campoSchema.safeParse(campo({ ...base, presentation: 'radio' })).success, true)
  assert.equal(campoSchema.safeParse(campo({ ...base, presentation: 'select' })).success, true)
  assert.equal(campoSchema.safeParse(campo({ ...base, presentation: 'checkbox' })).success, false)
  assert.equal(campoSchema.safeParse(campo({ ...base, presentation: null })).success, false)
  assert.equal(
    campoSchema.safeParse(campo({ type: 'singleChoice', presentation: 'radio', options: [] })).success,
    false,
  )
})

test('seleccion multiple: checkbox o multiSelect, nunca radio', () => {
  const base = { type: 'multipleChoice', options: [opcion('sim')] }

  assert.equal(campoSchema.safeParse(campo({ ...base, presentation: 'checkbox' })).success, true)
  assert.equal(campoSchema.safeParse(campo({ ...base, presentation: 'multiSelect' })).success, true)
  assert.equal(campoSchema.safeParse(campo({ ...base, presentation: 'radio' })).success, false)
})

test('dos opciones con el mismo id no pasan', () => {
  const dos = campo({
    type: 'singleChoice',
    presentation: 'radio',
    options: [opcion('sim'), opcion('sim')],
  })

  assert.equal(campoSchema.safeParse(dos).success, false)
})

test('un formulario sin campos no se puede publicar', () => {
  const vacio = {
    id: 'vacio',
    nombre: 'Vacío',
    estado: 'activo',
    submitLabel: cuatro('Enviar'),
    successMessage: cuatro('Obrigado'),
    fields: [],
  }

  assert.equal(formularioSchema.safeParse(vacio).success, false)
  assert.equal(formularioSchema.safeParse({ ...vacio, fields: [campo({})] }).success, true)
})

test('dos campos con el mismo id no pasan', () => {
  const repetido = {
    id: 'repetido',
    nombre: 'Repetido',
    estado: 'activo',
    submitLabel: cuatro('Enviar'),
    successMessage: cuatro('Obrigado'),
    fields: [campo({}), campo({})],
  }

  assert.equal(formularioSchema.safeParse(repetido).success, false)
})

test('el texto portugues es obligatorio en los cuatro idiomas', () => {
  const sinPt = campo({ label: { pt: '', es: 'Nombre', fr: 'Nom', en: 'Name' } })

  assert.equal(campoSchema.safeParse(sinPt).success, false)
})

test('la lista puede quedar vacia, pero no con dos formularios del mismo id', () => {
  assert.equal(formulariosSchema.safeParse({ forms: [] }).success, true)

  const uno = formularioSchema.parse({
    id: 'uno',
    nombre: 'Uno',
    estado: 'activo',
    submitLabel: cuatro('Enviar'),
    successMessage: cuatro('Obrigado'),
    fields: [campo({})],
  })

  assert.equal(formulariosSchema.safeParse({ forms: [uno, uno] }).success, false)
})

test('el formulario inicial existe y tiene los ocho campos acordados', () => {
  const inicial = getFormulario('aula-experimental-aikido')

  assert.ok(inicial)
  assert.equal(inicial.fields.length, 8)
  assert.equal(inicial.fields.at(-1)!.required, false)
  assert.equal(inicial.fields.find((c) => c.id === 'horario')!.options.length, 9)
})
