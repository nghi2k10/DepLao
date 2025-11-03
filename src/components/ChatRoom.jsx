import { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export default function ChatRoom({ chat, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // 🟢 Lắng nghe realtime tin nhắn của chat hiện tại
  useEffect(() => {
    // Dọn listener cũ trước khi tạo mới
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!chat?.id) return;

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chat.id),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [chat?.id]); // 🔥 chỉ chạy lại khi chat.id thay đổi

  // 🟣 Auto scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🟡 Gửi tin nhắn
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chat?.id) return;

    await addDoc(collection(db, "messages"), {
      chatId: chat.id,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || "AAA",
      senderAvatar:
        currentUser.avatar ||
        "https://res.cloudinary.com/dtsmm3z9b/image/upload/v1762159040/default_avatar_dvvkeg.png",
      text: newMessage.trim(),
      createdAt: serverTimestamp(),
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b bg-gray-100 flex items-center">
        <h2 className="font-semibold text-gray-700">
          {chat?.name || "Đoạn chat"}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 bg-white">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm">
            Chưa có tin nhắn nào.
          </p>
        )}

        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUser.uid;
          return (
            <div
              key={msg.id}
              className={`flex mb-3 ${isOwn ? "justify-end" : "justify-start"}`}
            >
              {!isOwn && (
                <img
                  src={msg.senderAvatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}
              <div
                className={`p-2 rounded-lg max-w-xs break-words ${
                  isOwn ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                {!isOwn && (
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    {msg.senderName}
                  </p>
                )}
                <p>{msg.text}</p>
              </div>
              {isOwn && (
                <img
                  src={msg.senderAvatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full ml-2"
                />
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t bg-gray-50 flex items-center"
      >
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none"
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
