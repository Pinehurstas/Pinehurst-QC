import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBg-ofXrXgn64c_0P5hecyjbRNoSebBPQE",
  authDomain: "pinehurst-qc.firebaseapp.com",
  projectId: "pinehurst-qc",
  // For Firebase Web SDK, storageBucket should be the bucket name (usually <project-id>.appspot.com)
  storageBucket: "pinehurst-qc.appspot.com",
  messagingSenderId: "977197838443",
  appId: "1:977197838443:web:93b1cd8d4ddb5a22fcc12e"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)

// Ensure we always have a user (anonymous) so writes pass auth-based rules
onAuthStateChanged(auth, (user) => {
  if (!user) {
    signInAnonymously(auth).catch(console.error)
  }
})
