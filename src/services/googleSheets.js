const SHEETS_API_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL || '';
const SHEETS_SECRET = import.meta.env.VITE_GOOGLE_SHEETS_SECRET || '';

export const isSheetsConfigured = Boolean(SHEETS_API_URL && SHEETS_SECRET);
export const isSupabaseConfigured = isSheetsConfigured;
export const supabaseConfigError = isSheetsConfigured
  ? null
  : 'Konfigurasi Google Sheets belum tersedia. Isi VITE_GOOGLE_SHEETS_URL dan VITE_GOOGLE_SHEETS_SECRET di .env';

async function sheetsGet(action, params = {}) {
  if (!isSheetsConfigured) throw new Error(supabaseConfigError);
  const query = new URLSearchParams({
    action,
    secret: SHEETS_SECRET,
    ...params,
  });
  const res = await fetch(`${SHEETS_API_URL}?${query.toString()}`);
  if (!res.ok) throw new Error('Gagal terhubung ke Google Sheets');
  return res.json();
}

async function sheetsPost(payload) {
  if (!isSheetsConfigured) throw new Error(supabaseConfigError);
  const res = await fetch(SHEETS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      secret: SHEETS_SECRET,
      ...payload,
    }),
  });
  if (!res.ok) throw new Error('Gagal mengirim data ke Google Sheets');
  return res.json();
}

export const sheetsDB = {
  login: (email, password) => sheetsPost({ action: 'login', email, password }),
  register: (userData) => sheetsPost({ action: 'register', ...userData }),
  getProducts: async () => {
    const res = await sheetsGet('getProducts');
    if (res.status !== 'success') throw new Error(res.message || 'Gagal memuat produk');
    return res.data;
  },
  getOrders: async (query = '') => {
    const res = await sheetsGet('getOrders', query ? { query } : {});
    if (res.status !== 'success') throw new Error(res.message || 'Gagal memuat pesanan');
    return res.data;
  },
  createOrder: (orderData) => sheetsPost({ action: 'createOrder', ...orderData }),
  trackOrder: (orderId, customerPhone) =>
    sheetsGet('trackOrder', { order_id: orderId, customer_phone: customerPhone }),
};

export async function fetchOrdersFromSheets(filterQuery = '') {
  return sheetsDB.getOrders(filterQuery);
}

export async function saveOrderToSheets(orderData = {}) {
  const res = await sheetsDB.createOrder({
    ...orderData,
    order_id: orderData.order_id || orderData.orderId || orderData.id || `ORD-${Date.now()}`,
    customer_name: orderData.customer_name || orderData.customerName || orderData.name || '',
    customer_phone: orderData.customer_phone || orderData.customerPhone || orderData.phone || '',
    items: orderData.items || orderData.cartItems || [],
    total_amount: Number(orderData.total_amount ?? orderData.totalAmount ?? orderData.total ?? 0),
    shipping_cost: Number(orderData.shipping_cost ?? orderData.shippingCost ?? 0),
    status: orderData.status || 'Menunggu Pembayaran',
    tracking_number: orderData.tracking_number || orderData.trackingNumber || '-',
  });

  if (res.status !== 'success') {
    throw new Error(res.message || 'Gagal menyimpan pesanan ke Google Sheets');
  }
  return res;
}

const SESSION_KEY = 'genzstation_session';
const authListeners = new Set();

function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredSession(session) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem('genzstation_user', JSON.stringify(session.user));
  } else {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('genzstation_user');
  }
  authListeners.forEach((cb) => {
    try {
      cb(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
    } catch (e) {
      console.error(e);
    }
  });
}

