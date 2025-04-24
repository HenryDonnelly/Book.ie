import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import SidebarNav from '../../components/SideBar';
import { useAuth } from '../../utils/useAuth';
import { useNavigate } from 'react-router-dom';

const PhysicalBook = () => {
  const { token } = useAuth();
  const { userId, bookId } = useParams();
  const [bookUser, setBookUser] = useState(null);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('https://bookie.laravel.cloud/api/self', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(response.data.data);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    if (token) fetchCurrentUser();
  }, [token]);


  const handleDelete = async () => {
    if (currentUser?.id !== bookUser.user_id) {
      alert("You are not authorized to delete this listing.");
      return;
    }
  
    const confirmDelete = window.confirm("Are you sure you want to delete this listing?");
    if (!confirmDelete) return;
  
    try {
      await axios.delete(`https://bookie.laravel.cloud/api/book-user/${bookUser.user_id}/${bookUser.book_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      alert("Listing deleted successfully!");
      navigate(`/books/${bookUser.book_id}`);
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete the listing.");
    }
  };
  
  useEffect(() => {
    if (token) {
      // Fetch the book-user data
      axios.get(`https://bookie.laravel.cloud/api/book-user/${userId}/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          console.log("Book User Data:", response.data);
          setBookUser(response.data);
        })
        .catch(error => console.error('Error fetching book-user data:', error));
    }
  }, [token, userId, bookId]);

  if (!bookUser) return <div>Loading...</div>;

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <SidebarNav className="h-screen" />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Physical Book Details</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p><strong>Condition:</strong> {bookUser.condition}</p>
          <p><strong>Status:</strong> {bookUser.status}</p>
          <p><strong>Note:</strong> {bookUser.note || "No additional notes"}</p>
          {currentUser?.id === bookUser.user_id && (
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-lg mt-4"
            >
              Delete Listing
            </button>
          )}
          <div className="mt-6">
            <Link to="/index" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
              Back to Library
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicalBook;