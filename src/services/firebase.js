
export const firebaseConfig = {
    apiKey: "AIzaSyBFCxKAfUtCbu4qimp0yS3uyFewaQbOWac",
    authDomain: "zikrullah-tv.firebaseapp.com",
    projectId: "zikrullah-tv",
    storageBucket: "zikrullah-tv.firebasestorage.app",
    messagingSenderId: "372758603397",
    appId: "1:372758603397:web:5251d877120734e7b46bec",
    measurementId: "G-PCBWHB4ST2"
};

let db = null;
let methods = null;

export const firebaseService = {
    async init() {
        console.log('FirebaseService: Attempting to connect to Cloud...');
        try {
            const [appMod, fsMod] = await Promise.all([
                import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'),
                import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js')
            ]);

            const app = appMod.initializeApp(firebaseConfig);
            db = fsMod.getFirestore(app);
            methods = {
                collection: fsMod.collection,
                addDoc: fsMod.addDoc,
                getDocs: fsMod.getDocs,
                query: fsMod.query,
                where: fsMod.where,
                orderBy: fsMod.orderBy,
                updateDoc: fsMod.updateDoc,
                deleteDoc: fsMod.deleteDoc,
                doc: fsMod.doc,
                onSnapshot: fsMod.onSnapshot
            };
            console.log('FirebaseService: Cloud connection established');
            return true;
        } catch (error) {
            console.error('FirebaseService: Initialization failed', error);
            return false;
        }
    },

    async getCollection(collectionName) {
        const q = methods.query(methods.collection(db, collectionName), methods.orderBy('date', 'desc'));
        const snapshot = await methods.getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    subscribeToCollection(collectionName, callback) {
        let q;
        if (collectionName === 'transactions') {
            q = methods.query(methods.collection(db, collectionName), methods.orderBy('date', 'desc'));
        } else {
            q = methods.collection(db, collectionName);
        }

        return methods.onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(data);
        }, (error) => {
            console.error(`FirebaseService: Subscription error for ${collectionName}:`, error);
        });
    },

    async addDocument(collectionName, data) {
        const docRef = await methods.addDoc(methods.collection(db, collectionName), data);
        return { id: docRef.id, ...data };
    },

    async updateDocument(collectionName, id, updates) {
        const docRef = methods.doc(db, collectionName, id);
        await methods.updateDoc(docRef, updates);
        return { id, ...updates };
    },

    async deleteDocument(collectionName, id) {
        await methods.deleteDoc(methods.doc(db, collectionName, id));
        return true;
    },

    async getSettings() {
        const snapshot = await methods.getDocs(methods.collection(db, 'settings'));
        if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        }
        return null;
    },

    async saveSettings(settings) {
        const current = await this.getSettings();
        if (current && current.id) {
            await methods.updateDoc(methods.doc(db, 'settings', current.id), settings);
        } else {
            await methods.addDoc(methods.collection(db, 'settings'), settings);
        }
        return settings;
    },

    subscribeToSettings(callback) {
        const q = methods.collection(db, 'settings');
        return methods.onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                callback({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            } else {
                callback(null);
            }
        }, (error) => {
            console.error('FirebaseService: Settings subscription error:', error);
        });
    }
};
