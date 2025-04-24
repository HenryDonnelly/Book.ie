import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/useAuth';
import { FaPaperPlane } from 'react-icons/fa';
import SidebarNav from '../../components/SideBar';

const Chat = () => {
  const { token } = useAuth(); // Ensure token is available
  const { friendId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [friendshipId, setFriendshipId] = useState(null);
  const [friends, setFriends] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState(friendId);
  const [selfData, setSelfData] = useState(null); // Store self data
  const messagesEndRef = useRef(null); // Reference for the last message

  useEffect(() => {
    if (!token) return;

    // Fetch friendships
    axios.get('https://bookie.laravel.cloud/api/friendships', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        const acceptedFriends = response.data.data.filter(f => f.status === "accepted");
        setFriends(acceptedFriends);

        const friendship = acceptedFriends.find(f =>
          (f.requester_id == friendId || f.receiver_id == friendId)
        );

        if (friendship) {
          setFriendshipId(friendship.id);
          fetchMessages(friendship.id);
        }
      })
      .catch(error => console.error("Error fetching friendships:", error));

    // Fetch self data
    getSelf();
  }, [token, friendId]);

  useEffect(() => {
    if (!friendshipId) return;
    const interval = setInterval(() => {
      fetchMessages(friendshipId);
    }, 2000);
    return () => clearInterval(interval);
  }, [friendshipId]);

  const getSelf = () => {
    axios.get(`https://bookie.laravel.cloud/api/self`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        console.log("Self data:", response.data.data); // Log self data
        setSelfData(response.data.data); // Store self data
      })
      .catch(error => console.error('Error fetching self data:', error));
  };

  const fetchMessages = (id) => {
    axios.get(`https://bookie.laravel.cloud/api/chat/${id}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => setMessages(response.data.messages))
      .catch(error => console.error('Error fetching messages:', error));
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !friendshipId) return;

    axios.post('https://bookie.laravel.cloud/api/chat/send', {
      friendship_id: friendshipId,
      message: newMessage,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setMessages([...messages, response.data.data]);
        setNewMessage('');
      })
      .catch(error => console.error('Error sending message:', error));
  };

  const handleChatSelection = (chatPartnerId) => {
    setSelectedFriendId(chatPartnerId);
    navigate(`/chat/${chatPartnerId}`);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!selfData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen w-full">
      <SidebarNav />

      {/* Sidebar for friends list */}
      <div className="w-1/4 bg-gray-200 p-4 overflow-y-auto border-r">
        <h2 className="text-lg font-bold mb-4">Friends</h2>
        <ul>
          {friends.map(friend => {
            const chatPartnerId = friend.requester_id === selfData?.id ? friend.receiver_id : friend.requester_id;
            const chatPartnerName = friend.requester_id === selfData?.id ? friend.receiver_username : friend.requester_username;

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

      {/* Chat Window */}
      <div className="flex flex-col flex-1 h-full p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Chat</h1>

        <div className="flex-1 overflow-y-auto mb-4 border rounded p-4 bg-white shadow">
          <ul className="list-none space-y-4">
          {messages.map((message) => {
  const isSender = message.sender_id === selfData.id || message.sender_username === selfData.username;

  return (
    <li
      key={message.id}
      className={`flex items-start ${isSender ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs p-3 rounded-lg shadow ${
          isSender ? 'bg-gradient-to-bl from-purple-500 via-purple-700 to-purple-800  self-end' : 'bg-gray-200 self-start'
        }`}
      >
        {/* Username */}
        <p
          className={`text-sm ${
            isSender ? 'text-white' : 'text-black'
          }`}
        >
          {message.sender_username}
        </p>

        {/* Message Text */}
        <span
          className={`block ${
            isSender ? 'text-white' : 'text-black'
          }`}
        >
          {message.message}
        </span>

        {/* Timestamp */}
        <span
          className={`text-xs mt-1 block ${
            isSender ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </li>
  );
})}
          </ul>
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center space-x-2 border-t pt-4 bg-white p-3">
          <input
            type="text"
            className="flex-1 p-2 border rounded shadow-sm"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white p-3 rounded-full shadow-md hover:bg-blue-600"
            disabled={!friendshipId}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;