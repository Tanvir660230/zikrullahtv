
export const localService = {
    getCollection(collectionName) {
        const data = localStorage.getItem(`agency_tracker_${collectionName}`);
        return data ? JSON.parse(data) : [];
    },

    saveCollection(collectionName, data) {
        localStorage.setItem(`agency_tracker_${collectionName}`, JSON.stringify(data));
    },

    async addDocument(collectionName, data) {
        const list = this.getCollection(collectionName);
        const newItem = { id: crypto.randomUUID(), ...data };
        list.unshift(newItem);
        this.saveCollection(collectionName, list);
        return newItem;
    },

    async updateDocument(collectionName, id, updates) {
        const list = this.getCollection(collectionName);
        const index = list.findIndex(item => item.id == id);
        if (index !== -1) {
            list[index] = { ...list[index], ...updates };
            this.saveCollection(collectionName, list);
            return list[index];
        }
        throw new Error('Document not found');
    },

    async deleteDocument(collectionName, id) {
        const list = this.getCollection(collectionName);
        const newList = list.filter(item => item.id != id);
        this.saveCollection(collectionName, newList);
        return true;
    },

    async getSettings() {
        const data = localStorage.getItem('agency_tracker_settings');
        return data ? JSON.parse(data) : null;
    },

    async saveSettings(settings) {
        localStorage.setItem('agency_tracker_settings', JSON.stringify(settings));
        return settings;
    },

    async clearAll() {
        localStorage.removeItem('agency_tracker_transactions');
        localStorage.removeItem('agency_tracker_beneficiaries');
        localStorage.removeItem('agency_tracker_sources');
        localStorage.removeItem('agency_tracker_settings');
        return true;
    }
};
