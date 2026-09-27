import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formularioSchema, formulariosSchema, type Formulario } from './formularios.ts'
import { copiaDe } from './formularios-copia.ts'

/**
 * Lo que promete «Copiar» (spec 0059): un formulario nuevo, con otro id, que no choca con
 * nadie y trae las cuatro traducciones. Y que el original no se entere.
 */

const original: Formulario = formularioSchema.parse({
  id: 'aula-experimental',
  nombre: 'Aula experimental',
  estado: 'archivado',
  submitLabel: { pt: 'Enviar', es: 'Enviar', fr: 'Envoyer', en: 'Send' },
  successMessage: { pt: 'Obrigado', es: 'Gracias', fr: 'Merci', en: 'Thanks' },
  fields: [
    {
      id: 'c-praticou',
      type: 'singleChoice',
      required: true,
      label: { pt: 'Já praticou?', es: '¿Ya practicó?', fr: 'Déjà pratiqué ?', en: 'Practiced before?' },
      help: { pt: 'Uma opção', es: null, fr: null, en: null },
      presentation: 'radio',
      options: [
        { id: 'o-sim', label: { pt: 'Sim', es: 'Sí', fr: 'Oui', en: 'Yes' } },
        { id: 'o-nao', label: { pt: 'Não', es: 'No', fr: 'Non', en: 'No' } },
      ],
    },
  ],
})

test('la copia lleva otro id, «(copia)» en el nombre y nace activa', () => {
  const copia = copiaDe(original, [original.id])

  assert.equal(copia.id, 'aula-experimental-copia')
  assert.equal(copia.nombre, 'Aula experimental (copia)')
  assert.equal(copia.estado, 'activo')
})

test('copiar dos veces no repite id: la segunda lleva sufijo', () => {
  const primera = copiaDe(original, [original.id])
  const segunda = copiaDe(original, [original.id, primera.id])

  assert.notEqual(segunda.id, primera.id)
  assert.match(segunda.id, /^aula-experimental-copia-[0-9a-f]{8}$/)
})

test('trae campos, opciones y los cuatro idiomas tal cual', () => {
  const copia = copiaDe(original, [original.id])

  assert.deepEqual(copia.fields, original.fields)
  assert.deepEqual(copia.submitLabel, original.submitLabel)
  assert.deepEqual(copia.successMessage, original.successMessage)
})

test('el original no se toca, ni siquiera por referencia', () => {
  const antes = structuredClone(original)
  const copia = copiaDe(original, [original.id])

  copia.fields[0]!.label.pt = 'Editado en la copia'
  copia.fields[0]!.options[0]!.label.es = 'Editado'
  copia.submitLabel.fr = 'Editado'

  assert.deepEqual(original, antes)
})

test('la lista con la copia valida contra el schema del build', () => {
  const copia = copiaDe(original, [original.id])

  assert.equal(formulariosSchema.safeParse({ forms: [original, copia] }).success, true)
})

test('un nombre largo que al recortarse da el id del original no choca con el', () => {
  const largo = formularioSchema.parse({ ...original, id: 'x', nombre: 'A'.repeat(60) })
  const conId = { ...largo, id: 'a'.repeat(48) }
  const copia = copiaDe(conId, [conId.id])

  assert.notEqual(copia.id, conId.id)
  assert.equal(formulariosSchema.safeParse({ forms: [conId, copia] }).success, true)
})
