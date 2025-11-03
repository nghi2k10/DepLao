import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function CreateGroupModal({ currentUser, onClose }) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [groupAvatar, setGroupAvatar] = useState("");

  // 🔹 Lấy danh sách user từ Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const list = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.uid !== currentUser.uid); // loại bỏ chính mình
      setUsers(list);
    };
    fetchUsers();
  }, [currentUser]);

  // 🔹 Chọn / bỏ chọn user
  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

    // 🔹 Cloudinary config — thay giá trị của bạn vào đây
  const CLOUD_NAME = "dtsmm3z9b"; // 👉 ví dụ: "mychatapp123"
  const UPLOAD_PRESET = "chat_avatar_preset"; // 👉 ví dụ: "chatapp_upload"

  // 🔹 Upload avatar nhóm lên Cloudinary
  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET); // ⚠️ thay bằng preset của bạn
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setGroupAvatar(data.secure_url);
    } catch (error) {
      console.error("Lỗi upload avatar:", error);
      alert("Không thể upload ảnh nhóm!");
    }
    setUploading(false);
  };

  // 🔹 Tạo nhóm chat mới
  const handleCreateGroup = async () => {
    if (!groupName.trim()) return alert("Vui lòng nhập tên nhóm!");
    if (selectedUsers.length < 1) return alert("Chọn ít nhất 1 thành viên!");

    try {
      const members = [...selectedUsers, currentUser.uid];

      await addDoc(collection(db, "chats"), {
        name: groupName,
        members,
        isGroup: true,
        avatar:
          groupAvatar ||
          "https://res.cloudinary.com/dtsmm3z9b/image/upload/v1762162714/default_group_gdtmue.png",
        createdAt: serverTimestamp(),
      });

      onClose(); // đóng modal sau khi tạo nhóm
    } catch (error) {
      console.error("Lỗi tạo nhóm:", error);
      alert("Không thể tạo nhóm!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-96 p-5 rounded-xl shadow-lg">
        <h2 className="text-lg font-semibold mb-3">Tạo nhóm mới</h2>

        {/* Nhập tên nhóm */}
        <input
          type="text"
          placeholder="Nhập tên nhóm..."
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="border w-full px-3 py-2 rounded mb-3"
        />

        {/* Upload avatar nhóm */}
        <div className="flex items-center mb-3">
          <input type="file" accept="image/*" onChange={handleUploadAvatar} />
          {uploading && <p className="text-sm text-gray-500 ml-2">Đang tải...</p>}
          {groupAvatar && (
            <img
              src={groupAvatar}
              alt="avatar nhóm"
              className="w-10 h-10 rounded-full ml-2"
            />
          )}
        </div>

        {/* Danh sách user chọn thành viên */}
        <div className="max-h-60 overflow-y-auto border rounded p-2 mb-4">
          {users.map((user) => (
            <label
              key={user.uid}
              className="flex items-center p-1 cursor-pointer hover:bg-gray-50 rounded"
            >
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.uid)}
                onChange={() => toggleUser(user.uid)}
                className="mr-2"
              />
              <img
                src={
                  user.avatar ||
                  "https://res.cloudinary.com/dtsmm3z9b/image/upload/v1762159040/default_avatar_dvvkeg.png"
                }
                alt="avatar"
                className="w-8 h-8 rounded-full mr-2"
              />
              <span>{user.name}</span>
            </label>
          ))}
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={handleCreateGroup}
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Tạo nhóm
          </button>
        </div>
      </div>
    </div>
  );
}
