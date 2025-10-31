import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function ChatList({ onSelectChat }) {
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");

  const currentUser = auth.currentUser;

  // 🧩 Lấy danh sách phòng chat mà user đang tham gia
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "chats"),
      where("members", "array-contains", currentUser.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatList);
    });
    return () => unsub();
  }, [currentUser]);

  // 🧩 Lấy danh sách user (để chọn khi tạo group)
  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentUser?.uid) list.push(doc.data());
      });
      setUsers(list);
    };
    fetchUsers();
  }, [currentUser]);

  // 🧩 Chọn/bỏ chọn thành viên group
  const toggleUserSelect = (uid) => {
    setSelectedUsers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  // 🧩 Tạo group mới
  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 1) {
      alert("Nhập tên nhóm và chọn ít nhất 1 thành viên!");
      return;
    }

    await addDoc(collection(db, "chats"), {
      name: groupName,
      members: [...selectedUsers, currentUser.uid],
      isGroup: true,
      createdAt: serverTimestamp(),
    });

    setShowCreateGroup(false);
    setGroupName("");
    setSelectedUsers([]);
  };

  return (
    <div className="w-1/4 bg-gray-100 border-r overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-lg">💬 Chat</h2>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
        >
          + Tạo nhóm mới
        </button>
      </div>

      {/* Danh sách phòng chat */}
      {chats.length > 0 ? (
        chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className="p-3 border-b cursor-pointer hover:bg-gray-200"
          >
            {chat.isGroup ? (
              <strong>{chat.name}</strong>
            ) : (
              <span>Trò chuyện riêng</span>
            )}
          </div>
        ))
      ) : (
        <div className="p-4 text-gray-500">Chưa có phòng chat nào</div>
      )}

      {/* Popup tạo nhóm */}
      {showCreateGroup && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Tạo nhóm mới</h3>

            <input
              type="text"
              placeholder="Tên nhóm..."
              className="border rounded-lg w-full px-3 py-2 mb-3"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />

            <div className="max-h-48 overflow-y-auto border rounded-lg p-2 mb-3">
              {users.map((u) => (
                <label
                  key={u.uid}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u.uid)}
                    onChange={() => toggleUserSelect(u.uid)}
                  />
                  <span>{u.name}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateGroup(false)}
                className="px-3 py-2 rounded-lg bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={createGroup}
                className="px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                Tạo nhóm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
