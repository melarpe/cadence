# Cadence · Proyectos, entregas y dinero para el trabajo independiente

**[Read in English](README.md)** · **[Demo en vivo](https://melimape.github.io/cadence/)**

Cadence es una aplicación web instalable (PWA) para organizar **tareas, fechas, citas y dinero** desde el celular, en segundos. Sirve para la vida personal, para el trabajo y para un negocio o trabajo independiente. Cada persona puede tener cada cosa en su propio **espacio** y cambiar con un toque.

Está pensada para tres tipos de usuario:

- **Un filmmaker independiente** con muchos clientes y entregas casi todas las semanas, que necesita no olvidar ninguna entrega y ver claro cuánto gana, gasta y le deben.
- **Un pequeño emprendimiento social de arte** que enseña arte a niños en fundaciones (pagado por padrinos, por taller), hace eventos privados, vende cuadros y acepta encargos. Está empezando y su dinero viene de cinco lugares distintos.

- **Una persona con empleo de oficina** que necesita sus tareas, informes y reuniones en un solo lugar, y el presupuesto de la casa. Sin clientes ni cobros.

Por eso Cadence es general pero directa: cada espacio tiene una **plantilla** que cambia las palabras, las etapas, las categorías y las secciones, y lo que no se usa no aparece.

![Cadence en iPhone: inicio, espacio personal, dinero y espacio de trabajo](docs/mobile-personal.png)
![Espacio de negocio](docs/mobile-art.png)

## Qué resuelve

| Problema | Qué hace Cadence |
|---|---|
| Entregas olvidadas | El inicio muestra **Atrasadas / Hoy / Próximos 7 días**. Entregas y eventos se envían a **Google Calendar** o al calendario del celular o computador (iPhone, Mac, Outlook), según lo que elija cada persona. |
| Dinero de muchas fuentes | Cada ingreso tiene un **tipo** (proyecto, evento, venta, ingreso fijo, otro). Finanzas muestra ingresos por tipo, gastos por categoría, ganancia y gráfico de 6 meses. |
| Padrinos que pagan por taller, clientes con mensualidad | **Ingresos fijos** de dos formas: cada mes o por sesión. Registras cada taller una vez y Cadence calcula cuánto debe cada padrino de ese grupo; la lista muestra quién pagó y quién falta. |
| Obras y productos para vender | **Inventario** con precio y estado. "Vender" registra el ingreso solo. |
| Talleres y eventos | **Eventos** con fecha, hora, lugar, valor y pagos. |
| Personas no técnicas | Botón **?** con explicación simple y ejemplo, guías paso a paso dentro de la app y pantallas vacías que dicen qué hacer primero. |
| Lo personal mezclado con el negocio | **Espacios**: una sola cuenta con cuadernos separados (Personal, Trabajo, Mi negocio…). Cada persona agrega solo los que necesita. |
| Mismos datos en el celular y el computador | **Cuentas opcionales con Firebase**. Cada persona entra con su cuenta y solo ve sus datos; todos sus espacios se sincronizan. |

![Ayuda en lenguaje simple](docs/desktop-help.png)

---

# 📲 Guía paso a paso

> Esta guía es para quien administra la app. Las personas que la usan **solo** tienen que abrir el link, instalarla y crear su cuenta (eso está explicado dentro de la app, en **Ayuda**).

## 1. Subir el proyecto a GitHub

1. Entra a [github.com](https://github.com) con tu cuenta.
2. Arriba a la derecha: **+** → **New repository**.
3. *Repository name*: `cadence`. Marca **Public**. No marques "Add a README". → **Create repository**.
4. Descomprime `cadence.zip` en tu computador.
5. En la página del repositorio vacío, toca **uploading an existing file**.
6. Abre la carpeta `cadence`, selecciona **todo lo que hay dentro** (`index.html`, `css`, `js`, `icons`, `docs`, etc.) y arrástralo a la página.
   - Los archivos que empiezan con punto (`.nojekyll`, `.gitignore`) a veces están ocultos. **Windows:** en el Explorador de archivos → **Ver** → **Mostrar** → **Elementos ocultos**. **Mac:** en el Finder presiona `Cmd + Shift + .`. Súbelos también.
7. Abajo, en *Commit changes*, escribe `Cadence v3` → **Commit changes**.
8. Revisa que en la página principal veas `index.html` directamente (no dentro de otra carpeta) y el README con imágenes.

> **¿Ya tenías una versión anterior subida?** Sube los archivos nuevos encima (Add file → Upload files). Después borra la carpeta `google-apps-script` y el archivo `js/sync.js`: abre cada archivo → ícono de los tres puntos → **Delete file** → Commit.

## 2. Publicarlo con GitHub Pages

1. En el repositorio: **Settings** → menú izquierdo **Pages**.
2. *Source*: **Deploy from a branch**. *Branch*: **main**, carpeta **/ (root)** → **Save**.
3. Espera 1–2 minutos y recarga: aparece `https://melimape.github.io/cadence/`.
4. En la página principal del repositorio, en **About** (⚙️): pega ese link en *Website* y agrega temas: `pwa`, `dashboard`, `javascript`, `firebase`, `freelance`.

> **Cuando empieces a cobrar:** las reglas de GitHub Pages no permiten usarlo para un negocio. En ese momento la app se pasa a Firebase Hosting (gratis) y el repositorio puede seguir público para tu portafolio.

En este punto la app ya funciona **sin cuentas** (cada quien guarda en su propio dispositivo). Los usuarios no ven ninguna instrucción técnica: en **Ajustes → Tu cuenta** solo aparece "Por ahora tus datos se guardan en este dispositivo". Para que cada persona vea lo mismo en el iPhone y en el Mac, sigue el paso 3.

## 3. Configurar Firebase (cuentas y sincronización)

Se hace **una sola vez**, gratis, sin tarjeta. Sirve para todos los usuarios.

**3.1 Crear el proyecto**
1. Entra a [console.firebase.google.com](https://console.firebase.google.com) con tu cuenta de Google.
2. **Crear un proyecto** (o "Agregar proyecto") → nombre: `cadence` → continuar.
3. Google Analytics: puedes desactivarlo (no se necesita) → **Crear proyecto**.
4. Verifica que el plan diga **Spark** (gratis).

**3.2 Registrar la app web**
1. En la página del proyecto, toca el ícono **`</>`** (Web).
2. Apodo: `Cadence`. **No** marques Firebase Hosting → **Registrar app**.
3. Aparece un bloque de código con `const firebaseConfig = { apiKey: "...", ... }`. Déjalo abierto, lo usas en el paso 3.6.

**3.3 Activar el inicio de sesión**
1. Menú izquierdo: **Compilación → Authentication** → **Comenzar**.
2. Pestaña **Método de acceso** → **Correo electrónico/contraseña** → activa el primer interruptor → **Guardar**.
3. **Agregar proveedor nuevo** → **Google** → activar → elige tu correo de asistencia → **Guardar**.

**3.4 Autorizar tu dirección de GitHub**
1. En Authentication → pestaña **Configuración** → **Dominios autorizados**.
2. **Agregar dominio** → escribe `melimape.github.io` → **Agregar**.
   - Sin esto, al entrar aparece el error "No se pudo entrar desde esta dirección".

**3.5 Crear la base de datos y sus reglas**
1. Menú izquierdo: **Compilación → Firestore Database** → **Crear base de datos**.
2. Ubicación: elige una cercana (por ejemplo `southamerica-east1`, São Paulo). No se puede cambiar después.
3. Elige **modo de producción** → **Crear**.
4. Pestaña **Reglas**: borra todo, pega el contenido del archivo [`firestore.rules`](firestore.rules) → **Publicar**.
   - Estas reglas hacen que cada persona solo pueda ver y editar sus propios datos.

**3.6 Conectar la app**
1. En GitHub, abre el archivo `js/firebase-config.js` → ícono del **lápiz** (Edit).
2. Copia cada valor del bloque de Firebase (paso 3.2) entre las comillas correspondientes:
   ```js
   window.FIREBASE_CONFIG = {
     apiKey: 'AIza…',
     authDomain: 'cadence-xxxx.firebaseapp.com',
     projectId: 'cadence-xxxx',
     storageBucket: 'cadence-xxxx.firebasestorage.app',
     messagingSenderId: '1234567890',
     appId: '1:1234567890:web:abc123'
   };
   ```
3. **Commit changes**.
4. Abre también `sw.js` (lápiz), sube el número de `VERSION` (por ejemplo, de `cadence-v3.0.3` a `cadence-v3.0.4`) y haz commit. Así los celulares que ya la tenían instalada descargan la versión nueva.
5. En el mismo archivo, al final, escribe en `contactEmail` el correo donde los usuarios pueden pedir que se borre su cuenta. Aparece en la **Política de privacidad** de la app. Si lo dejas vacío, la política dice "la persona que te compartió la app".
6. Espera 1–2 minutos, abre el link: en **Ajustes → Tu cuenta** ya aparecen "Entrar con Google" y el formulario de correo. En **Ayuda** aparece sola la guía "Crear tu cuenta y sincronizar".

> Estos valores no son secretos: solo identifican el proyecto. Lo que protege los datos son las reglas del paso 3.5.

**¿Cuánto aguanta gratis?** El plan Spark incluye 50.000 lecturas y 20.000 escrituras por día y 1 GiB guardado. Una persona usando Cadence a diario gasta unos cientos. Si algún día se pasara, Firebase pausa el servicio hasta el día siguiente; nunca cobra sin que actives un plan de pago.

## 4. Instalar (para cada usuario)

La app explica todo esto en **Ayuda**, y muestra primero la guía del equipo de cada persona.

- **iPhone:** abrir el link en **Safari** → **Compartir** → **Agregar a pantalla de inicio** → **Agregar**. Para la cuenta, mejor **correo y contraseña** (el botón de Google puede no abrir dentro de apps instaladas en iOS).
- **Android:** abrir el link en **Chrome** → botón **Instalar Cadence** (aparece en Inicio y en Ajustes), o menú **⋮** → **Instalar app**.
- **Windows:** abrir el link en **Chrome** o **Edge** → **Instalar Cadence** en Ajustes, o el ícono de instalar en la barra de direcciones. Queda en el menú Inicio.
- **Mac:** Safari → menú **Archivo → Agregar al Dock**.

Después: abrir Cadence desde el ícono → elegir para qué la va a usar → **Empezar**, o **Ya tengo cuenta**. Para crear la cuenta: **Ajustes → Tu cuenta** → marcar la casilla de la política de privacidad → **Crear cuenta** o **Entrar con Google**.

## 5. Calendario

Cada persona elige en **Ajustes → Tu calendario** (o la primera vez que toca 📅):
- **Google Calendar:** se abre Google Calendar con la fecha escrita y la persona toca **Guardar**. Funciona en Android, Windows, iPhone y Mac. Los avisos son los que tenga configurados en Google Calendar.
- **Calendario del celular o computador:** se descarga un archivo `.ics` con avisos el día antes y el mismo día. Funciona con el Calendario de iPhone y Mac, Outlook y Samsung. **No** funciona con Google Calendar en Android.

## 6. Espacios: lo personal y lo del negocio por separado

- Al abrir Cadence por primera vez se crea **un solo espacio** según lo que la persona elija.
- Para agregar otro: tocar el nombre del espacio arriba (junto al logo) → **Nuevo espacio**.
- Plantillas "Para mí": **Personal** (tareas, citas, ingresos, gastos y meta de ahorro) y **Trabajo** (tareas, reuniones y la etapa "Esperando respuesta", sin dinero).
- En **Ajustes → Secciones activas** se apaga lo que no se use (dinero, citas, inventario…).
- En **Ajustes → Este espacio** se cambia el nombre o se elimina el espacio.

Ejemplos: una persona con empleo puede tener **Trabajo** (informes, comités) y **Casa** (presupuesto). Un filmmaker, **Videos** y **Personal**. Una artista, **Mi taller** y **Personal**.

## 7. Ejemplo: emprendimiento de arte con padrinos

1. Al abrir Cadence (o al crear un espacio nuevo): elegir **Arte y emprendimiento social**.
2. En **Más → Apadrinamientos**: un registro por padrino, con el niño (solo nombre o código), la fundación, el valor y **Por cada sesión de taller**.
3. Cada vez que da un taller: botón **+** → **Registrar sesión de taller**.
4. Cuando un padrino paga: **Registrar pago** junto a su nombre.
5. Cuadros en **Obras**, eventos privados en **Eventos**, encargos en **Encargos**.

## 8. Privacidad (para quien administra)

- La app tiene una **Política de privacidad** (Ajustes → Acerca de) escrita para la ley colombiana de datos (Ley 1581 de 2012). Para crear una cuenta hay que aceptarla; la fecha y la versión aceptadas quedan guardadas en `users/{id}/meta/consent`.
- Es una base razonable para una prueba con pocas personas, pero **no es asesoría legal**. Si Cadence se vuelve un producto con usuarios que pagan, conviene que un abogado la revise.
- **Si alguien pide borrar su cuenta** (tienes máximo 15 días hábiles):
  1. Firebase → **Authentication** → **Usuarios** → busca su correo → copia su **UID** → menú ⋮ → **Borrar cuenta**.
  2. Firebase → **Firestore Database** → colección `users` → documento con ese UID → menú ⋮ → **Eliminar documento** y marca **Eliminar todas las subcolecciones**.
  3. Respóndele por correo que ya quedó borrada.

---

## Decisiones técnicas

| Decisión | Por qué |
|---|---|
| HTML, CSS y JavaScript puros, sin compilación | Corre en cualquier navegador, GitHub Pages lo publica gratis, el código es fácil de leer. |
| PWA | Se instala en iPhone, Android, Windows y Mac sin tienda de apps y abre sin internet. En Chrome y Edge hay botón de instalar de un toque. |
| Primero local (`localStorage`), después la nube | La app responde al instante y funciona sin cuenta. |
| Firebase (Auth + Firestore, plan gratis) en vez de Google Sheets | Sin configuración por persona, más rápido, en tiempo real, varias personas con datos separados. |
| Un documento por registro (`users/{uid}/spaces/{espacio}/...`) | Escrituras pequeñas, dos dispositivos pueden editar a la vez, sin límite de 1 MB por documento. |
| Espacios guardados por separado | Cambiar de espacio es instantáneo y sin internet; solo el espacio en pantalla escucha cambios en tiempo real, lo que ahorra lecturas del plan gratis. |
| Plantillas con secciones y palabras propias | Un solo código sirve a un filmmaker, a un emprendimiento de arte y a una persona con empleo de oficina; nadie ve lo que no usa. |
| Detección de cambios por "huella", gana la edición más reciente, borrados con marca | Los borrados también llegan al otro dispositivo. |
| SDK de Firebase incluido en el repositorio (`js/vendor`) | No depende de un CDN y solo se carga si hay cuentas configuradas. |
| Calendario: enlaces de Google Calendar o archivos `.ics`, a elección | Las notificaciones web en iOS necesitan servidor. Google Calendar en Android no abre `.ics`, por eso cada persona elige. |
| Historial del navegador para cada pantalla y formulario | El botón atrás de Android cierra primero el formulario abierto y después vuelve a la pantalla anterior. |
| Gráfico SVG propio con colores validados para daltonismo | Sin librerías; los estados siempre llevan ícono y texto, no solo color. |
| Datos mínimos de niños | Solo nombre o código; el formulario lo recuerda. |

## Probar en el computador

```bash
cd cadence
python3 -m http.server 8000      # abre http://localhost:8000
```

## Adaptarlo a otra profesión

Agrega una entrada en `TEMPLATES` (`js/templates.js`) con sus etapas, categorías, tipos de evento, módulos y palabras propias (`terms`). La última etapa siempre significa "terminado".

## Licencia

Todos los derechos reservados © 2026 Melissa Aristizabal. El código es público para que se pueda revisar, pero no se puede copiar, modificar, distribuir ni usar con fines comerciales sin permiso por escrito. Ver [LICENSE](LICENSE). Los datos de ejemplo son ficticios.

---
Hecho por **Melissa Aristizabal** · Ingeniera de Energía (UNILA) · Maestría en Ingeniería Mecánica, UFRGS · [GitHub](https://github.com/melimape)
