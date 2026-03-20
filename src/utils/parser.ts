// src/utils/parser.ts
import type { Message } from '../types/chat';

export const parseWhatsAppChat = (text: string): Message[] => {
  const messages: Message[] = [];
  const regex = /\[?(\d{1,2}[\.\/]\d{1,2}[\.\/]\d{2,4})[ ,]+(\d{1,2}:\d{2}(?::\d{2})?)\]?[ -]+([^:]+):\s*(.+)/;

  const lines = text.split('\n');
  
  // Otomatik kara liste (Grup ismini burada yakalayacağız)
  let autoBlacklist: string | null = null;

  const systemKeywords = [
    'uçtan uca şifrelidir', 'end-to-end encrypted', 'gruba eklendi', 'ayrıldı', 
    'joined', 'left', 'mesaj silindi', 'güvenlik kodu', 'oluşturuldu', 'created'
  ];

  for (const line of lines) {
    const match = line.match(regex);
    
    if (match) {
      const sender = match[3].trim();
      const content = match[4].trim();

      // KRİTİK NOKTA: Eğer mesaj içeriğinde "şifreleme" uyarısı varsa, 
      // bu satırın 'sender'ı kesinlikle grup ismidir. Onu kara listeye al!
      if (content.toLowerCase().includes('şifreli') || content.toLowerCase().includes('encrypted')) {
        autoBlacklist = sender; 
        continue; // Bu satırı direkt atla, listeye ekleme
      }

      // Filtreler:
      // 1. Otomatik kara listedeki grup ismi mi?
      // 2. İçinde sistem kelimesi geçiyor mu?
      // 3. Gönderen kısmında "grup" kelimesi geçiyor mu?
      const isSystem = systemKeywords.some(kw => 
        sender.toLowerCase().includes(kw.toLowerCase()) || 
        content.toLowerCase().includes(kw.toLowerCase())
      );

      if (sender !== autoBlacklist && !isSystem && sender.length < 40) {
        messages.push({
          date: match[1],
          time: match[2],
          sender: sender,
          content: content
        });
      }
    } else if (messages.length > 0) {
      messages[messages.length - 1].content += '\n' + line.trim();
    }
  }

  return messages;
};