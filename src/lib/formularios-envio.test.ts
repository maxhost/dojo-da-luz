import { test } from 'node:test'
import assert from 'node:assert/strict'
import { componerEmail, validarEnvio } from './formularios-envio.ts'
import { formularioSchema, type Formulario } from './formularios.ts'

/**
 * El servidor no acepta campos definidos por el navegador (ADR-0046): carga la definicion
 * publicada, valida contra ella y compone el correo con sus propios labels. Lo que se prueba
 * aca es cada puerta por la que un POST manipulado podria entrar.
 */

const cuatro = (t: string) => ({ pt: t, es: t, fr: t, en: t })
const sinAyuda = { pt: null, es: null, fr: null, en: null }

const campo = (extra: Record<string, unknown>) => ({
  id: 'x',
  type: 'text',
  required: false,
  label: cuatro('Campo'),
  help: sinAyuda,
  presentation: null,
  options: [],
  ...extra,
})

const formulario: Formulario = formularioSchema.parse({
  id: 'aula',
  nombre: 'Aula experimental',
  estado: 'activo',
  submitLabel: cuatro('Enviar'),
  successMessage: cuatro('Obrigado'),
  fields: [
    campo({ id: 'nome', required: true, label: { pt: 'Nome', es: 'Nombre', fr: 'Nom', en: 'Name' } }),
    campo({ id: 'idade', type: 'number', required: true, label: cuatro('Idade') }),
    campo({ id: 'email', type: 'email', required: true, label: cuatro('E-mail') }),
    campo({ id: 'dia', type: 'date', required: true, label: cuatro('Dia') }),
    campo({
      id: 'horario',
      type: 'singleChoice',
      required: true,
      presentation: 'select',
      label: cuatro('Horário'),
      options: [
        { id: 'seg', label: { pt: 'segunda-feira', es: 'lunes', fr: 'lundi', en: 'monday' } },
        { id: 'qua', label: cuatro('quarta-feira') },
      ],
    }),
    campo({ id: 'obs', type: 'textarea', label: cuatro('Observações') }),
  ],
})

const completo = {
  nome: 'Ana',
  idade: '34',
  email: 'ana@exemplo.pt',
  dia: '2026-10-05',
  horario: 'seg',
}

const con = (extra: Record<string, unknown>) => validarEnvio(formulario, { ...completo, ...extra })

test('una respuesta completa pasa y el e-mail del visitante es el replyTo', () => {
  const resultado = con({ obs: 'Sem lesões' })

  assert.equal(resultado.ok, true)
  assert.equal(resultado.replyTo, 'ana@exemplo.pt')
  assert.equal(resultado.lineas.length, 6)
})

test('un campo obligatorio vacio se rechaza', () => {
  assert.equal(con({ nome: '   ' }).ok, false)
})

test('un campo opcional vacio no ocupa una linea del correo', () => {
  const resultado = con({ obs: '' })

  assert.equal(resultado.ok, true)
  assert.equal(resultado.lineas.length, 5)
})

test('un campo que el formulario no declara es un rechazo, no un campo ignorado', () => {
  assert.equal(con({ pirata: 'x' }).ok, false)
})

test('una opcion inexistente se rechaza aunque el tipo sea correcto', () => {
  assert.equal(con({ horario: 'domingo' }).ok, false)
})

test('e-mail, numero y fecha se validan de verdad', () => {
  assert.equal(con({ email: 'ana(at)exemplo' }).ok, false)
  assert.equal(con({ idade: 'trinta' }).ok, false)
  assert.equal(con({ dia: '5 de outubro' }).ok, false)
  assert.equal(con({ dia: '2026-13-45' }).ok, false)
})

test('un tipo de dato que no corresponde se rechaza', () => {
  assert.equal(con({ nome: ['Ana', 'Otra'] }).ok, false)
  assert.equal(validarEnvio(formulario, 'no soy un objeto').ok, false)
  assert.equal(validarEnvio(formulario, [completo]).ok, false)
})

test('un texto larguisimo no entra', () => {
  assert.equal(con({ nome: 'a'.repeat(501) }).ok, false)
  assert.equal(con({ obs: 'a'.repeat(4001) }).ok, false)
})

test('seleccion multiple: lista de opciones existentes, sin repetir', () => {
  const multiple = formularioSchema.parse({
    ...formulario,
    fields: [
      campo({
        id: 'dias',
        type: 'multipleChoice',
        required: true,
        presentation: 'checkbox',
        label: cuatro('Dias'),
        options: [{ id: 'seg', label: cuatro('segunda') }, { id: 'qua', label: cuatro('quarta') }],
      }),
    ],
  })

  assert.equal(validarEnvio(multiple, { dias: ['seg', 'qua'] }).ok, true)
  assert.equal(validarEnvio(multiple, { dias: ['seg', 'seg'] }).ok, false)
  assert.equal(validarEnvio(multiple, { dias: ['domingo'] }).ok, false)
  assert.equal(validarEnvio(multiple, { dias: [] }).ok, false)
  assert.equal(validarEnvio(multiple, { dias: 'seg' }).ok, true)
})

test('el correo lleva los labels portugueses del servidor, no los del cliente', () => {
  const resultado = validarEnvio(formulario, completo)
  assert.equal(resultado.ok, true)

  const correo = componerEmail({
    formulario,
    locale: 'fr',
    source: '/cours',
    lineas: resultado.lineas,
  })

  assert.match(correo.subject, /Aula experimental/)
  assert.match(correo.text, /Nome: Ana/)
  assert.match(correo.text, /Horário: segunda-feira/)
  assert.match(correo.text, /Idioma do visitante: Français/)
  assert.doesNotMatch(correo.text, /Nom:/)
})

test('el HTML del correo escapa lo que escribio el visitante', () => {
  const resultado = validarEnvio(formulario, { ...completo, obs: '<script>alert(1)</script>' })
  assert.equal(resultado.ok, true)

  const correo = componerEmail({ formulario, locale: 'pt', source: '', lineas: resultado.lineas })

  assert.doesNotMatch(correo.html, /<script>/)
  assert.match(correo.html, /&lt;script&gt;/)
})
