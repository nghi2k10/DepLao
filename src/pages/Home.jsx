import { useState } from "react";
import ChatList from "../components/ChatList";
import ChatRoom from "../components/ChatRoom";

export default function Home({ currentUser }) {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="flex h-screen">
      <ChatList
        currentUser={currentUser}
        selectedChat={selectedChat}
        onSelectChat={(chat) => setSelectedChat(chat)}
      />

      <div className="flex-1">
        {selectedChat ? (
          <ChatRoom chat={selectedChat} currentUser={currentUser} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-lg">
            💬 Chọn người hoặc nhóm để bắt đầu trò chuyện
          </div>
        )}
      </div>
    </div>
  );
}
