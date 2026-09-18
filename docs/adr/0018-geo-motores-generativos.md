---
adr: 0018
fecha: 2026-09-18
estado: aceptada
resumen: GEO se ataca con datos estructurados, respuestas explicitas y acceso de los crawlers de IA; el contenido poetico convive con una capa factual extraible. Nada de tacticas sin evidencia.
---

# 0018 — GEO: optimizacion para motores generativos

## Contexto

`docs/TASKS.md` lista "mejorar GEO" como prioridad del cliente desde el principio, y hasta
hoy se estaba leyendo como SEO **geografico** (NAP, sedes, mapa). El cliente aclaro que se
referia a **generative engine optimization**: aparecer y ser citado en las respuestas de
ChatGPT, Perplexity, Google AI Overviews y similares.

No es lo mismo y cambia que tiene que poder editar el backoffice.

## Que se sabe y que no

Honestidad primero, porque es un campo joven y lleno de humo:

- **Lo que esta medido.** El trabajo academico que dio nombre al campo (*GEO: Generative
  Engine Optimization*, 2023) midio que agregar **citas, comparaciones y datos concretos**
  a una pagina sube su visibilidad en las respuestas generadas de forma significativa,
  mientras que las tacticas heredadas del SEO clasico —densidad de keywords— no movieron
  la aguja.
- **Lo que se deduce del mecanismo.** Estos motores no adivinan: **recuperan**. Casi todos
  buscan primero (Bing, Google o su propio indice) y despues resumen. Si la pagina no esta
  en el indice clasico, no hay GEO posible. **El SEO sigue siendo aguas arriba.**
- **Lo que es especulacion.** Rankings de "posicion en LLM", auditorias de marca por IA y
  la mayoria de los servicios que se venden como GEO. No hay ranking estable que auditar.

De ahi sale la regla: **no se implementa ninguna tactica GEO cuyo unico respaldo sea un
blog de una agencia.**

## Decision

Cuatro palancas, en orden de evidencia:

### 1. Datos estructurados (la mas fuerte)

Un motor generativo no interpreta una tarjeta bonita: parsea. Ya emitimos `SportsClub` y
`Person`; con el ADR-0017 se suma `SportsActivityLocation` por dojo con direccion, geo y
horarios. Se agrega **`FAQPage`** — el unico formato pensado literalmente para "pregunta →
respuesta", que es la forma en que estos motores consumen.

### 2. Una capa factual explicita junto a la poetica

El sitio dice *"Entre o céu"*, *"Não vencer"*. Es la direccion visual elegida (ADR-0010) y
**no se toca**: funciona con personas. Pero un modelo que extrae frases no puede citar eso
para responder "¿dónde se practica Aikido en Lisboa?".

Por eso cada pagina gana dos campos editables:

- **`resumen`**: dos o tres frases autocontenidas, con el sujeto explicito y sin pronombres
  colgados. *"El Dojo da Luz es una asociación sin fines de lucro que enseña Aikido en
  Lisboa, en Benfica y Lumiar, dirigida por Pablo Durán, 5.º Dan Aikikai."* Una frase asi se
  puede citar entera; *"Entre o céu"* no.
- **`faq`**: preguntas reales con respuesta corta y concreta — precio, edad minima,
  experiencia previa, que llevar, horarios.

Los dos se renderizan como HTML visible, no como metadatos ocultos. Texto que solo ven las
maquinas es cloaking, y ademas no sirve: los motores puntuan lo que el usuario veria.

### 3. Acceso explicito de los crawlers de IA

`robots.txt` declara por nombre a `GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`,
`Google-Extended` y `CCBot`, y les **permite** todo salvo `/admin`. Hoy ya pasarian por el
`Allow` generico; ponerlos por nombre es para que nadie los bloquee por inercia mas
adelante. Es una asociacion sin fines de lucro que quiere alumnos: que la citen es el
objetivo, no la amenaza.

### 4. `llms.txt` — apuesta barata y sin evidencia

Se publica `/llms.txt` con el mapa del sitio en markdown. **Ningun motor documento que lo
consuma.** Entra porque cuesta una funcion de veinte lineas generada del mismo contenido, y
sale sin costo si en seis meses sigue sin servir. Queda anotado como apuesta, no como
mejora.

## Lo que ya juega a favor y no hay que romper

- HTML estatico, sin JavaScript: el contenido esta en el primer byte. Los crawlers de IA
  **no ejecutan JS** en general — muchos sitios modernos son invisibles para ellos y este
  no.
- Cuatro idiomas con `hreflang` reciproco: cuatro superficies de respuesta, no una.
- Carga muy rapida y sin bloqueos.

Esto convierte una decision vieja (ADR-0001, cero JS) en una ventaja de GEO que no se
compro a proposito. Motivo extra para no meter frameworks en el sitio publico.

## Consecuencias

- `homeSchema` y las demas paginas ganan `resumen` y `faq`; el backoffice los edita por
  idioma (specs 0021 y 0023).
- Aparece `FAQPage` en el JSON-LD de las paginas que tengan FAQ.
- `robots.txt` deja de ser tres lineas y pasa a nombrar crawlers.
- **Como se mide:** no hay ranking. Lo unico honesto es preguntarle periodicamente a los
  motores por consultas reales ("aikido en Lisboa", "clases de aikido para niños Benfica")
  y anotar si citan el sitio. Manual, cualitativo y con fecha.
