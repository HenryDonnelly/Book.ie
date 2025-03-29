import React, { useState, useEffect } from 'react';
import { FaCommentDots, FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';
import SidebarNav from '../components/SideBar';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../utils/useAuth';

const FriendsList = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [friendIds, setFriendIds] = useState([]);




  useEffect(() => {
    if (!token) return;
    axios.get('https://bookie.laravel.cloud/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => setUsers(response.data.data || []))
      .catch(error => console.error('Error fetching users:', error));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    axios.get('https://bookie.laravel.cloud/api/friendships', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setRequests(response.data.data.filter(req => req.status === "pending"));
        setCurrentUserId(response.data.current_user_id);
        const acceptedFriendships = response.data.data.filter(req => req.status === "accepted");
        setFriendIds(acceptedFriendships.map(req => req.requester_id === response.data.current_user_id ? req.receiver_id : req.requester_id));
      })
      .catch(error => console.error('Error fetching friendships:', error));
  }, [token]);

  useEffect(() => {
    if (users.length > 0 && friendIds.length > 0) {
      setFriends(users.filter(user => friendIds.includes(user.id)));
    }
  }, [users, friendIds]);

  const sendFriendRequest = (username) => {
    axios.post('https://bookie.laravel.cloud/api/friendships', { username }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => alert(`Friend request sent to ${username}`))
      .catch(error => console.error('Error sending request:', error));
  };

  const handleRequest = (id, action) => {
    axios.post(`https://bookie.laravel.cloud/api/friendships/${id}/${action}`, { receiver_id: currentUserId }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setRequests(requests.filter(req => req.id !== id));
        if (action === "accept") {
          setFriends([...friends, requests.find(req => req.id === id)]);
        }
      })
      .catch(error => console.error(`Error ${action} request:`, error));
  };

  const filteredUsers = users
  .filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  .filter(user => !friendIds.includes(user.id));


  return (
    <div className="flex">
      <SidebarNav />
      <div className="p-6 bg-gray-100 min-h-screen w-full">
        <h1 className="text-2xl font-bold mb-4">Friends List</h1>

        <input
          type="text"
          placeholder="Search users..."
          className="p-2 border rounded w-full mb-4"
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <h2 className="text-xl font-bold mt-4">All Users</h2>
        <ul className="list-none mb-6">
          {filteredUsers.map(user => {
            const isFriend = friends.some(friend => friend.requester_username === user.username || friend.receiver_username === user.username);

            return (
              <li key={user.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow mb-4">
                <span>{user.username}</span>
                {isFriend ? (
                  <Link to={`/chat/${user.id}`} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center">
                    <FaCommentDots className="mr-2" />
                    Chat
                  </Link>
                ) : (
                  <button onClick={() => sendFriendRequest(user.username)} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center">
                    <FaUserPlus className="mr-2" />
                    Add Friend
                  </button>
                )}
              </li>
            );
          })}


        </ul>

        <h2 className="text-xl font-bold mt-4">Pending Friend Requests</h2>
        <ul className="list-none mb-6">
          {requests.map(request => (
            <li key={request.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow mb-4">
              <span>{request.requester_username}</span>
              <div>
                {request.receiver_username === "YOUR_USERNAME" ? (
                  // If the logged-in user is the receiver, show Accept/Decline buttons
                  <>
                    <button onClick={() => acceptRequest(request.id, request.requester_id)} className="bg-green-500 text-white px-4 py-2 rounded-lg mr-2">
                      <FaCheck /> Accept
                    </button>
                    <button onClick={() => rejectRequest(request.id, request.requester_id)} className="bg-red-500 text-white px-4 py-2 rounded-lg">
                      <FaTimes /> Reject
                    </button>
                  </>
                ) : (
                  // If the logged-in user is the sender, just show "Pending Request"
                  <span className="text-gray-500">Pending Request</span>
                )}
              </div>
            </li>
          ))}

        </ul>

        <h2 className="text-xl font-bold mt-4">Friends</h2>
        <ul className="list-none">
          {friends.length > 0 ? (
            friends.map(friend => (
              <li key={friend.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow mb-4">
                <span>{friend.username}</span>
                <Link to={`/chat/${friend.id}`} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center">
                  <FaCommentDots className="mr-2" /> Chat
                </Link>
              </li>
            ))
          ) : (
            <p>No friends added yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default FriendsList;
