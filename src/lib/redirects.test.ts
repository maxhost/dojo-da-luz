import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ANCHORS_VERIFICADOS, REDIRECTS_WIX, partirDestino, redirectsParaAstro } from './redirects.ts'
import { LOCALES, PAGES, pathFor } from './i18n.ts'

/**
 * El dia que cambie el DNS, estas 36 reglas son lo unico que separa diez años de
 * backlinks de 36 paginas de error. Lo que se prueba no es que el mapa este escrito: es
 * que **ningun destino sea un 404** —ni una ruta que no existe, ni un anchor que no esta—
 * y que ningun origen se pise con otro.
 *
 * El conjunto de rutas vivas no se escribe a mano aca: sale de `PAGES × LOCALES`, la
 * misma fuente de la que salen las 44 paginas. Si mañana se renombra un slug, este test
 * se pone rojo solo.
 */

const RUTAS_VIVAS = new Set(PAGES.flatMap((page) => LOCALES.map((locale) => pathFor(page, locale))))

test('el sitio tiene las 44 rutas de las que salen los destinos', () => {
  assert.equal(RUTAS_VIVAS.size, 44)
})

test('las 36 reglas del inventario estan todas', () => {
  assert.equal(Object.keys(REDIRECTS_WIX).length, 36)
})

test('cada destino es una ruta viva del sitio', () => {
  for (const [origen, destino] of Object.entries(REDIRECTS_WIX)) {
    const { path } = partirDestino(destino)
    assert.ok(RUTAS_VIVAS.has(path), `${origen} apunta a ${path}, que no es ninguna de las 44 rutas`)
  }
})

test('cada destino con anchor apunta a un anchor que existe en esa pagina', () => {
  for (const [origen, destino] of Object.entries(REDIRECTS_WIX)) {
    const { path, anchor } = partirDestino(destino)
    if (anchor === null) continue
    const anchors = ANCHORS_VERIFICADOS[path]
    assert.ok(anchors, `${origen} apunta a ${path}#${anchor} y de ${path} no hay anchors verificados`)
    assert.ok(anchors.includes(anchor), `${origen} apunta a #${anchor}, que no existe en ${path}`)
  }
})

test('ningun anchor verificado apunta a una pagina que no existe', () => {
  for (const path of Object.keys(ANCHORS_VERIFICADOS)) {
    assert.ok(RUTAS_VIVAS.has(path), `la tabla de anchors nombra ${path}, que no es una ruta del sitio`)
  }
})

test('ningun destino es a su vez un origen: un solo salto', () => {
  for (const [origen, destino] of Object.entries(REDIRECTS_WIX)) {
    const { path } = partirDestino(destino)
    assert.ok(!(path in REDIRECTS_WIX), `${origen} → ${path}, que a su vez redirige: son dos saltos`)
  }
})

test('ningun origen redirige a si mismo y ninguno es una ruta viva', () => {
  for (const [origen, destino] of Object.entries(REDIRECTS_WIX)) {
    assert.notEqual(origen, partirDestino(destino).path, `${origen} redirige a si mismo`)
    assert.ok(!RUTAS_VIVAS.has(origen), `${origen} es una ruta viva del sitio: la regla la taparia`)
  }
})

test('los origenes son paths absolutos, sin comodines y sin barra final', () => {
  for (const origen of Object.keys(REDIRECTS_WIX)) {
    assert.ok(origen.startsWith('/'), `${origen} no es absoluto`)
    assert.ok(!/[*\[\]]/.test(origen), `${origen} tiene un comodin: las reglas son una a una`)
    assert.ok(!origen.endsWith('/'), `${origen} termina en barra`)
  }
})

test('los destinos no llevan barra final: trailingSlash never, un solo salto', () => {
  for (const [origen, destino] of Object.entries(REDIRECTS_WIX)) {
    const { path } = partirDestino(destino)
    assert.ok(path === '/' || !path.endsWith('/'), `${origen} → ${destino} tiene barra final`)
  }
})

test('la config de Astro sale del mapa y es 301 en todas', () => {
  const config = redirectsParaAstro()
  assert.equal(Object.keys(config).length, Object.keys(REDIRECTS_WIX).length)
  for (const [origen, regla] of Object.entries(config)) {
    assert.equal(regla.status, 301, `${origen} no es permanente`)
    assert.equal(regla.destination, REDIRECTS_WIX[origen])
  }
})

test('las tres correcciones del crawl estan aplicadas', () => {
  // El documento 09 mandaba estas tres a anchors que no existen en ninguna pagina.
  assert.equal(REDIRECTS_WIX['/parcerias'], '/#parcerias')
  assert.equal(REDIRECTS_WIX['/enlaces-es'], '/es#parcerias')
  assert.equal(REDIRECTS_WIX['/links-fr'], '/fr#parcerias')
})

test('las tres paginas que el sitemap del Wix omite tienen regla', () => {
  for (const origen of ['/contactospt', '/atualidadept', '/enseignant-fr']) {
    assert.ok(origen in REDIRECTS_WIX, `${origen} responde 200 en el Wix y no tiene destino`)
  }
})

test('una URL inventada no matchea ninguna regla', () => {
  for (const inventada of ['/no-existe', '/aikido-fr', '/iniciopt/', '/videos']) {
    assert.ok(!(inventada in REDIRECTS_WIX), `${inventada} matchea y no deberia`)
  }
})

test('partirDestino separa el anchor y trata la raiz como raiz', () => {
  assert.deepEqual(partirDestino('/aulas'), { path: '/aulas', anchor: null })
  assert.deepEqual(partirDestino('/#parcerias'), { path: '/', anchor: 'parcerias' })
  assert.deepEqual(partirDestino('/es#parcerias'), { path: '/es', anchor: 'parcerias' })
  assert.deepEqual(partirDestino('/aulas/adultos#aula-experimental'), { path: '/aulas/adultos', anchor: 'aula-experimental' })
})
