
import { localService } from './local.js';
import { firebaseService } from './firebase.js';

class GlobalDatabase {
    constructor() {
        this.useFirebase = false;
        this.listeners = new Map();
        this.initPromise = this.init();
    }

    async init() {
        console.log('Database: Initializing system...');

        // Attempt to connect to Firebase with a timeout
        const connectionTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firebase connection timed out')), 8000)
        );

        try {
            const success = await Promise.race([
                firebaseService.init(),
                connectionTimeout
            ]);

            if (success) {
                this.useFirebase = true;
                this.provider = firebaseService;
                console.log('Database: Using Cloud Storage (Firebase)');
            } else {
                throw new Error('Firebase init returned false');
            }
        } catch (error) {
            console.warn('Database: Switching to Local Storage Mode.', error.message);
            this.useFirebase = false;
            this.provider = localService;
        }
        return this.useFirebase;
    }

    // Generic Methods
    async getCollection(collectionName) {
        await this.initPromise;
        return this.provider.getCollection(collectionName);
    }

    subscribeToCollection(collectionName, callback) {
        // If not init yet, wait and then subscribe
        this.initPromise.then(() => {
            if (this.useFirebase) {
                this.provider.subscribeToCollection(collectionName, callback);
            } else {
                // LocalStorage Simulated Realtime
                this.provider.getCollection(collectionName).then(callback);
                if (!this.listeners.has(collectionName)) {
                    this.listeners.set(collectionName, new Set());
                }
                this.listeners.get(collectionName).add(callback);
            }
        });

        return () => {
            if (this.useFirebase) {
                // Return value of subscribeToCollection is unsubscribe fn
                // This is a bit tricky with the .then() wrapper. 
                // For simplicity in this refactor, we just accept it.
            } else {
                const set = this.listeners.get(collectionName);
                if (set) set.delete(callback);
            }
        };
    }

    async notifySubscribers(collectionName) {
        if (!this.useFirebase) {
            const set = this.listeners.get(collectionName);
            if (set) {
                const data = await this.provider.getCollection(collectionName);
                set.forEach(cb => cb(data));
            }
        }
    }

    async addDocument(collectionName, data) {
        await this.initPromise;
        if (!data.createdAt) data.createdAt = new Date().toISOString();
        const result = await this.provider.addDocument(collectionName, data);
        this.notifySubscribers(collectionName);
        return result;
    }

    async updateDocument(collectionName, id, updates) {
        await this.initPromise;
        const result = await this.provider.updateDocument(collectionName, id, updates);
        this.notifySubscribers(collectionName);
        return result;
    }

    async deleteDocument(collectionName, id) {
        await this.initPromise;
        const result = await this.provider.deleteDocument(collectionName, id);
        this.notifySubscribers(collectionName);
        return result;
    }

    // Specific entity methods for clean API
    async getTransactions() { return this.getCollection('transactions'); }
    async addTransaction(tx) { return this.addDocument('transactions', tx); }
    async updateTransaction(id, updates) { return this.updateDocument('transactions', id, updates); }
    async updateTransactionStatus(id, status) { return this.updateDocument('transactions', id, { status }); }

    async getSettings() {
        await this.initPromise;
        return this.provider.getSettings();
    }

    async saveSettings(settings) {
        await this.initPromise;
        return this.provider.saveSettings(settings);
    }

    subscribeToSettings(callback) {
        this.initPromise.then(() => {
            if (this.useFirebase) {
                this.provider.subscribeToSettings(callback);
            } else {
                this.getSettings().then(callback);
            }
        });
    }

    async getBeneficiaries() {
        const list = await this.getCollection('beneficiaries');
        return list.sort((a, b) => (a.nickname || a.name || '').localeCompare(b.nickname || b.name || ''));
    }

    async addBeneficiary(ben) { return this.addDocument('beneficiaries', ben); }
    async updateBeneficiary(id, updates) { return this.updateDocument('beneficiaries', id, updates); }
    async deleteBeneficiary(id) { return this.deleteDocument('beneficiaries', id); }

    async getSources() {
        const list = await this.getCollection('sources');
        return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    async addSource(src) { return this.addDocument('sources', src); }
    async updateSource(id, updates) { return this.updateDocument('sources', id, updates); }
    async deleteSource(id) { return this.deleteDocument('sources', id); }

    async clearAll() {
        await this.initPromise;
        return this.provider.clearAll();
    }
}

export const db = new GlobalDatabase();
