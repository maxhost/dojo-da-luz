import { test } from 'node:test'
import assert from 'node:assert/strict'
import { partnersDesdeForm } from './forms.ts'
import { partnersSchema } from './partners.ts'

/**
 * La lista de parceiros es de largo libre y el editor pinta siempre una fila vacia de mas
 * (spec 0031). Lo que se prueba aca es la frontera: que una fila sin llenar no se publique
 * como un parceiro sin nombre ni logo, y que vaciar una del medio no corra a las de abajo.
 */

function form(filas: Record<string, string>[]): FormData {
  const fd = new FormData()
  filas.forEach((fila, i) => {
    for (const [campo, valor] of Object.entries(fila)) fd.append(`parceiros[${i}].${campo}`, valor)
  })
  return fd
}

const UNO = { nombre: 'Câmara Municipal de Lisboa', src: 'https://ejemplo.test/cml.png' }
const DOS = { nombre: 'Montessori', src: 'https://ejemplo.test/montessori.png' }

test('la fila vacia del final no se publica', () => {
  const lista = partnersDesdeForm(form([UNO, { nombre: '', src: '', escala: '' }]))
  assert.equal(lista.length, 1)
  assert.deepEqual(lista[0], UNO)
})

test('vaciar una fila del medio la borra sin tocar las demas', () => {
  const lista = partnersDesdeForm(form([UNO, { nombre: '', src: '' }, DOS]))
  assert.deepEqual(lista, [UNO, DOS])
})

test('la escala se guarda como numero y solo cuando esta escrita', () => {
  const lista = partnersDesdeForm(form([{ ...UNO, escala: '1,45' }, { ...DOS, escala: '' }]))
  assert.equal(lista[0]!.escala, 1.45)
  assert.equal('escala' in lista[1]!, false)
})

test('una escala ilegible falla en el schema en vez de desaparecer', () => {
  const lista = partnersDesdeForm(form([{ ...UNO, escala: 'grande' }]))
  const validado = partnersSchema.safeParse(lista)
  assert.equal(validado.success, false)
  assert.equal(validado.error!.issues[0]!.path.join('.'), '0.escala')
})

test('una fila a medio llenar no pasa la validacion', () => {
  const lista = partnersDesdeForm(form([{ nombre: 'Sin logo', src: '' }]))
  const validado = partnersSchema.safeParse(lista)
  assert.equal(validado.success, false)
  assert.equal(validado.error!.issues[0]!.path.join('.'), '0.src')
})

test('la lista vacia es valida: es una seccion sin parceiros', () => {
  assert.deepEqual(partnersSchema.parse(partnersDesdeForm(form([{ nombre: '', src: '' }]))), [])
})
