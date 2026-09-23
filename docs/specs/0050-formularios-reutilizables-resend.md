---
spec: 0050
fecha: 2026-09-22
estado: cerrada
resumen: Constructor acotado de formularios reutilizables y traducibles, asignación por formId a los CTA y envío validado al administrador mediante Resend.
disjunta: no
archivos: content/forms.json, content/*/{home,classes,adults,children}.json, db/migrations/0003_form_rate_limit.sql, src/lib/{formularios,formularios-edicion,formularios-envio,schemas,traduccion}.ts, src/pages/admin/formularios/**, src/pages/api/formularios/enviar.ts, src/components/{ContactForm,FormModal,HomeView,ClassesView,AudienceView}.astro, src/components/admin/**, src/layouts/Admin.astro, package.json
---

# 0050 — Formularios reutilizables, traducibles y enviados por Resend

## Problema

El formulario de Contactos y los modales locales tienen hoy una UI fija con botón
deshabilitado. Los CTA de aula experimental arrastran `formUrl` externos. No existe una
pantalla donde una persona no técnica pueda crear un formulario, ordenar campos, mantener
opciones como los horarios o decidir qué formulario abre cada botón.

El caso inicial es el CTA **«Marcar aula experimental»** de `/aulas`: debe abrir un modal
mobile-first con un formulario propio y enviar la respuesta a una casilla administrativa
mediante Resend.

## Alcance

**Entra:**

- entidad global `content/forms.json`;
- listado, alta, edición y archivado en `/admin/formularios`;
- pestañas Português/Español/Français/English con el mismo contrato que los editores;
- estructura editable solo en portugués y traducción en los otros idiomas;
- campos y opciones ordenables, sin límite de cantidad;
- tipos `text`, `textarea`, `email`, `tel`, `number`, `date`, `singleChoice` y
  `multipleChoice`;
- presentación configurable de selección: radio/select y checkbox/multiSelect;
- label, ayuda opcional y obligatoriedad por campo;
- texto del botón y mensaje de confirmación por idioma;
- selector de formulario por nombre en los editores de Home, Aulas, Adultos y Crianças;
- relación persistida por `formId`, nunca por nombre ni URL;
- modal y formulario público mobile-first;
- endpoint server-side validado y envío por Resend;
- estados accesibles: listo, enviando, enviado y error;
- honeypot y rate limit persistente por IP hasheada;
- formulario inicial «Aula experimental de Aikido» con los campos acordados.

**No entra:**

- leer o sincronizar horarios desde Dojos;
- lógica condicional entre campos;
- adjuntos;
- guardar respuestas o mostrar una bandeja en el backoffice;
- CRM, autorespuestas o newsletters;
- destinatarios distintos por formulario;
- edición visual libre, HTML escrito por el admin o tipos de campo fuera del catálogo;
- migrar en esta spec los Google Forms de Iaido y Tai Chi;
- recuperación de contraseña de la spec 0022.

## Modelo de contenido

`content/forms.json` es un solo archivo para que IDs y estructura no diverjan entre
idiomas. Forma normativa:

```ts
type Locale = 'pt' | 'es' | 'fr' | 'en'
type Localizado = Record<Locale, string>

type Opcion = {
  id: string
  label: Localizado
}

type Campo = {
  id: string
  type: 'text' | 'textarea' | 'email' | 'tel' | 'number' | 'date' |
        'singleChoice' | 'multipleChoice'
  required: boolean
  label: Localizado
  help: Record<Locale, string | null>
  presentation: 'radio' | 'select' | 'checkbox' | 'multiSelect' | null
  options: Opcion[]
}

type Formulario = {
  id: string
  nombre: string
  estado: 'activo' | 'archivado'
  submitLabel: Localizado
  successMessage: Localizado
  fields: Campo[]
}

type Formularios = { forms: Formulario[] }
```

Reglas de schema:

- IDs de formularios, campos y opciones son únicos y estables.
- `nombre` es obligatorio y no localizado: identifica el formulario en el BO.
- Todo formulario tiene al menos un campo.
- Solo campos de selección admiten opciones y deben tener al menos una.
- `singleChoice` solo admite `radio|select`.
- `multipleChoice` solo admite `checkbox|multiSelect`.
- El resto lleva `presentation: null` y `options: []`.
- Todo texto portugués es obligatorio. Los demás nacen con el portugués y pueden quedar
  marcados como pendientes de traducción.

Los IDs los genera el servidor al crear elementos. No se muestran ni se editan. El parser
del POST conserva el ID existente y asigna uno nuevo solo a una fila realmente nueva.

## Editor del backoffice

### Listado `/admin/formularios`

- nombre, estado y cantidad de campos;
- «Nuevo formulario»;
- editar, archivar y reactivar;
- un archivado muestra qué páginas todavía lo referencian;
- un formulario archivado no aparece en selectores nuevos, pero una referencia existente
  sigue visible con la marca «Archivado».

### Edición `/admin/formularios/[id]`

Usa el patrón mobile-first ya aprobado: sidebar general, pestañas fijas de idioma, mini
sidebar «Ir a una sección», tarjetas y publicación fija.

En Português:

- nombre interno, estado, botón y confirmación;
- añadir, quitar y reordenar campos;
- tipo, obligatorio, label y ayuda;
- para selección: presentación y lista ordenable de opciones;
- cambiar un tipo con datos incompatibles exige confirmación en UI y el servidor limpia
  `presentation/options` según el schema.

En es/fr/en:

- estructura bloqueada y visible;
- solo label, ayuda, opciones, botón y confirmación;
- marca «Sin traducir» cuando coincide con portugués;
- nunca se pisa una traducción existente al propagar.

La publicación usa SHA y control de concurrencia como las otras entidades.

## Formulario inicial

Nombre interno: `Aula experimental de Aikido`.

| Orden | Label PT | Tipo | Obligatorio | Presentación/opciones |
|---|---|---|---|---|
| 1 | Nome | text | sí | — |
| 2 | Idade | number | sí | — |
| 3 | Contacto telefónico | tel | sí | — |
| 4 | E-mail | email | sí | — |
| 5 | Já praticou Aikido anteriormente? | singleChoice | sí | radio: Sim / Não |
| 6 | Escolha o dia do mês a que pretendem vir fazer a sua aula | date | sí | — |
| 7 | Escolha a hora e o dia da semana para fazer a aula experimental | singleChoice | sí | select, opciones siguientes |
| 8 | Observações (Caso tenha alguma questão de saúde, p.f. informe o professor de Aikido antes da aula começar) | textarea | no | — |

Opciones iniciales del campo 7, guardadas como texto y editables únicamente desde el
formulario:

1. segunda-feira 20h30-21h30 (Pista Prof. Moniz Pereira)
2. quarta-feira 20h30-21h30 (Pista Prof. Moniz Pereira)
3. sábado 11h-12h30 (Pista Prof. Moniz Pereira)
4. terça-feira 20h00-21h15 (Dojo da Luz - Benfica)
5. quinta-feira 20h00-21h15 (Dojo da Luz - Benfica)
6. terça-feira 7h00-8h00 (Dojo da Luz - Benfica)
7. quinta-feira 7h00-8h00 (Dojo da Luz - Benfica)
8. quarta-feira 12h30-13h45, Almoço (Dojo da Luz - Benfica)
9. sexta-feira 12h30-13h45, Almoço (Dojo da Luz - Benfica)

El cierre «Arigato Gozaimashita!» forma parte del mensaje de confirmación, no es un campo.

## Asignación a páginas

Se reemplaza el destino externo por `formId` en los CTA locales de Home, Aulas, Adultos y
Crianças. Cada editor muestra un `<select>` con el nombre de los formularios activos. El
valor persistido y enviado al front es el ID.

`FormModal` recibe `formId` y `locale`; carga la definición ya validada y pinta campos en
orden. No recibe una definición desde props ni desde el navegador.

La migración asigna el formulario inicial a `/aulas`. Home, Adultos y Crianças conservan
su asignación local actual si ya usan el formulario propio; el editor permite cambiarla.
Los `formUrl` heredados dejan de ser la fuente para esos cuatro CTA. Los externos de
Outras artes permanecen intactos.

## Contrato público y Resend

`POST /api/formularios/enviar` acepta `application/json`:

```ts
{
  formId: string
  locale: Locale
  source: string
  website: string       // honeypot; debe llegar vacío
  values: Record<string, string | string[]>
}
```

El servidor:

1. carga el formulario publicado por `formId` y exige estado activo;
2. rechaza campos desconocidos, tipos incorrectos, opciones inexistentes y obligatorios
   vacíos;
3. valida email, número y fecha; limita largos de texto y tamaño total;
4. ignora labels enviados por el cliente y compone el email con la definición del servidor;
5. aplica rate limit por hash de IP en Neon; nunca guarda IP cruda ni valores del form;
6. envía con `FORM_FROM_EMAIL` a `FORM_TO_EMAIL` y usa el campo email como `replyTo`;
7. devuelve un resultado genérico localizado por la UI, sin detalles internos de Resend.

La API key solo se lee server-side. La ausencia de cualquiera de las tres variables de
email deja el botón deshabilitado en builds de preview/desarrollo y el endpoint responde
503; nunca simula éxito.

## Reparto de implementación

### UI preparada por Codex

- componentes visuales del formulario y modal;
- estados listo/enviando/enviado/error;
- controles mobile-first para todos los tipos;
- editor visual de campos/opciones y selector `formId` en páginas;
- atributos `name/data-field-id` estables según el contrato anterior;
- botón sin envío real hasta que exista el endpoint.

### Feature conectada por Claude Code

- schemas, lectura y publicación de `forms.json`;
- rutas CRUD y parsing seguro del editor;
- propagación PT → idiomas y control de concurrencia;
- migración de contenido `formUrl` → `formId`;
- endpoint, rate limit, variables de entorno y Resend;
- conexión del estado UI al endpoint y pruebas.

Claude Code no redefine markup, labels, tipos ni flujo del editor: consume el contrato de
esta spec y conecta los componentes preparados.

## Archivos

| Archivo | Acción |
|---|---|
| `content/forms.json` | crear: entidad y formulario inicial |
| `content/{pt,es,fr,en}/{home,classes,adults,children}.json` | editar: `formId` |
| `src/lib/formularios.ts` | crear: schema, tipos y lectura |
| `src/lib/formularios-edicion.ts` | crear: POST, propagación y publicación |
| `src/lib/formularios-envio.ts` | crear: validación de respuestas y composición de email |
| `src/lib/{schemas,traduccion}.ts` | editar: referencias y reglas de propagación |
| `src/pages/admin/formularios/{index,nuevo,[id]}.astro` | crear: CRUD |
| `src/components/admin/{FormularioFormulario,EditorCamposFormulario}.astro` | crear: editor |
| `src/components/admin/Formulario{Home,Aulas,Audiencia}.astro` | editar: selector por nombre |
| `src/layouts/Admin.astro` | editar: navegación a Formularios |
| `src/components/{ContactForm,FormModal}.astro` | editar: render por definición y estados |
| `src/components/{HomeView,ClassesView,AudienceView}.astro` | editar: pasan `formId` |
| `src/pages/api/formularios/enviar.ts` | crear: endpoint server-side |
| `db/migrations/0003_form_rate_limit.sql` | crear: ventana de rate limit sin respuestas |
| `package.json`, `package-lock.json` | editar: SDK oficial `resend` |
| `src/lib/*.test.ts` | crear/editar: tests de schema, propagación y endpoint |
| `docs/{INDEX,TASKS,HANDOFF-CLAUDE-CODE}.md` | editar: estado y operación |

### Disjunta?

**No.** Toca los componentes y archivos de contenido que están modificados por el rediseño
mobile-first sin commit y por la implementación parcial de la spec 0049. Debe comenzar
después de consolidar ese working tree; no se debe ejecutar en paralelo ni descartar las
modificaciones actuales.

## Verificación

- [ ] Tests del schema: combinaciones válidas e inválidas de tipo, presentación y opciones.
- [ ] Tests de IDs únicos y estabilidad al reordenar.
- [ ] Tests PT → idiomas: alta, baja y reorden; ninguna traducción existente se pisa.
- [ ] Test del selector: guarda ID aunque cambie el nombre interno.
- [ ] Test del endpoint contra Resend simulado: rechazo de campo, opción, tipo y obligatorio
      manipulados; `replyTo` correcto; secretos ausentes del cliente.
- [ ] Test de rate limit y honeypot sin persistir respuesta ni IP cruda.
- [ ] `npm run typecheck`, `npm test`, `npm run build` y `git diff --check` limpios.
- [ ] A 390 px: crear y traducir un campo, reordenar opciones y completar el formulario sin
      scroll horizontal; el teclado no tapa la acción principal.
- [ ] Cambiar PT propaga la estructura a es/fr/en y marca texto nuevo sin traducir.
- [ ] `/aulas` abre el formulario propio, no contiene iframe ni dominio de Google Forms.
- [ ] Envío real de staging llega a `FORM_TO_EMAIL`, responder va al visitante y un segundo
      clic/reintento no duplica silenciosamente el correo.
- [ ] Sin configuración Resend no hay falso éxito y la UI explica indisponibilidad.

## Operación y credenciales

Para producción hacen falta `RESEND_API_KEY`, `FORM_FROM_EMAIL` de dominio verificado y
`FORM_TO_EMAIL`. Su valor no se documenta ni se commitea. La spec está cerrada porque el
contrato de variables es suficiente para implementar y probar con mocks; las credenciales
solo bloquean la verificación real y el deploy operativo.

## Abierto

Nada bloquea implementación. Los textos es/fr/en del formulario inicial pueden sembrarse
desde portugués y quedar marcados «Sin traducir» para que el administrador los complete.

