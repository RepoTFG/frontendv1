import { initializeApp } from "firebase/app"; // arrancamos firebase
import { getAuth } from "firebase/auth"; // obtenemos auth

const firebaseConfig = {
    apiKey: "AIzaSyBbXqS5Ogb6mbSSgavFit13FrL11fVdNtc",
    authDomain: "readroom-92a82.firebaseapp.com",
    projectId: "readroom-92a82",
    storageBucket: "readroom-92a82.firebasestorage.app",
    messagingSenderId: "593481371497",
    appId: "1:593481371497:web:7844c1dc1615a7b71377f8",
    measurementId: "G-5P30VPTLYG",
};

const app = initializeApp(firebaseConfig); // cargamos firebase con la config
export const auth = getAuth(app); // auth
