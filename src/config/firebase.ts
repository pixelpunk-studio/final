import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA9BsU0k3A-QPXT3SvaX98rOuMpqjdX7Q8",
  authDomain: "pixel-punk.firebaseapp.com",
  databaseURL: "https://pixel-punk-default-rtdb.firebaseio.com",
  projectId: "pixel-punk",
  storageBucket: "pixel-punk.firebasestorage.app",
  messagingSenderId: "968396169727",
  appId: "1:968396169727:web:ba3fbf67962e4f6bc487ca"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export default app;
