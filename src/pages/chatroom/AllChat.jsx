import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/useAuth';
import SidebarNav from '../../components/SideBar';

const AllChat = () => {
  const { token } = useAuth();
  const [friends, setFriends] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    axios.get('https://bookie.laravel.cloud/api/friendships', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      const acceptedFriends = response.data.data.filter(f => f.status === "accepted");
      setFriends(acceptedFriends);
    })
    .catch(error => console.error("Error fetching friendships:", error));
  }, [token]);

  const handleChatSelection = (chatPartnerId) => {
    navigate(`/chat/${chatPartnerId}`);
  };

  return (
    <div className="flex h-screen w-full">
      <SidebarNav />

      {/* Sidebar for friends list */}
      <div className="w-1/4 bg-gray-200 p-4 overflow-y-auto border-r">
        <h2 className="text-lg font-bold mb-4">Chats</h2>
        <ul>
          {friends.map(friend => {
            const chatPartnerId = friend.requester_id === token ? friend.receiver_id : friend.requester_id;
            const chatPartnerName = friend.requester_id === token ? friend.receiver_username : friend.requester_username;

            return (
              <li 
                key={friend.id} 
                className={`p-3 rounded cursor-pointer ${selectedFriendId == chatPartnerId ? 'bg-blue-200 text-black' : 'hover:bg-gray-300'}`} 
                onClick={() => handleChatSelection(chatPartnerId)}
              >
                {chatPartnerName}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Display selected chat messages in the main area */}
      <div className="flex-1 bg-gray-100 p-6">
        <h1 className="text-2xl font-bold">Select a Chat to Start Messaging</h1>
        {/* Add any content you want to show when no chat is selected */}
      </div>
    </div>
  );
};

export default AllChat;
