import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase";

export default function ChatRoom({ selectedChat }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [members, setMembers] = useState([]);
  const messagesEndRef = useRef(null);

  // 🔹 Tự động scroll xuống tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🔹 Lấy tin nhắn realtime
  useEffect(() => {
    if (!selectedChat?.id) return;
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", selectedChat.id),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [selectedChat]);

  // 🔹 Lấy danh sách thành viên (nếu là nhóm)
  useEffect(() => {
    const fetchMembers = async () => {
      if (!selectedChat?.members) return;
      const list = [];
      for (const uid of selectedChat.members) {
        const userSnap = await getDoc(doc(db, "users", uid));
        if (userSnap.exists()) {
          list.push(userSnap.data());
        }
      }
      setMembers(list);
    };
    fetchMembers();
  }, [selectedChat]);

  // 🔹 Tự động scroll khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🔹 Gửi tin nhắn mới
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    await addDoc(collection(db, "messages"), {
      chatId: selectedChat.id,
      senderId: auth.currentUser.uid,
      text: text.trim(),
      createdAt: new Date(),
    });

    setText("");
  };

  if (!selectedChat)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Chọn phòng hoặc bắt đầu cuộc trò chuyện mới
      </div>
    );

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">
            {selectedChat.isGroup
              ? selectedChat.name
              : "Trò chuyện riêng"}
          </h2>
          {selectedChat.isGroup && (
            <p className="text-sm text-gray-500">
              Thành viên:{" "}
              {members.map((m) => m.name).join(", ") || "Đang tải..."}
            </p>
          )}
        </div>
      </div>

      {/* Danh sách tin nhắn */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 flex ${
              msg.senderId === auth.currentUser.uid
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-lg max-w-xs ${
                msg.senderId === auth.currentUser.uid
                  ? "bg-blue-500 text-white"
                  : "bg-white border"
              }`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Nhập tin nhắn */}
      <form onSubmit={handleSend} className="p-3 border-t flex">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
