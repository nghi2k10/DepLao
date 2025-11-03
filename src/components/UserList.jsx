import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

export default function UserList({ currentUser, onSelectChat }) {
  const [users, setUsers] = useState([]);

  // 🔹 Lấy danh sách người dùng trừ bản thân
  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.id !== currentUser.uid);
      setUsers(list);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 🔹 Khi chọn user -> tìm hoặc tạo chat 1-1
  const handleSelectUser = async (user) => {
    try {
      const chatsRef = collection(db, "chats");

      // Kiểm tra xem đã có chat 1-1 chưa
      const q = query(
        chatsRef,
        where("isGroup", "==", false),
        where("members", "array-contains", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);

      let existingChat = null;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.members.length === 2 &&
          data.members.includes(user.id) &&
          data.members.includes(currentUser.uid)
        ) {
          existingChat = { id: doc.id, ...data };
        }
      });

      // Nếu chưa có -> tạo mới
      if (!existingChat) {
        const newChatRef = await addDoc(chatsRef, {
          name: user.name || user.email,
          isGroup: false,
          members: [currentUser.uid, user.id],
          createdAt: new Date(),
        });
        existingChat = {
          id: newChatRef.id,
          name: user.name || user.email,
          isGroup: false,
          members: [currentUser.uid, user.id],
        };
      }

      // Gửi thông tin chat lên HomePage để mở ChatRoom
      onSelectChat(existingChat);
    } catch (error) {
      console.error("Lỗi khi chọn user:", error);
    }
  };

  return (
    <div className="border-t">
      <div className="p-2 font-semibold border-b bg-white">Người dùng</div>
      <div className="overflow-y-auto max-h-[300px]">
        {users.length === 0 ? (
          <p className="text-gray-500 text-sm p-2">Chưa có người dùng khác</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleSelectUser(user)}
              className="p-2 hover:bg-gray-100 cursor-pointer border-b"
            >
              <div className="font-medium">{user.name || user.email}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