function createQueryBuilder(table) {
  const state = {
    table,
    operation: 'select',
    columns: '*',
    data: null,
    filters: [],
    orderBy: null,
    limitCount: null,
    single: false,
  };

  const builder = {
    select(columns = '*') {
      state.columns = columns;
      return builder;
    },
    insert(rows) {
      state.operation = 'insert';
      state.data = rows;
      return builder;
    },
    update(values) {
      state.operation = 'update';
      state.data = values;
      return builder;
    },
    upsert(rows) {
      state.operation = 'insert';
      state.data = rows;
      return builder;
    },
    delete() {
      state.operation = 'delete';
      return builder;
    },
    eq(column, value) {
      state.filters.push({ op: 'eq', column, value });
      return builder;
    },
    neq(column, value) {
      state.filters.push({ op: 'neq', column, value });
      return builder;
    },
    ilike(column, value) {
      state.filters.push({ op: 'ilike', column, value });
      return builder;
    },
    in(column, value) {
      state.filters.push({ op: 'in', column, value });
      return builder;
    },
    order(column, options = {}) {
      state.orderBy = { column, ascending: options.ascending !== false };
      return builder;
    },
    limit(count) {
      state.limitCount = count;
      return builder;
    },
    single() {
      state.single = true;
      return builder;
    },
    maybeSingle() {
      state.single = true;
      return builder;
    },
    async execute() {
      try {
        const res = await sheetsPost({
          action: 'query',
          ...state,
        });
        if (res.status !== 'success') {
          return { data: null, error: { message: res.message || 'Query Google Sheets gagal' } };
        }
        return { data: res.data, error: null };
      } catch (err) {
        return { data: null, error: { message: err.message || 'Terjadi kesalahan koneksi' } };
      }
    },
    then(resolve, reject) {
      return builder.execute().then(resolve, reject);
    },
  };

  return builder;
}

export const sheetsClient = {
  from: (table) => createQueryBuilder(table),
  auth: {
    async getSession() {
      return { data: { session: getStoredSession() }, error: null };
    },
    async getUser() {
      const session = getStoredSession();
      return { data: { user: session?.user || null }, error: null };
    },
    onAuthStateChange(callback) {
      authListeners.add(callback);
      callback('INITIAL_SESSION', getStoredSession());
      return {
        data: {
          subscription: {
            unsubscribe: () => authListeners.delete(callback),
          },
        },
      };
    },
    async signInWithPassword({ email, password }) {
      try {
        const res = await sheetsDB.login(email, password);
        if (res.status !== 'success') {
          return { data: { user: null, session: null }, error: { message: res.message || 'Login gagal' } };
        }
        const session = { user: res.user, access_token: 'sheets-token' };
        setStoredSession(session);
        return { data: { user: res.user, session }, error: null };
      } catch (err) {
        return { data: { user: null, session: null }, error: { message: err.message } };
      }
    },
    async signUp({ email, password, options }) {
      try {
        const meta = options?.data || {};
        const res = await sheetsDB.register({
          email,
          password,
          name: meta.name || meta.full_name || '',
          phone: meta.phone || '',
          role: meta.role || 'customer',
        });
        if (res.status !== 'success') {
          return { data: { user: null, session: null }, error: { message: res.message || 'Registrasi gagal' } };
        }
        const session = { user: res.user, access_token: 'sheets-token' };
        setStoredSession(session);
        return { data: { user: res.user, session }, error: null };
      } catch (err) {
        return { data: { user: null, session: null }, error: { message: err.message } };
      }
    },
    async resetPasswordForEmail(email) {
      const { data, error } = await createQueryBuilder('Users').select('id,email').eq('email', email).maybeSingle();
      if (error || !data) {
        return { data: null, error: { message: 'Email tidak terdaftar di sistem' } };
      }
      return { data, error: null };
    },
    async updateUser({ password }) {
      const session = getStoredSession();
      if (!session?.user?.email) {
        return { data: null, error: { message: 'Sesi pengguna tidak ditemukan' } };
      }
      const res = await sheetsPost({ action: 'resetPassword', email: session.user.email, password });
      if (res.status !== 'success') {
        return { data: null, error: { message: res.message || 'Gagal memperbarui kata sandi' } };
      }
      return { data: { user: session.user }, error: null };
    },
    async signOut() {
      setStoredSession(null);
      return { error: null };
    },
  },
};

// Alias kompatibilitas agar halaman lama yang mengimpor nama variabel ini langsung terhubung ke Google Sheets
export const supabase = sheetsClient;