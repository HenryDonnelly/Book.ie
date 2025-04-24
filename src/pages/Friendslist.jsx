import React, { useState, useEffect } from 'react';
import { FaCommentDots, FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';
import SidebarNav from '../components/SideBar';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../utils/useAuth';

const FriendsList = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // Default to 'users' tab

  useEffect(() => {
    if (!token) return;

    // Get data of yourself and get the id
    if (!user?.id) {
      axios.get('https://bookie.laravel.cloud/api/self', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          const fetchedUser = response.data.data;
          user.id = fetchedUser.id;
          fetchFriendships();
        })
        .catch(error => {
          console.error('Error fetching user info:', error);
        });
    } else {
      fetchFriendships();
    }
    // Get all users
    axios.get('https://bookie.laravel.cloud/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        const allUsers = response.data.data || [];
        setUsers(allUsers);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, [token, user]);


  // Get all friendship requests and friends sort them out 
  const fetchFriendships = () => {
    if (!user?.id) return;

    axios.get('https://bookie.laravel.cloud/api/friendships', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        const data = response.data.data || [];

        const receivedRequests = data.filter(req => req.status === "pending" && req.receiver_id === user.id);
        setRequests(receivedRequests);

        const sentRequests = data.filter(req => req.status === "pending" && req.requester_id === user.id);
        setSentRequests(sentRequests);

        const acceptedFriends = data.filter(req => req.status === "accepted")
          .map(req => req.requester_id === user.id
            ? { id: req.receiver_id, username: req.receiver_username }
            : { id: req.requester_id, username: req.requester_username }
          );

        setFriends(acceptedFriends);
      })
      .catch(error => {
        console.error('Error fetching friendships:', error);
      });
  };

  const sendFriendRequest = (username) => {
    axios.post('https://bookie.laravel.cloud/api/friendships', { username }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => alert(`Friend request sent to ${username}`))
      .catch(error => console.error('Error sending request:', error));
  };

  // Handle accept or reject requesta
  const handleRequest = (id, action) => {
    axios.post(`https://bookie.laravel.cloud/api/friendships/${id}/${action}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setRequests(prevRequests => prevRequests.filter(req => req.id !== id));
        if (action === "accept") {
          const acceptedRequest = requests.find(req => req.id === id);
          if (acceptedRequest) {
            setFriends(prevFriends => [
              ...prevFriends,
              { id: acceptedRequest.requester_id, username: acceptedRequest.requester_username }
            ]);
          }
        }
      })
      .catch(error => console.error(`Error ${action} request:`, error));
  };

  const isFriend = (userId) => {
    return friends.some(friend => friend.id === userId);
  };

  // Filter out friends from the users 
  const filteredUsers = users.filter(user => !isFriend(user.id) && user.username.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex">
      <SidebarNav />
      <div className="p-6 bg-gray-100 min-h-screen w-full">
        <h1 className="text-2xl font-bold mb-4">Friends List</h1>



        <div className="mb-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 mr-2 rounded-lg ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >


            Users
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 mr-2 rounded-lg ${activeTab === 'requests' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Pending Requests
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'friends' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Friends
          </button>
        </div>

        {activeTab === 'users' && (
          <div>


            <h2 className="text-xl font-bold mt-4">All Users</h2>

            <input
              type="text"
              placeholder="Search users..."
              className="p-2 border rounded w-full my-4"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul className="list-none mb-6">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <li key={user.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow mb-4">
                    <a href={`/users/${user.id}`} className="text-black hover:underline ">
                      {user.username}
                    </a>
                    <button onClick={() => sendFriendRequest(user.username)} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center">
                      <FaUserPlus className="mr-2" /> Add Friend
                    </button>
                  </li>
                ))
              ) : (
                <p>No users found.</p>
              )}
            </ul>
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <h2 className="text-xl font-bold mt-4">Pending Friend Requests</h2>
            <ul className="list-none mb-6">
              {requests.length > 0 || sentRequests.length > 0 ? (
                <>
                  {requests.map(request => (
                    <li key={request.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow mb-4">
                      <span>{request.requester_username} sent you a request</span>
                      <div className='flex'>
                        <button onClick={() => handleRequest(request.id, "accept")} className="bg-green-500 text-white px-4 py-2 rounded-lg mr-2 flex items-center">
                          <FaCheck className="mr-1" /> Accept
                        </button>
                        <button onClick={() => handleRequest(request.id, "reject")} className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center">
                          <FaTimes className="mr-1" /> Reject
                        </button>
                      </div>
                    </li>
                  ))}

                  {sentRequests.map(request => (
                    <li key={request.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow mb-4">
                      <span>Friend request sent to {request.receiver_username}</span>
                      <span className="text-gray-500 italic">Pending approval</span>
                    </li>
                  ))}
                </>
              ) : (
                <p>No pending requests.</p>
              )}
            </ul>
          </div>
        )}

        {activeTab === 'friends' && (
          <div>
            <h2 className="text-xl font-bold mt-4">Friends</h2>
            <ul className="list-none">
              {friends.length > 0 ? (
                friends.map(friend => (
                  <li key={friend.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow mb-4">
                    <a href={`/users/${friend.id}`} className="text-black hover:underline">
                      {friend.username}
                    </a><Link to={`/chat/${friend.id}`} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center">
                      <FaCommentDots className="mr-2" /> Chat
                    </Link>
                  </li>
                ))
              ) : (
                <p>No friends added yet.</p>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
