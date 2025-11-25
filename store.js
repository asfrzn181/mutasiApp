import { defineStore } from 'pinia';
import { api } from './api.js';

export const useMainStore = defineStore('main', {
    state: () => ({
        formasiList: [],
        occupiedIds: [], // ID Formasi yang sedang TERISI (dari dashboard)
        lastFetchFormasi: 0,
        lastFetchDash: 0
    }),
    
    getters: {
        // Filter: Hanya formasi yang ID-nya TIDAK ADA di daftar occupiedIds
        emptyFormasiList: (state) => {
            return state.formasiList.filter(f => !state.occupiedIds.includes(String(f.id)));
        }
    },

    actions: {
        // Ambil Master Formasi (Cache 5 menit)
        async fetchFormasi(force = false) {
            const now = Date.now();
            if (!force && this.formasiList.length > 0 && (now - this.lastFetchFormasi < 300000)) {
                return this.formasiList;
            }
            const res = await api.getFormasi();
            this.formasiList = res.data;
            this.lastFetchFormasi = now;
            return this.formasiList;
        },

        // Ambil Dashboard (Cache 1 menit) untuk tahu mana yang terisi
        async fetchDashboard(force = false) {
            const now = Date.now();
            if (!force && this.occupiedIds.length > 0 && (now - this.lastFetchDash < 60000)) {
                return;
            }
            const res = await api.getDashboard();
            this.occupiedIds = res.data
                .filter(x => x.status === 'TERISI')
                .map(x => String(x.id_formasi));
            this.lastFetchDash = now;
        },

        // Helper: Cari detail formasi by ID
        getFormasiDetail(id) {
            return this.formasiList.find(f => String(f.id) === String(id));
        },

        // Reset Cache (Dipanggil setelah mutasi sukses)
        invalidateCache() {
            this.lastFetchFormasi = 0;
            this.lastFetchDash = 0;
        }
    }
});
