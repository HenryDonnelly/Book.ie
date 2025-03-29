import React, { useState } from 'react';
import SidebarNav from '../../components/SideBar';

const Chat = () => {
  const [messages, setMessages] = useState([
    { sender: 'Alexa', text: 'Hey, how are you?' },
    { sender: 'Bob', text: 'I am good, how about you?' },
    { sender: 'Alexa', text: 'I am doing well, thanks!' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([
    { name: 'Alexa', lastMessage: 'I am doing well, thanks!', image: '/images/user1.png' },
    { name: 'Bob', lastMessage: 'I am good, how about you?', image: '/images/user2.png' }
  ]);
  const [currentUser, setCurrentUser] = useState(users[0]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { sender: 'You', text: newMessage }]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex bg-yellow-50 min-h-screen">
      <SidebarNav />
      <div className="flex flex-1 h-screen">
        <div className="w-1/4 bg-white p-4 border-r border-gray-300">
          <h2 className="text-xl font-bold mb-4">Chats</h2>
          <ul className="list-none">
            {users.map((user, index) => (
              <li
                key={index}
                className={`flex items-center p-2 mb-2 cursor-pointer rounded-lg ${currentUser.name === user.name ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                onClick={() => setCurrentUser(user)}
              >
                <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <p className="font-bold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.lastMessage}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-none bg-green-500 text-white p-4 flex items-center">
            <img src={currentUser.image} alt={currentUser.name} className="w-10 h-10 rounded-full mr-3" />
            <h1 className="text-xl font-bold">Chat with {currentUser.name}</h1>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg ${message.sender === 'You' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
                  <p className="font-bold">{message.sender}</p>
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex-none p-4 bg-white flex items-center">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg p-2 mr-2"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-lg"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;