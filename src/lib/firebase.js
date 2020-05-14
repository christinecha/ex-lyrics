import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDiZfsH55AMe6WdlrX0goZQjHcrgGawru0",
  authDomain: "ex-lyrics.firebaseapp.com",
  databaseURL: "https://ex-lyrics.firebaseio.com",
  projectId: "ex-lyrics",
  storageBucket: "ex-lyrics.appspot.com",
  messagingSenderId: "746150652042",
  appId: "1:746150652042:web:82c64ea8e58eea66a16573",
  measurementId: "G-RQN7V2LP97"
};

firebase.initializeApp(firebaseConfig);

export default firebase