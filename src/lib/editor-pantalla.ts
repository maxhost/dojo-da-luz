import { LOCALES, LOCALE_NAME, isLocale, type Locale } from './i18n'
import { leerContenido } from './publish'
import { indicesSinTraducir } from './traduccion'
import { guardarPagina, type Pagina } from './editor-pagina'

/**
 * Lo que una pagina de administracion necesita para pintarse: el POST ya resuelto y los
 * cuatro archivos leidos.
 *
 * Vive fuera del `.astro` porque son varias pantallas con la misma forma —Adultos,
 * Criancas, Aikido— y la alternativa era la misma pagina copiada una vez por cada una. Lo
 * que cambia entre ellas es el descriptor, y eso es un argumento.
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

export async function pantallaEditor(
  pagina: Pagina,
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
          ? `${pagina.titulo} en portugués publicada, y la estructura y las fotos de los otros tres idiomas al día. El sitio tarda 1 o 2 minutos en regenerarse.`
          : `${pagina.titulo} en ${LOCALE_NAME[publicado]} publicada. El sitio tarda 1 o 2 minutos en regenerarse.`,
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
      const guardado = await guardarPagina(pagina, form, idioma)

      if (guardado.ok) {
        return vacia(`${pagina.rutaBO}?publicado=${idioma}`, idioma)
      }

      estado = guardado.estado
      errores = { [idioma]: guardado.errores }
      enviado[idioma] = pagina.desdeForm(form) as Datos
      aviso = { tipo: guardado.estado === 200 ? 'ok' : 'error', texto: guardado.aviso }
    }
  }

  const shas = {} as Record<Locale, string>
  let archivos: Archivo[] = []
  let sinRepositorio: string | null = null

  try {
    const crudos = await Promise.all(
      LOCALES.map(async (locale) => {
        const archivo = await leerContenido(pagina.archivo(locale))
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
              pagina.listas.map((lista) => [lista, indicesSinTraducir(pt, datos, lista)]),
            )
      return { locale, datos, sinTraducir }
    })
  } catch (error) {
    estado = 503
    sinRepositorio = error instanceof Error ? error.message : String(error)
  }

  return { estado, redirigir: null, aviso, errores, activo, archivos, shas, sinRepositorio }
}

function vacia(redirigir: string, activo: Locale): Pantalla {
  return {
    estado: null,
    redirigir,
    aviso: null,
    errores: {},
    activo,
    archivos: [],
    shas: {} as Record<Locale, string>,
    sinRepositorio: null,
  }
}
