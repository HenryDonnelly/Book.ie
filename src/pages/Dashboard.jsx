import React from 'react';
import { HiUser, HiRefresh, HiClipboardList, HiBookOpen, HiChatAlt2, HiHeart, HiUsers, HiCollection, HiUserCircle } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/useAuth';
import SidebarNav from '../components/SideBar';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const today = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-UK', options);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  console.log(user);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <div className="flex-1 p-6 bg-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome {user.name}</h1>
            <p>{formattedDate}</p>
          </div>
          <HiUserCircle className="text-blue-500 w-12 h-12 cursor-pointer" onClick={handleLogout} title="Sign Out" />
        </div>
        <div className="my-4 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Profile */}
          <div className="md:row-span-2 bg-gray-200 rounded-lg shadow-md flex flex-col items-center text-center p-6">
            <HiUser className="text-blue-500 w-12 h-12" />
            <h2 className="text-xl font-semibold mt-3">Profile</h2>
            <p className="text-gray-500 text-sm mt-1">View and edit your profile details.</p>
            <Link to="/profile" className="mt-3 text-blue-600 hover:underline">Go to Profile</Link>
          </div>

          {/* Trade Offers & Trade History */}
          <div className="md:col-span-2 bg-gray-200 rounded-lg shadow-md">
            <h1 className="text-xl font-bold p-6 pb-0">Trades</h1>
            <div className="flex flex-col md:flex-row gap-6 p-6">
              <div className="flex-1 bg-gray-50 rounded-lg shadow-md flex flex-col items-center text-center p-6">
                <HiRefresh className="text-green-500 w-10 h-10" />
                <h2 className="text-lg font-semibold mt-3">Trade Offers</h2>
                <p className="text-gray-500 text-sm mt-1">Check pending trade requests.</p>
                <Link to="/traderequest" className="mt-3 text-green-600 hover:underline">View Offers</Link>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg shadow-md flex flex-col items-center text-center p-6">
                <HiClipboardList className="text-yellow-500 w-10 h-10" />
                <h2 className="text-lg font-semibold mt-3">Trade History</h2>
                <p className="text-gray-500 text-sm mt-1">See past trades.</p>
                <Link to="/trade-history" className="mt-3 text-yellow-600 hover:underline">View History</Link>
              </div>
            </div>
          </div>

          {/* View Books & Forums */}
          <div className="flex flex-col md:flex-row md:col-span-2 gap-6">
            <div className="flex-1 bg-gray-200 rounded-lg shadow-md flex flex-col items-center text-center p-6 h-48">
              <HiBookOpen className="text-indigo-500 w-12 h-12" />
              <h2 className="text-xl font-semibold mt-3">View Books</h2>
              <p className="text-gray-500 text-sm mt-1">Browse available books.</p>
              <Link to="/index" className="mt-3 text-indigo-600 hover:underline">Browse Books</Link>
            </div>
            <div className="flex-1 bg-gray-200 rounded-lg shadow-md flex flex-col items-center text-center p-6 h-48">
              <HiChatAlt2 className="text-purple-500 w-12 h-12" />
              <h2 className="text-xl font-semibold mt-3">Forums</h2>
              <p className="text-gray-500 text-sm mt-1">Discuss and share with others.</p>
              <Link to="/forums" className="mt-3 text-purple-600 hover:underline">Join Discussions</Link>
            </div>
          </div>

          {/* Wishlist, Friends, My Books */}
          <div className="bg-gray-200 rounded-lg shadow-md flex flex-col items-center text-center p-6">
            <HiHeart className="text-red-500 w-10 h-10" />
            <h2 className="text-lg font-semibold mt-3">Wishlist</h2>
            <p className="text-gray-500 text-sm mt-1">Track books you want.</p>
            <Link to="/wishlist" className="mt-3 text-red-600 hover:underline">View Wishlist</Link>
          </div>
          <div className="bg-gray-200 rounded-lg shadow-md flex flex-col items-center text-center p-6">
            <HiUsers className="text-pink-500 w-10 h-10" />
            <h2 className="text-lg font-semibold mt-3">Friends</h2>
            <p className="text-gray-500 text-sm mt-1">Connect with book traders.</p>
            <Link to="/friends" className="mt-3 text-pink-600 hover:underline">View Friends</Link>
          </div>
          <div className="bg-gray-200 rounded-lg shadow-md flex flex-col items-center text-center p-6">
            <HiCollection className="text-gray-500 w-10 h-10" />
            <h2 className="text-lg font-semibold mt-3">My Books</h2>
            <p className="text-gray-500 text-sm mt-1">Manage your book collection.</p>
            <Link to="/inventory" className="mt-3 text-gray-600 hover:underline">Manage Books</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;