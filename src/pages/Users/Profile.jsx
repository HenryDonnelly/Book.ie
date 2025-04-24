import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../utils/useAuth';
import SidebarNav from '../../components/SideBar';

const Profile = () => {
  const { token } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (token) {
      // Fetch user details
      axios.get('https://bookie.laravel.cloud/api/self', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          console.log("User Data:", response.data.data);
          setUserData(response.data.data);
          setUsername(response.data.data.username);
        })
        .catch(error => {
          console.error('Error fetching user details:', error);
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await axios.put(`https://bookie.laravel.cloud/api/users/${userData.id}`, 
        { username }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Username updated successfully!');
      setUserData((prev) => ({ ...prev, username }));
    } catch (error) {
      console.error('Error updating username:', error);
      alert('Failed to update username.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <SidebarNav />
        <div className="flex-1 p-6 bg-gray-100">
          <h1 className="text-2xl font-bold mb-4">Loading Profile...</h1>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex min-h-screen">
        <SidebarNav />
        <div className="flex-1 p-6 bg-gray-100">
          <h1 className="text-2xl font-bold mb-4">Failed to load profile.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <div className="flex-1 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Username:</strong> {userData.username}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Phone Number:</strong> {userData.phone_number}</p>
          <p><strong>Address:</strong> {userData.address}</p>
        </div>

        {/* Form to update username */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-bold mb-4">Update Username</h2>
          <form onSubmit={handleUpdateUsername}>
            <label className="block mb-2">
              New Username:
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border p-2 w-full rounded"
                required
              />
            </label>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4"
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update Username'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;