import type { ZodError } from 'zod'
import { CLAVES_MEDIA } from './media.ts'

/**
 * `FormData` → objeto plano para pasarle a zod (spec 0021). No valida nada: normaliza.
 * La validacion es la del build, con los mismos schemas, un paso despues.
 */

export function texto(form: FormData, campo: string): string {
  return String(form.get(campo) ?? '').trim()
}

/** Campo que el schema declara `nullable`: vacio es `null`, no cadena vacia. */
export function opcional(form: FormData, campo: string): string | null {
  return texto(form, campo) || null
}

export function numero(form: FormData, campo: string): number | null {
  const valor = texto(form, campo)
  if (!valor) return null
  const n = Number(valor.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/** Entero con piso: para `orden`, donde un vacio no puede tumbar el formulario entero. */
export function entero(form: FormData, campo: string, porDefecto: number): number {
  const n = numero(form, campo)
  return n !== null && Number.isInteger(n) ? n : porDefecto
}

/**
 * Un texto cortado en renglones, sin vacios. Es como se edita una lista **anidada**
 * —los parrafos de una seccion de `/aikido`, que viven dentro de una fila de otra lista—
 * porque una tabla adentro de una tabla es mas pantalla de la que el contenido merece
 * (ADR-0033).
 */
export function renglones(valor: string): string[] {
  return valor
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

/** Textarea de una entrada por linea: parrafos, lineas de titulo, frases del resumen. */
export function lineas(form: FormData, campo: string): string[] {
  return renglones(texto(form, campo))
}

export type Fila = {
  uno(campo: string): string
  muchos(campo: string): string[]
  vacia(): boolean
}

/**
 * Filas repetidas con nombres `prefijo[0].campo`. El editor de horarios siempre pinta una
 * fila vacia de mas para poder agregar sin JavaScript: `vacia()` es lo que la descarta.
 */
export function filas(form: FormData, prefijo: string): Fila[] {
  // El prefijo puede traer puntos (`pricing.items`): se escapa para que no sea comodin.
  const escapado = prefijo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`^${escapado}\\[(\\d+)\\]\\.(.+)$`)
  const porIndice = new Map<number, Map<string, string[]>>()

  for (const [clave, valor] of form.entries()) {
    const m = re.exec(clave)
    if (!m) continue

    const indice = Number(m[1])
    const campo = m[2]!
    const campos = porIndice.get(indice) ?? new Map<string, string[]>()
    const previos = campos.get(campo) ?? []
    previos.push(String(valor).trim())
    campos.set(campo, previos)
    porIndice.set(indice, campos)
  }

  return [...porIndice.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, campos]) => ({
      uno: (campo) => campos.get(campo)?.[0] ?? '',
      muchos: (campo) => (campos.get(campo) ?? []).filter(Boolean),
      vacia: () => [...campos.values()].flat().every((v) => v === ''),
    }))
}

/**
 * Errores de zod indexados por ruta (`seo.title`, `horarios.0.hasta`) para pintarlos al
 * lado del campo culpable. La raiz —refinements del objeto entero— va en `(raiz)`.
 */
export function erroresDe(error: ZodError): Record<string, string> {
  const mapa: Record<string, string> = {}
  for (const issue of error.issues) {
    const ruta = issue.path.join('.') || '(raiz)'
    mapa[ruta] ??= issue.message
  }
  return mapa
}

/** Resumen para el aviso de arriba del formulario: "seo.title: campo requerido". */
export function resumenDeErrores(errores: Record<string, string>): string {
  return Object.entries(errores)
    .map(([ruta, mensaje]) => `${ruta}: ${mensaje}`)
    .join(' · ')
}

/** Un error exacto, o el primero de su rama: `resumen` tapa a `resumen.2`. */
export function errorDe(errores: Record<string, string>, ruta: string): string | undefined {
  return (
    errores[ruta] ?? Object.entries(errores).find(([clave]) => clave.startsWith(`${ruta}.`))?.[1]
  )
}

/**
 * El orden de las claves lo fija el schema al validar (ADR-0025), no este objeto.
 */
export function homeDesdeForm(form: FormData): unknown {
  const tarjeta = (clave: 'adults' | 'children') => ({
    photoAlt: texto(form, `audiences.${clave}.photoAlt`),
    title: texto(form, `audiences.${clave}.title`),
    lead: texto(form, `audiences.${clave}.lead`),
  })

  return {
    seo: { title: texto(form, 'seo.title'), description: texto(form, 'seo.description') },
    chrome: {
      caption: texto(form, 'chrome.caption'),
      menuLabel: texto(form, 'chrome.menuLabel'),
      skipLink: texto(form, 'chrome.skipLink'),
    },
    hero: {
      eyebrowLines: lineas(form, 'hero.eyebrowLines'),
      titleLines: lineas(form, 'hero.titleLines'),
      titleHighlight: texto(form, 'hero.titleHighlight'),
      tagline: texto(form, 'hero.tagline'),
    },
    practice: {
      label: texto(form, 'practice.label'),
      titleLines: lineas(form, 'practice.titleLines'),
      paragraphs: lineas(form, 'practice.paragraphs'),
    },
    audiences: {
      label: texto(form, 'audiences.label'),
      title: texto(form, 'audiences.title'),
      intro: texto(form, 'audiences.intro'),
      adultsLabel: texto(form, 'audiences.adultsLabel'),
      childrenLabel: texto(form, 'audiences.childrenLabel'),
      ctaLabel: texto(form, 'audiences.ctaLabel'),
      adults: tarjeta('adults'),
      children: tarjeta('children'),
    },
    places: {
      label: texto(form, 'places.label'),
      titleLines: lineas(form, 'places.titleLines'),
      lead: texto(form, 'places.lead'),
      ctaLabel: texto(form, 'places.ctaLabel'),
    },
    dojo: {
      label: texto(form, 'dojo.label'),
      titleLines: lineas(form, 'dojo.titleLines'),
      photoCaption: texto(form, 'dojo.photoCaption'),
      photoAlt: texto(form, 'dojo.photoAlt'),
      teacher: {
        name: texto(form, 'dojo.teacher.name'),
        credentialsLines: lineas(form, 'dojo.teacher.credentialsLines'),
        bio: texto(form, 'dojo.teacher.bio'),
        photoAlt: texto(form, 'dojo.teacher.photoAlt'),
      },
    },
    threshold: {
      label: texto(form, 'threshold.label'),
      titleLines: lineas(form, 'threshold.titleLines'),
      text: texto(form, 'threshold.text'),
      ctaLabel: texto(form, 'threshold.ctaLabel'),
      formId: texto(form, 'threshold.formId'),
    },
    partnerships: {
      label: texto(form, 'partnerships.label'),
      title: texto(form, 'partnerships.title'),
    },
    resumen: lineas(form, 'resumen'),
  }
}

