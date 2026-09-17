---
spec: NNNN
fecha: YYYY-MM-DD
estado: borrador | cerrada | implementada
resumen: Una linea. Es lo que se lee en el INDEX sin abrir el archivo.
disjunta: si | no
archivos: rutas que esta spec va a tocar
---

# NNNN — Titulo

> **Nada de codigo empieza sin esta spec en `cerrada`.**
>
> No es ceremonia. En tareas **imposibles o mal especificadas** los modelos frontier
> fingen exito **~50% de las veces**, y **23-35% aunque se les diga explicitamente que
> no**. En tareas resolubles y bien definidas, el reward hacking bajo a **0%**.
> La subespecificacion es el gatillo medido. Cerrar la spec saca al agente del regimen
> donde miente.
>
> Y la palanca: *"una mala linea de codigo es una mala linea de codigo. Pero una mala
> linea de un **plan** puede llevar a cientos de malas lineas."*

## Problema

Que esta mal hoy, o que falta. En terminos observables, no de solucion.

## Alcance

**Entra:**
- …

**No entra:** (explicito — es lo que evita el scope creep del agente)
- …

## Diseño

Como se resuelve. Modulos, contratos, canales IPC nuevos, types nuevos.

## Archivos

Lista completa de archivos a crear o tocar. **Esto es lo que decide si la spec es
disjunta y por lo tanto paralelizable.**

| Archivo | Accion |
|---|---|
| `src/…` | crear / editar |

### Disjunta?

Comparar contra los `archivos` de las otras specs abiertas en el INDEX.

- **Si** → puede correr en paralelo con las otras specs abiertas.
- **No** → serializar. Listar con cual colisiona y por que.

Regla: si dos tareas comparten un archivo, la respuesta **no** es coordinar mejor: es
serializarlas. El caso de falla canonico (16 agentes sobre un compilador de C): *"Every
agent would hit the same bug, fix that bug, and then **overwrite each other's changes**."*

Y el default correcto no es "paralelo siempre que se pueda": 930.292 PRs agenticos midieron
conflictos **30.8% con multiples agentes vs 31.2% con uno solo** — indistinguible.
*"Govern change tempo rather than headcount."* Paralelo cuando el trabajo es
**demostrablemente disjunto**, y eso lo decide esta seccion, no el orquestador en runtime.

### Archivos compartidos

Si esta spec necesita algo compartido (un type, un canal IPC, un util), **el orquestador
lo deja listo antes de que arranquen los agentes**. Los agentes solo consumen.

| Que | Quien lo deja listo | Cuando |
|---|---|---|
| … | orquestador | antes de despachar |

## Verificacion

Como se sabe que esta hecho. **Una señal que el agente no escribio.**

- [ ] Test que falla primero, despues pasa
- [ ] `npm run typecheck` limpio
- [ ] Verificado corriendo la app (que se hace, que se ve)

No vale "deberia andar". El auto-reporte no es evidencia: en 80 casos de auto-critica los
humanos dudaron 7 veces, GPT-4 **cero**.

## Abierto

Lo que no se sabe todavia. Si esta seccion tiene algo que bloquea, la spec **no** esta
cerrada.
