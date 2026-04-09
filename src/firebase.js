// ----------------------------------------------------------------------------------
// CONFIGURAÇÃO DO FIREBASE (Banco de Dados e Autenticação)
// ----------------------------------------------------------------------------------
// Este arquivo centraliza toda a conexão do nosso aplicativo com o Firebase.
// Assim que você criar seu projeto no Firebase Console (https://console.firebase.google.com/),
// você deve copiar as "firebaseConfig" de lá e colar aqui embaixo.

// Importamos as funções necessárias da biblioteca do Firebase
// eslint-disable-next-line no-unused-vars
import { initializeApp } from 'firebase/app';
// eslint-disable-next-line no-unused-vars
import { getFirestore } from 'firebase/firestore';
// eslint-disable-next-line no-unused-vars
import { getAuth } from 'firebase/auth';

// 1. Cole aqui a configuração do seu projeto Firebase!
// ATENÇÃO: Nunca suba essas chaves para repositórios públicos no GitHub.
// O ideal é usar variáveis de ambiente (ex: import.meta.env.VITE_FIREBASE_API_KEY).
// eslint-disable-next-line no-unused-vars
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// 2. Inicializamos o aplicativo Firebase com a configuração acima.
// Apenas descomente as linhas abaixo quando tiver instalado a biblioteca do firebase (npm install firebase)
// e preenchido as chaves acima.

/*
const app = initializeApp(firebaseConfig);

// 3. Exportamos o banco de dados (Firestore) para usar nas nossas telas (ex: salvar transações)
export const db = getFirestore(app);

// 4. Exportamos a autenticação para podermos fazer login e cadastro
export const auth = getAuth(app);
*/

// Por enquanto, o app está rodando de forma local (salvando no navegador do usuário).
// Quando for conectar ao banco de dados real, você importará `db` e `auth` nos arquivos
// onde for precisar ler ou salvar informações!
