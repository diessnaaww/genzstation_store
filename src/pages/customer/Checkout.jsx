import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { saveOrderToSheets } from '../../services/googleSheets.js';
import { calculatePackageShipping } from '../../utils/shippingCalculator.js';
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Package,
  Zap,
  FileText,
  ShoppingBag,
  Loader2,
  Truck,
  MapPin,
  TicketPercent,
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  AlertCircle,
  ExternalLink,
  Info,
  Scale,
} from 'lucide-react';

// Konfigurasi Metode Pembayaran & Tarif Biaya Layanan Otomatis
const PAYMENT_METHODS = [
  {
    id: 'qris',
    name: 'QRIS DANA Bisnis',
    badge: 'Biaya 0,7%',
    type: 'percent',
    rate: 0.007,
  },
  {
    id: 'transfer',
    name: 'Transfer Bank',
    badge: 'Gratis + Kode Unik',
    type: 'transfer',
    rate: 0,
  },
];

// Ganti nomor rekening di bawah ini dengan nomor rekening asli Anda
const BANK_ACCOUNTS = [
  { id: 'BCA', name: 'BCA', accountNumber: '1920941661', holder: 'ADIESTI NURI AMANDA' },
  { id: 'BRI', name: 'BRI', accountNumber: '646901049211531', holder: 'ADIESTI NURI AMANDA' },
  { id: 'SEABANK', name: 'SeaBank', accountNumber: '901448381028', holder: 'ADIESTI NURI AMANDA' },
  { id: 'BANK_JATIM', name: 'Bank Jatim', accountNumber: '0076545863', holder: 'ADIESTI NURI AMANDA' },
];

export const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, setCartItems } = useCart();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  // State Dropdown Wilayah Indonesia (Open API Gratis)
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvId, setSelectedProvId] = useState('');
  const [selectedRegencyId, setSelectedRegencyId] = useState('');
  const [manualRegionMode, setManualRegionMode] = useState(false);

  // State Kode Promo
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoFeedback, setPromoFeedback] = useState({ type: '', text: '' });

// Satu sumber perhitungan biaya layanan & total akhir
const activePayment =
  PAYMENT_METHODS.find((m) => m.id === paymentMethod) || PAYMENT_METHODS[0];
const activeBank =
  VA_BANKS.find((b) => b.id === selectedBank) || VA_BANKS[0];

const baseTotal = Number(subtotal || 0) + Number(shippingCost || 0);
const serviceFee =
  activePayment.type === 'percent'
    ? Math.round(baseTotal * activePayment.rate)
    : activePayment.rate;
const grandTotal = baseTotal + serviceFee;

// Label lengkap metode pembayaran untuk disimpan ke Google Sheets & pesan WhatsApp
const paymentLabel =
  activePayment.id === 'va'
    ? `Virtual Account - ${activeBank.name}`
    : activePayment.name;

const handleCopyVa = (text) => {
  navigator.clipboard.writeText(text);
  setCopiedVa(true);
  setTimeout(() => setCopiedVa(false), 2000);
};

