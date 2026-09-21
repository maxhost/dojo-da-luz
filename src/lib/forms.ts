import type { ZodError } from 'zod'

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

/** Textarea de una entrada por linea: parrafos, lineas de titulo, frases del resumen. */
export function lineas(form: FormData, campo: string): string[] {
  return texto(form, campo)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
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
  const re = new RegExp(`^${prefijo}\\[(\\d+)\\]\\.(.+)$`)
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

/** Lo que el editor de Home no toca y hay que conservar del archivo publicado. */
type BaseHome = {
  chrome: { nav: { label: string; href: string }[] }
}

/**
 * Se parte del contenido ya publicado y se sobrescribe encima solo lo que el formulario
 * manda (ADR-0026): el menu, y cualquier campo que salga del editor mas adelante,
 * sobrevive por construccion y no porque alguien se acuerde de copiarlo.
 *
 * El orden de las claves lo fija el schema al validar (ADR-0025), no este objeto.
 */
export function homeDesdeForm(form: FormData, base: BaseHome): unknown {
  const tarjeta = (clave: 'adults' | 'children') => ({
    photo: texto(form, `audiences.${clave}.photo`),
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
      // El menu es estructura, no contenido: no esta en el formulario.
      nav: base.chrome.nav,
      footerNote: {
        areas: texto(form, 'chrome.footerNote.areas'),
        orgType: texto(form, 'chrome.footerNote.orgType'),
      },
    },
    hero: {
      eyebrowLines: lineas(form, 'hero.eyebrowLines'),
      titleLines: lineas(form, 'hero.titleLines'),
      titleHighlight: texto(form, 'hero.titleHighlight'),
      tagline: texto(form, 'hero.tagline'),
      poster: texto(form, 'hero.poster'),
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
      photo: texto(form, 'dojo.photo'),
      photoCaption: texto(form, 'dojo.photoCaption'),
      photoAlt: texto(form, 'dojo.photoAlt'),
      teacher: {
        name: texto(form, 'dojo.teacher.name'),
        credentialsLines: lineas(form, 'dojo.teacher.credentialsLines'),
        bio: texto(form, 'dojo.teacher.bio'),
        photo: texto(form, 'dojo.teacher.photo'),
        photoAlt: texto(form, 'dojo.teacher.photoAlt'),
      },
    },
    threshold: {
      label: texto(form, 'threshold.label'),
      titleLines: lineas(form, 'threshold.titleLines'),
      text: texto(form, 'threshold.text'),
      ctaLabel: texto(form, 'threshold.ctaLabel'),
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
 * Lista de parceiros desde el formulario de la seccion 06 (spec 0031). El largo es libre:
 * el editor pinta siempre una fila vacia de mas, y `vacia()` la descarta. Vaciar una fila
 * existente es como se borra un parceiro — no hay boton que apretar sin querer.
 *
 * Una `escala` escrita pero ilegible se deja pasar como `NaN` a proposito: que la rechace
 * el schema y se vea el error en la fila, en vez de descartarla en silencio.
 */
export type FilaParceiro = { nombre: string; src: string; escala?: number }

export function partnersDesdeForm(form: FormData): FilaParceiro[] {
  return filas(form, 'parceiros')
    .filter((fila) => !fila.vacia())
    .map((fila) => {
      const bruto = fila.uno('escala')
      const escala = bruto ? Number(bruto.replace(',', '.')) : null
      return {
        nombre: fila.uno('nombre'),
        src: fila.uno('src'),
        ...(escala === null ? {} : { escala }),
      }
    })
}
