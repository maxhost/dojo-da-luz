import { LOCALES, LOCALE_NAME, isLocale, type Locale } from './i18n'
import { leerContenido } from './publish'
import { LISTAS_AUDIENCIA, indicesSinTraducir } from './traduccion'
import {
  RUTA_BO,
  TITULO_AUDIENCIA,
  audienciaDesdeForm,
  guardarAudiencia,
  ruta,
  type PaginaAudiencia,
} from './audiencia-edicion'

/**
 * Lo que la pagina de administracion necesita para pintarse: el POST ya resuelto y los
 * cuatro archivos leidos (spec 0036).
 *
 * Vive fuera del `.astro` porque son **dos pantallas** —Adultos y Criancas— y la
 * alternativa era la misma pagina copiada dos veces. Lo que cambia entre las dos es el
 * archivo que escriben, y eso es un argumento.
 */

export type Datos = Record<string, any>

export type Archivo = {
  locale: Locale
  datos: Datos
  /** Ruta de lista → indices cuyo texto sigue siendo el portugues. */
  sinTraducir: Record<string, number[]>
}

export type Pantalla = {
  estado: number | null
  redirigir: string | null
  aviso: { tipo: 'ok' | 'error'; texto: string } | null
  errores: Partial<Record<Locale, Record<string, string>>>
  activo: Locale
  archivos: Archivo[]
  shas: Record<Locale, string>
  sinRepositorio: string | null
}

export async function pantallaAudiencia(
  pagina: PaginaAudiencia,
  request: Request,
  url: URL,
): Promise<Pantalla> {
  let errores: Partial<Record<Locale, Record<string, string>>> = {}
  const enviado: Partial<Record<Locale, Datos>> = {}
  let aviso: Pantalla['aviso'] = null
  let estado: number | null = null

  const idiomaPedido = url.searchParams.get('idioma') ?? ''
  let activo: Locale = isLocale(idiomaPedido) ? idiomaPedido : 'pt'

  const publicado = url.searchParams.get('publicado')
  if (publicado && isLocale(publicado)) {
    activo = publicado
    aviso = {
      tipo: 'ok',
      texto:
        publicado === 'pt'
          ? `${TITULO_AUDIENCIA[pagina]} en portugués publicada, y la estructura y las fotos de los otros tres idiomas al día. El sitio tarda 1 o 2 minutos en regenerarse.`
          : `${TITULO_AUDIENCIA[pagina]} en ${LOCALE_NAME[publicado]} publicada. El sitio tarda 1 o 2 minutos en regenerarse.`,
    }
  }

  if (request.method === 'POST') {
    const form = await request.formData()
    const idioma = String(form.get('idioma') ?? '')

    if (!isLocale(idioma)) {
      estado = 400
      aviso = { tipo: 'error', texto: 'Idioma desconocido.' }
    } else {
      activo = idioma
      const guardado = await guardarAudiencia(form, idioma, pagina)

      if (guardado.ok) {
        return vacia({
          redirigir: `${RUTA_BO[pagina]}?publicado=${idioma}`,
          activo: idioma,
        })
      }

      estado = guardado.estado
      errores = { [idioma]: guardado.errores }
      enviado[idioma] = audienciaDesdeForm(form) as Datos
      aviso = { tipo: guardado.estado === 200 ? 'ok' : 'error', texto: guardado.aviso }
    }
  }

  const shas = {} as Record<Locale, string>
  let archivos: Archivo[] = []
  let sinRepositorio: string | null = null

  try {
    const crudos = await Promise.all(
      LOCALES.map(async (locale) => {
        const archivo = await leerContenido(ruta(pagina, locale))
        shas[locale] = archivo.sha
        return { locale, publicado: JSON.parse(archivo.contenido) as Datos }
      }),
    )

    const pt = crudos.find((c) => c.locale === 'pt')!.publicado

    archivos = crudos.map(({ locale, publicado: datosPublicados }) => {
      const datos = enviado[locale] ?? datosPublicados
      // En portugues la marca no tiene sentido: comparar el portugues consigo mismo diria
      // que todo esta sin traducir.
      const sinTraducir =
        locale === 'pt'
          ? {}
          : Object.fromEntries(
              LISTAS_AUDIENCIA.map((lista) => [lista, indicesSinTraducir(pt, datos, lista)]),
            )
      return { locale, datos, sinTraducir }
    })
  } catch (error) {
    estado = 503
    sinRepositorio = error instanceof Error ? error.message : String(error)
  }

  return { estado, redirigir: null, aviso, errores, activo, archivos, shas, sinRepositorio }
}

function vacia(parcial: { redirigir: string; activo: Locale }): Pantalla {
  return {
    estado: null,
    redirigir: parcial.redirigir,
    aviso: null,
    errores: {},
    activo: parcial.activo,
    archivos: [],
    shas: {} as Record<Locale, string>,
    sinRepositorio: null,
  }
}
