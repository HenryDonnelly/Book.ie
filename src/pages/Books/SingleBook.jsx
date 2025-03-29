import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiOutlineBookmark } from 'react-icons/hi';
import axios from 'axios';
import SidebarNav from '../../components/SideBar';
import { useAuth } from '../../utils/useAuth';

const SingleBook = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [book, setBook] = useState(null);
  const [bookUsers, setBookUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('Synopsis');
  const [showNotes, setShowNotes] = useState(null); // Track which book_user note is expanded

  useEffect(() => {
    if (token) {
      // Fetch book details
      axios.get(`https://bookie.laravel.cloud/api/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => setBook(response.data.data))
        .catch(error => console.error('Error fetching book:', error));

      // Fetch book_users (traders) that match this book
      axios.get(`https://bookie.laravel.cloud/api/book-user/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          console.log("All book users response:", response.data.data); // Log full response

          // Correct filtering logic: match book.id with selected book ID
          const filteredUsers = response.data.data.filter(entry => entry.book.id === parseInt(id));

          console.log("Filtered book users for book_id", id, ":", filteredUsers);

          setBookUsers(filteredUsers);
        })

        .catch(error => console.error('Error fetching book users:', error));
    }
  }, [id, token]);


  const toggleNote = (index) => {
    setShowNotes(showNotes === index ? null : index); // Toggle note display
  };

  if (!book) return <div>Loading...</div>;

  return (
    <div className="flex bg-gray-200 min-h-screen">
      <SidebarNav className="h-screen" />
      <div className="flex-1 ml-4 flex flex-col md:flex-row min-h-screen">
        <div className="flex-1 mr-4 flex flex-col">
          <div className="pb-4 mt-5">
            <img src={book.image || '/images/bookimage.jpg'} alt={book.title} className="w-32 h-48 object-cover rounded-lg" />
            <button className="bg-blue-800 text-white mt-4 px-3 py-2 rounded-xl flex items-center text-size-sm">
              Add to Wishlist <HiOutlineBookmark className="text-white ml-2" />
            </button>
          </div>

          <div className="bg-gray-300 p-3 rounded-lg flex-1 flex flex-col">
            <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
            <h2 className="text-l text-gray-700 mb-2">By {book.author}</h2>
            <hr className='mb-2'></hr>

            <div className="flex space-x-2 mb-4">
              {book.release_date && <div className="bg-blue-800 text-white px-4 py-1 rounded-lg w-30 text-center">
                <div className="">Released</div>
                <div className='font-bold'>{book.release_date}</div>
              </div>}
              {book.pages && <div className="bg-blue-800 text-white px-4 py-1 rounded-lg w-30 text-center">
                <div className="">Pages</div>
                <div className='font-bold'>{book.pages}</div>
              </div>}
              {book.format && <div className="bg-blue-800 text-white px-4 py-1 rounded-lg w-30 text-center">
                <div className="">Format</div>
                <div className='font-bold'>{book.format}</div>
              </div>}
            </div>

            <div className="flex space-x-2 mb-2">
              <button className={`text-l px-4 py-1 rounded-xl w-30 text-center ${activeTab === 'Synopsis' ? 'bg-blue-800 font-bold text-white' : 'bg-white text-blue-800'}`}
                onClick={() => setActiveTab('Synopsis')}>Synopsis</button>
              <button className={`text-l px-4 py-1 rounded-xl w-30 text-center ${activeTab === 'Details' ? 'bg-blue-800 font-bold text-white' : 'bg-white text-blue-800'}`}
                onClick={() => setActiveTab('Details')}>Details</button>
              <button className={`text-l px-4 py-1 rounded-xl w-30 text-center ${activeTab === 'Reviews' ? 'bg-blue-800 font-bold text-white' : 'bg-white text-blue-800'}`}
                onClick={() => setActiveTab('Reviews')}>Reviews</button>
            </div>

            <hr></hr>
            {activeTab === 'Synopsis' && <p className="text-gray-600 mb-4">{book.description}</p>}
            {activeTab === 'Details' && <div className="text-gray-600 mb-4">
              {book.isbn && <p><strong>ISBN:</strong> {book.isbn}</p>}
              {book.genres && book.genres.length > 0 && <p><strong>Genres:</strong> {book.genres.map(genre => genre.name).join(', ')}</p>}
            </div>}
            {activeTab === 'Reviews' && <p className="text-gray-600 mb-4">Reviews content goes here...</p>}
          </div>
        </div>

        {/* TRADERS SECTION */}
        <div className="w-full md:w-1/3 bg-gray-100 p-4 rounded-lg mt-6 md:mt-0 flex-shrink-0">
          <h2 className="text-xl font-bold mb-4">Traders</h2>
          {bookUsers.length > 0 ? (
            bookUsers.map((entry) => (
              <div key={entry.book_user.id} className="border p-4 rounded-lg shadow-md mb-4">
                <h2 className="text-lg font-bold">Trader: {entry.user.name}</h2>
                <p>Condition: {entry.book_user.condition}</p>
                <p>Status: {entry.book_user.status}</p>
                <p>Note: {entry.book_user.note || "No additional notes"}</p>

                {/* Show images if available */}
                {entry.book_user.images.length > 0 ? (
                  <div className="mt-2 flex gap-2">
                    {entry.book_user.images.map((img) => (
                      <img key={img.id} src={img.image} alt="Book" className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No images available</p>
                )}
              </div>
            ))
          ) : (
            <p>No traders available for this book.</p>
          )}


          {/* ✅ "List Book" Button */}
          <div className="mt-4">
            <Link to={`/book_user_create?book_id=${id}`} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 block text-center">
              List Book
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleBook;
