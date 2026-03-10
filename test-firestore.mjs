import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBQN_UnvehAafGv4I0Zk1f5wLTUjxbXU78",
    authDomain: "careroute-landing.firebaseapp.com",
    projectId: "careroute-landing",
    storageBucket: "careroute-landing.firebasestorage.app",
    messagingSenderId: "870183120356",
    appId: "1:870183120356:web:a70af85d7ad77f6d516bf1",
    measurementId: "G-SRJC7313Q7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
    try {
        const docRef = await addDoc(collection(db, "newsletter_subscribers"), {
            email: "test@example.com",
            source: "shorts_landing",
            createdAt: serverTimestamp()
        });
        console.log("Success:", docRef.id);
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

test();
