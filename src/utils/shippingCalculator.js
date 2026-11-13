// Tarif dasar per Kg berdasarkan Zona Provinsi Tujuan (Titik asal gudang Pulau Jawa)
const ZONE_RATES = {
  ZONE_1_JATENG_DIY: {
    label: 'Jawa Tengah & DIY',
    'J&T Express': 10000,
    'JNE Reguler': 11000,
  },
  ZONE_2_JAWA_LAINNYA: {
    label: 'Jawa Timur, Jawa Barat, DKI Jakarta & Banten',
    'J&T Express': 15000,
    'JNE Reguler': 16000,
  },
  ZONE_3_BALI_NUSRA: {
    label: 'Bali & Nusa Tenggara',
    'J&T Express': 24000,
    'JNE Reguler': 26000,
  },
  ZONE_4_SUMATERA: {
    label: 'Pulau Sumatera',
    'J&T Express': 28000,
    'JNE Reguler': 30000,
  },
  ZONE_5_KALIMANTAN_SULAWESI: {
    label: 'Kalimantan & Sulawesi',
    'J&T Express': 38000,
    'JNE Reguler': 40000,
  },
  ZONE_6_MALUKU_PAPUA: {
    label: 'Maluku & Papua',
    'J&T Express': 65000,
    'JNE Reguler': 70000,
  },
};

// Pemetaan nama Provinsi tujuan ke Zona Tarif
export const getProvinceZone = (provinceName = '') => {
  const prov = provinceName.toUpperCase();

  if (prov.includes('JAWA TENGAH') || prov.includes('YOGYAKARTA')) {
    return ZONE_RATES.ZONE_1_JATENG_DIY;
  }
  if (
    prov.includes('JAWA TIMUR') ||
    prov.includes('JAWA BARAT') ||
    prov.includes('JAKARTA') ||
    prov.includes('BANTEN')
  ) {
    return ZONE_RATES.ZONE_2_JAWA_LAINNYA;
  }
  if (prov.includes('BALI') || prov.includes('NUSA TENGGARA')) {
    return ZONE_RATES.ZONE_3_BALI_NUSRA;
  }
  if (
    prov.includes('ACEH') ||
    prov.includes('SUMATERA') ||
    prov.includes('RIAU') ||
    prov.includes('JAMBI') ||
    prov.includes('BENGKULU') ||
    prov.includes('LAMPUNG') ||
    prov.includes('BANGKA')
  ) {
    return ZONE_RATES.ZONE_4_SUMATERA;
  }
  if (prov.includes('KALIMANTAN') || prov.includes('SULAWESI') || prov.includes('GORONTALO')) {
    return ZONE_RATES.ZONE_5_KALIMANTAN_SULAWESI;
  }
  if (prov.includes('MALUKU') || prov.includes('PAPUA')) {
    return ZONE_RATES.ZONE_6_MALUKU_PAPUA;
  }

  // Default ke Zona 2 jika provinsi belum dipilih
  return ZONE_RATES.ZONE_2_JAWA_LAINNYA;
};

// Hitung detail berat (gram -> kg) & total ongkir untuk 1 paket supplier
export const calculatePackageShipping = (items, provinceName, courier = 'J&T Express') => {
  const totalWeightGram = items.reduce((sum, item) => {
    const unitWeight = Number(item.weight) > 0 ? Number(item.weight) : 250;
    return sum + unitWeight * item.quantity;
  }, 0);

  // Aturan standar kurir J&T & JNE: pembulatan ke atas per 1.000 gram (minimal 1 kg)
  const billableKg = Math.max(1, Math.ceil(totalWeightGram / 1000));

  const zone = getProvinceZone(provinceName);
  const ratePerKg = zone[courier] || zone['J&T Express'];
  const shippingCost = billableKg * ratePerKg;

  return {
    totalWeightGram,
    billableKg,
    ratePerKg,
    shippingCost,
    zoneLabel: zone.label,
  };
};