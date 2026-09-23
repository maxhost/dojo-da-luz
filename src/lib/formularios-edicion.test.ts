import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formularioDesdeForm } from './formularios-parse.ts'
import { formularioSchema, type Formulario } from './formularios.ts'
import { idDesdeNombre } from './formularios-edicion.ts'

/**
 * El ADR-0046 dice que portugues manda la estructura y que los otros tres idiomas solo
 * traducen. Lo que se prueba aca es esa frase, dentro de un mismo archivo: que un campo
 * nuevo nazca en los cuatro idiomas con el texto portugues, que propagar no pise una
 * traduccion hecha, y que una traduccion no pueda cambiar ni un tipo ni un campo.
 */

function form(pares: Record<string, string>): FormData {
  const datos = new FormData()
  for (const [clave, valor] of Object.entries(pares)) datos.set(clave, valor)
  return datos
}

const cuatro = (t: string) => ({ pt: t, es: t, fr: t, en: t })

const publicado: Formulario = formularioSchema.parse({
  id: 'aula',
  nombre: 'Aula experimental',
  estado: 'activo',
  submitLabel: { pt: 'Enviar', es: 'Enviar', fr: 'Envoyer', en: 'Send' },
  successMessage: cuatro('Obrigado'),
  fields: [
    {
      id: 'c-nome',
      type: 'text',
      required: true,
      label: { pt: 'Nome', es: 'Nombre', fr: 'Nom', en: 'Name' },
      help: { pt: null, es: null, fr: null, en: null },
      presentation: null,
      options: [],
    },
    {
      id: 'c-praticou',
      type: 'singleChoice',
      required: true,
      label: cuatro('Já praticou?'),
      help: { pt: null, es: null, fr: null, en: null },
      presentation: 'radio',
      options: [
        { id: 'o-sim', label: { pt: 'Sim', es: 'Sí', fr: 'Oui', en: 'Yes' } },
        { id: 'o-nao', label: cuatro('Não') },
      ],
    },
  ],
})

const basePt = {
  idioma: 'pt',
  nombre: 'Aula experimental',
  estado: 'activo',
  submitLabel: 'Enviar',
  successMessage: 'Obrigado',
  'fields[0].id': 'c-nome',
  'fields[0].type': 'text',
  'fields[0].required': 'si',
  'fields[0].orden': '1',
  'fields[0].label': 'Nome',
  'fields[1].id': 'c-praticou',
  'fields[1].type': 'singleChoice',
  'fields[1].required': 'si',
  'fields[1].orden': '2',
  'fields[1].label': 'Já praticou?',
  'fields[1].presentation': 'radio',
  'options[1][0].id': 'o-sim',
  'options[1][0].label': 'Sim',
  'options[1][0].orden': '1',
  'options[1][1].id': 'o-nao',
  'options[1][1].label': 'Não',
  'options[1][1].orden': '2',
}

const pt = (extra: Record<string, string> = {}) =>
  formularioSchema.parse(formularioDesdeForm(form({ ...basePt, ...extra }), 'pt', publicado))

test('un campo nuevo nace en los cuatro idiomas con el texto portugues', () => {
  const guardado = pt({
    'fields[2].id': '',
    'fields[2].type': 'email',
    'fields[2].orden': '3',
    'fields[2].label': 'E-mail',
  })

  const nuevo = guardado.fields[2]!
  assert.deepEqual(nuevo.label, cuatro('E-mail'))
  assert.ok(nuevo.id.startsWith('c-'))
  assert.equal(nuevo.presentation, null)
})

test('editar el portugues no pisa lo ya traducido', () => {
  const guardado = pt({ 'fields[0].label': 'Nome completo' })

  assert.equal(guardado.fields[0]!.label.pt, 'Nome completo')
  assert.equal(guardado.fields[0]!.label.es, 'Nombre')
  assert.equal(guardado.fields[0]!.label.fr, 'Nom')
})

test('quitar un campo en portugues lo saca del archivo entero', () => {
  const guardado = pt({ 'fields[0].quitar': 'si' })

  assert.equal(guardado.fields.length, 1)
  assert.equal(guardado.fields[0]!.id, 'c-praticou')
})

