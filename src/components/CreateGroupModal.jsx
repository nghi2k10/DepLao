import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function CreateGroupModal({ currentUser, onClose }) {
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🧩 Lấy danh sách user để chọn thành viên nhóm
  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.id !== currentUser.uid); // bỏ chính mình
      setUsers(userList);
    };
    fetchUsers();
  }, [currentUser]);

  // ✅ Toggle chọn / bỏ chọn user
  const toggleUser = (userId) => {
    setSelected((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // 🚀 Tạo nhóm chat
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return alert("Vui lòng nhập tên nhóm!");
    if (selected.length === 0)
      return alert("Vui lòng chọn ít nhất một thành viên!");

    setLoading(true);
    try {
      const members = [currentUser.uid, ...selected];
      await addDoc(collection(db, "chats"), {
        name: groupName.trim(),
        isGroup: true,
        members,
        createdAt: serverTimestamp(),
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo nhóm: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Tạo nhóm chat mới
        </h2>

        <form onSubmit={handleCreateGroup} className="space-y-4">
          {/* Nhập tên nhóm */}
          <input
            type="text"
            placeholder="Tên nhóm"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="border p-2 rounded-md w-full focus:outline-blue-500"
          />

          {/* Danh sách chọn user */}
          <div className="border rounded-md max-h-48 overflow-y-auto p-2">
            {users.length === 0 ? (
              <p className="text-sm text-gray-500">Không có người dùng nào</p>
            ) : (
              users.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(u.id)}
                    onChange={() => toggleUser(u.id)}
                  />
                  <span className="text-sm">{u.name || u.email}</span>
                </label>
              ))
            )}
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Đang tạo..." : "Tạo nhóm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
