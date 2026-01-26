import { firebaseService } from './firebase.js';

class GlobalDatabase {
    constructor() {
        this.useFirebase = false;
        this.initPromise = this.init();
    }

    async init() {
        console.log('Database: Initializing system (Online Only Mode)...');

        // Attempt to connect to Firebase with a 5s timeout
        const connectionTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firebase connection timed out. Check your internet.')), 5000)
        );

        try {
            const success = await Promise.race([
                firebaseService.init(),
                connectionTimeout
            ]);

            if (success) {
                this.useFirebase = true;
                this.provider = firebaseService;
                console.log('Database: Connected to Cloud Storage (Firebase)');
            } else {
                throw new Error('Firebase initialization failed.');
            }
        } catch (error) {
            console.error('Database: Cloud Connection Failed!', error.message);
            this.useFirebase = false;
            this.provider = null;
            this.initError = error.message;
        }
        return { online: this.useFirebase, error: this.initError };
    }

    // Generic Methods
    async getCollection(collectionName) {
        await this.initPromise;
        if (!this.provider) throw new Error('Database not connected.');
        return this.provider.getCollection(collectionName);
    }

    subscribeToCollection(collectionName, callback) {
        this.initPromise.then(() => {
            if (this.provider) {
                this.provider.subscribeToCollection(collectionName, callback);
            }
        });
    }

    async addDocument(collectionName, data) {
        await this.initPromise;
        if (!navigator.onLine) {
            alert('Cannot save: You are currently Offline. Please check your internet connection.');
            throw new Error('Action blocked: Offline');
        }
        if (!this.provider) throw new Error('Database not connected');
        if (!data.createdAt) data.createdAt = new Date().toISOString();
        return this.provider.addDocument(collectionName, data);
    }

    async updateDocument(collectionName, id, updates) {
        await this.initPromise;
        if (!navigator.onLine) throw new Error('Action blocked: Offline');
        if (!this.provider) throw new Error('Database not connected');
        return this.provider.updateDocument(collectionName, id, updates);
    }

    async deleteDocument(collectionName, id) {
        await this.initPromise;
        if (!navigator.onLine) throw new Error('Action blocked: Offline');
        if (!this.provider) throw new Error('Database not connected');
        return this.provider.deleteDocument(collectionName, id);
    }

    // Specific entity methods for clean API
    async getTransactions() { return this.getCollection('transactions'); }
    async addTransaction(tx) { return this.addDocument('transactions', tx); }
    async updateTransaction(id, updates) { return this.updateDocument('transactions', id, updates); }
    async updateTransactionStatus(id, status) { return this.updateDocument('transactions', id, { status }); }

    async getSettings() {
        await this.initPromise;
        if (!this.provider) return null;
        return this.provider.getSettings();
    }

    async saveSettings(settings) {
        await this.initPromise;
        if (!this.provider) throw new Error('Database not connected');
        return this.provider.saveSettings(settings);
    }

    subscribeToSettings(callback) {
        this.initPromise.then(() => {
            if (this.provider) {
                this.provider.subscribeToSettings(callback);
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
        if (!this.provider) throw new Error('Database not connected');
        return this.provider.clearAll();
    }
}

export const db = new GlobalDatabase();
