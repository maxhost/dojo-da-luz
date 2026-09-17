# Auditoría y arquitectura

## Auditoría breve

1. La propuesta de valor existe, pero queda enterrada entre frases aspiracionales,
   navegación repetida y grandes bloques históricos.
2. Horarios y precios se publican como imagen: pierden accesibilidad, actualización y SEO.
3. Inicio, Aikido y las homes española y francesa intercambian contenido sin jerarquía común.
4. La home portuguesa es un manifiesto; la española y francesa son introducciones históricas.
5. Profesor mezcla a Pablo Durán con biografías extensas de otros maestros.
6. Dojo da Luz aporta material humano y fotográfico, pero sin edición suficiente.
7. Atualidade mezcla novedades con un archivo de eventos antiguos.
8. Outras Artes reúne Shiatsu, Iaido y Tai Chi con profundidad desigual.
9. Links y Parcerias se confunden y en algunos casos apuntan al mismo destino.
10. Se nombran tres barrios, pero no se publica dirección postal ni teléfono.

## Arquitectura propuesta

| Pantalla | Función | Páginas que absorbe | Decisión editorial |
|---|---|---|---|
| Inicio | Presentar el dojo, sedes y primera acción | Início, Aula Experimental y resúmenes de Aikido, Professor y Horários | Orientada a la decisión local, no a contar toda la historia |
| Clases | Horarios, precios, públicos, sedes y disciplinas | Horários e quotas, Crianças, Outras Artes | Adultos y niños son secciones; Iaido, Tai Chi y Shiatsu quedan como oferta secundaria |
| Aikido | Práctica, principios, historia, linaje y videos | Aikido, contenido histórico de las homes es/fr y partes de Professor | Historia breve y útil; sin biografía enciclopédica |
| Dojo | Asociación, Pablo, espacio, actualidad y red | Professor, Dojo da Luz, Atualidade, Parcerias, Links | Pablo es protagonista; sus maestros aparecen como linaje |
| Contacto | Convertir interés en visita | Aula Experimental, Contactos y datos prácticos dispersos | Sede, transporte, condiciones y contacto en un único lugar |

## Paridad multilingüe

Los cuatro idiomas usan las mismas pantallas, secciones, orden y tipos de campo. El
material de las homes española y francesa se conserva como fuente para Aikido, pero deja
de determinar una home diferente. Esta paridad permite alternates `hreflang` inequívocos.
Cada traducción puede variar ±30 % sin truncamiento; las restricciones editoriales son
límites máximos, no alturas visuales.

## Qué se transforma o retira

- Links pasa a recursos institucionales dentro de Dojo y, selectivamente, al footer.
- Parcerias pasa a una franja breve dentro de Dojo.
- Atualidade muestra como máximo tres elementos recientes o futuros. Eventos históricos
  relevantes pasan a hitos; anuncios vencidos sin valor documental se retiran.
- Franck Noël, Seigo Yamaguchi y la familia Ueshiba se resumen dentro del linaje.
- La galería se reduce a 6–8 imágenes elegidas; el resto queda archivado fuera de la web.
- Las explicaciones duplicadas de kanji, budō, jutsu e historia se unifican en Aikido.
- Se conservan hasta cuatro videos mediante fachadas estáticas.
- Cada URL eliminada requiere redirect 301 a su pantalla equivalente, nunca a la home por defecto.

## SEO visible

| Término | Ubicación principal |
|---|---|
| Aikido Lisboa | Hero de Inicio y H1 de Clases |
| Aikido Benfica | Bloque de sede en Inicio, Clases y Contacto |
| Aikido Lumiar | Bloque de sede en Inicio, Clases y Contacto |
| Aikido Encarnação | Bloque de sede en Clases y Contacto; retirado de Inicio por decisión del cliente |
| Pablo Durán | Inicio y H2/H1 de su sección en Dojo |
| Aikikai | Credencial visible de Pablo y sección de linaje |
| aula experimental | CTA de Inicio, Clases y H1/lead de Contacto |
| horários | Enlaces de sede y encabezados de tabla en Clases |
| preços | Enlaces de sede y encabezado visible en Clases |
