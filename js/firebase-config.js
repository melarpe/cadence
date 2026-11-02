/* Cadence · settings for whoever runs the app (the admin). Users never see this file.
 *
 * 1) Firebase connection
 * Leave the values empty and Cadence works only on this device (no account).
 * To turn on accounts and phone ↔ computer sync, paste here the values Firebase gives you
 * (Firebase console → Project settings → Your apps → Web app → "firebaseConfig").
 * Step-by-step guide: README.es.md → "Configurar Firebase".
 *
 * These values are not secret: they only identify the project. What protects the
 * data is firestore.rules (each person can only read and write their own data). */
window.FIREBASE_CONFIG = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: ''
};

/* 2) Privacy policy contact (shown in the app → Settings → Privacy policy).
 * Put the email where users can ask to delete their account.
 * If it is empty, the policy tells users to contact the person who shared the app. */
window.APP_INFO = {
  owner: 'Melissa Aristizabal',
  contactEmail: ''
};
