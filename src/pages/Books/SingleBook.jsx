import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiOutlineBookmark } from 'react-icons/hi';
import axios from 'axios';
import SidebarNav from '../../components/SideBar';
import { useAuth } from '../../utils/useAuth';
import { useNavigate } from 'react-router-dom';

const SingleBook = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [bookUsers, setBookUsers] = useState([]);
  const [filteredBookUsers, setFilteredBookUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('Synopsis');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [timeSortOrder, setTimeSortOrder] = useState('newest');
  const [wishlist, setWishlist] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 1, comment: '' });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const { user, token } = useAuth();


  if (!user) return <div>Loading user info...</div>;


  const StarRating = ({ rating, onChange, editable }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`cursor-pointer text-xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${editable ? 'hover:scale-110' : ''}`}
            onClick={() => editable && onChange(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await axios.delete(`https://bookie.laravel.cloud/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };


  useEffect(() => {
    if (token) {
      // Fetch book details
      axios.get(`https://bookie.laravel.cloud/api/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setBook(response.data.data);
          setReviews(response.data.data.reviews || []);

          // Log the book data
          console.log("Book Data:", response.data.data);
        })
        .catch(error => console.error('Error fetching book:', error));

      // Fetch book users
      axios.get('https://bookie.laravel.cloud/api/book-user', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          const filteredUsers = response.data.data.filter(entry => entry.book.id === parseInt(id));
          setBookUsers(filteredUsers);
          setFilteredBookUsers(filteredUsers); // Initialize filtered list
        })
        .catch(error => console.error('Error fetching book users:', error));

      // Fetch wishlist
      axios.get('https://bookie.laravel.cloud/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          if (response.data && Array.isArray(response.data.data)) {
            const wishlistIds = response.data.data.map(item => item.id);
            setWishlist(wishlistIds);
            setIsInWishlist(wishlistIds.includes(parseInt(id)));
          }
        })
        .catch(error => console.error('Error fetching wishlist:', error));
    }
  }, [id, token]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingReviewId
        ? `https://bookie.laravel.cloud/api/reviews/${editingReviewId}`
        : `https://bookie.laravel.cloud/api/books/${id}/reviews`;

      const method = editingReviewId ? 'put' : 'post';

      const response = await axios[method](url, newReview, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const updatedReview = response.data.data;

        if (editingReviewId) {
          setReviews((prev) =>
            prev.map((r) => (r.id === editingReviewId ? updatedReview : r))
          );
        } else {
          setReviews((prev) => [...prev, updatedReview]);
        }

        setNewReview({ rating: 1, comment: '' });
        setEditingReviewId(null);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };



  const toggleWishlist = async () => {
    try {
      const response = await axios.post('https://bookie.laravel.cloud/api/wishlist/toggle', { book_id: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setIsInWishlist(!isInWishlist);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  // Filter by condition
  const handleConditionFilter = (condition) => {
    setConditionFilter(condition);
    let filtered = bookUsers;

    if (condition !== 'all') {
      filtered = bookUsers.filter(user => user.book_user.condition === condition);
    }

    // Apply time sorting after filtering
    if (timeSortOrder === 'newest') {
      filtered = filtered.sort((a, b) => new Date(b.book_user.created_at) - new Date(a.book_user.created_at));
    } else {
      filtered = filtered.sort((a, b) => new Date(a.book_user.created_at) - new Date(b.book_user.created_at));
    }

    setFilteredBookUsers(filtered);
  };

  // Sort by time
  const handleTimeSort = (order) => {
    setTimeSortOrder(order);
    let sorted = [...filteredBookUsers];

    if (order === 'newest') {
      sorted = sorted.sort((a, b) => new Date(b.book_user.created_at) - new Date(a.book_user.created_at));
    } else {
      sorted = sorted.sort((a, b) => new Date(a.book_user.created_at) - new Date(b.book_user.created_at));
    }

    setFilteredBookUsers(sorted);
  };

  if (!book) return <div>Loading...</div>;


  return (
    <div className="flex bg-gray-100 min-h-screen">
      <SidebarNav className="h-screen" />
      <div className="flex-1 ml-4 flex flex-col md:flex-row min-h-screen">
        <div className="flex-1 mr-4 flex flex-col">
          <div className="pb-4 mt-5">
            <img src={book.image || '/images/bookimage.jpg'} alt={book.title} className="w-32 h-48 object-cover rounded-lg" />
            <button
              className={`mt-4 px-3 py-2 rounded-xl flex items-center text-size-sm ${isInWishlist ? 'bg-gray-400 text-white' : 'bg-blue-800 text-white'
                }`}
              onClick={toggleWishlist}
            >
              {isInWishlist ? 'On Wishlist' : 'Add to Wishlist'}
              <HiOutlineBookmark className="text-white ml-2" />
            </button>
          </div>

          <div className="bg-gray-200 p-3 rounded-lg flex-1 flex flex-col">
            <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
            <h2 className="text-l text-gray-700 mb-2">By {book.author}</h2>
            <hr className="mb-2"></hr>

            <div className="flex space-x-2 mb-2">
              <button
                className={`text-l px-4 py-1 rounded-xl w-30 text-center ${activeTab === 'Synopsis' ? 'bg-blue-800 font-bold text-white' : 'bg-white text-blue-800'
                  }`}
                onClick={() => setActiveTab('Synopsis')}
              >
                Synopsis
              </button>
              <button
                className={`text-l px-4 py-1 rounded-xl w-30 text-center ${activeTab === 'Details' ? 'bg-blue-800 font-bold text-white' : 'bg-white text-blue-800'
                  }`}
                onClick={() => setActiveTab('Details')}
              >
                Details
              </button>
              <button
                className={`text-l px-4 py-1 rounded-xl w-30 text-center ${activeTab === 'Reviews' ? 'bg-blue-800 font-bold text-white' : 'bg-white text-blue-800'
                  }`}
                onClick={() => setActiveTab('Reviews')}
              >
                Reviews
              </button>
            </div>

            <hr></hr>
            {activeTab === 'Synopsis' && <p className="text-gray-600 mb-4">{book.description}</p>}
            {activeTab === 'Details' && (
              <div className="text-gray-600 mb-4">
                {book.isbn && <p><strong>ISBN:</strong> {book.isbn}</p>}
                {book.genres && book.genres.length > 0 && (
                  <p><strong>Genres:</strong> {book.genres.map(genre => genre.name).join(', ')}</p>
                )}
              </div>
            )}
            {activeTab === 'Reviews' && (
              <div className="text-gray-600 space-y-4">
                {/* Review List */}
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border border-gray-300 p-3 rounded-md bg-white relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{review.user?.username || 'Unknown User'}</p>
                          <StarRating rating={review.rating} editable={false} />
                          <p className="italic mt-1">"{review.comment}"</p>
                        </div>
                        {user && user.id === review.user?.id && (
                          <div className="flex gap-4 mt-2">
                            <button
                              className="text-blue-600 text-sm underline"
                              onClick={() => {
                                setNewReview({ rating: review.rating, comment: review.comment });
                                setEditingReviewId(review.id);
                                setActiveTab('Reviews');
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 text-sm underline"
                              onClick={() => handleDeleteReview(review.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No reviews yet.</p>
                )}

                {/* Review Form */}
                <form onSubmit={handleReviewSubmit} className="mt-4 bg-white p-4 rounded-lg shadow">
                  <h3 className="font-bold mb-2">{editingReviewId ? 'Edit Your Review' : 'Add Your Review'}</h3>

                  <label className="block mb-2">Rating</label>
                  <StarRating
                    rating={newReview.rating}
                    onChange={(rating) => setNewReview((prev) => ({ ...prev, rating }))}
                    editable={true}
                  />

                  <label className="block mt-4 mb-2">Comment</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full p-2 border rounded mb-4"
                    rows="3"
                    placeholder="Write something..."
                    required
                  />

                  <button type="submit" className="bg-blue-800 text-white px-4 py-2 rounded">
                    {editingReviewId ? 'Update Review' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>

        {/* TRADERS SECTION */}
        <div className="w-full md:w-1/3 bg-white p-4 rounded-lg mt-6 md:mt-0 flex-shrink-0">
          <h2 className="text-xl font-bold">Traders</h2>
          <hr className="my-2 border-gray-400"></hr>

          <div className='my-5'>
            <Link to={`/book_user_create?book_id=${id}`} className="bg-blue-200 text-black px-4 py-2 rounded-lg">
              List a Book
            </Link>
          </div>

          {/* Filters */}
          <div className="flex space-x-4 mb-4">
            <div>
              <label className="block mb-2 font-bold">Filter by Condition</label>
              <select
                className="w-full p-2 border rounded"
                value={conditionFilter}
                onChange={(e) => handleConditionFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="New">New</option>
                <option value="Very Good">Very Good</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-bold">Sort by Time</label>
              <select
                className="w-full p-2 border rounded"
                value={timeSortOrder}
                onChange={(e) => handleTimeSort(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {filteredBookUsers.length > 0 ? (
            filteredBookUsers.map((entry) => (
              <div key={entry.book_user.id} className="bg-blue-100 border p-4 rounded-lg shadow-md mb-4">
                <h3 className="text-lg font-bold mb-2">Trader:&nbsp; 
                <Link
                  to={`/users/${entry.user.id}`}
                  className="text-xl text-blue-500 hover:underline"
                >
                 {entry.user.name}
                </Link>  
                </h3>
                <p>Condition: {entry.book_user.condition}</p>
                <p>Status: {entry.book_user.status}</p>
                <p>Note: {entry.book_user.note || 'No additional notes'}</p>
                <p>Created At: {new Date(entry.book_user.created_at).toLocaleString()}</p>


                {entry.book_user.images.length > 0 ? (
                  <div className="mt-2 flex gap-2">
                    {entry.book_user.images.map((img) => (
                      <img key={img.id} src={img.image} alt="Book" className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>


                ) : (
                  <p className="text-gray-500">No images available</p>
                )}



                <div className="mt-4 flex gap-4">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    onClick={() => navigate(`/book-user/${entry.user.id}/${entry.book.id}`)}                >
                    View Book
                  </button>

                  <button
                    onClick={() => navigate(`/trade/${entry.user.id}`)}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg"
                  >
                    Trade
                  </button>
                </div>
              </div>


            ))
          ) : (
            <p>No traders available for this book.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleBook;