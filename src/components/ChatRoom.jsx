import { useEffect, useState, useRef } from "react";
import {
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export default function ChatRoom({ chat, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  // 🔹 Lắng nghe tin nhắn realtime theo chatId
  useEffect(() => {
    if (!chat?.id) return;

    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((msg) => msg.chatId === chat.id);
      setMessages(list);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [chat]);

  // 🔹 Tự động cuộn xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // 🔹 Gửi tin nhắn
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !chat?.id) return;

    try {
      await addDoc(collection(db, "messages"), {
        chatId: chat.id,
        senderId: currentUser.uid,
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText("");
      scrollToBottom();
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">
          {chat.name || "Đang trò chuyện"}
        </h2>
        {chat.isGroup && (
          <span className="text-xs text-gray-500">
            {chat.members?.length || 0} thành viên
          </span>
        )}
      </div>

      {/* Danh sách tin nhắn */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center mt-10 text-sm">
            Chưa có tin nhắn nào
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 flex ${
                msg.senderId === currentUser.uid
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`rounded-2xl px-3 py-2 max-w-[70%] ${
                  msg.senderId === currentUser.uid
                    ? "bg-blue-500 text-white"
                    : "bg-white border"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Ô nhập tin nhắn */}
      <form
        onSubmit={handleSend}
        className="border-t p-3 bg-white flex items-center"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 border rounded-full px-3 py-2 mr-2 outline-none focus:ring-1 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full"
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
