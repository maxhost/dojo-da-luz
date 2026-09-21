import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LISTAS_AULAS, indicesSinTraducir, propagarEstructura } from './traduccion.ts'

/**
 * El ADR-0030 dice que algo que no existe en portugues no puede existir en ingles. Lo que
 * se prueba aca es esa frase: que el largo de cada lista lo decida siempre el portugues, y
 * que propagar la estructura no pise una traduccion ya hecha.
 */

const LISTAS = ['pricing.items'] as const

const cuota = (name: string) => ({ name, price: '35 €/mês', detail: 'Até 3 aulas por semana' })

const pt = (...names: string[]) => ({
  pricing: { label: 'Quotas', items: names.map(cuota) },
  qa: { items: [{ pregunta: 'P?', respuesta: 'R.' }] },
})

test('una fila nueva en portugues nace en el otro idioma con el texto portugues', () => {
  const otro = propagarEstructura(pt('Normal', 'Anual'), pt('Normal'), LISTAS)

  assert.equal(otro.pricing.items.length, 2)
  assert.deepEqual(otro.pricing.items[1], cuota('Anual'))
})

test('quitar una fila en portugues la borra en el otro idioma', () => {
  const traducido = {
    pricing: { label: 'Cuotas', items: [cuota('Normal'), cuota('Anual')] },
    qa: { items: [{ pregunta: 'P?', respuesta: 'R.' }] },
  }

  const otro = propagarEstructura(pt('Normal'), traducido, LISTAS)

  assert.equal(otro.pricing.items.length, 1)
  assert.equal(otro.pricing.items[0]!.name, 'Normal')
})

test('propagar no pisa lo ya traducido', () => {
  const traducido = {
    pricing: { label: 'Cuotas', items: [{ name: 'Normal', price: '35 €/mes', detail: 'Hasta 3 clases por semana' }] },
    qa: { items: [{ pregunta: 'P?', respuesta: 'R.' }] },
  }

  const otro = propagarEstructura(pt('Normal', 'Anual'), traducido, LISTAS)

  assert.equal(otro.pricing.items[0]!.detail, 'Hasta 3 clases por semana')
  assert.equal(otro.pricing.items[1]!.detail, 'Até 3 aulas por semana')
})

test('lo que no es una lista declarada no se toca', () => {
  const traducido = {
    pricing: { label: 'Cuotas', items: [cuota('Normal')] },
    qa: { items: [{ pregunta: '¿P?', respuesta: 'R.' }] },
  }

  const otro = propagarEstructura(pt('Normal'), traducido, LISTAS)

  assert.equal(otro.pricing.label, 'Cuotas')
  assert.deepEqual(otro.qa.items, [{ pregunta: '¿P?', respuesta: 'R.' }])
})

test('propagar no muta el original', () => {
  const traducido = { pricing: { label: 'Cuotas', items: [cuota('Normal')] }, qa: { items: [] } }
  propagarEstructura(pt('Normal', 'Anual'), traducido, LISTAS)

  assert.equal(traducido.pricing.items.length, 1)
})

test('una fila copiada tal cual queda marcada como sin traducir', () => {
  const fuente = pt('Normal', 'Anual')
  const traducido = {
    pricing: { label: 'Cuotas', items: [{ name: 'Normal', price: '35 €/mes', detail: 'Hasta 3 clases por semana' }] },
    qa: { items: [] },
  }

  const otro = propagarEstructura(fuente, traducido, LISTAS)

  assert.deepEqual(indicesSinTraducir(fuente, otro, 'pricing.items'), [1])
})

test('las cinco listas de /aulas son las declaradas', () => {
  assert.deepEqual(
    [...LISTAS_AULAS],
    ['pricing.items', 'pricing.notes', 'children.paragraphs', 'children.facts', 'qa.items'],
  )
})

test('una lista de textos sueltos se propaga igual que una de objetos', () => {
  const fuentePt = { children: { paragraphs: ['Um.', 'Dois.'] } }
  const traducido = { children: { paragraphs: ['Uno.'] } }

  const otro = propagarEstructura(fuentePt, traducido, ['children.paragraphs'])

  assert.deepEqual(otro.children.paragraphs, ['Uno.', 'Dois.'])
})
