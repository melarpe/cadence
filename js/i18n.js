/* Cadence · all visible text, in Spanish and English.
 * Templates can override some words (see `terms` in templates.js).
 * help   → what the "?" buttons show
 * guides → the step-by-step pages in Help */
window.I18N = {
  es: {
    locale: 'es-CO',
    // spaces (v3)
    switchSpace: 'Cambiar de espacio', mySpaces: 'Mis espacios', newSpace: 'Nuevo espacio', thisSpace: 'Este espacio',
    spaceName: 'Nombre del espacio', spaceNameHint: 'Ej.: Personal, Trabajo, Mi negocio', current: 'Actual',
    forMe: 'Para mí', forBusiness: 'Para mi negocio o trabajo independiente',
    newSpaceText: 'Cada espacio tiene sus propias tareas, citas y dinero. Agrega solo los que necesites.',
    spacesHint: 'Puedes tener lo personal separado del negocio. Cada espacio guarda sus datos aparte.',
    oneSpaceFirst: 'Empieza con uno. Después puedes agregar más espacios (por ejemplo, Personal y Mi negocio).',
    withSample: 'Con datos de ejemplo para probar', deleteSpace: 'Eliminar este espacio', emptySpace: 'Vaciar este espacio',
    confirmDeleteSpace: (n) => `¿Eliminar el espacio "${n}" y todo lo que tiene? Los demás espacios no se tocan.`,
    noSpacesYet: 'Tu cuenta todavía no tiene espacios. Crea el primero para empezar.', back: 'Volver',
    stepEvent: 'Agenda una reunión o cita', stepEventHint: 'Aparece en el calendario y te avisa.',
    type_salary: 'Sueldo', mod_events: 'Citas, reuniones y eventos', modHint_events: 'Con fecha, hora y lugar',
    mod_finance: 'Dinero', modHint_finance: 'Ingresos, gastos y meta del mes', mod_recurring: 'Ingresos fijos', modHint_recurring: 'Mensualidades, apadrinamientos',
    mod_inventory: 'Inventario', modHint_inventory: 'Lo que tienes para vender',

    appTagline: 'Tareas, entregas y dinero en un solo lugar',
    nav_home: 'Inicio', nav_calendar: 'Calendario', nav_projects: 'Proyectos', nav_recurring: 'Ingresos fijos',
    nav_events: 'Eventos', nav_inventory: 'Inventario', nav_clients: 'Clientes', nav_finance: 'Finanzas',
    nav_more: 'Más', nav_help: 'Ayuda', nav_settings: 'Ajustes',
    more_recurring: 'Pagos que se repiten', more_events: 'Talleres, ferias, eventos', more_inventory: 'Lo que tienes para vender',
    more_clients: 'Contactos e historial', more_help: 'Guías paso a paso', more_settings: 'Cuenta, idioma, moneda',
    weekdaysShort: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    whatIsThis: '¿Qué es esto?', example: 'Ejemplo', gotIt: 'Entendido', close: 'Cerrar', accept: 'Aceptar',
    save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar', remove: 'Quitar', all: 'Todos', none: '— Ninguno —', or: 'o',
    saved: 'Guardado ✓', deleted: 'Eliminado', loading: 'Cargando…', search: 'Buscar…', seeAll: 'Ver todos', seeSteps: 'Ver los pasos',
    prevMonth: 'Mes anterior', nextMonth: 'Mes siguiente',

    // home
    // calendar choice, install, privacy
    calendarTitle: 'Tu calendario', calGoogle: 'Google Calendar', calGoogleHint: 'Se abre Google Calendar con la fecha lista. Ideal si usas Gmail o Android.',
    calDevice: 'Calendario del celular o computador', calDeviceHint: 'iPhone, Mac, Outlook o Samsung. Se descarga un archivo con avisos.',
    calChooseTitle: '¿Qué calendario usas?', calChooseText: 'Elige dónde quieres guardar tus fechas. Puedes cambiarlo después en Ajustes.',
    calListTitle: 'Agregar a Google Calendar', calListText: 'Toca cada fecha. Se abre Google Calendar con todo escrito: solo toca Guardar.', calAdd: 'Agregar', calOpened: 'Abierto ✓',
    calThisDevice: 'Se guarda solo en este dispositivo.',
    installBtn: 'Instalar Cadence', installed: 'Cadence ya está instalada en este dispositivo ✓',
    installBannerTitle: 'Instala Cadence', installBannerText: 'Queda como una app en tu pantalla y funciona sin internet.', installHowTo: 'Ver cómo', dismiss: 'Ahora no',
    privacyTitle: 'Política de privacidad', privacyShort: 'Qué datos guarda Cadence y cómo borrarlos.', about: 'Acerca de',
    privacyAccept: 'Leí y acepto la', privacyNeeded: 'Para crear tu cuenta, primero acepta la política de privacidad.',
    privacyFallbackContact: 'la persona que te compartió la app',
    privacyUpdated: 'Última actualización: noviembre de 2026',
    privacyBody: (c) => `
      <p>Cadence es una app para organizar tareas, fechas y dinero. Está en <strong>fase de prueba</strong>. Aquí te contamos, en palabras simples, qué datos guarda y qué puedes hacer con ellos.</p>
      <h3>Quién es responsable</h3>
      <p>${c.owner}. Contacto: ${c.contact}.</p>
      <h3>Qué datos se guardan</h3>
      <ul>
        <li><strong>Sin cuenta:</strong> todo lo que escribes se guarda solo en este dispositivo (en el navegador). Nadie más lo recibe.</li>
        <li><strong>Con cuenta:</strong> tu correo (y tu nombre y foto de perfil si entras con Google) y lo que escribes en la app (tareas, clientes, ingresos, gastos, eventos…), para que los veas en todos tus equipos.</li>
        <li>No usamos publicidad, cookies de seguimiento ni herramientas de analítica.</li>
      </ul>
      <h3>Para qué se usan</h3>
      <p>Solo para mostrarte tu información y sincronizarla entre tus equipos. No se venden, no se comparten con otras empresas y no se usan para nada más.</p>
      <h3>Dónde se guardan y quién los ve</h3>
      <ul>
        <li>Las cuentas usan <strong>Firebase, de Google</strong>. Sus servidores pueden estar fuera de Colombia.</li>
        <li>Unas reglas de seguridad hacen que cada persona solo pueda leer y editar sus propios datos. Otros usuarios no los ven.</li>
        <li>Quien administra la app tiene acceso técnico a la base de datos. Solo la abre si tú lo pides (por ejemplo, para ayudarte con un error o borrar tu cuenta).</li>
      </ul>
      <h3>Datos de otras personas</h3>
      <p>Si guardas datos de clientes o de otras personas, asegúrate de tener su permiso. Para niños o niñas, usa solo el nombre o un código: nunca apellidos, fotos, documentos ni datos de salud.</p>
      <h3>Tus derechos</h3>
      <p>Según la ley colombiana de protección de datos (Ley 1581 de 2012) puedes conocer, corregir, actualizar y pedir que se borren tus datos, y retirar este permiso cuando quieras:</p>
      <ul>
        <li><strong>Ver y descargar:</strong> Ajustes → Respaldo y datos → Descargar respaldo.</li>
        <li><strong>Corregir o borrar:</strong> edita o elimina cualquier dato en la app, o borra un espacio completo en Ajustes.</li>
        <li><strong>Borrar tu cuenta:</strong> escribe a ${c.contact}. Se elimina tu cuenta con todos sus datos en máximo 15 días hábiles.</li>
      </ul>
      <h3>Seguridad y respaldos</h3>
      <p>Como es una versión de prueba, puede tener errores. Descarga un respaldo de vez en cuando.</p>
      <h3>Cambios</h3>
      <p>Si esta política cambia, lo avisaremos dentro de la app.</p>`,
    greetMorning: 'Buenos días', greetAfternoon: 'Buenas tardes', greetEvening: 'Buenas noches', sumStart: 'Empecemos',
    summary: (o, d) => {
      const late = o ? `${o} ${o === 1 ? 'atrasada' : 'atrasadas'}` : '', now = d ? `${d} para hoy` : '';
      return late && now ? `${late} y ${now}` : (late || now || 'Todo al día ✓');
    },
    hello: 'Hola', overdue: 'Atrasadas', today: 'Hoy', thisWeek: 'Próximos 7 días',
    nothingOverdue: 'Nada atrasado. ¡Bien!', nothingToday: 'Nada para hoy.', nothingWeek: 'Semana libre.',
    nothingThisDay: 'Nada este día.', monthAtGlance: 'Este mes',
    received: 'Cobrado', pendingToCollect: 'Por cobrar', expenses: 'Gastos', profit: 'Ganancia',
    monthlyGoal: 'Meta mensual', ofGoal: 'de la meta', noGoal: 'Ponte una meta de ingresos en Ajustes',
    activeProjects: 'Proyectos activos', noActive: 'No hay nada en curso.',
    daysLate: (n) => n === 1 ? '1 día de atraso' : `${n} días de atraso`,
    inDays: (n) => n === 0 ? 'hoy' : n === 1 ? 'mañana' : `en ${n} días`,
    markDone: 'Marcar como entregado', done: 'Entregado',
    expected: 'Esperado', missing: 'Falta', allPaid: 'Todos pagaron este mes. 🎉', missingThisMonth: 'faltan este mes',
    firstStepsTitle: 'Empieza aquí', firstStepsText: 'Tres pasos y Cadence ya empieza a ayudarte. Puedes hacerlos en cualquier orden.',
    step1: 'Agrega un cliente', step1Hint: 'La persona o empresa que te contrata.',
    step2: 'Crea un proyecto con su fecha de entrega', step2Hint: 'Así Cadence te avisa antes de que se te pase.',
    step3: 'Anota un pago que recibiste', step3Hint: 'Así ves cuánto ganaste este mes.',
    seeGuides: 'Ver las guías paso a paso',
    demoBanner: 'Estás viendo datos de ejemplo.', leaveDemo: 'Empezar con mis datos',

    // quick add
    quickAdd: 'Agregar', qa_delivery: 'Proyecto / entrega', qa_income: 'Ingreso', qa_expense: 'Gasto', qa_client: 'Cliente',

    // projects
    projects: 'Proyectos', newProject: 'Nuevo proyecto', editProject: 'Editar proyecto',
    projectTitle: 'Nombre del proyecto', projectTitleHint: 'Ej.: Video para Café Montaña',
    client: 'Cliente', newClientInline: '+ Cliente nuevo', stage: 'Etapa',
    totalValue: 'Valor total', deposit: 'Anticipo recibido', balance: 'Saldo', paid: 'Pagado',
    deliverables: 'Entregas', deliverable: 'Entrega', addDeliverable: '+ Agregar otra entrega',
    deliverableName: 'Qué entregas', dueDate: 'Fecha', notes: 'Notas',
    payments: 'Pagos', addPayment: '+ Registrar pago', moveTo: 'Mover a',
    noPendingDeliveries: 'Sin entregas pendientes',
    kanbanHintTouch: 'Desliza a los lados para ver cada etapa. Usa las flechas ‹ › para mover un proyecto.',
    emptyProjectsTitle: 'Aún no hay proyectos', emptyProjectsText: 'Crea el primero con el botón de abajo. Solo necesitas un nombre y una fecha de entrega.',
    addToCalendar: 'Agregar al calendario', exportUpcomingIcs: 'Enviar todo al calendario',
    icsHint: 'Abre el archivo y toca "Agregar todo" para guardarlo en tu calendario.',

    // incomes / expenses
    income: 'Ingresos', incomes: 'Ingresos', newIncome: 'Registrar ingreso', editIncome: 'Editar ingreso',
    incomeType: 'Tipo de ingreso', whatFor: '¿De qué es este pago?', nothingToPay: 'No hay nada pendiente de este tipo.',
    type_project: 'Proyecto / encargo', type_event: 'Evento', type_sale: 'Venta', type_recurring: 'Ingreso fijo', type_other: 'Otro',
    amount: 'Valor', date: 'Fecha', noteOptional: 'Nota (opcional)', noteHint: 'Ej.: pago por Nequi', exampleAmount: 'Ej.: 500000',
    newExpense: 'Registrar gasto', editExpense: 'Editar gasto', category: 'Categoría', description: 'Descripción',
    expenseHint: 'Ej.: taxi al rodaje', linkedProject: 'Proyecto (opcional)',

    // recurring (generic wording; templates change it)
    recurring: 'Ingresos fijos', recurringTitle: 'Ingresos que se repiten', newRecurring: 'Nuevo ingreso fijo',
    payer: 'Quién paga', payerHint: 'Nombre de la persona o empresa',
    concept: 'Por qué paga', conceptHint: 'Ej.: servicio mensual',
    group: 'Grupo o lugar (opcional)', groupHint: 'Ej.: Fundación Semillas',
    session: 'Sesión', sessions: 'Sesiones', logSession: 'Registrar sesión', sessionsThisMonth: 'Dadas este mes',
    sessionLogged: 'Registrada', sessionNoteHint: 'Ej.: tema del taller',
    sessionExplain: 'Cada vez que registras una, a cada persona que paga por sesión en ese grupo se le suma un pago pendiente.',
    frequency: 'Cada cuánto paga', freq_monthly: 'Cada mes (valor fijo)', freq_per_session: (s) => `Por cada ${s}`,
    perMonth: 'al mes', perSession: (s) => `por ${s}`, startDate: 'Desde', activeLabel: 'Activo',
    st_paid: 'Pagó', st_partial: 'Pagó una parte', st_pending: 'Falta', st_none: 'Nada este mes',
    registerPayment: 'Registrar pago', noGroup: 'Sin grupo', inactive: 'Inactivos',
    privacyNote: 'Si es un niño o niña, escribe solo el nombre o un código. No guardes apellidos, fotos ni datos de salud.',
    emptyRecurringTitle: 'Sin ingresos fijos todavía',
    emptyRecurringText: 'Aquí van los pagos que se repiten: un cliente que paga cada mes, un padrino que paga por cada taller…',

    // events
    events: 'Eventos', newEvent: 'Nuevo evento', editEvent: 'Editar evento', eventTitle: 'Nombre del evento',
    eventTitleHint: 'Ej.: Taller de acuarela', eventType: 'Tipo', otherType: 'Otro', time: 'Hora', place: 'Lugar',
    eventValue: 'Cuánto te pagan', eventDone: 'Ya se realizó', upcoming: 'Próximos', pastEvents: 'Pasados',
    noUpcoming: 'No hay eventos próximos.', eventTypes: 'Tipos de evento',
    emptyEventsTitle: 'Sin eventos todavía', emptyEventsText: 'Registra talleres, ferias o eventos privados con fecha, lugar y cuánto te pagan.',

    // inventory
    inventory: 'Inventario', newInventory: 'Nuevo artículo', inventoryItem: 'Artículo', invTitle: 'Nombre o título',
    technique: 'Técnica o material', techniqueHint: 'Ej.: óleo', size: 'Medidas', price: 'Precio', status: 'Estado',
    inv_available: 'Disponible', inv_reserved: 'Reservada', inv_sold: 'Vendida',
    markSold: 'Vender', salePrice: 'Precio de venta', buyer: 'Comprador (opcional)', buyerHint: 'Ej.: Laura, feria del parque',
    soldOn: 'Vendida el', inStockValue: 'Valor disponible', soldThisMonth: 'Vendido este mes',
    emptyInventoryTitle: 'Inventario vacío', emptyInventoryText: 'Agrega lo que tienes para vender: cuadros, productos, piezas… y márcalos como vendidos cuando salgan.',

    // clients
    clients: 'Clientes', newClient: 'Nuevo cliente', editClient: 'Editar cliente', name: 'Nombre',
    clientNameHint: 'Persona o empresa', contactPerson: 'Persona de contacto', phone: 'Teléfono / WhatsApp', email: 'Correo',
    projectsCount: (n) => n === 1 ? '1 proyecto' : `${n} proyectos`, totalBilled: 'Total facturado', totalReceived: 'Total cobrado',
    history: 'Historial', noHistory: 'Todavía no hay trabajos con este cliente.',
    emptyClientsTitle: 'Aún no hay clientes', emptyClientsText: 'Guarda aquí a quien te contrata: nombre, WhatsApp y correo. Después ves todo lo que has hecho con cada uno.',

    // finance
    incomeByType: 'Ingresos por tipo', expensesByCategory: 'Gastos por categoría', last6Months: 'Ingresos vs gastos · últimos 6 meses',
    pendingCollections: 'Lo que te deben', nothingPending: 'Nadie te debe nada. 👌', incomeList: 'Ingresos del mes', expenseList: 'Gastos del mes',
    noData: 'Sin datos este mes.', showTable: 'Ver como tabla', hideTable: 'Ocultar tabla', month: 'Mes',
    exportCsv: 'Descargar para Excel', csv_projects: 'Proyectos', csv_deliverables: 'Entregas', csv_incomes: 'Ingresos', csv_expenses: 'Gastos',
    csv_clients: 'Clientes', csv_events: 'Eventos', csv_inventory: 'Inventario', csv_recurring: 'Ingresos fijos',

    // settings
    profile: 'Perfil', yourName: 'Tu nombre o marca', yourNameHint: 'Ej.: Taller Aurora', language: 'Idioma', currency: 'Moneda',
    template: 'Tipo de trabajo', modules: 'Secciones activas', stages: 'Etapas de los proyectos', expenseCategories: 'Categorías de gasto',
    addItem: '+ Agregar', data: 'Respaldo y datos', exportJson: 'Descargar respaldo', importJson: 'Restaurar un respaldo',
    loadDemo: 'Llenar con datos de ejemplo', clearAll: 'Borrar todo', imported: 'Respaldo restaurado ✓',
    installTitle: 'Instalar la app', installShort: 'Cadence se instala desde el navegador, sin tienda de apps, y funciona sin internet. Sirve en iPhone, Android, Mac y Windows.',
    account: 'Tu cuenta',
    accountOff: 'Por ahora tus datos se guardan en este dispositivo.',
    accountWhy: 'Con una cuenta ves los mismos datos en el celular y en el computador, y no se pierden si cambias de equipo.',
    signInGoogle: 'Entrar con Google', email: 'Correo', password: 'Contraseña (mínimo 6 caracteres)',
    signIn: 'Entrar', createAccount: 'Crear cuenta', forgotPassword: 'Olvidé mi contraseña', signOut: 'Cerrar sesión',
    iphoneLoginTip: 'En el iPhone, dentro de la app instalada, es más fácil entrar con correo y contraseña.',
    welcomeBack: '¡Listo! Ya estás dentro.', resetSent: 'Te enviamos un correo para crear una contraseña nueva.',
    cloud_off: 'Solo en este dispositivo', cloud_loading: 'Conectando…', 'cloud_signed-out': 'Sin cuenta',
    cloud_syncing: 'Guardando en tu cuenta…', cloud_synced: 'Todo guardado en tu cuenta ✓',
    cloud_offline: 'Sin internet: se guarda aquí y se envía cuando vuelva la conexión', cloud_error: 'No se pudo sincronizar',
    err_wrongPass: 'Correo o contraseña incorrectos.', err_emailUsed: 'Ese correo ya tiene cuenta. Toca "Entrar".',
    err_weakPass: 'La contraseña debe tener al menos 6 caracteres.', err_badEmail: 'Revisa el correo, parece incompleto.',
    err_popup: 'El navegador bloqueó la ventana de Google. Usa correo y contraseña.', err_popupClosed: 'Se cerró la ventana de Google antes de terminar.',
    err_network: 'Sin conexión a internet.', err_domain: 'No se pudo entrar desde esta dirección. Avísale a quien te compartió la app.',
    err_provider: 'Esa forma de entrar no está disponible. Prueba con otra o avísale a quien te compartió la app.', err_tooMany: 'Demasiados intentos. Espera unos minutos.',
    err_generic: 'Algo salió mal', err_typeEmail: 'Escribe tu correo primero.', err_badFile: 'Ese archivo no es un respaldo de Cadence.',

    // confirms
    confirmDelete: '¿Eliminar definitivamente?', confirmDeleteRecurring: '¿Eliminar? También se borran sus pagos registrados. Si solo dejó de pagar, mejor desmarca "Activo".',
    confirmDeleteSession: '¿Eliminar esta sesión registrada?', confirmDemo: 'Esto reemplaza lo que hay en este espacio por datos de ejemplo. ¿Continuar?',
    confirmClear: 'Esto borra todo lo que hay en este espacio (los otros espacios no se tocan). ¿Continuar?', confirmClearCloud: 'Esto borra todo lo de este espacio, también en tu cuenta. ¿Seguro?',
    confirmLeaveDemo: 'Se borran los datos de ejemplo para que empieces con los tuyos. ¿Continuar?',
    confirmSignOut: 'Tus espacios quedan guardados en tu cuenta y se borran de este dispositivo. ¿Cerrar sesión?',
    confirmImport: 'Esto reemplaza los datos actuales por los del respaldo. ¿Continuar?',
    demoSignedIn: 'Con la sesión iniciada no se pueden cargar datos de ejemplo.',

    // onboarding
    welcome: 'Bienvenido a Cadence', welcomeText: 'Organiza tus tareas, fechas y dinero sin perder tiempo. Para lo personal o para tu negocio.',
    chooseWork: '¿Para qué lo vas a usar?', startDemo: 'Ver cómo funciona (datos de ejemplo)', startEmpty: 'Empezar',
    haveAccount: 'Ya tengo cuenta', changeLater: 'Puedes cambiar todo después en Ajustes.',
    helpIntro: 'Guías cortas, paso a paso. Toca una para abrirla.',

    help: {
      home: { title: '¿Cómo empiezo?', body: '<p>Cadence funciona con tres cosas: <strong>clientes</strong> (quién te paga), <strong>proyectos con fecha de entrega</strong> (qué tienes que hacer y para cuándo) y <strong>pagos</strong> (lo que recibes).</p><p>Con eso, la pantalla de inicio te muestra lo atrasado, lo de hoy y lo de la semana.</p>' },
      kpis: { title: 'Los números del mes', body: '<ul><li><strong>Cobrado:</strong> la plata que ya recibiste este mes.</li><li><strong>Por cobrar:</strong> lo que te deben de proyectos y eventos, más los pagos fijos que faltan este mes.</li><li><strong>Gastos:</strong> lo que gastaste este mes.</li><li><strong>Ganancia:</strong> cobrado menos gastos.</li></ul>' },
      calendar: { title: 'El calendario', body: '<p>Muestra todas tus entregas y eventos del mes. Toca un día para ver qué hay.</p><p>El botón <strong>Enviar todo al calendario</strong> envía tus fechas a Google Calendar o al calendario de tu celular o computador, según lo que elijas en <strong>Ajustes → Tu calendario</strong>.</p>' },
      projects: (t) => ({ title: t('nav_projects'), body: `<p>Cada columna es una etapa del trabajo. Mueve cada tarjeta a la etapa en que va (arrastrándola en el computador o con las flechas ‹ › en el celular).</p><p>Cuando marcas todas sus entregas como hechas, pasa sola a la última etapa.</p>` }),
      stage: { title: 'Etapa', body: '<p>En qué parte del trabajo va. Las etapas se pueden cambiar en Ajustes.</p>', example: 'Preproducción → Rodaje → Edición → Revisión → Entregado' },
      totalValue: { title: 'Valor total', body: '<p>Cuánto vas a cobrar en total por este trabajo. Si todavía no lo sabes, déjalo vacío.</p>', example: 'Cobras 2.000.000 por un video: escribe 2000000' },
      deposit: { title: 'Anticipo', body: '<p>Si ya te pagaron una parte al empezar, escríbela aquí. Cadence la cuenta como cobrada hoy y te muestra el saldo que falta.</p>', example: 'Te pagan la mitad, 1.000.000, antes de empezar' },
      deliverables: { title: 'Entregas', body: '<p>Lo que tienes que entregar y la fecha. Un proyecto puede tener varias entregas (una primera versión, la final…). Cadence te avisa de cada una.</p><p>Marca la casilla cuando ya la entregaste.</p>', example: 'Teaser el 10, video final el 20' },
      recurring: (t) => ({ title: t('nav_recurring'), body: `<p>Pagos que se repiten. Hay dos formas:</p><ul><li><strong>${t('freq_monthly')}:</strong> el mismo valor todos los meses.</li><li><strong>${t('freq_per_session', t('session').toLowerCase())}:</strong> se paga por cada ${t('session').toLowerCase()} que das. Registra cada una con el botón "${t('logSession')}" y Cadence calcula cuánto debe cada quien.</li></ul><p>En la lista ves quién ya pagó este mes y a quién le falta.</p>`, example: t('conceptHint') }),
      concept: (t) => ({ title: t('concept'), body: '<p>Por qué te pagan. Si es un niño o niña apadrinado, escribe solo su nombre o un código, nunca datos personales completos.</p>', example: t('conceptHint') }),
      group: (t) => ({ title: t('group'), body: `<p>Sirve para juntar a varias personas que pagan por el mismo lugar o actividad. Cuando registras una ${t('session').toLowerCase()} en ese grupo, se cobra a todos los de ese grupo que pagan por ${t('session').toLowerCase()}.</p>`, example: t('groupHint') }),
      frequency: { title: 'Cada cuánto paga', body: '<p><strong>Cada mes:</strong> paga lo mismo todos los meses, aunque no haya sesiones.</p><p><strong>Por cada sesión:</strong> paga según las sesiones o talleres que diste en el mes.</p>' },
      session: (t) => ({ title: t('logSession'), body: `<p>Toca aquí cada vez que das una ${t('session').toLowerCase()}. Así Cadence sabe cuánto le corresponde pagar a cada persona del grupo ese mes.</p>` }),
      events: { title: 'Eventos', body: '<p>Talleres, ferias, exposiciones o eventos privados. Tienen fecha, hora, lugar y cuánto te pagan. Aparecen en el calendario y en el inicio cuando se acercan.</p>' },
      eventValue: { title: 'Cuánto te pagan', body: '<p>El valor total del evento. Si es gratis o a beneficio, déjalo en 0. Los pagos se registran después, cuando llegan.</p>' },
      inventory: (t) => ({ title: t('nav_inventory'), body: '<p>Lo que tienes para vender, con su precio y estado: disponible, reservada o vendida. Al tocar <strong>Vender</strong>, Cadence registra el ingreso automáticamente.</p>' }),
      sell: { title: 'Vender', body: '<p>Escribe el precio final (puede ser distinto al de lista) y la fecha. Queda registrado como ingreso de tipo "Venta".</p>' },
      clients: { title: 'Clientes', body: '<p>Las personas o empresas que te contratan. En la ficha de cada uno ves sus trabajos, cuánto te ha pagado y cuánto debe, y un botón para escribirle por WhatsApp.</p>' },
      incomeTypes: { title: 'Tipos de ingreso', body: '<ul><li><strong>Proyecto / encargo:</strong> pagos de un trabajo con entrega.</li><li><strong>Evento:</strong> talleres, ferias, eventos privados.</li><li><strong>Venta:</strong> obras o productos vendidos.</li><li><strong>Ingreso fijo:</strong> mensualidades, apadrinamientos.</li><li><strong>Otro:</strong> cualquier otra entrada de dinero.</li></ul><p>Así ves de dónde viene tu plata cada mes.</p>' },
      pending: { title: 'Lo que te deben', body: '<p>Proyectos y eventos con saldo pendiente. Toca el valor para registrar el pago cuando llegue.</p>' },
      excel: { title: 'Descargar para Excel', body: '<p>Cada botón descarga un archivo .csv que se abre en Excel, Numbers o Google Sheets. Útil para tu contador o para hacer tus propios análisis.</p>' },
      account: { title: 'Tu cuenta', body: '<p>Sin cuenta, los datos viven solo en este celular o computador. Con cuenta (gratis), se guardan también en la nube: los ves en el celular y en el computador, y no se pierden si cambias de equipo.</p><p>Nadie más puede ver tus datos. Lee la <strong>Política de privacidad</strong> en Ajustes.</p>' },
      monthlyGoal: { title: 'Meta mensual', body: '<p>Cuánto quieres ganar al mes. En el inicio verás una barra con cuánto llevas.</p>', example: '5000000' },
      template: { title: 'Tipo de espacio', body: '<p>Cambia las etapas, las categorías de gasto, las palabras y las secciones para que se parezcan a lo que haces. Tus datos no se borran.</p>' },
      spaces: { title: 'Espacios', body: '<p>Un espacio es un cuaderno aparte dentro de Cadence. Por ejemplo: <strong>Personal</strong> para tus tareas y el presupuesto de la casa, y <strong>Mi negocio</strong> para clientes y cobros.</p><p>Crea solo los que necesites. Cambias de uno a otro tocando su nombre arriba, junto al logo. Con tu cuenta, todos se sincronizan.</p>', example: 'Personal 🏠 · Trabajo 🗂️ · Mi taller 🖌️' },
      modules: { title: 'Secciones activas', body: '<p>Prende solo lo que usas, para que la app se vea más simple. Puedes cambiarlo cuando quieras; no se borra nada.</p>' },
      backup: { title: 'Respaldo', body: '<p><strong>Descargar respaldo</strong> guarda una copia de todo en un archivo. Si algún día pierdes el celular o borras la app, con <strong>Restaurar</strong> vuelves a tener todo.</p><p>Si tienes cuenta, tus datos ya están en la nube, pero un respaldo de vez en cuando no sobra.</p>' }
    },

    guides: [
      { id: 'start', emoji: '🚀', title: 'Primeros pasos', steps: [
        'Toca el botón dorado <strong>+</strong> (abajo a la derecha). Es el atajo para agregar cualquier cosa.',
        'Elige <strong>Tarea</strong> (o <strong>Proyecto</strong>, si es de negocio). Escribe qué tienes que hacer y la fecha.',
        'Si es de negocio, agrega también el cliente y cuánto cobras.',
        'Cuando recibas dinero, toca <strong>+</strong> → <strong>Ingreso</strong>. Cuando gastes, <strong>Gasto</strong>.',
        'Abre <strong>Inicio</strong> cada mañana: ahí ves lo atrasado, lo de hoy y lo de la semana.'
      ], note: 'Los botones con <strong>?</strong> explican cada parte con un ejemplo.' },
      { id: 'spaces', emoji: '🗂️', title: 'Separar lo personal del negocio (espacios)', steps: [
        'Toca el nombre del espacio, arriba junto al logo de Cadence.',
        'Toca <strong>Nuevo espacio</strong> y elige qué tipo quieres (Personal, Trabajo o uno de negocio).',
        'Ponle un nombre que reconozcas, por ejemplo "Casa" o "Mi taller".',
        'Para cambiar de espacio, toca otra vez el nombre de arriba y elige el otro.'
      ], note: 'Cada espacio tiene sus propias tareas, citas y dinero. No se mezclan.' },
      { id: 'iphone', platform: 'ios', emoji: '📱', title: 'Instalar en el iPhone', steps: [
        'Abre el link de Cadence en <strong>Safari</strong> (tiene que ser Safari).',
        'Toca el botón <strong>Compartir</strong> (el cuadrado con una flecha hacia arriba).',
        'Baja y toca <strong>Agregar a pantalla de inicio</strong>, luego <strong>Agregar</strong>.',
        'Abre Cadence desde el ícono nuevo. Se ve en pantalla completa y funciona sin internet.'
      ], note: 'Si usas la app sin cuenta, los datos de Safari y los de la app instalada son distintos. Usa siempre el ícono.' },
      { id: 'android', platform: 'android', emoji: '🤖', title: 'Instalar en Android', steps: [
        'Abre el link de Cadence en <strong>Chrome</strong>.',
        'Si ves el botón <strong>Instalar Cadence</strong> (en Inicio o en Ajustes), tócalo y luego <strong>Instalar</strong>.',
        'Si no aparece: toca el menú <strong>⋮</strong> (arriba a la derecha) → <strong>Instalar app</strong> o <strong>Agregar a la pantalla principal</strong>.',
        'Abre Cadence desde el ícono nuevo. Se ve en pantalla completa y funciona sin internet.'
      ], note: 'El botón "atrás" del celular cierra primero lo que tengas abierto y después vuelve a la pantalla anterior.' },
      { id: 'windows', platform: 'windows', emoji: '🪟', title: 'Usar en Windows', steps: [
        'Abre el link de Cadence en <strong>Chrome</strong> o <strong>Edge</strong>.',
        'Toca <strong>Instalar Cadence</strong> en Ajustes, o el ícono de instalar al final de la barra de direcciones.',
        'Cadence queda en el menú Inicio. Puedes anclarla a la barra de tareas como cualquier programa.',
        'Si tienes cuenta, entra con la misma del celular para ver los mismos datos.'
      ] },
      { id: 'mac', platform: 'mac', emoji: '💻', title: 'Usar en el Mac', steps: [
        'Abre el link de Cadence en Safari.',
        'En el menú de arriba: <strong>Archivo → Agregar al Dock</strong>. (En Chrome: el ícono de instalar en la barra de direcciones).',
        'Abre Cadence desde el Dock como cualquier programa.',
        'Si tienes cuenta, entra con la misma del celular para ver los mismos datos.'
      ] },
      { id: 'account', cloud: true, emoji: '☁️', title: 'Crear tu cuenta y sincronizar', steps: [
        'Ve a <strong>Ajustes → Tu cuenta</strong>.',
        'Escribe tu correo y una contraseña (mínimo 6 caracteres) y toca <strong>Crear cuenta</strong>. También puedes usar <strong>Entrar con Google</strong> (en iPhone es más fácil con correo y contraseña).',
        'Listo: todo lo que tenías en ese dispositivo se sube a tu cuenta.',
        'En el otro equipo (celular o computador) abre Cadence, toca <strong>Ya tengo cuenta</strong> y entra con el mismo correo.'
      ], note: 'Si olvidas la contraseña, toca "Olvidé mi contraseña" y te llega un correo para crear otra.' },
      { id: 'calendar', emoji: '⏰', title: 'Recibir avisos de las entregas', steps: [
        'Elige tu calendario en <strong>Ajustes → Tu calendario</strong>: Google Calendar, o el del celular o computador (iPhone, Mac, Outlook).',
        'En <strong>Inicio</strong> o <strong>Calendario</strong>, toca <strong>Enviar todo al calendario</strong> (o el ícono 📅 de una entrega).',
        '<strong>Google Calendar:</strong> se abre con la fecha ya escrita, solo toca <strong>Guardar</strong>. Si son varias, aparece una lista para agregarlas una por una.',
        '<strong>iPhone, Mac u Outlook:</strong> se descarga un archivo; ábrelo y toca <strong>Agregar todo</strong>. Trae avisos el día antes a las 9:00 y el mismo día a las 8:00.',
        'Si agregas entregas nuevas, repite el paso 2.'
      ], note: 'En Google Calendar, los avisos son los que tengas configurados allá (por ejemplo, 30 minutos antes).' },
      { id: 'recurring', emoji: '🔁', module: 'recurring', title: 'Pagos que se repiten (mensualidades, apadrinamientos)', steps: [
        'Abre <strong>Más → Ingresos fijos</strong> (o Apadrinamientos / Mensualidades, según tu tipo de trabajo).',
        'Toca <strong>Nuevo</strong>: escribe quién paga, por qué, el valor y cada cuánto (cada mes o por cada sesión).',
        'Si pagan por sesión: cada vez que das una, toca <strong>Registrar sesión</strong> y elige el grupo (por ejemplo, la fundación).',
        'Cuando alguien pague, toca <strong>Registrar pago</strong> junto a su nombre.',
        'En Inicio verás cuánto falta por cobrar este mes y a quién.'
      ], note: 'Para niños o niñas apadrinados, usa solo el nombre o un código. Nunca guardes fotos, apellidos ni datos de salud.' },
      { id: 'excel', emoji: '📊', title: 'Pasar los datos a Excel', steps: [
        'Ve a <strong>Finanzas</strong> y baja hasta <strong>Descargar para Excel</strong>.',
        'Toca lo que quieras (Ingresos, Gastos, Proyectos…). Se descarga un archivo .csv.',
        'Ábrelo con Excel, Numbers o súbelo a Google Sheets.'
      ] },
      { id: 'backup', emoji: '💾', title: 'Hacer un respaldo', steps: [
        'Ve a <strong>Ajustes → Respaldo y datos</strong>.',
        'Toca <strong>Descargar respaldo</strong>. Guarda el archivo en iCloud Drive, Google Drive o tu correo.',
        'Para recuperar todo en otro equipo: <strong>Restaurar un respaldo</strong> y elige ese archivo.'
      ], note: 'Hazlo una vez al mes, sobre todo si no usas cuenta.' }
    ]
  },

  en: {
    locale: 'en-US',
    switchSpace: 'Switch space', mySpaces: 'My spaces', newSpace: 'New space', thisSpace: 'This space',
    spaceName: 'Space name', spaceNameHint: 'E.g. Personal, Job, My business', current: 'Current',
    forMe: 'For me', forBusiness: 'For my business or freelance work',
    newSpaceText: 'Each space has its own tasks, appointments and money. Add only the ones you need.',
    spacesHint: 'Keep personal life apart from your business. Each space stores its data separately.',
    oneSpaceFirst: 'Start with one. You can add more spaces later (for example Personal and My business).',
    withSample: 'With sample data to try it', deleteSpace: 'Delete this space', emptySpace: 'Empty this space',
    confirmDeleteSpace: (n) => `Delete the space "${n}" and everything in it? Other spaces are not touched.`,
    noSpacesYet: 'Your account has no spaces yet. Create the first one to start.', back: 'Back',
    stepEvent: 'Schedule a meeting or appointment', stepEventHint: 'It shows in the calendar and reminds you.',
    type_salary: 'Salary', mod_events: 'Appointments, meetings and events', modHint_events: 'With date, time and place',
    mod_finance: 'Money', modHint_finance: 'Income, expenses and monthly goal', mod_recurring: 'Recurring income', modHint_recurring: 'Retainers, sponsorships',
    mod_inventory: 'Inventory', modHint_inventory: 'What you have for sale',

    appTagline: 'Tasks, deliveries and money in one place',
    nav_home: 'Home', nav_calendar: 'Calendar', nav_projects: 'Projects', nav_recurring: 'Recurring income',
    nav_events: 'Events', nav_inventory: 'Inventory', nav_clients: 'Clients', nav_finance: 'Finance',
    nav_more: 'More', nav_help: 'Help', nav_settings: 'Settings',
    more_recurring: 'Payments that repeat', more_events: 'Workshops, fairs, events', more_inventory: 'What you have for sale',
    more_clients: 'Contacts and history', more_help: 'Step-by-step guides', more_settings: 'Account, language, currency',
    weekdaysShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    whatIsThis: 'What is this?', example: 'Example', gotIt: 'Got it', close: 'Close', accept: 'OK',
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', remove: 'Remove', all: 'All', none: '— None —', or: 'or',
    saved: 'Saved ✓', deleted: 'Deleted', loading: 'Loading…', search: 'Search…', seeAll: 'See all', seeSteps: 'See the steps',
    prevMonth: 'Previous month', nextMonth: 'Next month',

    calendarTitle: 'Your calendar', calGoogle: 'Google Calendar', calGoogleHint: 'Opens Google Calendar with the date filled in. Best if you use Gmail or Android.',
    calDevice: 'Phone or computer calendar', calDeviceHint: 'iPhone, Mac, Outlook or Samsung. Downloads a file with reminders.',
    calChooseTitle: 'Which calendar do you use?', calChooseText: 'Choose where to save your dates. You can change it later in Settings.',
    calListTitle: 'Add to Google Calendar', calListText: 'Tap each date. Google Calendar opens with everything filled in: just tap Save.', calAdd: 'Add', calOpened: 'Opened ✓',
    calThisDevice: 'Saved on this device only.',
    installBtn: 'Install Cadence', installed: 'Cadence is installed on this device ✓',
    installBannerTitle: 'Install Cadence', installBannerText: 'It sits on your screen like an app and works offline.', installHowTo: 'Show me how', dismiss: 'Not now',
    privacyTitle: 'Privacy policy', privacyShort: 'What data Cadence keeps and how to delete it.', about: 'About',
    privacyAccept: 'I have read and accept the', privacyNeeded: 'To create your account, first accept the privacy policy.',
    privacyFallbackContact: 'the person who shared the app with you',
    privacyUpdated: 'Last updated: November 2026',
    privacyBody: (c) => `
      <p>Cadence is an app to organize tasks, dates and money. It is in a <strong>testing phase</strong>. This page explains, in plain words, what data it keeps and what you can do about it.</p>
      <h3>Who is responsible</h3>
      <p>${c.owner}. Contact: ${c.contact}.</p>
      <h3>What data is kept</h3>
      <ul>
        <li><strong>Without an account:</strong> everything you type stays on this device only (in the browser). Nobody else receives it.</li>
        <li><strong>With an account:</strong> your email (plus your name and profile photo if you sign in with Google) and what you type in the app (tasks, clients, income, expenses, events…), so you can see it on all your devices.</li>
        <li>No ads, no tracking cookies, no analytics tools.</li>
      </ul>
      <h3>What it is used for</h3>
      <p>Only to show you your information and sync it between your devices. It is not sold, not shared with other companies and not used for anything else.</p>
      <h3>Where it is stored and who can see it</h3>
      <ul>
        <li>Accounts use <strong>Google Firebase</strong>. Its servers may be outside Colombia.</li>
        <li>Security rules make sure each person can only read and edit their own data. Other users cannot see it.</li>
        <li>Whoever runs the app has technical access to the database and only opens it if you ask (for example, to help with a bug or to delete your account).</li>
      </ul>
      <h3>Other people’s data</h3>
      <p>If you store data about clients or other people, make sure you have their permission. For children, use only a first name or a code: never surnames, photos, ID numbers or health data.</p>
      <h3>Your rights</h3>
      <p>Under Colombia’s data protection law (Ley 1581 of 2012) you can access, correct, update and ask to delete your data, and withdraw this consent at any time:</p>
      <ul>
        <li><strong>See and download:</strong> Settings → Backup & data → Download backup.</li>
        <li><strong>Correct or delete:</strong> edit or delete anything in the app, or delete a whole space in Settings.</li>
        <li><strong>Delete your account:</strong> write to ${c.contact}. Your account and all its data are deleted within 15 business days.</li>
      </ul>
      <h3>Security and backups</h3>
      <p>Since this is a test version, it may have bugs. Download a backup now and then.</p>
      <h3>Changes</h3>
      <p>If this policy changes, you will be told inside the app.</p>`,
    greetMorning: 'Good morning', greetAfternoon: 'Good afternoon', greetEvening: 'Good evening', sumStart: 'Let’s get started',
    summary: (o, d) => {
      const late = o ? `${o} overdue` : '', now = d ? `${d} due today` : '';
      return late && now ? `${late} · ${now}` : (late || now || 'All caught up ✓');
    },
    hello: 'Hi', overdue: 'Overdue', today: 'Today', thisWeek: 'Next 7 days',
    nothingOverdue: 'Nothing overdue. Nice!', nothingToday: 'Nothing for today.', nothingWeek: 'Free week.',
    nothingThisDay: 'Nothing on this day.', monthAtGlance: 'This month',
    received: 'Received', pendingToCollect: 'To collect', expenses: 'Expenses', profit: 'Profit',
    monthlyGoal: 'Monthly goal', ofGoal: 'of goal', noGoal: 'Set an income goal in Settings',
    activeProjects: 'Active projects', noActive: 'Nothing in progress.',
    daysLate: (n) => n === 1 ? '1 day late' : `${n} days late`,
    inDays: (n) => n === 0 ? 'today' : n === 1 ? 'tomorrow' : `in ${n} days`,
    markDone: 'Mark as delivered', done: 'Delivered',
    expected: 'Expected', missing: 'Missing', allPaid: 'Everyone paid this month. 🎉', missingThisMonth: 'missing this month',
    firstStepsTitle: 'Start here', firstStepsText: 'Three steps and Cadence starts helping you. Any order works.',
    step1: 'Add a client', step1Hint: 'The person or company that hires you.',
    step2: 'Create a project with its due date', step2Hint: 'So Cadence reminds you before it slips.',
    step3: 'Log a payment you received', step3Hint: 'So you see what you earned this month.',
    seeGuides: 'See the step-by-step guides',
    demoBanner: 'You are looking at sample data.', leaveDemo: 'Start with my data',

    quickAdd: 'Add', qa_delivery: 'Project / delivery', qa_income: 'Income', qa_expense: 'Expense', qa_client: 'Client',

    projects: 'Projects', newProject: 'New project', editProject: 'Edit project',
    projectTitle: 'Project name', projectTitleHint: 'E.g. Video for Café Montaña',
    client: 'Client', newClientInline: '+ New client', stage: 'Stage',
    totalValue: 'Total fee', deposit: 'Deposit received', balance: 'Balance', paid: 'Paid',
    deliverables: 'Deliverables', deliverable: 'Deliverable', addDeliverable: '+ Add another deliverable',
    deliverableName: 'What you deliver', dueDate: 'Date', notes: 'Notes',
    payments: 'Payments', addPayment: '+ Log payment', moveTo: 'Move to',
    noPendingDeliveries: 'No pending deliveries',
    kanbanHintTouch: 'Swipe sideways to see each stage. Use the ‹ › arrows to move a project.',
    emptyProjectsTitle: 'No projects yet', emptyProjectsText: 'Create the first one below. All you need is a name and a due date.',
    addToCalendar: 'Add to calendar', exportUpcomingIcs: 'Send all to calendar',
    icsHint: 'Open the file and tap "Add All" to save it to your calendar.',

    income: 'Income', incomes: 'Income', newIncome: 'Log income', editIncome: 'Edit income',
    incomeType: 'Income type', whatFor: 'What is this payment for?', nothingToPay: 'Nothing pending of this type.',
    type_project: 'Project / commission', type_event: 'Event', type_sale: 'Sale', type_recurring: 'Recurring', type_other: 'Other',
    amount: 'Amount', date: 'Date', noteOptional: 'Note (optional)', noteHint: 'E.g. bank transfer', exampleAmount: 'E.g. 500000',
    newExpense: 'Log expense', editExpense: 'Edit expense', category: 'Category', description: 'Description',
    expenseHint: 'E.g. taxi to the shoot', linkedProject: 'Project (optional)',

    recurring: 'Recurring income', recurringTitle: 'Income that repeats', newRecurring: 'New recurring income',
    payer: 'Who pays', payerHint: 'Person or company name',
    concept: 'What for', conceptHint: 'E.g. monthly service',
    group: 'Group or place (optional)', groupHint: 'E.g. Semillas Foundation',
    session: 'Session', sessions: 'Sessions', logSession: 'Log a session', sessionsThisMonth: 'Given this month',
    sessionLogged: 'Logged', sessionNoteHint: 'E.g. workshop topic',
    sessionExplain: 'Each one you log adds a pending payment for everyone in that group who pays per session.',
    frequency: 'How often they pay', freq_monthly: 'Every month (fixed)', freq_per_session: (s) => `Per ${s}`,
    perMonth: 'a month', perSession: (s) => `per ${s}`, startDate: 'Since', activeLabel: 'Active',
    st_paid: 'Paid', st_partial: 'Partly paid', st_pending: 'Missing', st_none: 'Nothing this month',
    registerPayment: 'Log payment', noGroup: 'No group', inactive: 'Inactive',
    privacyNote: 'If it is a child, write only a first name or a code. Do not store surnames, photos or health data.',
    emptyRecurringTitle: 'No recurring income yet',
    emptyRecurringText: 'Payments that repeat go here: a client who pays monthly, a sponsor who pays per workshop…',

    events: 'Events', newEvent: 'New event', editEvent: 'Edit event', eventTitle: 'Event name',
    eventTitleHint: 'E.g. Watercolor workshop', eventType: 'Type', otherType: 'Other', time: 'Time', place: 'Place',
    eventValue: 'How much you get paid', eventDone: 'Already happened', upcoming: 'Upcoming', pastEvents: 'Past',
    noUpcoming: 'No upcoming events.', eventTypes: 'Event types',
    emptyEventsTitle: 'No events yet', emptyEventsText: 'Log workshops, fairs or private events with date, place and fee.',

    inventory: 'Inventory', newInventory: 'New item', inventoryItem: 'Item', invTitle: 'Name or title',
    technique: 'Technique or material', techniqueHint: 'E.g. oil', size: 'Size', price: 'Price', status: 'Status',
    inv_available: 'Available', inv_reserved: 'Reserved', inv_sold: 'Sold',
    markSold: 'Sell', salePrice: 'Sale price', buyer: 'Buyer (optional)', buyerHint: 'E.g. Laura, park fair',
    soldOn: 'Sold on', inStockValue: 'Available value', soldThisMonth: 'Sold this month',
    emptyInventoryTitle: 'Inventory is empty', emptyInventoryText: 'Add what you have for sale: paintings, products, pieces… and mark them sold when they go.',

    clients: 'Clients', newClient: 'New client', editClient: 'Edit client', name: 'Name',
    clientNameHint: 'Person or company', contactPerson: 'Contact person', phone: 'Phone / WhatsApp', email: 'Email',
    projectsCount: (n) => n === 1 ? '1 project' : `${n} projects`, totalBilled: 'Total billed', totalReceived: 'Total received',
    history: 'History', noHistory: 'No work with this client yet.',
    emptyClientsTitle: 'No clients yet', emptyClientsText: 'Keep who hires you here: name, WhatsApp and email. Later you see everything you did with each one.',

    incomeByType: 'Income by type', expensesByCategory: 'Expenses by category', last6Months: 'Income vs expenses · last 6 months',
    pendingCollections: 'What you are owed', nothingPending: 'Nobody owes you anything. 👌', incomeList: 'Income this month', expenseList: 'Expenses this month',
    noData: 'No data this month.', showTable: 'Show as table', hideTable: 'Hide table', month: 'Month',
    exportCsv: 'Download for Excel', csv_projects: 'Projects', csv_deliverables: 'Deliverables', csv_incomes: 'Income', csv_expenses: 'Expenses',
    csv_clients: 'Clients', csv_events: 'Events', csv_inventory: 'Inventory', csv_recurring: 'Recurring',

    profile: 'Profile', yourName: 'Your name or brand', yourNameHint: 'E.g. Aurora Studio', language: 'Language', currency: 'Currency',
    template: 'Type of work', modules: 'Active sections', stages: 'Project stages', expenseCategories: 'Expense categories',
    addItem: '+ Add', data: 'Backup & data', exportJson: 'Download backup', importJson: 'Restore a backup',
    loadDemo: 'Fill with sample data', clearAll: 'Erase everything', imported: 'Backup restored ✓',
    installTitle: 'Install the app', installShort: 'Cadence installs from the browser, no app store, and works offline. Works on iPhone, Android, Mac and Windows.',
    account: 'Your account',
    accountOff: 'For now your data is saved on this device.',
    accountWhy: 'With an account you see the same data on your phone and computer, and nothing is lost if you change devices.',
    signInGoogle: 'Continue with Google', email: 'Email', password: 'Password (at least 6 characters)',
    signIn: 'Sign in', createAccount: 'Create account', forgotPassword: 'Forgot my password', signOut: 'Sign out',
    iphoneLoginTip: 'On iPhone, inside the installed app, email and password is the easiest way in.',
    welcomeBack: 'Done! You are in.', resetSent: 'We sent you an email to set a new password.',
    cloud_off: 'This device only', cloud_loading: 'Connecting…', 'cloud_signed-out': 'No account',
    cloud_syncing: 'Saving to your account…', cloud_synced: 'Everything saved to your account ✓',
    cloud_offline: 'Offline: saved here, will upload when you reconnect', cloud_error: 'Could not sync',
    err_wrongPass: 'Wrong email or password.', err_emailUsed: 'That email already has an account. Tap "Sign in".',
    err_weakPass: 'Password needs at least 6 characters.', err_badEmail: 'Check the email, it looks incomplete.',
    err_popup: 'The browser blocked the Google window. Use email and password.', err_popupClosed: 'The Google window closed before finishing.',
    err_network: 'No internet connection.', err_domain: 'Could not sign in from this address. Let the person who shared the app know.',
    err_provider: 'That sign-in method is not available. Try another one or let the person who shared the app know.', err_tooMany: 'Too many attempts. Wait a few minutes.',
    err_generic: 'Something went wrong', err_typeEmail: 'Type your email first.', err_badFile: 'That file is not a Cadence backup.',

    confirmDelete: 'Delete permanently?', confirmDeleteRecurring: 'Delete? Its logged payments are deleted too. If they just stopped paying, untick "Active" instead.',
    confirmDeleteSession: 'Delete this logged session?', confirmDemo: 'This replaces what is in this space with sample data. Continue?',
    confirmClear: 'This erases everything in this space (other spaces are kept). Continue?', confirmClearCloud: 'This erases everything in this space, also in your account. Sure?',
    confirmLeaveDemo: 'Sample data will be erased so you can start with yours. Continue?',
    confirmSignOut: 'Your data stays in your account and is removed from this device. Sign out?',
    confirmImport: 'This replaces current data with the backup. Continue?',
    demoSignedIn: 'Sample data cannot be loaded while signed in.',

    welcome: 'Welcome to Cadence', welcomeText: 'Keep tasks, dates and money organized without wasting time. For your personal life or your business.',
    chooseWork: 'What will you use it for?', startDemo: 'See how it works (sample data)', startEmpty: 'Start',
    haveAccount: 'I have an account', changeLater: 'You can change everything later in Settings.',
    helpIntro: 'Short, step-by-step guides. Tap one to open it.',

    help: {
      home: { title: 'How do I start?', body: '<p>Cadence runs on three things: <strong>clients</strong> (who pays you), <strong>projects with a due date</strong> (what you must do and by when) and <strong>payments</strong> (what you receive).</p><p>With that, Home shows what is overdue, due today and this week.</p>' },
      kpis: { title: 'The month in numbers', body: '<ul><li><strong>Received:</strong> money that already came in this month.</li><li><strong>To collect:</strong> what projects and events still owe, plus recurring payments missing this month.</li><li><strong>Expenses:</strong> what you spent this month.</li><li><strong>Profit:</strong> received minus expenses.</li></ul>' },
      calendar: { title: 'The calendar', body: '<p>Shows every delivery and event of the month. Tap a day to see what is on.</p><p><strong>Send all to calendar</strong> sends your dates to Google Calendar or to your phone or computer calendar, whichever you choose in <strong>Settings → Your calendar</strong>.</p>' },
      projects: (t) => ({ title: t('nav_projects'), body: '<p>Each column is a stage of the work. Move each card to the stage it is in (drag it on a computer or use the ‹ › arrows on a phone).</p><p>When all its deliverables are ticked, it moves to the last stage by itself.</p>' }),
      stage: { title: 'Stage', body: '<p>Which part of the work it is in. Stages can be renamed in Settings.</p>', example: 'Pre-production → Shoot → Editing → Review → Delivered' },
      totalValue: { title: 'Total fee', body: '<p>How much you will charge in total. Leave it empty if you do not know yet.</p>', example: 'You charge 2,000,000 for a video: type 2000000' },
      deposit: { title: 'Deposit', body: '<p>If part was already paid up front, type it here. Cadence counts it as received today and shows the remaining balance.</p>' },
      deliverables: { title: 'Deliverables', body: '<p>What you must hand in and when. One project can have several (a first cut, the final…). Cadence reminds you of each.</p><p>Tick the box once delivered.</p>' },
      recurring: (t) => ({ title: t('nav_recurring'), body: `<p>Payments that repeat. Two kinds:</p><ul><li><strong>${t('freq_monthly')}:</strong> same amount every month.</li><li><strong>${t('freq_per_session', t('session').toLowerCase())}:</strong> paid for each ${t('session').toLowerCase()} you give. Log each one with "${t('logSession')}" and Cadence works out what each person owes.</li></ul><p>The list shows who already paid this month and who has not.</p>` }),
      concept: (t) => ({ title: t('concept'), body: '<p>Why they pay you. For a sponsored child, write only a first name or a code, never full personal details.</p>', example: t('conceptHint') }),
      group: (t) => ({ title: t('group'), body: `<p>Groups several payers by place or activity. When you log a ${t('session').toLowerCase()} for that group, everyone in it who pays per ${t('session').toLowerCase()} is charged.</p>`, example: t('groupHint') }),
      frequency: { title: 'How often they pay', body: '<p><strong>Every month:</strong> same amount each month, even with no sessions.</p><p><strong>Per session:</strong> depends on the sessions or workshops you gave that month.</p>' },
      session: (t) => ({ title: t('logSession'), body: `<p>Tap this every time you give a ${t('session').toLowerCase()}. Cadence then knows how much each person in the group owes that month.</p>` }),
      events: { title: 'Events', body: '<p>Workshops, fairs, exhibitions or private events, with date, time, place and fee. They show in the calendar and on Home when they get close.</p>' },
      eventValue: { title: 'Fee', body: '<p>The total value of the event. If it is free or a fundraiser, leave 0. Log payments later as they arrive.</p>' },
      inventory: (t) => ({ title: t('nav_inventory'), body: '<p>What you have for sale, with price and status: available, reserved or sold. Tapping <strong>Sell</strong> logs the income automatically.</p>' }),
      sell: { title: 'Sell', body: '<p>Type the final price (can differ from the list price) and the date. It is logged as a "Sale" income.</p>' },
      clients: { title: 'Clients', body: '<p>The people or companies that hire you. Each card shows their work, what they paid, what they owe, and a WhatsApp button.</p>' },
      incomeTypes: { title: 'Income types', body: '<ul><li><strong>Project / commission:</strong> payments for work with a delivery.</li><li><strong>Event:</strong> workshops, fairs, private events.</li><li><strong>Sale:</strong> artworks or products sold.</li><li><strong>Recurring:</strong> retainers, sponsorships.</li><li><strong>Other:</strong> anything else.</li></ul><p>So you see where your money comes from each month.</p>' },
      pending: { title: 'What you are owed', body: '<p>Projects and events with a balance due. Tap the amount to log the payment when it arrives.</p>' },
      excel: { title: 'Download for Excel', body: '<p>Each button downloads a .csv file that opens in Excel, Numbers or Google Sheets. Handy for your accountant or your own analysis.</p>' },
      account: { title: 'Your account', body: '<p>Without an account, data lives only on this phone or computer. With a free account it is also stored in the cloud: you see it on your phone and computer and nothing is lost if you change devices.</p><p>Nobody else can see your data. Read the <strong>Privacy policy</strong> in Settings.</p>' },
      monthlyGoal: { title: 'Monthly goal', body: '<p>How much you want to earn per month. Home shows a bar with your progress.</p>', example: '5000000' },
      template: { title: 'Type of space', body: '<p>Changes stages, expense categories, wording and sections to match what you do. Your data is kept.</p>' },
      spaces: { title: 'Spaces', body: '<p>A space is a separate notebook inside Cadence. For example <strong>Personal</strong> for your tasks and home budget, and <strong>My business</strong> for clients and payments.</p><p>Create only the ones you need. Switch by tapping its name at the top, next to the logo. With an account, all of them sync.</p>' },
      modules: { title: 'Active sections', body: '<p>Turn on only what you use so the app stays simple. Change it anytime; nothing is deleted.</p>' },
      backup: { title: 'Backup', body: '<p><strong>Download backup</strong> saves a copy of everything to a file. If you lose your phone or delete the app, <strong>Restore</strong> brings it all back.</p>' }
    },

    guides: [
      { id: 'start', emoji: '🚀', title: 'First steps', steps: [
        'Tap the gold <strong>+</strong> button (bottom right). It is the shortcut to add anything.',
        'Choose <strong>Task</strong> (or <strong>Project</strong> in a business space). Type what you need to do and the date.',
        'In a business space, also add the client and the fee.',
        'When money comes in, tap <strong>+</strong> → <strong>Income</strong>. When you spend, <strong>Expense</strong>.',
        'Open <strong>Home</strong> every morning: overdue, today and this week are there.'
      ], note: 'Buttons with <strong>?</strong> explain each part with an example.' },
      { id: 'spaces', emoji: '🗂️', title: 'Keep personal and business apart (spaces)', steps: [
        'Tap the space name at the top, next to the Cadence logo.',
        'Tap <strong>New space</strong> and choose its type (Personal, Job or a business one).',
        'Give it a name you recognize, e.g. "Home" or "My studio".',
        'To switch, tap the name at the top again and pick the other one.'
      ], note: 'Each space has its own tasks, appointments and money. They never mix.' },
      { id: 'iphone', platform: 'ios', emoji: '📱', title: 'Install on iPhone', steps: [
        'Open the Cadence link in <strong>Safari</strong> (it has to be Safari).',
        'Tap <strong>Share</strong> (the square with an arrow pointing up).',
        'Scroll and tap <strong>Add to Home Screen</strong>, then <strong>Add</strong>.',
        'Open Cadence from the new icon. Full screen, works offline.'
      ], note: 'Without an account, Safari and the installed app keep separate data. Always use the icon.' },
      { id: 'android', platform: 'android', emoji: '🤖', title: 'Install on Android', steps: [
        'Open the Cadence link in <strong>Chrome</strong>.',
        'If you see the <strong>Install Cadence</strong> button (on Home or in Settings), tap it and then <strong>Install</strong>.',
        'If not: tap the <strong>⋮</strong> menu (top right) → <strong>Install app</strong> or <strong>Add to Home screen</strong>.',
        'Open Cadence from the new icon. Full screen, works offline.'
      ], note: 'The phone’s back button first closes whatever is open, then goes to the previous screen.' },
      { id: 'windows', platform: 'windows', emoji: '🪟', title: 'Use it on Windows', steps: [
        'Open the Cadence link in <strong>Chrome</strong> or <strong>Edge</strong>.',
        'Tap <strong>Install Cadence</strong> in Settings, or the install icon at the end of the address bar.',
        'Cadence appears in the Start menu. You can pin it to the taskbar like any program.',
        'If you have an account, sign in with the same one as on your phone to see the same data.'
      ] },
      { id: 'mac', platform: 'mac', emoji: '💻', title: 'Use it on a Mac', steps: [
        'Open the Cadence link in Safari.',
        'Top menu: <strong>File → Add to Dock</strong>. (Chrome: the install icon in the address bar).',
        'Open Cadence from the Dock like any app.',
        'If you have an account, sign in with the same one as on your phone to see the same data.'
      ] },
      { id: 'account', cloud: true, emoji: '☁️', title: 'Create your account and sync', steps: [
        'Go to <strong>Settings → Your account</strong>.',
        'Type your email and a password (6+ characters) and tap <strong>Create account</strong>. You can also use <strong>Continue with Google</strong> (on iPhone, email and password is easier).',
        'Done: everything on that device is uploaded to your account.',
        'On the other device open Cadence, tap <strong>I have an account</strong> and sign in with the same email.'
      ], note: 'Forgot the password? Tap "Forgot my password" and you get an email to set a new one.' },
      { id: 'calendar', emoji: '⏰', title: 'Get delivery reminders', steps: [
        'Choose your calendar in <strong>Settings → Your calendar</strong>: Google Calendar, or your phone or computer calendar (iPhone, Mac, Outlook).',
        'On <strong>Home</strong> or <strong>Calendar</strong>, tap <strong>Send all to calendar</strong> (or the 📅 icon of one delivery).',
        '<strong>Google Calendar:</strong> it opens with the date filled in, just tap <strong>Save</strong>. For several dates, a list lets you add them one by one.',
        '<strong>iPhone, Mac or Outlook:</strong> a file downloads; open it and tap <strong>Add All</strong>. Reminders the day before at 9:00 and on the day at 8:00.',
        'When you add new deliveries, repeat step 2.'
      ], note: 'In Google Calendar, reminders follow your Google Calendar settings (for example, 30 minutes before).' },
      { id: 'recurring', emoji: '🔁', module: 'recurring', title: 'Payments that repeat (retainers, sponsorships)', steps: [
        'Open <strong>More → Recurring income</strong> (or Sponsorships / Retainers, depending on your type of work).',
        'Tap <strong>New</strong>: who pays, what for, the amount and how often (monthly or per session).',
        'If they pay per session: every time you give one, tap <strong>Log a session</strong> and pick the group (e.g. the foundation).',
        'When someone pays, tap <strong>Log payment</strong> next to their name.',
        'Home shows how much is still missing this month and from whom.'
      ], note: 'For sponsored children, use only a first name or a code. Never store photos, surnames or health data.' },
      { id: 'excel', emoji: '📊', title: 'Move your data to Excel', steps: [
        'Go to <strong>Finance</strong> and scroll to <strong>Download for Excel</strong>.',
        'Tap what you need (Income, Expenses, Projects…). A .csv file downloads.',
        'Open it with Excel, Numbers or upload it to Google Sheets.'
      ] },
      { id: 'backup', emoji: '💾', title: 'Make a backup', steps: [
        'Go to <strong>Settings → Backup & data</strong>.',
        'Tap <strong>Download backup</strong>. Save the file to iCloud Drive, Google Drive or email.',
        'To get everything back on another device: <strong>Restore a backup</strong> and pick that file.'
      ], note: 'Do it once a month, especially if you do not use an account.' }
    ]
  }
};
