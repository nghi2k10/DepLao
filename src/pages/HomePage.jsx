import { useState } from "react";
import GroupList from "../components/GroupList";
import CreateGroupModal from "../components/CreateGroupModal";

export default function HomePage({ currentUser }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 p-4 bg-gray-100">
        <button
          onClick={() => setShowModal(true)}
          className="w-full mb-4 p-2 bg-blue-600 text-white rounded"
        >
          + Tạo nhóm mới
        </button>
        <GroupList currentUser={currentUser} onSelectGroup={setSelectedGroup} />
      </div>

      {/* Main Chat */}
      <div className="flex-1 p-4">
        {selectedGroup ? (
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {selectedGroup.name}
            </h2>
            <p className="text-gray-500">
              ({selectedGroup.members.length} thành viên)
            </p>
            {/* ChatRoom component sẽ hiển thị ở đây */}
          </div>
        ) : (
          <div className="text-gray-500 text-center mt-20">
            Chọn nhóm hoặc tạo nhóm mới để bắt đầu chat
          </div>
        )}
      </div>

      {showModal && (
        <CreateGroupModal currentUser={currentUser} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
