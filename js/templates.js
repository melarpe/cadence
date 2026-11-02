/* Cadence · work templates + sample data
 *
 * A template decides:
 *  - modules: which sections are on (projects, recurring income, events, inventory)
 *  - stages, expense categories and event types it suggests
 *  - terms: the words the app uses (e.g. "Encargos" instead of "Proyectos")
 *  - icon: used in menus and in calendar reminders
 * Everything can be changed later in Settings. To add a profession, copy one entry. */
/* Wording shared by the two "for me" templates: projects become tasks. */
function TASK_TERMS_ES(extra) {
  return Object.assign({
    nav_projects: 'Tareas', projects: 'Tareas', newProject: 'Nueva tarea', editProject: 'Editar tarea', project: 'Tarea',
    projectTitle: 'Qué tienes que hacer', projectTitleHint: 'Ej.: Enviar el informe del mes', activeProjects: 'Tareas pendientes',
    qa_delivery: 'Tarea', deliverables: 'Fecha límite y pasos', deliverable: 'Tarea', deliverableName: 'Paso (opcional)',
    addDeliverable: '+ Agregar otro paso con fecha', noActive: 'No tienes tareas pendientes. 🙌',
    emptyProjectsTitle: 'Sin tareas todavía', emptyProjectsText: 'Anota lo que tienes que hacer y para cuándo. Cadence te lo recuerda.',
    firstStepsText: 'Dos pasos y Cadence ya empieza a ayudarte.', step2: 'Anota una tarea con su fecha', step2Hint: 'Así te aviso antes de que se te pase.',
    step3: 'Anota un ingreso o un gasto', step3Hint: 'Así ves cuánto te queda este mes.',
    markDone: 'Marcar como hecha', done: 'Hecha', moveTo: 'Mover a', noPendingDeliveries: 'Sin fecha pendiente'
  }, extra);
}
function TASK_TERMS_EN(extra) {
  return Object.assign({
    nav_projects: 'Tasks', projects: 'Tasks', newProject: 'New task', editProject: 'Edit task', project: 'Task',
    projectTitle: 'What you need to do', projectTitleHint: 'E.g. Send the monthly report', activeProjects: 'Pending tasks',
    qa_delivery: 'Task', deliverables: 'Due date and steps', deliverable: 'Task', deliverableName: 'Step (optional)',
    addDeliverable: '+ Add another dated step', noActive: 'No pending tasks. 🙌',
    emptyProjectsTitle: 'No tasks yet', emptyProjectsText: 'Write down what you need to do and by when. Cadence reminds you.',
    firstStepsText: 'Two steps and Cadence starts helping you.', step2: 'Add a task with its date', step2Hint: 'So I remind you before it slips.',
    step3: 'Log an income or an expense', step3Hint: 'So you see what is left this month.',
    markDone: 'Mark as done', done: 'Done', moveTo: 'Move to', noPendingDeliveries: 'No pending date'
  }, extra);
}

window.TEMPLATES = {
  // ---------------------------------------------------------------- "Para mí"
  personal: {
    label: { es: 'Personal: tareas y presupuesto', en: 'Personal: tasks & budget' },
    icon: '🏠', demo: 'personal', kind: 'personal',
    modules: { clients: false, finance: 'personal', projects: true, recurring: false, events: true, inventory: false },
    stages: [
      { id: 'todo', es: 'Por hacer', en: 'To do' },
      { id: 'doing', es: 'En curso', en: 'Doing' },
      { id: 'done', es: 'Hecho', en: 'Done' }
    ],
    categories: [
      { id: 'home', es: 'Casa y arriendo', en: 'Home & rent' },
      { id: 'food', es: 'Mercado y comida', en: 'Groceries & food' },
      { id: 'bills', es: 'Servicios (luz, agua, internet)', en: 'Utilities' },
      { id: 'transport', es: 'Transporte', en: 'Transport' },
      { id: 'health', es: 'Salud', en: 'Health' },
      { id: 'education', es: 'Educación', en: 'Education' },
      { id: 'fun', es: 'Ocio y salidas', en: 'Leisure' },
      { id: 'other', es: 'Otros', en: 'Other' }
    ],
    eventTypes: [
      { id: 'appointment', es: 'Cita', en: 'Appointment' },
      { id: 'meeting', es: 'Reunión', en: 'Meeting' },
      { id: 'social', es: 'Cumpleaños / social', en: 'Birthday / social' }
    ],
    terms: {
      es: TASK_TERMS_ES({ nav_events: 'Citas', newEvent: 'Nueva cita', editEvent: 'Editar cita', eventTitle: 'Qué cita es', eventTitleHint: 'Ej.: Odontólogo',
        received: 'Ingresos', profit: 'Ahorro (lo que queda)', monthlyGoal: 'Meta de ahorro', noGoal: 'Ponte una meta de ahorro en Ajustes', nav_finance: 'Dinero',
        qa_income: 'Ingreso', incomeList: 'Ingresos del mes', type_other: 'Otro ingreso' }),
      en: TASK_TERMS_EN({ nav_events: 'Appointments', newEvent: 'New appointment', editEvent: 'Edit appointment', eventTitle: 'What appointment', eventTitleHint: 'E.g. Dentist',
        received: 'Income', profit: 'Savings (what is left)', monthlyGoal: 'Savings goal', noGoal: 'Set a savings goal in Settings', nav_finance: 'Money',
        qa_income: 'Income', incomeList: 'Income this month', type_other: 'Other income' })
    }
  },

  work: {
    label: { es: 'Trabajo: tareas y reuniones', en: 'Job: tasks & meetings' },
    icon: '🗂️', demo: 'work', kind: 'personal',
    modules: { clients: false, finance: false, projects: true, recurring: false, events: true, inventory: false },
    stages: [
      { id: 'todo', es: 'Por hacer', en: 'To do' },
      { id: 'doing', es: 'En curso', en: 'Doing' },
      { id: 'waiting', es: 'Esperando respuesta', en: 'Waiting on others' },
      { id: 'done', es: 'Hecho', en: 'Done' }
    ],
    categories: [{ id: 'other', es: 'Otros', en: 'Other' }, { id: 'misc', es: 'Varios', en: 'Misc' }],
    eventTypes: [
      { id: 'meeting', es: 'Reunión', en: 'Meeting' },
      { id: 'training', es: 'Capacitación', en: 'Training' },
      { id: 'deadline', es: 'Presentación o entrega', en: 'Presentation or hand-in' }
    ],
    terms: {
      es: TASK_TERMS_ES({ nav_events: 'Reuniones', newEvent: 'Nueva reunión', editEvent: 'Editar reunión', eventTitle: 'De qué es la reunión', eventTitleHint: 'Ej.: Comité de costos' }),
      en: TASK_TERMS_EN({ nav_events: 'Meetings', newEvent: 'New meeting', editEvent: 'Edit meeting', eventTitle: 'Meeting topic', eventTitleHint: 'E.g. Budget committee' })
    }
  },

  // ---------------------------------------------------------------- "Para mi negocio"
  filmmaker: {
    label: { es: 'Filmmaker / video', en: 'Filmmaker / video' },
    icon: '🎬', demo: 'film',
    kind: 'business',
    modules: { clients: true, finance: 'business', projects: true, recurring: true, events: false, inventory: false },
    stages: [
      { id: 'pre', es: 'Preproducción', en: 'Pre-production' },
      { id: 'shoot', es: 'Rodaje', en: 'Shoot' },
      { id: 'edit', es: 'Edición', en: 'Editing' },
      { id: 'review', es: 'Revisión cliente', en: 'Client review' },
      { id: 'done', es: 'Entregado', en: 'Delivered' }
    ],
    categories: [
      { id: 'gear', es: 'Equipo', en: 'Gear' },
      { id: 'rental', es: 'Alquiler de equipo', en: 'Gear rental' },
      { id: 'transport', es: 'Transporte', en: 'Transport' },
      { id: 'software', es: 'Software y suscripciones', en: 'Software & subscriptions' },
      { id: 'crew', es: 'Asistentes / crew', en: 'Crew' },
      { id: 'music', es: 'Música y licencias', en: 'Music & licenses' },
      { id: 'other', es: 'Otros', en: 'Other' }
    ],
    eventTypes: [],
    terms: {
      es: { nav_recurring: 'Mensualidades', recurringTitle: 'Clientes con mensualidad', payer: 'Cliente', concept: 'Servicio', conceptHint: 'Ej.: 4 reels al mes', newRecurring: 'Nueva mensualidad' },
      en: { nav_recurring: 'Retainers', recurringTitle: 'Monthly retainers', payer: 'Client', concept: 'Service', conceptHint: 'E.g. 4 reels a month', newRecurring: 'New retainer' }
    }
  },

  photographer: {
    label: { es: 'Fotografía', en: 'Photography' },
    icon: '📷', demo: 'film',
    kind: 'business',
    modules: { clients: true, finance: 'business', projects: true, recurring: false, events: true, inventory: false },
    stages: [
      { id: 'booked', es: 'Agendado', en: 'Booked' },
      { id: 'shoot', es: 'Sesión', en: 'Session' },
      { id: 'edit', es: 'Selección y edición', en: 'Culling & editing' },
      { id: 'review', es: 'Revisión cliente', en: 'Client review' },
      { id: 'done', es: 'Entregado', en: 'Delivered' }
    ],
    categories: [
      { id: 'gear', es: 'Equipo', en: 'Gear' },
      { id: 'studio', es: 'Alquiler de estudio', en: 'Studio rental' },
      { id: 'transport', es: 'Transporte', en: 'Transport' },
      { id: 'prints', es: 'Impresiones', en: 'Prints' },
      { id: 'software', es: 'Software y suscripciones', en: 'Software & subscriptions' },
      { id: 'other', es: 'Otros', en: 'Other' }
    ],
    eventTypes: [
      { id: 'wedding', es: 'Boda', en: 'Wedding' },
      { id: 'session', es: 'Sesión de fotos', en: 'Photo session' },
      { id: 'corporate', es: 'Evento corporativo', en: 'Corporate event' }
    ],
    terms: {}
  },

  designer: {
    label: { es: 'Diseño / contenido', en: 'Design / content' },
    icon: '🎨', demo: 'film',
    kind: 'business',
    modules: { clients: true, finance: 'business', projects: true, recurring: true, events: false, inventory: false },
    stages: [
      { id: 'brief', es: 'Brief', en: 'Brief' },
      { id: 'draft', es: 'Propuesta', en: 'Draft' },
      { id: 'revision', es: 'Ajustes', en: 'Revisions' },
      { id: 'approval', es: 'Aprobación', en: 'Approval' },
      { id: 'done', es: 'Entregado', en: 'Delivered' }
    ],
    categories: [
      { id: 'software', es: 'Software y suscripciones', en: 'Software & subscriptions' },
      { id: 'assets', es: 'Recursos (fuentes, fotos)', en: 'Assets (fonts, stock)' },
      { id: 'ads', es: 'Publicidad', en: 'Ads' },
      { id: 'hardware', es: 'Equipo', en: 'Hardware' },
      { id: 'other', es: 'Otros', en: 'Other' }
    ],
    eventTypes: [],
    terms: {
      es: { nav_recurring: 'Mensualidades', recurringTitle: 'Clientes con mensualidad', payer: 'Cliente', concept: 'Servicio', conceptHint: 'Ej.: manejo de redes', newRecurring: 'Nueva mensualidad' },
      en: { nav_recurring: 'Retainers', recurringTitle: 'Monthly retainers', payer: 'Client', concept: 'Service', conceptHint: 'E.g. social media management', newRecurring: 'New retainer' }
    }
  },

  engineering: {
    label: { es: 'Ingeniería / consultoría', en: 'Engineering / consulting' },
    icon: '📐', demo: 'engineering',
    kind: 'business',
    modules: { clients: true, finance: 'business', projects: true, recurring: true, events: false, inventory: false },
    stages: [
      { id: 'survey', es: 'Levantamiento', en: 'Site survey' },
      { id: 'design', es: 'Diseño', en: 'Design' },
      { id: 'calc', es: 'Cálculo / simulación', en: 'Calculation / simulation' },
      { id: 'review', es: 'Revisión cliente', en: 'Client review' },
      { id: 'done', es: 'Entregado', en: 'Delivered' }
    ],
    categories: [
      { id: 'software', es: 'Software y licencias', en: 'Software & licenses' },
      { id: 'travel', es: 'Viajes y visitas técnicas', en: 'Travel & site visits' },
      { id: 'instruments', es: 'Equipos de medición', en: 'Measuring instruments' },
      { id: 'printing', es: 'Impresión y planos', en: 'Printing & drawings' },
      { id: 'other', es: 'Otros', en: 'Other' }
    ],
    eventTypes: [],
    terms: {
      es: { nav_recurring: 'Contratos fijos', recurringTitle: 'Contratos con pago fijo', payer: 'Cliente', concept: 'Servicio', conceptHint: 'Ej.: mantenimiento mensual', newRecurring: 'Nuevo contrato' },
      en: { nav_recurring: 'Fixed contracts', recurringTitle: 'Fixed-fee contracts', payer: 'Client', concept: 'Service', conceptHint: 'E.g. monthly maintenance', newRecurring: 'New contract' }
    }
  },

  entrepreneurship: {
    label: { es: 'Emprendimiento / negocio', en: 'Small business' },
    icon: '🚀', demo: 'engineering',
    kind: 'business',
    modules: { clients: true, finance: 'business', projects: true, recurring: true, events: true, inventory: true },
    stages: [
      { id: 'idea', es: 'Idea', en: 'Idea' },
      { id: 'validation', es: 'Validación', en: 'Validation' },
      { id: 'build', es: 'Desarrollo', en: 'Building' },
      { id: 'launch', es: 'Lanzamiento', en: 'Launch' },
      { id: 'done', es: 'Completado', en: 'Completed' }
    ],
    categories: [
      { id: 'marketing', es: 'Marketing y publicidad', en: 'Marketing & ads' },
      { id: 'supplies', es: 'Proveedores e insumos', en: 'Suppliers & supplies' },
      { id: 'tools', es: 'Herramientas', en: 'Tools' },
      { id: 'legal', es: 'Legal e impuestos', en: 'Legal & taxes' },
      { id: 'other', es: 'Otros', en: 'Other' }
    ],
    eventTypes: [
      { id: 'fair', es: 'Feria', en: 'Fair' },
      { id: 'workshop', es: 'Taller', en: 'Workshop' },
      { id: 'private', es: 'Evento privado', en: 'Private event' }
    ],
    terms: {
      es: { nav_inventory: 'Productos', inventoryItem: 'Producto', newInventory: 'Nuevo producto' },
      en: { nav_inventory: 'Products', inventoryItem: 'Product', newInventory: 'New product' }
    }
  },

  art_social: {
    label: { es: 'Arte y emprendimiento social', en: 'Art & social enterprise' },
    icon: '🖌️', demo: 'art',
    kind: 'business',
    modules: { clients: true, finance: 'business', projects: true, recurring: true, events: true, inventory: true },
    stages: [
      { id: 'order', es: 'Pedido', en: 'Ordered' },
      { id: 'sketch', es: 'Boceto', en: 'Sketch' },
      { id: 'painting', es: 'Pintando', en: 'Painting' },
      { id: 'review', es: 'Revisión cliente', en: 'Client review' },
      { id: 'done', es: 'Entregado', en: 'Delivered' }
    ],
    categories: [
      { id: 'materials', es: 'Materiales de arte', en: 'Art supplies' },
      { id: 'frames', es: 'Marcos', en: 'Frames' },
      { id: 'transport', es: 'Transporte', en: 'Transport' },
      { id: 'venue', es: 'Alquiler de espacio', en: 'Venue rental' },
      { id: 'ads', es: 'Publicidad', en: 'Ads' },
      { id: 'other', es: 'Otros', en: 'Other' }
    ],
    eventTypes: [
      { id: 'foundation', es: 'Taller en fundación', en: 'Foundation workshop' },
      { id: 'private', es: 'Evento privado', en: 'Private event' },
      { id: 'exhibition', es: 'Exposición', en: 'Exhibition' },
      { id: 'class', es: 'Taller abierto', en: 'Open workshop' }
    ],
    terms: {
      es: {
        nav_projects: 'Encargos', newProject: 'Nuevo encargo', editProject: 'Editar encargo', projectTitle: 'Qué te pidieron',
        project: 'Encargo', activeProjects: 'Encargos activos', qa_delivery: 'Encargo / entrega',
        nav_recurring: 'Apadrinamientos', recurringTitle: 'Apadrinamientos', payer: 'Padrino o madrina',
        concept: 'Niño o niña apadrinado', conceptHint: 'Solo nombre o un código (ej.: Sofi o N-07)', group: 'Fundación',
        session: 'Sesión de taller', logSession: 'Registrar sesión de taller', newRecurring: 'Nuevo apadrinamiento',
        nav_inventory: 'Obras', inventoryItem: 'Obra', newInventory: 'Nueva obra'
      },
      en: {
        nav_projects: 'Commissions', newProject: 'New commission', editProject: 'Edit commission', projectTitle: 'What was ordered',
        project: 'Commission', activeProjects: 'Active commissions', qa_delivery: 'Commission / delivery',
        nav_recurring: 'Sponsorships', recurringTitle: 'Sponsorships', payer: 'Sponsor',
        concept: 'Sponsored child', conceptHint: 'First name or a code only (e.g. Sofi or N-07)', group: 'Foundation',
        session: 'Workshop session', logSession: 'Log a workshop session', newRecurring: 'New sponsorship',
        nav_inventory: 'Artworks', inventoryItem: 'Artwork', newInventory: 'New artwork'
      }
    }
  },

  generic: {
    label: { es: 'Independiente (cualquier oficio)', en: 'Independent (any trade)' },
    icon: '💼', demo: 'engineering',
    kind: 'business',
    modules: { clients: true, finance: 'business', projects: true, recurring: true, events: false, inventory: false },
    stages: [
      { id: 'todo', es: 'Por hacer', en: 'To do' },
      { id: 'doing', es: 'En progreso', en: 'In progress' },
      { id: 'review', es: 'En revisión', en: 'In review' },
      { id: 'done', es: 'Terminado', en: 'Done' }
    ],
    categories: [
      { id: 'tools', es: 'Herramientas', en: 'Tools' },
      { id: 'transport', es: 'Transporte', en: 'Transport' },
      { id: 'services', es: 'Servicios', en: 'Services' },
      { id: 'taxes', es: 'Impuestos', en: 'Taxes' },
      { id: 'other', es: 'Otros', en: 'Other' }
    ],
    eventTypes: [],
    terms: {}
  }
};

window.CURRENCIES = ['COP', 'BRL', 'USD', 'EUR', 'MXN', 'CLP', 'PEN', 'ARS'];

/* ------------------------------------------------------------------ sample data
 * All names are fictional. Dates are relative to today so the demo always has
 * something overdue, something due today and things coming up. */
window.buildDemoData = function (templateKey) {
  const tpl = TEMPLATES[templateKey] || TEMPLATES.generic;
  const st = tpl.stages.map(s => s.id);
  const last = st[st.length - 1];
  const cat = (i) => tpl.categories[Math.min(i, tpl.categories.length - 1)].id;
  const evType = (i) => (tpl.eventTypes[i] || tpl.eventTypes[0] || { id: 'event' }).id;
  const d = (offset) => {
    const x = new Date(); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() + offset);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  };
  const uid = () => Math.random().toString(36).slice(2, 11);
  const out = { clients: [], projects: [], incomes: [], expenses: [], events: [], inventory: [], recurring: [], sessions: [] };
  const client = (name, contact, notes = '') => { const c = { id: uid(), name, contact, phone: '', email: '', notes }; out.clients.push(c); return c.id; };
  const del = (title, offset, done) => ({ id: uid(), title, date: d(offset), done: !!done });
  const project = (title, clientId, stage, total, deliverables, payments = [], notes = '') => {
    const p = { id: uid(), title, clientId, stage, total, deliverables, notes, createdAt: new Date().toISOString() };
    out.projects.push(p);
    payments.forEach(([off, amount, note]) => out.incomes.push({ id: uid(), date: d(off), amount, type: 'project', refId: p.id, note: note || '' }));
    return p.id;
  };
  const expense = (off, amount, ci, description) => out.expenses.push({ id: uid(), date: d(off), amount, category: cat(ci), description, projectId: '' });
  const income = (off, amount, type, refId, note) => out.incomes.push({ id: uid(), date: d(off), amount, type, refId: refId || '', note: note || '' });

  if (tpl.demo === 'film') {
    const cafe = client('Café Montaña', 'Laura', 'Reels mensuales');
    const hotel = client('Hotel Ribera', 'Andrés', 'Video institucional');
    const boda = client('Boda Valentina & Sebastián', 'Valentina');
    const clinica = client('Clínica Sonríe', 'Dra. Pérez');
    const banda = client('Banda Los Faroles', 'Mateo', 'Videoclip');
    project('Reels noviembre', cafe, st[2], 1800000, [del('Reel 1 · nuevo menú', -2), del('Reel 2 · barista', 3), del('Reel 3 · promo', 10)], [[-10, 900000, 'Anticipo 50%']]);
    project('Video institucional', hotel, st[3], 4500000, [del('Corte final 2 min', 0), del('Versión 30 s para redes', 4)], [[-35, 2250000, 'Anticipo'], [-1, 1000000, 'Segundo pago']]);
    project('Boda · película', boda, st[2], 6000000, [del('Teaser 1 min', -1), del('Highlight 5 min', 6), del('Película completa', 20)], [[-60, 3000000, 'Reserva'], [-20, 1500000, 'Día del evento']]);
    project('Testimonios pacientes', clinica, st[1], 2200000, [del('3 testimonios editados', 12)], [[0, 1100000, 'Anticipo']]);
    project('Videoclip "Marea"', banda, st[0], 3500000, [del('Guion técnico', 2), del('Videoclip final', 30)]);
    project('Reels octubre', cafe, last, 1800000, [del('Paquete 3 reels', -25, true)], [[-40, 900000], [-24, 900000]]);
    project('Fotos habitaciones', hotel, last, 1500000, [del('40 fotos editadas', -50, true)], [[-70, 750000], [-48, 750000]]);
    const r = { id: uid(), payer: 'Café Montaña', concept: '4 reels al mes', group: '', amount: 1200000, frequency: 'monthly', active: true, startDate: d(-120), notes: '' };
    out.recurring.push(r);
    income(-28, 1200000, 'recurring', r.id, ''); income(-58, 1200000, 'recurring', r.id, '');
    [[-1, 89000, 3, 'Adobe Creative Cloud'], [-4, 350000, 1, 'Alquiler gimbal + luces'], [-6, 120000, 2, 'Taxi rodaje'], [-12, 60000, 5, 'Licencia música'],
      [-33, 89000, 3, 'Adobe Creative Cloud'], [-38, 1200000, 0, 'Lente 35mm'], [-63, 89000, 3, 'Adobe Creative Cloud'], [-70, 400000, 1, 'Alquiler drone'],
      [-95, 89000, 3, 'Adobe Creative Cloud'], [-125, 89000, 3, 'Adobe Creative Cloud'], [-150, 300000, 4, 'Crew']].forEach(a => expense(...a));
  }

  if (tpl.demo === 'art') {
    const casa = client('Casa Lumbre (restaurante)', 'Marta', 'Mural para el patio');
    const fam = client('Familia Ortiz', 'Carlos');
    const colegio = client('Colegio Los Pinos', 'Coordinación');
    project('Mural patio 3×2 m', casa, st[2], 2800000, [del('Boceto aprobado', -3, true), del('Mural terminado', 9)], [[-15, 1400000, 'Anticipo 50%']]);
    project('Retrato de mascota (óleo)', fam, st[1], 450000, [del('Entrega del cuadro', -1)], [[-12, 200000, 'Anticipo']]);
    project('Decoración feria escolar', colegio, st[0], 900000, [del('Propuesta de diseño', 4)]);
    project('Cuadro abstracto sala', fam, last, 700000, [del('Entrega', -40, true)], [[-55, 350000], [-40, 350000]]);
    // sponsorships: paid per workshop by each sponsor
    const sponsors = [
      ['Ana M.', 'N-01', 'Fundación Semillas', 25000], ['Jorge P.', 'N-02', 'Fundación Semillas', 25000],
      ['Lucía R.', 'Sofi', 'Fundación Semillas', 25000], ['Pedro V.', 'N-04', 'Fundación Arcoíris', 30000],
      ['Camila T.', 'Mateo', 'Fundación Arcoíris', 30000]
    ].map(([payer, concept, group, amount]) => {
      const r = { id: uid(), payer, concept, group, amount, frequency: 'per_session', active: true, startDate: d(-90), notes: '' };
      out.recurring.push(r); return r;
    });
    const m = { id: uid(), payer: 'Empresa Andina', concept: 'Taller mensual para empleados', group: '', amount: 600000, frequency: 'monthly', active: true, startDate: d(-60), notes: '' };
    out.recurring.push(m);
    // workshops given (this month and last month)
    [-1, -8, -15, -22, -29, -36, -43].forEach(off => out.sessions.push({ id: uid(), date: d(off), group: 'Fundación Semillas', note: '' }));
    [-3, -17, -31, -45].forEach(off => out.sessions.push({ id: uid(), date: d(off), group: 'Fundación Arcoíris', note: '' }));
    // some sponsors already paid
    sponsors.slice(0, 2).forEach(r => income(-1, r.amount * 2, 'recurring', r.id, ''));
    sponsors.forEach(r => income(-26, r.amount * 3, 'recurring', r.id, ''));
    income(-30, 600000, 'recurring', m.id, '');
    // events
    const e1 = { id: uid(), title: 'Taller de acuarela en familia', date: d(5), time: '15:00', place: 'Casa Lumbre', type: evType(1), clientId: casa, total: 800000, notes: '12 cupos', done: false };
    const e2 = { id: uid(), title: 'Pintura en vivo · cumpleaños', date: d(-6), time: '17:00', place: 'Salón Los Robles', type: evType(1), clientId: '', total: 500000, notes: '', done: true };
    const e3 = { id: uid(), title: 'Exposición "Colores que sanan"', date: d(16), time: '18:00', place: 'Biblioteca municipal', type: evType(2), clientId: '', total: 0, notes: 'Obras de los niños', done: false };
    out.events.push(e1, e2, e3);
    income(-6, 500000, 'event', e2.id, ''); income(-2, 400000, 'event', e1.id, 'Anticipo');
    // artworks
    const art = (title, technique, size, price, status) => { const a = { id: uid(), title, technique, size, price, status, notes: '' }; out.inventory.push(a); return a; };
    art('Amanecer en el río', 'Acrílico sobre lienzo', '60 × 40 cm', 650000, 'available');
    art('Niña con cometa', 'Óleo', '50 × 70 cm', 900000, 'reserved');
    art('Serie flores I', 'Acuarela', '30 × 40 cm', 250000, 'available');
    const sold = art('Serie flores II', 'Acuarela', '30 × 40 cm', 250000, 'sold');
    income(-9, 250000, 'sale', sold.id, 'Vendida en feria');
    [[-2, 180000, 0, 'Pinturas y pinceles'], [-5, 60000, 2, 'Taxi a la fundación'], [-11, 120000, 1, 'Marco'], [-20, 95000, 0, 'Lienzos'],
      [-34, 210000, 0, 'Materiales taller'], [-40, 150000, 4, 'Publicidad Instagram'], [-65, 300000, 3, 'Alquiler salón'], [-90, 140000, 0, 'Pinturas']].forEach(a => expense(...a));
  }

  if (tpl.demo === 'engineering') {
    const agro = client('Agroindustrial El Valle', 'Ing. Rojas', 'Planta de riego');
    const res = client('Conjunto Residencial Mirador', 'Administración');
    const pyme = client('Panadería La Espiga', 'Don Luis');
    project('Diseño sistema solar 30 kWp', agro, st[2], 12000000, [del('Informe de levantamiento', -2), del('Memoria de cálculo', 5), del('Planos finales', 18)], [[-20, 6000000, 'Anticipo 50%']]);
    project('Auditoría energética', pyme, st[3], 3500000, [del('Informe final', 0)], [[-25, 1750000, 'Anticipo']]);
    project('Iluminación LED zonas comunes', res, st[1], 2400000, [del('Propuesta técnica', 3)]);
    project('Análisis de eficiencia en bombeo', agro, st[0], 5000000, [del('Visita técnica', 8)]);
    project('Cotización sistema de respaldo', pyme, last, 800000, [del('Cotización', -30, true)], [[-28, 800000]]);
    const r = { id: uid(), payer: 'Conjunto Residencial Mirador', concept: 'Mantenimiento mensual', group: '', amount: 900000, frequency: 'monthly', active: true, startDate: d(-100), notes: '' };
    out.recurring.push(r);
    income(-30, 900000, 'recurring', r.id, ''); income(-61, 900000, 'recurring', r.id, '');
    [[-3, 250000, 0, 'Licencia software de simulación'], [-7, 320000, 1, 'Viaje visita técnica'], [-14, 80000, 3, 'Impresión de planos'],
      [-35, 250000, 0, 'Licencia software'], [-42, 1500000, 2, 'Analizador de redes'], [-70, 250000, 0, 'Licencia software'], [-100, 400000, 1, 'Viajes']].forEach(a => expense(...a));
  }

  if (tpl.demo === 'personal') {
    out.projects.push(
      { id: uid(), title: 'Pagar seguro del carro', clientId: '', stage: st[0], total: 0, deliverables: [del('Pagar seguro del carro', -1)], notes: '', createdAt: new Date().toISOString() },
      { id: uid(), title: 'Renovar pasaporte', clientId: '', stage: st[1], total: 0, deliverables: [del('Pedir cita', 2), del('Llevar documentos', 12)], notes: 'Foto reciente', createdAt: new Date().toISOString() },
      { id: uid(), title: 'Declaración de renta', clientId: '', stage: st[0], total: 0, deliverables: [del('Declaración de renta', 9)], notes: '', createdAt: new Date().toISOString() },
      { id: uid(), title: 'Comprar regalo mamá', clientId: '', stage: st[0], total: 0, deliverables: [del('Comprar regalo mamá', 0)], notes: '', createdAt: new Date().toISOString() },
      { id: uid(), title: 'Revisar plan de celular', clientId: '', stage: last, total: 0, deliverables: [del('Revisar plan de celular', -6, true)], notes: '', createdAt: new Date().toISOString() });
    out.events.push(
      { id: uid(), title: 'Odontólogo', date: d(3), time: '07:30', place: 'Clínica Dental', type: evType(0), clientId: '', total: 0, notes: '', done: false },
      { id: uid(), title: 'Cumpleaños de Ana', date: d(6), time: '19:00', place: '', type: evType(2), clientId: '', total: 0, notes: '', done: false });
    [[-1, 4200000, 'salary', 'Sueldo'], [-31, 4200000, 'salary', 'Sueldo'], [-62, 4200000, 'salary', 'Sueldo'], [-92, 4200000, 'salary', 'Sueldo'],
      [-10, 350000, 'other', 'Venta bicicleta'], [-122, 4200000, 'salary', 'Sueldo'], [-153, 4200000, 'salary', 'Sueldo']].forEach(([o, a, ty, n]) => income(o, a, ty, '', n));
    [[0, 1500000, 0, 'Arriendo'], [-2, 420000, 1, 'Mercado'], [-4, 210000, 2, 'Luz y agua'], [-5, 120000, 3, 'Gasolina'], [-8, 95000, 6, 'Cine'],
      [-30, 1500000, 0, 'Arriendo'], [-33, 450000, 1, 'Mercado'], [-36, 180000, 4, 'Medicamentos'], [-40, 300000, 5, 'Gimnasio'], [-45, 200000, 6, 'Cena'],
      [-61, 1500000, 0, 'Arriendo'], [-64, 480000, 1, 'Mercado'], [-70, 210000, 2, 'Servicios'], [-91, 1500000, 0, 'Arriendo'], [-95, 400000, 1, 'Mercado'],
      [-121, 1500000, 0, 'Arriendo'], [-126, 430000, 1, 'Mercado'], [-152, 1500000, 0, 'Arriendo']].forEach(a => expense(...a));
  }

  if (tpl.demo === 'work') {
    const task = (title, stage, dels, notes = '') => out.projects.push({ id: uid(), title, clientId: '', stage, total: 0, deliverables: dels, notes, createdAt: new Date().toISOString() });
    task('Informe de costos de octubre', st[1], [del('Informe de costos de octubre', -1)], 'Enviar a gerencia');
    task('Presupuesto 2027', st[1], [del('Borrador por área', 4), del('Versión final', 18)]);
    task('Revisar facturas de proveedores', st[0], [del('Revisar facturas de proveedores', 0)]);
    task('Respuesta de auditoría', st[2], [del('Respuesta de auditoría', 6)], 'Esperando datos de farmacia');
    task('Actualizar indicadores', st[0], [del('Actualizar indicadores', 9)]);
    task('Capacitación nuevo software', st[3], [del('Capacitación nuevo software', -5, true)]);
    out.events.push(
      { id: uid(), title: 'Comité de costos', date: d(2), time: '08:00', place: 'Sala de juntas', type: evType(0), clientId: '', total: 0, notes: '', done: false },
      { id: uid(), title: 'Presentación a gerencia', date: d(5), time: '10:00', place: 'Gerencia', type: evType(2), clientId: '', total: 0, notes: '', done: false },
      { id: uid(), title: 'Taller Excel avanzado', date: d(11), time: '14:00', place: 'Virtual', type: evType(1), clientId: '', total: 0, notes: '', done: false });
  }

  return out;
};
