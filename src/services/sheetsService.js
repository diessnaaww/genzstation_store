const SHEETS_API_URL = import.meta.env.VITE_SHEETS_WEBAPP_URL;

export const saveOrderToSheets = async (orderPayload) => {
  if (!SHEETS_API_URL) {
    console.warn('VITE_SHEETS_WEBAPP_URL belum diatur di file .env');
    return { status: 'skipped' };
  }

  try {
    // Menggunakan text/plain agar browser tidak memicu CORS preflight (OPTIONS)
    // yang tidak didukung oleh Google Apps Script
    const response = await fetch(SHEETS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(orderPayload),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Gagal mencatat pesanan ke Google Sheets:', error);
    return { status: 'error', message: error.message };
  }
};

export const fetchOrdersFromSheets = async () => {
  if (!SHEETS_API_URL) return [];

  try {
    const response = await fetch(SHEETS_API_URL);
    const result = await response.json();
    return result.status === 'success' ? result.data : [];
  } catch (error) {
    console.error('Gagal mengambil data dari Google Sheets:', error);
    return [];
  }
};