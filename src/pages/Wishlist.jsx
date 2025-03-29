import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SidebarNav from '../components/SideBar';
import { FaHeart } from 'react-icons/fa';
import { useAuth } from '../utils/useAuth';

const Wishlist = () => {
    const { token } = useAuth();
    const [wishlistBooks, setWishlistBooks] = useState([]);
    const [traderCounts, setTraderCounts] = useState({}); // Store trader counts here

    useEffect(() => {
        if (token) {
            // Fetch wishlist books
            axios.get('https://bookie.laravel.cloud/api/wishlist', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then((response) => {
                    if (response.data && Array.isArray(response.data.data)) {
                        const sortedBooks = response.data.data.sort((a, b) =>
                            new Date(b.created_at) - new Date(a.created_at)
                        );
                        setWishlistBooks(sortedBooks);

                        // Fetch trader counts for each book
                        fetchTraderCounts(sortedBooks);
                    } else {
                        console.error('Unexpected response format:', response.data);
                    }
                })
                .catch(error => console.error('Error fetching wishlist:', error));
        }
    }, [token]);

    const fetchTraderCounts = (books) => {
        books.forEach(book => {
            axios.get(`https://bookie.laravel.cloud/api/book-user/`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    const tradersForBook = response.data.data.filter(entry => entry.book.id === book.book_id);
                    setTraderCounts(prevCounts => ({
                        ...prevCounts,
                        [book.book_id]: tradersForBook.length
                    }));
                })
                .catch(error => console.error(`Error fetching traders for book ${book.book_id}:`, error));
        });
    };

    return (
        <div className="flex min-h-screen">
            <SidebarNav showFilters={true} />
            <div className="flex-1 p-6 bg-gray-100">
                <div className="pt-6">
                    <h1 className="text-2xl font-bold mb-4">Wishlist 📖</h1>
                    <div className="grid gap-8 mb-6 lg:mb-16 md:grid-cols-2">
                        {wishlistBooks.map((book) => (
                            <div key={book.book_id} className="relative items-center bg-gray-50 rounded-lg shadow sm:flex dark:bg-gray-800 dark:border-gray-700">
                                <Link to={`/books/${book.book_id}`}>
                                    <img className="w-full rounded-lg sm:rounded-none sm:rounded-l-lg p-3" src={book.image || '/images/bookimage.jpg'} alt={`${book.title} cover`} />
                                </Link>
                                <div className="p-5 flex flex-col space-between">
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                            <a href="#">{book.title}</a>
                                        </h3>
                                        <span className="text-gray-500 dark:text-gray-400">by {book.author}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-xl me-4 text-gray-500 dark:text-gray-400">
                                            {traderCounts[book.book_id] !== undefined ? `${traderCounts[book.book_id]} Traders` : "Loading..."}
                                        </span>
                                        <Link to={`/books/${book.book_id}`} className="bg-blue-500 text-white px-4 py-2 rounded-lg">View Book</Link>
                                    </div>
                                </div>
                                <button
                                    className="absolute top-0 right-0 m-6 p-1 bg-white rounded-full shadow"
                                    onClick={() => console.log('Remove from wishlist functionality here')}
                                >
                                    <FaHeart className="text-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wishlist;