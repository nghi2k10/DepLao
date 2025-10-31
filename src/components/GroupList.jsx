import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function GroupList({ currentUser, onSelectGroup }) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "chats"),
      where("type", "==", "group"),
      where("members", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupList);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Nhóm của bạn</h2>
      <ul className="space-y-2">
        {groups.map((g) => (
          <li
            key={g.id}
            className="p-2 bg-white rounded-md hover:bg-blue-100 cursor-pointer"
            onClick={() => onSelectGroup(g)}
          >
            <div className="font-medium">{g.name}</div>
            <div className="text-sm text-gray-500">
              {g.members.length} thành viên
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
