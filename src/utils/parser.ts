// src/utils/parser.ts
import type { Message } from '../types/chat';
export const parseWhatsAppChat = (text: string): Message[] => {
  const messages: Message[] = [];
  
  // Bu Regex hem Android hem de iOS WhatsApp dışa aktarma formatlarını yakalar
  // Örnek: "12.04.2023 15:30 - İsim:" veya "[12.04.23 15:30:00] İsim:"
  const regex = /\[?(\d{1,2}[\.\/]\d{1,2}[\.\/]\d{2,4})[ ,]+(\d{1,2}:\d{2}(?::\d{2})?)\]?[ -]+([^:]+):\s*(.+)/;

  // Tüm .txt dosyasını satır satır böleriz
  const lines = text.split('\n');

  for (const line of lines) {
    const match = line.match(regex);
    
    if (match) {
      // Eğer satır bizim tarihlisaatli Regex'imize uyuyorsa yeni bir mesajdır
      messages.push({
        date: match[1],
        time: match[2],
        sender: match[3].trim(),
        content: match[4].trim()
      });
    } else if (messages.length > 0) {
      // Eğer satır Regex'e uymuyorsa, bu bir önceki mesajın alt satıra geçmiş halidir (Enter'a basılmıştır)
      // O yüzden bu satırı bir önceki mesajın içeriğine ekliyoruz.
      messages[messages.length - 1].content += '\n' + line.trim();
    }
  }

  return messages;
};