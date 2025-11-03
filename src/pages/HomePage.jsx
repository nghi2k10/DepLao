import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import UserList from "../components/UserList";
import ChatRoom from "../components/ChatRoom";
import GroupList from "../components/GroupList";
import CreateGroupModal from "../components/CreateGroupModal";

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 🔹 Theo dõi trạng thái đăng nhập Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(user);
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Đăng xuất
  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar trái */}
      <div className="w-1/4 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-semibold text-gray-700">
            {currentUser.displayName || currentUser.email}
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="text-blue-500 hover:text-blue-700 text-2xl font-bold"
            title="Tạo nhóm mới"
          >
            +
          </button>
        </div>

        {/* Danh sách nhóm */}
        <GroupList currentUser={currentUser} onSelectChat={setSelectedChat} />

        {/* Danh sách user */}
        <UserList currentUser={currentUser} onSelectChat={setSelectedChat} />

        {/* Đăng xuất */}
        <button
          onClick={handleLogout}
          className="mt-auto p-3 text-sm text-red-500 hover:underline border-t"
        >
          Đăng xuất
        </button>
      </div>

      {/* Khu vực Chat */}
      <div className="flex-1">
        {selectedChat ? (
          <ChatRoom chat={selectedChat} currentUser={currentUser} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-lg">
            💬 Chọn người hoặc nhóm để bắt đầu chat
          </div>
        )}
      </div>

      {/* Modal tạo nhóm */}
      {showModal && (
        <CreateGroupModal
          currentUser={currentUser}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
