import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Upload, MessageCircle, FileText, BarChart3, 
  Globe, ShieldCheck, RefreshCcw 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, LabelList 
} from 'recharts';
import { parseWhatsAppChat } from './utils/parser';
import { getMessageCountBySender } from './utils/analyzer';
import type { Message } from './types/chat';
import JSZip from 'jszip';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function App() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Dil değiştirme fonksiyonu
  const toggleLanguage = () => {
    const newLang = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
  };

  // İstatistik hesaplama (En çok konuşan ilk 10 kişi)
  const chatStats = useMemo(() => {
    if (messages.length === 0) return [];
    return getMessageCountBySender(messages).slice(0, 10);
  }, [messages]);

  const handleFile = async (file: File) => {
  if (!file) return;

  const reader = new FileReader();

  // SENARYO 1: Kullanıcı direkt .txt yükledi
  if (file.name.endsWith('.txt')) {
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setMessages(parseWhatsAppChat(text));
    };
    reader.readAsText(file);
  } 
  // SENARYO 2: Kullanıcı WhatsApp'ın verdiği .zip dosyasını yükledi
  else if (file.name.endsWith('.zip')) {
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      // Zip içindeki .txt dosyasını bul (Genelde adı _chat.txt veya WhatsApp Chat... .txt olur)
      const chatFile = Object.values(contents.files).find(f => f.name.endsWith('.txt'));

      if (chatFile) {
        const text = await chatFile.async('string');
        setMessages(parseWhatsAppChat(text));
      } else {
        alert('Zip içinde sohbet metni (.txt) bulunamadı!');
      }
    } catch (err) {
      alert('Zip dosyası açılırken bir hata oluştu.');
    }
  } else {
    alert('Lütfen .txt veya .zip formatında bir dosya yükleyin.');
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 sm:py-12">
      
      {/* Üst Menü: Dil Değiştirici */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={toggleLanguage}
          className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 text-sm font-bold text-gray-700"
        >
          <Globe className="w-4 h-4 text-blue-500" />
          <span>{i18n.language === 'tr' ? 'English' : 'Türkçe'}</span>
        </button>
      </div>

      {/* Başlık ve Gizlilik Notu */}
      <div className="text-center mb-10 max-w-2xl">
        <div className="relative inline-block mb-4">
          <MessageCircle className="w-16 h-16 text-green-500 mx-auto" />
          <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          {t('title')}
        </h1>
        <p className="text-gray-500 mt-3 text-lg">
          {t('subtitle')}
        </p>
        <div className="inline-flex items-center space-x-2 mt-4 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>{t('privacy_note')}</span>
        </div>
      </div>

      {messages.length === 0 ? (
        /* DOSYA YÜKLEME ALANI */
        <div 
          className={`w-full max-w-xl p-10 sm:p-16 border-3 border-dashed rounded-[2.5rem] text-center transition-all cursor-pointer group relative overflow-hidden ${
            isDragging ? 'border-green-500 bg-green-50 scale-[1.02]' : 'border-gray-200 bg-white hover:border-green-400 hover:bg-gray-50/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
          }}
        >
          <div className="relative z-10">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-100 transition-colors">
              <Upload className="w-10 h-10 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('drop_file')}</h3>
            <p className="text-gray-400 text-sm mb-8">{i18n.language === 'tr' ? 'Veya dosya gezgininden seçin' : 'Or choose from file explorer'}</p>
            
            <label className="inline-flex items-center space-x-2 bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-bold cursor-pointer hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95">
              <span>{t('select_file')}</span>
              <input 
                type="file" 
                className="hidden" 
                accept=".txt" 
                onChange={(e) => e.target.files && handleFile(e.target.files[0])} 
              />
            </label>
          </div>
        </div>
      ) : (
        /* ANALİZ SONUÇLARI */
        <div className="w-full max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* İstatistik Özet Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center space-x-5">
              <div className="bg-green-100 p-4 rounded-2xl text-green-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{t('total_messages')}</p>
                <p className="text-3xl font-black text-gray-800 tracking-tight">{messages.length.toLocaleString(i18n.language)}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center space-x-5">
              <div className="bg-blue-100 p-4 rounded-2xl text-blue-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{t('participants')}</p>
                <p className="text-3xl font-black text-gray-800 tracking-tight">{chatStats.length}</p>
              </div>
            </div>
          </div>

          {/* Grafik Kartı */}
          <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                {t('top_speakers')}
              </h3>
            </div>
            
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chatStats} layout="vertical" margin={{ left: 20, right: 60, top: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120} 
                    tick={{ fontSize: 13, fontWeight: 700, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc', radius: 10 }}
                    contentStyle={{ 
                      borderRadius: '20px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      padding: '12px 16px'
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={32}>
                    <LabelList 
                      dataKey="value" 
                      position="right" 
                      fill="#94a3b8" 
                      fontSize={13} 
                      fontWeight={800}
                      offset={12}
                    />
                    {chatStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reset Butonu */}
          <button 
            onClick={() => {
              if (window.confirm(i18n.language === 'tr' ? 'Veriler temizlensin mi?' : 'Clear all data?')) {
                setMessages([]);
              }
            }}
            className="w-full py-6 flex items-center justify-center space-x-2 text-gray-400 hover:text-red-500 transition-all font-bold group"
          >
            <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-sm uppercase tracking-widest">
              {i18n.language === 'tr' ? 'BAŞKA BİR SOHBET YÜKLE' : 'UPLOAD ANOTHER CHAT'}
            </span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-12 pb-6 text-gray-400 text-xs font-medium uppercase tracking-[0.2em]">
        &copy; 2026 WP Röntgeni • All Rights Local • Mehmet Çelik
      </footer>
    </div>
  );
}

export default App;