/** `estado` no sale del formulario: se cambia desde el listado, con su propio boton. */
export function dojoDesdeForm(form: FormData, estado: 'activo' | 'archivado'): unknown {
  const lat = numero(form, 'geo.lat')
  const lng = numero(form, 'geo.lng')

  return {
    slug: texto(form, 'slug'),
    estado,
    orden: entero(form, 'orden', 0),
    nombre: texto(form, 'nombre'),
    dojo: texto(form, 'dojo'),
    instalacion: opcional(form, 'instalacion'),
    direccion: {
      calle: opcional(form, 'direccion.calle'),
      codigoPostal: opcional(form, 'direccion.codigoPostal'),
      localidad: texto(form, 'direccion.localidad'),
      pais: texto(form, 'direccion.pais').toUpperCase(),
    },
    geo: lat !== null && lng !== null ? { lat, lng } : null,
    telefono: opcional(form, 'telefono'),
    horarios: filas(form, 'horarios')
      .filter((f) => !f.vacia())
      .map((f) => ({
        audiencia: f.uno('audiencia'),
        variante: f.uno('variante') || null,
        dias: f.muchos('dias'),
        desde: f.uno('desde'),
        hasta: f.uno('hasta'),
      })),
  }
}

/**
 * Objeto → valores planos indexados por el mismo nombre que usa el formulario
 * (`seo.title`, `hero.tagline`). Los arrays de texto se pintan como textarea, una entrada
 * por linea. Es el camino inverso de los constructores de arriba: lo que permite volver a
 * pintar exactamente lo que el usuario mando cuando la validacion falla.
 */
export function aplanar(
  valor: unknown,
  prefijo = '',
  salida: Record<string, string> = {},
): Record<string, string> {
  if (valor === null || valor === undefined) {
    salida[prefijo] = ''
  } else if (Array.isArray(valor)) {
    if (valor.every((v) => typeof v === 'string' || typeof v === 'number')) {
      salida[prefijo] = valor.join('\n')
    } else {
      valor.forEach((v, i) => aplanar(v, `${prefijo}.${i}`, salida))
    }
  } else if (typeof valor === 'object') {
    for (const [clave, v] of Object.entries(valor)) {
      aplanar(v, prefijo ? `${prefijo}.${clave}` : clave, salida)
    }
  } else {
    salida[prefijo] = String(valor)
  }
  return salida
}

/**
 * Lista de parceiros desde el formulario (specs 0031 y 0033). El largo es libre: el editor
 * pinta siempre una fila vacia de mas, y se agrega llenandola.
 *
 * Una fila sale de la lista por dos caminos: tildando "quitar", o quedandose sin logo. Los
 * dos son explicitos y ninguno es un boton que se aprieta sin querer.
 *
 * Una `escala` escrita pero ilegible se deja pasar como `NaN` a proposito: que la rechace
 * el schema y se vea el error en la fila, en vez de descartarla en silencio.
 */
export type FilaParceiro = { nombre: string; src: string; escala?: number }

export function partnersDesdeForm(form: FormData): FilaParceiro[] {
  return filas(form, 'parceiros')
    .filter((fila) => !fila.vacia() && fila.uno('quitar') !== 'si' && fila.uno('src') !== '')
    .map((fila) => {
      const bruto = fila.uno('escala')
      const escala = bruto ? Number(bruto.replace(',', '.')) : null
      return {
        // Un logo nuevo no trae nombre: lleva el generico, que es lo que se lee sin verlo.
        nombre: fila.uno('nombre') || 'Parceiro do Dojo da Luz',
        src: fila.uno('src'),
        ...(escala === null ? {} : { escala }),
      }
    })
}

/**
 * Las cinco imagenes de la portada. Viajan con el formulario del idioma —se editan en la
 * seccion donde se ven (ADR-0029)— pero se guardan una sola vez, en su propio archivo.
 * El prefijo `media.` es lo que las separa del resto de los campos.
 */
export function mediaDesdeForm(form: FormData): Record<string, string> {
  return Object.fromEntries(CLAVES_MEDIA.map((clave) => [clave, texto(form, `media.${clave}`)]))
}
