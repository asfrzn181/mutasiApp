import axios from 'axios';

// State Internal Module
const STATE = {
    url: sessionStorage.getItem('api_url') || '',
    token: sessionStorage.getItem('api_token') || ''
};

// Helper Request
async function request(action, method = 'GET', data = {}) {
    if (!STATE.url || !STATE.token) throw new Error("Sesi habis atau belum login.");

    const config = {
        method: method,
        url: `${STATE.url}?action=${action}&token=${STATE.token}`,
        headers: { 'Content-Type': 'text/plain' } // GAS butuh text/plain agar tidak preflight CORS ribet
    };

    if (method === 'GET') {
        // Ubah object ke query string
        const params = new URLSearchParams(data).toString();
        config.url += `&${params}`;
    } else {
        // POST: Kirim token di body juga untuk keamanan
        data.token = STATE.token;
        config.data = JSON.stringify(data);
    }

    try {
        const res = await axios(config);
        if (res.data.status === 'success') return res.data;
        throw new Error(res.data.message || 'Terjadi kesalahan pada server.');
    } catch (err) {
        console.error("API Error:", err);
        throw err;
    }
}

// --- EXPORT AUTH ---
export const auth = {
    login: async (url, token) => {
        STATE.url = url; 
        STATE.token = token;
        // Test koneksi ringan
        await request('get_formasi'); 
        // Simpan jika sukses
        sessionStorage.setItem('api_url', url);
        sessionStorage.setItem('api_token', token);
    },
    logout: () => {
        sessionStorage.clear();
        window.location.reload();
    },
    isLoggedIn: () => !!STATE.url && !!STATE.token,
    getUrl: () => STATE.url,
    getToken: () => STATE.token
};

// --- EXPORT ENDPOINTS ---
export const api = {
    // Master Data
    getPejabat: (page=1, limit=10, q='') => request('get_pejabat', 'GET', { page, limit, q }),
    getFormasi: () => request('get_formasi'),
    
    // Transaksi
    getRiwayat: (nip) => request('get_riwayat', 'GET', { nip }),
    getDashboard: () => request('dashboard_peta'),
    getNonJob: () => request('laporan_nonjob'),
    
    // Laporan & Filter (POST)
    getLaporanMutasi: (filters) => request('get_laporan_mutasi', 'POST', filters),
    
    // CRUD Pejabat
    tambahPejabat: (data) => request('tambah_pejabat', 'POST', data),
    editPejabat: (data) => request('edit_pejabat', 'POST', data),
    hapusPejabat: (nip) => request('hapus_pejabat', 'POST', { nip }),
    
    // CRUD Formasi
    tambahFormasi: (data) => request('tambah_formasi', 'POST', data),
    editFormasi: (data) => request('edit_formasi', 'POST', data),
    hapusFormasi: (id) => request('hapus_formasi', 'POST', { id }),
    
    // Proses Mutasi
    prosesMutasi: (data) => request('proses_mutasi', 'POST', data)
};