test('reordenar conserva los ids: la traduccion no se desalinea', () => {
  const guardado = pt({ 'fields[0].orden': '9' })

  assert.deepEqual(guardado.fields.map((c) => c.id), ['c-praticou', 'c-nome'])
  assert.equal(guardado.fields[1]!.label.es, 'Nombre')
})

test('cambiar un campo de seleccion a texto le limpia opciones y presentacion', () => {
  const guardado = pt({ 'fields[1].type': 'text' })

  assert.equal(guardado.fields[1]!.presentation, null)
  assert.deepEqual(guardado.fields[1]!.options, [])
})

test('una presentacion imposible se corrige, no se publica', () => {
  const guardado = pt({ 'fields[1].presentation': 'checkbox' })

  assert.equal(guardado.fields[1]!.presentation, 'radio')
})

test('una opcion nueva nace con el texto portugues y una quitada desaparece', () => {
  const guardado = pt({
    'options[1][2].id': '',
    'options[1][2].label': 'Talvez',
    'options[1][2].orden': '3',
    'options[1][0].quitar': 'si',
  })

  const opciones = guardado.fields[1]!.options
  assert.deepEqual(opciones.map((o) => o.label.pt), ['Não', 'Talvez'])
  assert.deepEqual(opciones[1]!.label, cuatro('Talvez'))
})

test('traducir solo toca el idioma editado', () => {
  const guardado = formularioSchema.parse(
    formularioDesdeForm(
      form({
        idioma: 'es',
        submitLabel: 'Enviar formulario',
        successMessage: 'Gracias',
        'fields[0].id': 'c-nome',
        'fields[0].label': 'Nombre y apellido',
        'options[0][0].id': 'o-sim',
        'options[0][0].label': 'Sí, ya practiqué',
      }),
      'es',
      publicado,
    ),
  )

  assert.equal(guardado.fields[0]!.label.es, 'Nombre y apellido')
  assert.equal(guardado.fields[0]!.label.pt, 'Nome')
  assert.equal(guardado.fields[1]!.options[0]!.label.es, 'Sí, ya practiqué')
  assert.equal(guardado.fields[1]!.options[0]!.label.fr, 'Oui')
  assert.equal(guardado.submitLabel.fr, 'Envoyer')
})

test('una traduccion no puede añadir campos ni cambiar tipos', () => {
  const guardado = formularioSchema.parse(
    formularioDesdeForm(
      form({
        idioma: 'fr',
        submitLabel: 'Envoyer',
        successMessage: 'Merci',
        'fields[0].id': 'c-nome',
        'fields[0].type': 'number',
        'fields[0].label': 'Nom',
        'fields[1].id': '',
        'fields[1].type': 'text',
        'fields[1].label': 'Champ pirate',
      }),
      'fr',
      publicado,
    ),
  )

  assert.equal(guardado.fields.length, 2)
  assert.equal(guardado.fields[0]!.type, 'text')
  assert.equal(guardado.estado, 'activo')
})

test('la fila vacia de mas —la que existe para agregar— no se publica', () => {
  const guardado = pt({
    'fields[2].id': '',
    'fields[2].type': 'text',
    'fields[2].orden': '3',
    'fields[2].label': '',
    'options[1][2].id': '',
    'options[1][2].label': '',
    'options[1][2].orden': '3',
  })

  assert.equal(guardado.fields.length, 2)
  assert.equal(guardado.fields[1]!.options.length, 2)
})

test('un campo que ya existe y se queda sin texto es un error, no una baja', () => {
  const vacio = formularioDesdeForm(form({ ...basePt, 'fields[0].label': '' }), 'pt', publicado)

  assert.equal(formularioSchema.safeParse(vacio).success, false)
})

test('el id sale del nombre y solo lleva sufijo si ya existe', () => {
  assert.equal(idDesdeNombre('Aula experimental de Aikido', []), 'aula-experimental-de-aikido')
  assert.equal(idDesdeNombre('Contacto geral', ['outro']), 'contacto-geral')
  assert.match(idDesdeNombre('Contacto geral', ['contacto-geral']), /^contacto-geral-[0-9a-f]{8}$/)
})
