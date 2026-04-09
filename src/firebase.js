// ----------------------------------------------------------------------------------
// CONFIGURAÇÃO DO FIREBASE (Banco de Dados e Autenticação)
// ----------------------------------------------------------------------------------
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// As chaves são carregadas do arquivo .env de forma segura
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 1. Inicializa o aplicativo Firebase
const app = initializeApp(firebaseConfig);

// 2. Exporta o banco de dados (Firestore) para usar nas nossas telas
export const db = getFirestore(app);

// 3. Exporta a autenticação para podermos fazer login e cadastro
export const auth = getAuth(app);
