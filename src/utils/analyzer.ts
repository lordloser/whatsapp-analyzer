// src/utils/analyzer.ts
import type { Message } from '../types/chat';

// 1. En Çok Konuşanlar İstatistiği
export const getMessageCountBySender = (messages: Message[]) => {
  const counts: Record<string, number> = {};

  messages.forEach((msg) => {
    // Boş veya hatalı gönderenleri yoksay
    if (msg.sender && msg.sender.trim() !== '') {
      // Eğer bu kişiyi ilk defa görüyorsak 0'dan başlat, yoksa sayıyı 1 artır
      counts[msg.sender] = (counts[msg.sender] || 0) + 1;
    }
  });

  // Recharts (Grafik kütüphanesi) verileri dizi (array) şeklinde sever.
  // Objemizi şu formata çeviriyoruz: [{ name: "Ali", value: 150 }, { name: "Ayşe", value: 120 }]
  const sortedCounts = Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // En çok mesaj atandan en aza doğru sırala

  return sortedCounts;
};