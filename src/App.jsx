import { useState } from "react";
import { taburaiData } from "./data/taburai";
import taburaiImg from "./assets/taburai.png";

import {
  FaPhone,
  FaVideo,
  FaEllipsisV,
  FaSmile,
  FaPaperclip,
  FaMicrophone,
} from "react-icons/fa";

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Halo! Saya Chatbot Warung Taburai. Ada yang bisa saya bantu? 😊",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // ================================================
  // FIX UTAMA ENV UNTUK VERCEL
  // ================================================
  const API_KEY =
    import.meta.env.VITE_OPENROUTER_KEY || process.env.VITE_OPENROUTER_KEY;

  const formatHarga = (harga) => "Rp " + Number(harga).toLocaleString("id-ID");

  const formatMenu = () => {
    let header = `
NAMA WARUNG: ${taburaiData.nama_warung}
PEMILIK: ${taburaiData.pemilik}
JAM BUKA: ${taburaiData.jam_buka}
`;

    const menus = Object.entries(taburaiData)
      .filter(([key]) =>
        [
          "menu_utama",
          "premium_paket",
          "buah",
          "minuman",
          "favorit_praz_teguh",
          "cabang",
        ].includes(key)
      )
      .map(([kategori, items]) => {
        const judul = kategori.replace(/_/g, " ").toUpperCase();

        const list = items
          .map((m) => {
            if (kategori === "cabang") {
              return `- ${m.no}. ${m.lokasi}\n  Maps: ${m.maps}`;
            }
            return `- ${m.nama} (${
              m.harga ? formatHarga(m.harga) : "Maaf, data tidak tersedia."
            })${m.deskripsi ? ": " + m.deskripsi : ""}`;
          })
          .join("\n\n");

        return `${judul}:\n\n${list}`;
      })
      .join("\n\n");

    return header + "\n\n" + menus;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setIsTyping(true);

    const menuFormatted = formatMenu();

    const prompt = `
Kamu adalah chatbot Warung Taburai.
Jawaban harus:
- Berdasarkan data yang tersedia.
- Jika data tidak ada, balas "Maaf, data tidak tersedia."
- Gunakan bahasa ramah seperti admin manusia.
- Jangan ubah format menu; menu sudah diformat oleh sistem.

Menu:
${menuFormatted}

Pertanyaan user:
${userMessage}
`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Warung Taburai Chat",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menghubungi API");
      }

      const data = await res.json();

      const aiText =
        data?.choices?.[0]?.message?.content ||
        "Maaf, Chatbot error saat membaca respon 😢";

      setMessages((prev) => [...prev, { role: "bot", text: aiText }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Gagal koneksi ke AI. Periksa API KEY ya." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-[#111b21] p-2 sm:p-4">
      <div
        className="
        w-full 
        max-w-lg 
        h-[90vh] sm:h-[95vh] 
        flex flex-col 
        bg-[#0b141a] 
        rounded-lg 
        overflow-hidden 
        border border-[#27343b]
      "
      >
        {/* HEADER */}
        <div className="p-3 flex items-center gap-3 bg-[#202c33] text-white shadow-md">
          <img
            src={taburaiImg}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-gray-500"
          />
          <div className="flex-1">
            <p className="font-semibold text-sm sm:text-base">
              {taburaiData.nama_warung}
            </p>
            <p className="text-xs sm:text-sm text-gray-300">
              {isTyping ? "Mengetik..." : "online"}
            </p>
          </div>

          <div className="hidden sm:flex items-center text-gray-300 gap-4 text-lg">
            <FaPhone className="cursor-pointer hover:text-white" />
            <FaVideo className="cursor-pointer hover:text-white" />
            <FaEllipsisV className="cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* CHAT AREA */}
        <div
          className="
          flex-1 
          overflow-y-auto 
          p-3 
          bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/89/Whatsapp_background.png')] 
          bg-cover
        "
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`my-1 p-2 rounded-lg max-w-[85%] sm:max-w-[75%] text-sm sm:text-base leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-[#005c4b] text-white ml-auto"
                  : "bg-[#202c33] text-gray-200 mr-auto"
              }`}
            >
              {msg.text.split("\n").map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          ))}

          {isTyping && (
            <div className="my-1 p-2 rounded-lg bg-[#202c33] text-gray-300 w-fit">
              Admin sedang mengetik...
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="p-3 flex gap-2 items-center bg-[#1f2c34] border-t border-[#233138]">
          <FaSmile className="text-gray-400 text-xl cursor-pointer hidden sm:block" />
          <FaPaperclip className="text-gray-400 text-xl cursor-pointer hidden sm:block" />

          <input
            type="text"
            className="flex-1 bg-[#2a3942] text-gray-200 border border-[#3b4a54] rounded-lg px-3 py-2 focus:outline-none placeholder-gray-500 text-sm sm:text-base"
            placeholder="Ketik pesan..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <FaMicrophone className="text-gray-400 text-xl cursor-pointer hidden sm:block" />

          <button
            onClick={sendMessage}
            className="bg-[#005c4b] hover:bg-[#036d59] text-white px-4 py-2 rounded-lg active:scale-95 text-sm sm:text-base"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