<div className="space-y-4">
  {/* 2 Pilihan Utama: QRIS DANA Bisnis & Transfer Bank */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {PAYMENT_METHODS.map((method) => {
      const isSelected = paymentMethod === method.id;
      return (
        <button
          key={method.id}
          type="button"
          onClick={() => setPaymentMethod(method.id)}
          className={`text-left p-4 rounded-xl border transition-all ${
            isSelected
              ? 'border-purple-600 bg-purple-50/40 ring-1 ring-purple-600'
              : 'border-gray-200 bg-white hover:border-purple-300'
          }`}
        >
          <div className="font-semibold text-gray-900">{method.name}</div>
          <span
            className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-md ${
              isSelected
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {method.badge}
          </span>
        </button>
      );
    })}
  </div>

  {/* Detail 1: QRIS DANA Bisnis */}
  {paymentMethod === 'qris' && (
    <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 flex flex-col sm:flex-row items-center gap-4">
      <img
        src="/qris-dana-bisnis.png"
        alt="QRIS DANA Bisnis"
        className="w-36 h-36 object-contain rounded-lg bg-white p-2 border border-gray-200 shadow-sm"
      />
      <div className="space-y-1 text-center sm:text-left">
        <p className="text-sm font-semibold text-gray-900">
          QRIS DANA Bisnis (Semua Bank & E-Wallet)
        </p>
        <p className="text-xs text-gray-600 leading-relaxed">
          Scan menggunakan <strong>DANA, GoPay, OVO, ShopeePay</strong> atau{' '}
          <strong>Mobile Banking (BCA, BRI, Mandiri, BNI, SeaBank, Bank Jatim)</strong>.
          Biaya layanan tetap <strong>0,7%</strong>.
        </p>
      </div>
    </div>
  )}

  {/* Detail 2: Transfer Bank (BCA, BRI, SeaBank, Bank Jatim) + Kode Unik 3 Digit */}
  {paymentMethod === 'transfer' && (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
        Pilih Rekening Bank Tujuan (Tanpa Biaya Admin)
      </p>

      {/* Tombol Pilih 4 Bank */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {BANK_ACCOUNTS.map((bank) => {
          const isBankActive = selectedBank === bank.id;
          return (
            <button
              key={bank.id}
              type="button"
              onClick={() => setSelectedBank(bank.id)}
              className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all ${
                isBankActive
                  ? 'border-purple-600 bg-purple-600 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
              }`}
            >
              {bank.name}
            </button>
          );
        })}
      </div>

      {/* Kotak Info Nomor Rekening + Tombol Salin */}
      <div className="p-3 rounded-lg bg-white border border-gray-200 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-gray-500">
            Bank <strong>{activeBank.name}</strong> • a.n. <strong>{activeBank.holder}</strong>
          </p>
          <p className="text-base font-bold text-gray-900 tracking-wider mt-0.5">
            {activeBank.accountNumber}
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleCopyText(activeBank.accountNumber, 'rek')}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors shrink-0"
        >
          {copiedField === 'rek' ? 'Tersalin!' : 'Salin No. Rek'}
        </button>
      </div>

      {/* Kotak Info Total Transfer Tepat dengan Kode Unik 3 Digit */}
      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-amber-800">
            Nominal Transfer Tepat (termasuk Kode Unik <strong>+{appliedUniqueCode}</strong>):
          </p>
          <p className="text-base font-extrabold text-amber-950 mt-0.5">
            Rp {grandTotal.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">
            Transfer sesuai hingga 3 digit terakhir agar pesanan cepat diverifikasi.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleCopyText(grandTotal, 'nominal')}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-200 text-amber-900 hover:bg-amber-300 transition-colors shrink-0"
        >
          {copiedField === 'nominal' ? 'Tersalin!' : 'Salin Nominal'}
        </button>
      </div>
    </div>
  )}
</div>

{serviceFee > 0 && (
  <div className="flex justify-between text-sm text-gray-600">
    <span>Biaya Layanan QRIS (0,7%)</span>
    <span>Rp {serviceFee.toLocaleString('id-ID')}</span>
  </div>
)}

{appliedUniqueCode > 0 && (
  <div className="flex justify-between text-sm text-amber-700 font-medium">
    <span>Kode Unik Verifikasi</span>
    <span>+ Rp {appliedUniqueCode.toLocaleString('id-ID')}</span>
  </div>
)}

  // State Formulir Dinamis
  const [formData, setFormData] = useState(() => {
    const savedProfile = localStorage.getItem('genz_profile');
    const parsed = savedProfile ? JSON.parse(savedProfile) : {};
    return {
      customerName: parsed.name || '',
      whatsappNumber: parsed.whatsapp || '',
      customerEmail: '',
      province: '',
      city: '',
      district: '',
      postalCode: '',
      shippingAddress: parsed.address || '',
      courier: 'J&T Express',
      targetAccount: '',
      serviceBrief: '',
      notes: '',
    };
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.displayName || '',
        customerEmail: prev.customerEmail || user.email || '',
      }));
    }
  }, [user]);

  // Klasifikasi isi keranjang berdasarkan 3 pilar
  const physicalItems = cartItems.filter((item) => item.pillar === 'physical');
  const digitalItems = cartItems.filter((item) => item.pillar === 'digital');
  const serviceItems = cartItems.filter((item) => item.pillar === 'service');

  const hasPhysical = physicalItems.length > 0;
  const hasDigital = digitalItems.length > 0;
  const hasService = serviceItems.length > 0;

  // Muat daftar Provinsi Indonesia gratis saat ada item fisik
  useEffect(() => {
    if (!hasPhysical || manualRegionMode) return;
    fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch(() => setManualRegionMode(true));
  }, [hasPhysical, manualRegionMode]);

  // Muat daftar Kota/Kabupaten saat Provinsi dipilih
  const handleProvinceSelect = (e) => {
    const provId = e.target.value;
    const provObj = provinces.find((p) => p.id === provId);
    setSelectedProvId(provId);
    setSelectedRegencyId('');
    setRegencies([]);
    setDistricts([]);
    setFormData((prev) => ({
      ...prev,
      province: provObj ? provObj.name : '',
      city: '',
      district: '',
    }));

    if (provId) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provId}.json`)
        .then((res) => res.json())
        .then((data) => setRegencies(data))
        .catch(() => setManualRegionMode(true));
    }
  };

  // Muat daftar Kecamatan saat Kota/Kabupaten dipilih
  const handleRegencySelect = (e) => {
    const regId = e.target.value;
    const regObj = regencies.find((r) => r.id === regId);
    setSelectedRegencyId(regId);
    setDistricts([]);
    setFormData((prev) => ({
      ...prev,
      city: regObj ? regObj.name : '',
      district: '',
    }));

    if (regId) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regId}.json`)
        .then((res) => res.json())
        .then((data) => setDistricts(data))
        .catch(() => setManualRegionMode(true));
    }
  };

  // Kelompokkan produk fisik berdasarkan kota asal supplier (Multi-Origin Dropship)
  const physicalPackages = physicalItems.reduce((acc, item) => {
    const origin = item.originCity || 'Gudang Mitra';
    if (!acc[origin]) acc[origin] = [];
    acc[origin].push(item);
    return acc;
  }, {});

  const originCitiesList = Object.keys(physicalPackages);

  // Hitung berat & ongkos kirim otomatis per masing-masing paket supplier
  const shippingDetailsByOrigin = originCitiesList.reduce((acc, origin) => {
    acc[origin] = calculatePackageShipping(
      physicalPackages[origin],
      formData.province,
      formData.courier
    );
    return acc;
  }, {});

  const totalShippingCost = hasPhysical
    ? originCitiesList.reduce((sum, origin) => sum + shippingDetailsByOrigin[origin].shippingCost, 0)
    : 0;

  const totalPhysicalWeightGram = hasPhysical
    ? originCitiesList.reduce(
        (sum, origin) => sum + shippingDetailsByOrigin[origin].totalWeightGram,
        0
      )
    : 0;

  // Perhitungan Otomatis: Subtotal -> Diskon -> Ongkir -> Biaya Layanan -> Total Akhir
  const subtotal = getTotalPrice();

  const discountAmount = appliedPromo
    ? appliedPromo.type === 'percent'
      ? Math.round((subtotal * appliedPromo.value) / 100)
      : appliedPromo.value
    : 0;

  const netSubtotal = Math.max(0, subtotal - discountAmount);
  const amountBeforeFee = netSubtotal + totalShippingCost;

  const selectedPayment = PAYMENT_METHODS[paymentMethod] || PAYMENT_METHODS.QRIS;

  const paymentServiceFee = (() => {
    if (amountBeforeFee <= 0) return 0;
    if (selectedPayment.feeType === 'percent') {
      return Math.round((amountBeforeFee * selectedPayment.feeValue) / 100);
    }
    if (selectedPayment.feeType === 'fixed') {
      return selectedPayment.feeValue;
    }
    return 0;
  })();

  const finalTotal = amountBeforeFee + paymentServiceFee;

  const formatIDR = (price) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fungsi Terapkan Kode Promo
  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoFeedback({ type: 'error', text: 'Masukkan kode voucher terlebih dahulu.' });
      return;
    }

    if (code === 'GENZBARU') {
      if (subtotal < 50000) {
        setPromoFeedback({
          type: 'error',
          text: 'Voucher GENZBARU membutuhkan minimal belanja Rp 50.000.',
        });
        return;
      }
      setAppliedPromo({ code: 'GENZBARU', type: 'percent', value: 10, label: 'Diskon 10%' });
      setPromoFeedback({ type: 'success', text: 'Voucher GENZBARU (Diskon 10%) berhasil dipakai!' });
    } else if (code === 'SKRIPSIAMAN') {
      if (!hasService) {
        setPromoFeedback({
          type: 'error',
          text: 'Voucher SKRIPSIAMAN hanya berlaku untuk kategori Layanan Jasa.',
        });
        return;
      }
      setAppliedPromo({
        code: 'SKRIPSIAMAN',
        type: 'fixed',
        value: 5000,
        label: 'Potongan Rp 5.000',
      });
      setPromoFeedback({
        type: 'success',
        text: 'Voucher SKRIPSIAMAN (Potongan Rp 5.000) berhasil dipakai!',
      });
    } else {
      setAppliedPromo(null);
      setPromoFeedback({ type: 'error', text: 'Kode voucher tidak valid atau sudah berakhir.' });
    }
  };

  const handleCopyAccount = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  // Validasi & Kirim Pesanan
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.customerName.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }

    const cleanWA = formData.whatsappNumber.replace(/\D/g, '');
    if (cleanWA.length < 10) {
      setErrorMsg('Masukkan nomor WhatsApp aktif yang valid (minimal 10 digit angka).');
      return;
    }

    if (hasPhysical) {
      if (
        !formData.province.trim() ||
        !formData.city.trim() ||
        !formData.district.trim() ||
        !formData.shippingAddress.trim()
      ) {
        setErrorMsg(
          'Lengkapi Provinsi, Kota/Kabupaten, Kecamatan, dan Alamat Lengkap untuk menghitung ongkir dan pengiriman.'
        );
        return;
      }
    }

    if (hasDigital && !formData.targetAccount.trim()) {
      setErrorMsg('Masukkan Nomor HP atau Email tujuan pengisian produk digital.');
      return;
    }

    if (hasService && !formData.serviceBrief.trim()) {
      setErrorMsg('Masukkan tautan dokumen (Google Drive) atau detail brief layanan jasa.');
      return;
    }

    setIsSubmitting(true);

    const uniquePillars = [...new Set(cartItems.map((item) => item.pillar))].join(', ');
    const uniqueOrigins = [
      ...new Set(cartItems.map((item) => item.originCity || 'Digital/Pusat')),
    ].join(', ');

    const itemsSummaryText = cartItems
      .map((item) => `${item.name} (${item.quantity}x)`)
      .join('; ');

    const fullShippingLocation = hasPhysical
      ? `${formData.shippingAddress}, Kec. ${formData.district}, ${formData.city}, ${formData.province} ${formData.postalCode} | Kurir: ${formData.courier} | Total Berat: ${totalPhysicalWeightGram} gr | Ongkir: ${formatIDR(totalShippingCost)}`
      : '-';

    const extraInfo = [
      appliedPromo ? `Voucher: ${appliedPromo.code} (-${formatIDR(discountAmount)})` : '',
      hasPhysical ? `Ongkir: ${formatIDR(totalShippingCost)} (${totalPhysicalWeightGram} gr)` : '',
      `Bayar: ${selectedPayment.shortLabel}`,
      `Biaya Layanan: ${paymentServiceFee > 0 ? formatIDR(paymentServiceFee) : 'Gratis'}`,
      formData.notes ? `Catatan: ${formData.notes}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

      const [paymentMethod, setPaymentMethod] = useState('qris');
const [selectedBank, setSelectedBank] = useState(BANK_ACCOUNTS[0].id);
const [copiedField, setCopiedField] = useState('');

// Kode unik 3 digit (100 - 999) dibuat 1x saat halaman dibuka agar tidak berubah-ubah saat mengetik
const [uniqueCode] = useState(() => Math.floor(100 + Math.random() * 900));

const activePayment =
  PAYMENT_METHODS.find((m) => m.id === paymentMethod) || PAYMENT_METHODS[0];
const activeBank =
  BANK_ACCOUNTS.find((b) => b.id === selectedBank) || BANK_ACCOUNTS[0];

const baseTotal = Number(subtotal || 0) + Number(shippingCost || 0);

// QRIS dikenakan biaya layanan 0,7%; Transfer Bank Rp 0 tetapi memakai Kode Unik 3 digit
const serviceFee =
  activePayment.id === 'qris' ? Math.round(baseTotal * activePayment.rate) : 0;
const appliedUniqueCode =
  activePayment.id === 'transfer' && baseTotal > 0 ? uniqueCode : 0;

const grandTotal = baseTotal + serviceFee + appliedUniqueCode;

// Label metode pembayaran untuk disimpan ke Google Sheets & pesan WhatsApp
const paymentLabel =
  activePayment.id === 'transfer'
    ? `Transfer Bank ${activeBank.name} (Kode Unik +${appliedUniqueCode})`
    : activePayment.name;

const handleCopyText = (text, fieldKey) => {
  navigator.clipboard.writeText(String(text));
  setCopiedField(fieldKey);
  setTimeout(() => setCopiedField(''), 2000);
};

await saveOrderToSheets({
  // ...pertahankan field order lainnya yang sudah ada
  payment_method: paymentLabel,
  unique_code: appliedUniqueCode,
  service_fee: serviceFee,
  total_amount: grandTotal,
});

    // Simpan ke Google Sheets
    const sheetResult = await saveOrderToSheets({
      customerName: formData.customerName.trim(),
      whatsappNumber: cleanWA,
      pillars: uniquePillars,
      itemsSummary: itemsSummaryText,
      originCities: uniqueOrigins,
      shippingAddress: fullShippingLocation,
      targetAccount: formData.targetAccount.trim(),
      serviceBrief: `${formData.serviceBrief.trim()} ${extraInfo ? `(${extraInfo})` : ''}`.trim(),
      totalPrice: finalTotal,
    });

    const generatedOrderId = sheetResult?.orderId || `GS-${Date.now().toString().slice(-6)}`;

    // Susun pesan terstruktur untuk WhatsApp Admin
    let itemsListWA = '';
    if (hasPhysical) {
      originCitiesList.forEach((origin, idx) => {
        const pkgShip = shippingDetailsByOrigin[origin];
        itemsListWA += `\n📦 *Paket Fisik ${idx + 1} (Gudang Asal: ${origin})*\n`;
        physicalPackages[origin].forEach((item) => {
          const itemWeight = (Number(item.weight) > 0 ? Number(item.weight) : 250) * item.quantity;
          itemsListWA += `  • ${item.name} (${item.quantity}x | ${itemWeight} gr) = ${formatIDR(
            item.price * item.quantity
          )}\n`;
        });
        itemsListWA += `  _↳ Berat Paket: ${pkgShip.totalWeightGram} gr (${pkgShip.billableKg} kg) • Ongkir ${formData.courier}: ${formatIDR(pkgShip.shippingCost)}_\n`;
      });
    }
    if (hasDigital) {
      itemsListWA += `\n⚡ *Produk Digital (Tanpa Ongkir)*\n`;
      digitalItems.forEach((item) => {
        itemsListWA += `  • ${item.name} (${item.quantity}x) = ${formatIDR(
          item.price * item.quantity
        )}\n`;
      });
    }
    if (hasService) {
      itemsListWA += `\n📄 *Layanan Jasa (Tanpa Ongkir)*\n`;
      serviceItems.forEach((item) => {
        itemsListWA += `  • ${item.name} (${item.quantity}x) = ${formatIDR(
          item.price * item.quantity
        )}\n`;
      });
    }

    const adminWA = '6285649750554';
    let waMessage = `*PESANAN BARU (${generatedOrderId}) - GENZSTATION.ID*\n`;
    waMessage += `====================================\n\n`;
    waMessage += `*DATA PEMESAN:*\n`;
    waMessage += `• Nama: ${formData.customerName.trim()}\n`;
    waMessage += `• No. WA: ${formData.whatsappNumber.trim()}\n`;
    if (formData.customerEmail) waMessage += `• Email: ${formData.customerEmail.trim()}\n`;
    waMessage += `• Metode Bayar: ${selectedPayment.shortLabel}\n\n`;

    if (hasPhysical) {
      waMessage += `*ALAMAT & EKSPEDISI (DROPSHIP):*\n`;
      waMessage += `• Alamat: ${formData.shippingAddress}\n`;
      waMessage += `• Wilayah: Kec. ${formData.district}, ${formData.city}, ${formData.province} ${formData.postalCode}\n`;
      waMessage += `• Ekspedisi: ${formData.courier}\n\n`;
    }
    if (hasDigital) {
      waMessage += `*TUJUAN PRODUK DIGITAL:*\n`;
      waMessage += `• Akun / No. HP: ${formData.targetAccount}\n\n`;
    }
    if (hasService) {
      waMessage += `*BRIEF & TAUTAN LAYANAN JASA:*\n`;
      waMessage += `• Detail: ${formData.serviceBrief}\n\n`;
    }
    if (formData.notes) {
      waMessage += `*CATATAN TAMBAHAN:*\n• ${formData.notes}\n\n`;
    }

    waMessage += `*RINCIAN PESANAN:*${itemsListWA}\n`;
    waMessage += `------------------------------------\n`;
    waMessage += `• Subtotal Produk: ${formatIDR(subtotal)}\n`;
    if (appliedPromo) {
      waMessage += `• Diskon (${appliedPromo.code}): -${formatIDR(discountAmount)}\n`;
    }
    if (hasPhysical) {
      waMessage += `• Total Ongkir (${totalPhysicalWeightGram} gr): +${formatIDR(totalShippingCost)}\n`;
    }
    waMessage += `• Biaya Layanan (${selectedPayment.shortLabel}): ${
      paymentServiceFee > 0 ? `+${formatIDR(paymentServiceFee)}` : 'Gratis (Rp 0)'
    }\n`;
    waMessage += `*TOTAL PEMBAYARAN: ${formatIDR(finalTotal)}*\n`;
    waMessage += `------------------------------------\n`;

    const whatsappUrl = `https://wa.me/${adminWA}?text=${encodeURIComponent(waMessage)}`;

    setIsSubmitting(false);
    setCompletedOrder({
      orderId: generatedOrderId,
      total: finalTotal,
      shippingCost: totalShippingCost,
      serviceFee: paymentServiceFee,
      paymentLabel: selectedPayment.shortLabel,
      whatsappUrl,
      hasPhysical,
      originCities: originCitiesList,
    });

    if (setCartItems) setCartItems([]);
    window.open(whatsappUrl, '_blank');
  };

  // Tampilan Sukses Setelah Checkout
  if (completedOrder) {
    return (
      <div className="min-h-screen bg-[#FAFAFF] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-emerald-100 shadow-md p-6 sm:p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Pesanan Tercatat
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 pt-2">
              Terima Kasih atas Pesanan Anda!
            </h2>
            <p className="text-xs text-gray-500">
              Simpan kode pesanan di bawah ini untuk memantau status & nomor resi Anda.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 space-y-1">
            <p className="text-[11px] font-semibold text-purple-700">Order ID Anda</p>
            <p className="text-xl font-mono font-black text-purple-900">
              {completedOrder.orderId}
            </p>
            <p className="text-xs font-bold text-gray-800 pt-1">
              Total Pembayaran: {formatIDR(completedOrder.total)}
            </p>
            <p className="text-[11px] text-gray-500">
              Metode: {completedOrder.paymentLabel}
              {completedOrder.hasPhysical
                ? ` • Termasuk ongkir ${formatIDR(completedOrder.shippingCost)}`
                : ''}
            </p>
          </div>

          {completedOrder.hasPhysical && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left text-xs text-amber-900 leading-relaxed">
              <strong>Info Pengiriman Dropship:</strong> Paket Anda dikirim dari{' '}
              <strong>{completedOrder.originCities.join(', ')}</strong>. Nomor resi ekspedisi akan
              diperbarui maksimal dalam <strong>1x24 jam</strong> setelah pembayaran dikonfirmasi.
            </div>
          )}

          <div className="space-y-2.5 pt-2">
            <a
              href={completedOrder.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Buka WhatsApp untuk Konfirmasi Pembayaran</span>
              <ExternalLink size={15} />
            </a>

            <Link
              to="/account"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <span>Pantau Status & Resi di My Account</span>
            </Link>

            <Link
              to="/shop"
              className="block text-xs font-semibold text-gray-500 hover:text-purple-700 pt-1"
            >
              &larr; Kembali ke Katalog Toko
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan Jika Keranjang Kosong
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] bg-[#FAFAFF] flex flex-col items-center justify-center p-4 text-center">
        <ShoppingBag size={56} className="text-purple-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Keranjang Belanja Anda Kosong</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-6 max-w-md">
          Silakan pilih produk fisik, aplikasi digital premium, atau layanan jasa terlebih dahulu.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-purple-600 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md hover:bg-purple-700 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Jelajahi Katalog</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Katalog</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck size={14} />
            <span>Checkout Aman & Transparan</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Checkout Pesanan
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Berat produk, ongkos kirim per gudang asal, dan biaya layanan dihitung otomatis.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-2xl flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* KOLOM KIRI (7 KOLOM): FORMULIR DINAMIS */}
          <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6" noValidate>
            {/* 1. DATA PEMESAN */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
              <h2 className="font-bold text-gray-900 border-b pb-3 text-base flex items-center gap-2">
                <CheckCircle2 size={18} className="text-purple-600" />
                <span>1. Data Pemesan</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Contoh: Adiesti Nuri"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nomor WhatsApp Aktif *
                  </label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleInputChange}
                    placeholder="Contoh: 08123456789"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Alamat Email {hasDigital ? '(Disarankan untuk info akun)' : '(Opsional)'}
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  placeholder="nama@email.com"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
            </div>

            {/* 2. BLOK KONDISIONAL PRODUK FISIK + KALKULATOR ONGKIR WILAYAH */}
            {hasPhysical && (
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-purple-100 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                  <h2 className="font-bold text-purple-900 text-base flex items-center gap-2">
                    <Package size={18} className="text-purple-600" />
                    <span>Alamat & Kalkulator Ongkir Otomatis</span>
                  </h2>
                  <span className="text-[11px] font-bold bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full">
                    {originCitiesList.length} Gudang Asal • {totalPhysicalWeightGram} gr
                  </span>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1 text-xs text-amber-950">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Truck size={15} className="text-amber-600" />
                    <span>Transparansi Pengiriman Langsung dari Mitra Supplier</span>
                  </div>
                  <p className="leading-relaxed text-amber-900/90 text-[11px]">
                    Produk fisik dikirim dari <strong>{originCitiesList.join(', ')}</strong> atas
                    nama <strong>Genzstation.id</strong>. Pilih Provinsi tujuan di bawah agar
                    sistem menghitung ongkir otomatis sesuai berat paket.
                  </p>
                </div>

                {/* Pilihan Wilayah Indonesia Otomatis atau Manual */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setManualRegionMode(!manualRegionMode)}
                    className="text-[11px] font-semibold text-purple-600 hover:underline"
                  >
                    {manualRegionMode
                      ? 'Gunakan daftar pilihan wilayah otomatis'
                      : 'Wilayah tidak muncul? Ketik manual'}
                  </button>
                </div>

                {!manualRegionMode ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Provinsi Tujuan *
                      </label>
                      <select
                        value={selectedProvId}
                        onChange={handleProvinceSelect}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      >
                        <option value="">-- Pilih Provinsi --</option>
                        {provinces.map((prov) => (
                          <option key={prov.id} value={prov.id}>
                            {prov.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Kota / Kabupaten *
                      </label>
                      <select
                        value={selectedRegencyId}
                        onChange={handleRegencySelect}
                        disabled={!selectedProvId}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-white disabled:bg-gray-100 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      >
                        <option value="">-- Pilih Kota/Kabupaten --</option>
                        {regencies.map((reg) => (
                          <option key={reg.id} value={reg.id}>
                            {reg.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Kecamatan *
                      </label>
                      <select
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        disabled={!selectedRegencyId}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-white disabled:bg-gray-100 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      >
                        <option value="">-- Pilih Kecamatan --</option>
                        {districts.map((dist) => (
                          <option key={dist.id} value={dist.name}>
                            {dist.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Kode Pos</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="Contoh: 69162"
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Provinsi *
                      </label>
                      <input
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        placeholder="Contoh: Jawa Timur"
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Kota / Kabupaten *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Contoh: Kab. Bangkalan"
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Kecamatan *
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        placeholder="Contoh: Kamal"
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Kode Pos</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="Contoh: 69162"
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Alamat Lengkap & Patokan Rumah *
                  </label>
                  <textarea
                    name="shippingAddress"
                    rows="2"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan/desa"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                {/* Pilihan Ekspedisi J&T / JNE */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Pilih Ekspedisi Pengiriman *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['J&T Express', 'JNE Reguler'].map((kurir) => {
                      const estimatedTotalForKurir = originCitiesList.reduce(
                        (sum, origin) =>
                          sum +
                          calculatePackageShipping(
                            physicalPackages[origin],
                            formData.province,
                            kurir
                          ).shippingCost,
                        0
                      );
                      return (
                        <button
                          type="button"
                          key={kurir}
                          onClick={() => setFormData({ ...formData, courier: kurir })}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            formData.courier === kurir
                              ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold">{kurir}</p>
                            <p className="text-[11px] text-purple-700 font-semibold mt-0.5">
                              {formData.province
                                ? formatIDR(estimatedTotalForKurir)
                                : 'Pilih provinsi dulu'}
                            </p>
                          </div>
                          <Truck
                            size={16}
                            className={
                              formData.courier === kurir ? 'text-purple-600' : 'text-gray-400'
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 3. BLOK KONDISIONAL PRODUK DIGITAL */}
            {hasDigital && (
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-lime-200 shadow-2xs space-y-3.5">
                <h2 className="font-bold text-lime-900 border-b pb-3 text-base flex items-center gap-2">
                  <Zap size={18} className="text-lime-600" />
                  <span>Tujuan Pengisian (Produk Digital)</span>
                </h2>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Akun / Nomor HP Tujuan *
                  </label>
                  <input
                    type="text"
                    name="targetAccount"
                    value={formData.targetAccount}
                    onChange={handleInputChange}
                    placeholder="Masukkan email untuk Canva Pro/Spotify atau No. HP untuk Pulsa/Kuota"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-lime-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 4. BLOK KONDISIONAL LAYANAN JASA */}
            {hasService && (
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-rose-200 shadow-2xs space-y-3.5">
                <h2 className="font-bold text-rose-900 border-b pb-3 text-base flex items-center gap-2">
                  <FileText size={18} className="text-rose-600" />
                  <span>Tautan Berkas & Instruksi Layanan Jasa</span>
                </h2>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tautan Google Drive / Catatan Spesifikasi Pengerjaan *
                  </label>
                  <textarea
                    name="serviceBrief"
                    rows="3"
                    value={formData.serviceBrief}
                    onChange={handleInputChange}
                    placeholder="Tempel link Google Drive naskah Turnitin / target penurunan skor parafrase / brief desain Anda"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 5. METODE PEMBAYARAN */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <CreditCard size={18} className="text-purple-600" />
                  <span>Metode Pembayaran</span>
                </h2>
                <span className="text-[11px] font-semibold text-gray-500">
                  Biaya layanan dihitung otomatis
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {Object.values(PAYMENT_METHODS).map((method) => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      type="button"
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50 text-purple-950 shadow-2xs'
                          : 'border-gray-200 bg-gray-50/70 text-gray-700 hover:bg-purple-50/50'
                      }`}
                    >
                      <span className="text-xs font-bold">{method.shortLabel}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md w-fit ${
                          method.feeType === 'free'
                            ? 'bg-emerald-100 text-emerald-700'
                            : isSelected
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200/80 text-gray-600'
                        }`}
                      >
                        {method.feeBadge}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-gray-500">{selectedPayment.title}</p>
                  <p className="text-sm font-mono font-extrabold text-gray-900">
                    {selectedPayment.number}
                  </p>
                  <p className="text-[11px] text-gray-500">{selectedPayment.holder}</p>
                </div>

                {selectedPayment.canCopy && (
                  <button
                    type="button"
                    onClick={() => handleCopyAccount(selectedPayment.number)}
                    className="bg-white border border-gray-200 hover:border-purple-400 text-purple-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-all"
                  >
                    {copiedAccount ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span className="text-emerald-600">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Catatan untuk Penjual (Opsional)
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Contoh: Ukuran kuku custom S/M, atau minta dikirim sore hari"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 active:scale-[0.99] text-white font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Memproses Pesanan...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Buat Pesanan ({formatIDR(finalTotal)})</span>
                </>
              )}
            </button>
          </form>

          {/* KOLOM KANAN (5 KOLOM): RINGKASAN BERAT, PAKET, VOUCHER, & BIAYA */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
              <h2 className="font-bold text-gray-900 border-b pb-3 text-base">
                Ringkasan Pesanan ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} Item)
              </h2>

              <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                {/* Paket Fisik per Wilayah Supplier + Info Berat & Ongkir */}
                {originCitiesList.map((origin, idx) => {
                  const pkgShip = shippingDetailsByOrigin[origin];
                  return (
                    <div
                      key={origin}
                      className="bg-purple-50/50 border border-purple-100 rounded-xl p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-purple-800 border-b border-purple-100 pb-1.5">
                        <span className="flex items-center gap-1">
                          <Package size={12} />
                          Paket Fisik {idx + 1}
                        </span>
                        <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-purple-100">
                          <MapPin size={10} className="text-purple-600" />
                          Asal: {origin}
                        </span>
                      </div>

                      {physicalPackages[origin].map((item) => {
                        const unitWeight = Number(item.weight) > 0 ? Number(item.weight) : 250;
                        return (
                          <div key={item.id} className="flex justify-between items-start text-xs">
                            <div className="pr-2">
                              <p className="font-semibold text-gray-800">{item.name}</p>
                              <p className="text-gray-400">
                                {item.quantity}x @ {formatIDR(item.price)} •{' '}
                                <span className="text-purple-700 font-medium">
                                  {unitWeight * item.quantity} gr
                                </span>
                              </p>
                            </div>
                            <span className="font-bold text-gray-900 shrink-0">
                              {formatIDR(item.price * item.quantity)}
                            </span>
                          </div>
                        );
                      })}

                      {/* Sub-footer berat & ongkir paket */}
                      <div className="pt-1.5 border-t border-purple-200/60 flex items-center justify-between text-[11px] text-purple-900">
                        <span className="flex items-center gap-1 font-medium">
                          <Scale size={11} />
                          Berat: {pkgShip.totalWeightGram} gr ({pkgShip.billableKg} kg)
                        </span>
                        <span className="font-bold">
                          Ongkir: {formData.province ? formatIDR(pkgShip.shippingCost) : '-'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Kelompok Produk Digital */}
                {hasDigital && (
                  <div className="bg-lime-50/50 border border-lime-200/70 rounded-xl p-3 space-y-2">
                    <div className="text-[11px] font-bold text-lime-800 border-b border-lime-200/70 pb-1.5 flex items-center gap-1">
                      <Zap size={12} />
                      <span>Produk Digital (Tanpa Ongkir)</span>
                    </div>
                    {digitalItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-start text-xs">
                        <div className="pr-2">
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-gray-400">
                            {item.quantity}x @ {formatIDR(item.price)}
                          </p>
                        </div>
                        <span className="font-bold text-gray-900 shrink-0">
                          {formatIDR(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Kelompok Layanan Jasa */}
                {hasService && (
                  <div className="bg-rose-50/50 border border-rose-200/70 rounded-xl p-3 space-y-2">
                    <div className="text-[11px] font-bold text-rose-800 border-b border-rose-200/70 pb-1.5 flex items-center gap-1">
                      <FileText size={12} />
                      <span>Layanan Jasa (Tanpa Ongkir)</span>
                    </div>
                    {serviceItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-start text-xs">
                        <div className="pr-2">
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-gray-400">
                            {item.quantity}x @ {formatIDR(item.price)}
                          </p>
                        </div>
                        <span className="font-bold text-gray-900 shrink-0">
                          {formatIDR(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Input Kode Voucher Promo */}
              <div className="pt-2 border-t space-y-2">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <TicketPercent size={14} className="text-rose-500" />
                  <span>Kode Voucher Promo</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Contoh: GENZBARU"
                    className="flex-1 p-2.5 border border-gray-200 rounded-xl text-xs uppercase font-mono focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                  >
                    Terapkan
                  </button>
                </div>
                {promoFeedback.text && (
                  <p
                    className={`text-[11px] font-medium ${
                      promoFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {promoFeedback.text}
                  </p>
                )}
              </div>

              {/* Rincian Biaya Otomatis */}
              <div className="border-t pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold">{formatIDR(subtotal)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Diskon ({appliedPromo.code})</span>
                    <span>-{formatIDR(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>
                    Ongkos Kirim {hasPhysical ? `(${totalPhysicalWeightGram} gr)` : ''}
                  </span>
                  <span className="font-semibold text-purple-700">
                    {hasPhysical
                      ? formData.province
                        ? `+${formatIDR(totalShippingCost)}`
                        : 'Pilih Provinsi Tujuan'
                      : 'Gratis (Rp 0)'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span className="flex items-center gap-1">
                    <span>Biaya Layanan ({selectedPayment.shortLabel})</span>
                    <Info size={12} className="text-gray-400" />
                  </span>
                  <span
                    className={`font-semibold ${
                      paymentServiceFee === 0 ? 'text-emerald-600' : 'text-gray-800'
                    }`}
                  >
                    {paymentServiceFee > 0 ? `+${formatIDR(paymentServiceFee)}` : 'Gratis (Rp 0)'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm pt-2 border-t">
                  <span className="font-extrabold text-gray-900">Total Pembayaran</span>
                  <span className="font-extrabold text-purple-700 text-lg">
                    {formatIDR(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Kotak Transparansi SLA */}
              <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 space-y-1.5 text-[11px] text-gray-600">
                <div className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Clock size={13} className="text-purple-600" />
                  <span>Estimasi Proses & Pengiriman:</span>
                </div>
                {hasPhysical && (
                  <p>
                    • <strong>Produk Fisik:</strong> Nomor resi {formData.courier} diperbarui
                    maksimal 1x24 jam setelah pembayaran.
                  </p>
                )}
                {hasDigital && (
                  <p>
                    • <strong>Produk Digital:</strong> Diproses cepat dalam 5–30 menit ke tujuan
                    pengisian.
                  </p>
                )}
                {hasService && (
                  <p>
                    • <strong>Layanan Jasa:</strong> Hasil cek Turnitin / pengerjaan dikirim ke
                    WhatsApp atau Email Anda.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;