import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export default function UserList({ currentUser, onSelectChat }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const list = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.uid !== currentUser.uid); // bỏ chính mình
      setUsers(list);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // 🟢 Hàm tạo hoặc mở chat 1-1
  const handleSelectUser = async (user) => {
    // Tạo query kiểm tra xem đã có chat giữa 2 người chưa
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("isGroup", "==", false),
      where("members", "array-contains", currentUser.uid)
    );

    const snapshot = await getDocs(q);

    // Tìm chat có cả currentUser.uid và user.uid
    let chat = null;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.members.includes(user.uid)) {
        chat = { id: doc.id, ...data };
      }
    });

    // Nếu chưa có → tạo mới
    if (!chat) {
      const newChat = {
        name: user.name || user.email,
        isGroup: false,
        members: [currentUser.uid, user.uid],
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(chatsRef, newChat);
      chat = { id: docRef.id, ...newChat };
    }

    // ✅ Truyền về HomePage
    onSelectChat(chat);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <h3 className="p-3 font-semibold border-b bg-gray-100">Người dùng</h3>
      {users.map((user) => (
        <div
          key={user.uid}
          className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b"
          onClick={() => handleSelectUser(user)}
        >
          <img
            src={
              user.avatar ||
              "https://res.cloudinary.com/dtsmm3z9b/image/upload/v1762159040/default_avatar_dvvkeg.png"
            }
            alt="avatar"
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
