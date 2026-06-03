'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Sabit Ürün Listesi
const PRODUCT_LIST = {
  aynalar: ['MD1-100', 'MD1-80M', 'MD1-80C', 'MD2-100', 'MD2-80M', 'MD2-80C', 'MD3-80', 'MD4', 'MD5-70', 'MD6-70', 'MD7-50', 'MD8-50'],
  sehpalar: ['SP1-A', 'SP2-C', 'SP3-CM', 'SP4-CC', 'SP5-C']
};

interface ProductData {
  en: string; boy: string; kalinlik: string; agirlik: string; fiyat: string;
}

export default function Home() {
  const [formState, setFormState] = useState<Record<string, ProductData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Veritabanından mevcut tek kaydı çekme
  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase.from('price_list').select('data').eq('id', 1).single();
      if (data?.data) setFormState(data.data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleChange = (code: string, field: keyof ProductData, value: string) => {
    setFormState(prev => ({
      ...prev,
      [code]: { ...prev[code], [field]: value }
    }));
  };

  // Desi ve Kargo Matrahı Hesaplama Fonksiyonu
  const calculateDesi = (prod: ProductData) => {
    const en = parseFloat(prod?.en) || 0;
    const boy = parseFloat(prod?.boy) || 0;
    const kalinlik = parseFloat(prod?.kalinlik) || 0;
    const agirlik = parseFloat(prod?.agirlik) || 0;

    const desi = (en * boy * kalinlik) / 3000;
    const kargoEsas = Math.max(desi, agirlik); // Hangisi büyükse kargoda o baz alınır

    return { desi: desi.toFixed(2), kargoEsas: kargoEsas.toFixed(2) };
  };

  // Güncelleme (Kaydetme) Fonksiyonu
  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('price_list').upsert({ id: 1, data: formState });
    setSaving(false);
    if (!error) {
      alert('Veriler başarıyla güncellendi!');
    } else {
      alert('Hata oluştu: ' + error.message);
    }
  };

  if (loading) return <div className="text-center p-10 font-medium text-gray-600">Veritabanı yükleniyor...</div>;

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">EFFE Tedarik Fiyat ve Ölçü Paneli</h1>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:bg-gray-400"
          >
            {saving ? 'Kaydediliyor...' : 'Tüm Listeyi Güncelle'}
          </button>
        </div>

        {/* BÖLÜM 1: DOĞAL AHŞAP ÇERÇEVELI AYNALAR */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold bg-gray-100 p-3 rounded mb-4 text-gray-700 border-l-4 border-amber-500">
            Doğal Ahşap Çerçeveli Aynalar (PDF 1)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCT_LIST.aynalar.map(code => (
              <ProductCard key={code} code={code} data={formState[code]} onChange={handleChange} calculate={calculateDesi} />
            ))}
          </div>
        </section>

        {/* BÖLÜM 2: DOĞAL AHŞAP VE CAMLI SEHPALAR */}
        <section>
          <h2 className="text-xl font-semibold bg-gray-100 p-3 rounded mb-4 text-gray-700 border-l-4 border-blue-500">
            Doğal Ahşap ve Camlı Sehpa Modelleri (PDF 2)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCT_LIST.sehpalar.map(code => (
              <ProductCard key={code} code={code} data={formState[code]} onChange={handleChange} calculate={calculateDesi} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

// Ortak Ürün Kartı Bileşeni
function ProductCard({ code, data, onChange, calculate }: any) {
  const { desi, kargoEsas } = calculate(data);
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-3">
      <div className="bg-gray-200 h-150 rounded flex items-center justify-center font-bold text-gray-500 relative overflow-hidden">
        {/* Hatalı kısım düzeltildi: Resim yoksa yer tutucu (placeholder) yükler */}
        <img 
          src={`/images/${code.toLowerCase()}.jpeg`} 
          alt={code} 
          className="object-cover w-full h-full"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Resim+Yok';
          }} 
        />
        <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{code}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label className="block text-gray-600 font-medium">En (cm)</label>
          <input type="number" value={data?.en || ''} onChange={e => onChange(code, 'en', e.target.value)} className="w-full border p-1 rounded text-black" />
        </div>
        <div>
          <label className="block text-gray-600 font-medium">Boy (cm)</label>
          <input type="number" value={data?.boy || ''} onChange={e => onChange(code, 'boy', e.target.value)} className="w-full border p-1 rounded text-black" />
        </div>
        <div>
          <label className="block text-gray-600 font-medium">Kalınlık (cm)</label>
          <input type="number" value={data?.kalinlik || ''} onChange={e => onChange(code, 'kalinlik', e.target.value)} className="w-full border p-1 rounded text-black" />
        </div>
        <div>
          <label className="block text-gray-600 font-medium">Ağırlık (kg)</label>
          <input type="number" value={data?.agirlik || ''} onChange={e => onChange(code, 'agirlik', e.target.value)} className="w-full border p-1 rounded text-black" />
        </div>
      </div>

      <div className="border-t pt-2 mt-1">
        <label className="block text-sm font-semibold text-gray-700">FİYAT (TL)</label>
        <input type="text" value={data?.fiyat || ''} onChange={e => onChange(code, 'fiyat', e.target.value)} className="w-full border p-2 rounded font-bold text-emerald-600 text-lg" placeholder="0.00" />
      </div>

      <div className="bg-amber-50 p-2 rounded text-xs flex justify-between text-gray-700 font-medium">
        <span>Hesaplanan Desi: <strong className="text-amber-700">{desi}</strong></span>
        <span>Kargo Matrahı: <strong className="text-red-700">{kargoEsas} desi/kg</strong></span>
      </div>
    </div>
  );
}