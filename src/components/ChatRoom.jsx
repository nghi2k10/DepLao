import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function ChatRoom() {
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const currentUser = auth.currentUser;

  // 🧩 Lấy danh sách user (trừ bản thân)
  useEffect(() => {
    if (!currentUser) return;

    const fetchUsers = async () => {
      const q = query(collection(db, "users"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs
        .map((doc) => doc.data())
        .filter((u) => u.uid !== currentUser.uid);
      setUsers(list);
    };

    fetchUsers();
  }, [currentUser]);

  // 🧩 Hàm chọn user để chat 1-1
  const selectUser = async (user) => {
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;

    const chatRef = doc(db, "chats", combinedId);

    // Nếu phòng chưa tồn tại → tạo mới
    await setDoc(
      chatRef,
      {
        members: [currentUser.uid, user.uid],
        type: "private",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    setSelectedChat({ id: combinedId, user });
  };

  // 🧩 Lắng nghe tin nhắn realtime
  useEffect(() => {
    if (!selectedChat?.id) return;

    const msgsRef = collection(db, "chats", selectedChat.id, "messages");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(list);
    });

    return () => unsub();
  }, [selectedChat]);

  // 🧩 Gửi tin nhắn
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedChat?.id) return;

    await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
      senderId: currentUser.uid,
      text: text.trim(),
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  // 🧩 Đăng xuất
  const logout = () => signOut(auth);

  return (
    <div className="flex h-screen">
      {/* Sidebar người dùng */}
      <div className="w-1/4 bg-gray-100 border-r overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">💬 Chat 1:1</h2>
          <button
            onClick={logout}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg"
          >
            Đăng xuất
          </button>
        </div>

        {users.map((u) => (
          <div
            key={u.uid}
            className={`p-3 cursor-pointer hover:bg-gray-200 ${
              selectedChat?.user?.uid === u.uid ? "bg-indigo-100" : ""
            }`}
            onClick={() => selectUser(u)}
          >
            <div className="font-medium">{u.name || u.email}</div>
            <div className="text-sm text-gray-500">Nhắn tin riêng</div>
          </div>
        ))}
      </div>

      {/* Khung chat chính */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-white font-semibold">
              {selectedChat.user.name || selectedChat.user.email}
            </div>

            {/* Tin nhắn */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 flex ${
                    msg.senderId === currentUser.uid
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg max-w-xs ${
                      msg.senderId === currentUser.uid
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Gửi tin nhắn */}
            <form
              onSubmit={sendMessage}
              className="p-3 border-t flex gap-2 bg-white"
            >
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
              >
                Gửi
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-400">
            👋 Chọn người bên trái để bắt đầu trò chuyện
          </div>
        )}
      </div>
    </div>
  );
}
