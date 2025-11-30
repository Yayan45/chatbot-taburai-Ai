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

  const formatHarga = (harga) => "Rp " + Number(harga).toLocaleString("id-ID");

  const formatMenu = () => {
    return Object.entries(taburaiData)
      .filter(([key]) =>
        [
          "pemilik",
          "nama_warung",
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
              m.harga ? formatHarga(m.harga) : "Harga tidak tersedia"
            })${m.deskripsi ? ": " + m.deskripsi : ""}`;
          })
          .join("\n\n");

        return `${judul}:\n\n${list}`;
      })
      .join("\n\n");
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setIsTyping(true);

    const prompt = `
Kamu adalah chatbot Warung Taburai.
Jawaban harus ramah dan berdasarkan data restoran.

Data:
Nama Warung: ${taburaiData.nama_warung}
Jam Buka: ${taburaiData.jam_buka}

Menu:
${formatMenu()}

Pertanyaan:
${userMessage}
`;

    const referer =
      window.location.hostname === "localhost"
        ? "https://example.com"
        : window.location.origin;

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`,
          "HTTP-Referer": referer,
          "X-Title": "Warung Taburai Chatbot",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const aiText =
        data?.choices?.[0]?.message?.content || "⚠️ Tidak ada jawaban dari AI.";

      setMessages((prev) => [...prev, { role: "bot", text: aiText }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "⚠️ Gagal menghubungkan ke server AI.\nCek kembali API key OpenRouter kamu ya!",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen w-full flex justify-center bg-[#111b21]">
      <div className="w-full max-w-lg h-full flex flex-col bg-[#0b141a] border-x border-[#27343b]">
        {/* HEADER */}
        <div className="p-3 flex items-center gap-3 bg-[#202c33] text-white shadow-md">
          <img
            src={taburaiImg}
            className="w-10 h-10 rounded-full object-cover border border-gray-500"
          />

          <div className="flex-1">
            <p className="font-semibold text-sm">{taburaiData.nama_warung}</p>
            <p className="text-xs text-gray-300">
              {isTyping ? "Mengetik..." : "online"}
            </p>
          </div>

          <div className="flex items-center text-gray-300 gap-4 text-lg">
            <FaPhone className="cursor-pointer hover:text-white" />
            <FaVideo className="cursor-pointer hover:text-white" />
            <FaEllipsisV className="cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* CHAT BODY */}
        <div className="flex-1 overflow-y-auto p-3 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/89/Whatsapp_background.png')] bg-cover">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`my-1 p-2 rounded-lg max-w-[80%] text-sm leading-relaxed shadow-sm ${
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
        </div>

        {/* INPUT AREA */}
        <div className="p-3 flex gap-2 items-center bg-[#1f2c34] border-t border-[#233138]">
          <FaSmile className="text-gray-400 text-xl cursor-pointer" />
          <FaPaperclip className="text-gray-400 text-xl cursor-pointer" />

          <input
            type="text"
            className="flex-1 bg-[#2a3942] text-gray-200 border border-[#3b4a54] rounded-lg px-3 py-2 focus:outline-none placeholder-gray-500"
            placeholder="Ketik pesan..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <FaMicrophone className="text-gray-400 text-xl cursor-pointer" />

          <button
            onClick={sendMessage}
            className="bg-[#005c4b] hover:bg-[#036d59] text-white px-4 py-2 rounded-lg active:scale-95"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
