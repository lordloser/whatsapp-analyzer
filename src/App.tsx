import { useState, useMemo } from 'react';
import { Upload, MessageCircle, FileText, BarChart3 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell ,LabelList
} from 'recharts';
import { parseWhatsAppChat } from './utils/parser';
import { getMessageCountBySender } from './utils/analyzer';
import type { Message } from './types/chat';

// Grafikte kullanacağımız şık renk paleti
const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Veri değiştiğinde istatistikleri hesapla (Performans için useMemo)
  const chatStats = useMemo(() => {
    if (messages.length === 0) return [];
    return getMessageCountBySender(messages).slice(0, 10); // En çok konuşan ilk 10 kişiyi al
  }, [messages]);

  const handleFile = (file: File) => {
    if (!file || !file.name.endsWith('.txt')) {
      alert('Lütfen geçerli bir .txt dosyası yükleyin.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setMessages(parseWhatsAppChat(text));
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      {/* Başlık */}
      <div className="text-center mb-10">
        <MessageCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-800">WhatsApp Röntgeni</h1>
        <p className="text-gray-500 mt-2">Gizlilik odaklı, anında sohbet analizi.</p>
      </div>

      {messages.length === 0 ? (
        /* Yükleme Alanı */
        <div 
          className={`w-full max-w-xl p-12 border-2 border-dashed rounded-3xl text-center transition-all cursor-pointer ${
            isDragging ? 'border-green-500 bg-green-50 scale-105' : 'border-gray-300 bg-white hover:border-green-400'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
        >
          <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium mb-4">Sohbet dosyasını buraya sürükleyin</p>
          <label className="bg-green-500 text-white px-8 py-3 rounded-full font-bold cursor-pointer hover:bg-green-600 transition-colors">
            Dosya Seç
            <input type="file" className="hidden" accept=".txt" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
          </label>
        </div>
      ) : (
        /* Analiz Sonuçları */
        <div className="w-full max-w-4xl space-y-6">
          
          {/* Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-xl"><FileText className="text-green-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Toplam Mesaj</p>
                <p className="text-2xl font-bold">{messages.length.toLocaleString('tr-TR')}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl"><BarChart3 className="text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Katılımcı Sayısı</p>
                <p className="text-2xl font-bold">{chatStats.length}</p>
              </div>
            </div>
          </div>

          {/* Grafik Alanı */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">En Çok Konuşanlar</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chatStats} layout="vertical" margin={{ left: 40, right: 60 }}> {/* Sağ boşluğu artırdık */}
  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
  <XAxis type="number" hide />
  <YAxis 
    dataKey="name" 
    type="category" 
    width={100} 
    tick={{ fontSize: 12, fontWeight: 500 }} 
  />
  <Tooltip 
    cursor={{ fill: '#f8fafc' }}
    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
  />
  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={30}>
    {/* İşte sayıları barın yanına yazdıran kısım: */}
    <LabelList 
      dataKey="value" 
      position="right" 
      fill="#64748b" 
      fontSize={12} 
      fontWeight={600}
      offset={10} // Bar ile sayı arasındaki mesafe
    />
    {chatStats.map((_, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    ))}
  </Bar>
</BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <button 
            onClick={() => setMessages([])}
            className="w-full py-4 text-gray-400 hover:text-red-500 transition-colors text-sm font-medium"
          >
            ← Başka bir sohbet yükle
          </button>
        </div>
      )}
    </div>
  );
}

export default App;