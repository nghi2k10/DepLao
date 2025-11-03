import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function GroupList({ currentUser, onSelectChat }) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    // 🔍 Chỉ lấy các group chat mà user hiện tại là thành viên
    const q = query(
      collection(db, "chats"),
      where("isGroup", "==", true),
      where("members", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGroups(list);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="border-t">
      <div className="p-2 font-semibold border-b bg-white">Nhóm chat</div>

      <div className="overflow-y-auto max-h-[300px]">
        {groups.length === 0 ? (
          <p className="text-gray-500 text-sm p-2">Chưa có nhóm nào</p>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              onClick={() => onSelectChat(group)}
              className="p-2 hover:bg-gray-100 cursor-pointer border-b"
            >
              <div className="font-medium">{group.name}</div>
              <div className="text-xs text-gray-500">
                {group.members?.length || 0} thành viên
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
