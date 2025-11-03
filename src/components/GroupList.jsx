import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

export default function GroupList({ currentUser, onSelectChat }) {
  const [groups, setGroups] = useState([]);

  // 🔹 Lấy danh sách nhóm của currentUser theo thời gian tạo
  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, "chats"),
      where("members", "array-contains", currentUser.uid),
      where("isGroup", "==", true),
      //orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(list);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="border-t flex-1 overflow-y-auto bg-white">
      <h3 className="p-3 font-semibold border-b bg-gray-100 text-gray-700">
        Nhóm chat
      </h3>

      {groups.length === 0 && (
        <p className="p-3 text-sm text-gray-400 italic">Chưa có nhóm nào</p>
      )}

      {groups.map((group) => (
        <div
          key={group.id}
          onClick={() => onSelectChat(group)}
          className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b"
        >
          <img
            src={
              group.avatar ||
              "https://res.cloudinary.com/dtsmm3z9b/image/upload/v1762159040/default_avatar_dvvkeg.png"
            }
            alt="group avatar"
            className="w-10 h-10 rounded-full mr-3 object-cover"
          />
          <div>
            <p className="font-medium text-gray-800">{group.name}</p>
            <p className="text-xs text-gray-500">
              {group.members?.length || 0} thành viên
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
