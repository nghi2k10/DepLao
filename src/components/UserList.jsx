import { useEffect, useState } from "react";
import {
  collection,
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
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const allUsers = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.id !== currentUser.uid);
      setUsers(allUsers);
    };
    fetchUsers();
  }, [currentUser]);

  const startPrivateChat = async (otherUser) => {
    // Kiểm tra xem đã có chat 1-1 giữa 2 user chưa
    const q = query(
      collection(db, "chats"),
      where("type", "==", "private"),
      where("members", "array-contains", currentUser.uid)
    );

    const snapshot = await getDocs(q);

    let chat = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .find(
        (c) =>
          c.members.includes(otherUser.id) &&
          c.members.includes(currentUser.uid)
      );

    // Nếu chưa có → tạo mới
    if (!chat) {
      const newChatRef = await addDoc(collection(db, "chats"), {
        type: "private",
        members: [currentUser.uid, otherUser.id],
        name: otherUser.name,
        createdAt: serverTimestamp(),
      });
      chat = { id: newChatRef.id, name: otherUser.name, members: [currentUser.uid, otherUser.id], type: "private" };
    }

    onSelectChat(chat);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Người dùng</h2>
      <ul className="space-y-2">
        {users.map((u) => (
          <li
            key={u.id}
            onClick={() => startPrivateChat(u)}
            className="p-2 bg-white rounded-md hover:bg-blue-100 cursor-pointer flex items-center space-x-2"
          >
            {u.avatar ? (
              <img
                src={u.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold">
                {u.name?.[0]?.toUpperCase()}
              </div>
            )}
            <span>{u.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
