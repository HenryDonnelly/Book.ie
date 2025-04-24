import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SidebarNav from '../components/SideBar';
import { FaHeart } from 'react-icons/fa';
import { useAuth } from '../utils/useAuth';

const Wishlist = () => {
    const { token } = useAuth();
    const [wishlistBooks, setWishlistBooks] = useState([]);
    const [traderCounts, setTraderCounts] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchTraderCounts = (books) => {
        books.forEach(book => {
            axios.get(`https://bookie.laravel.cloud/api/book-user`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    const tradersForBook = response.data.data.filter(entry => entry.book.id === book.id);
                    setTraderCounts(prevCounts => ({
                        ...prevCounts,
                        [book.id]: tradersForBook.length
                    }));
                })
                .catch(error => console.error(`Error fetching traders for book ${book.id}:`, error));
        });
    };

    useEffect(() => {
        if (token) {
            axios.get('https://bookie.laravel.cloud/api/wishlist', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then((response) => {
                    if (response.data && Array.isArray(response.data.data)) {
                        const sortedBooks = response.data.data.sort((a, b) =>
                            new Date(b.created_at) - new Date(a.created_at)
                        );
                        setWishlistBooks(sortedBooks);
                        fetchTraderCounts(sortedBooks);
                    } else {
                        console.error('Unexpected response format:', response.data);
                    }
                })
                .catch(error => console.error('Error fetching wishlist:', error))
                .finally(() => setLoading(false));
        }
    }, [token]);

    const removeFromWishlist = (book) => {
        const bookId = book.book_id || book.id;
        if (!bookId) {
            console.error("Book ID is undefined, cannot remove from wishlist.", book);
            return;
        }

        axios.delete(`https://bookie.laravel.cloud/api/wishlist/${bookId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => {
                setWishlistBooks(prevBooks => prevBooks.filter(b => b.book_id !== bookId && b.id !== bookId));
            })
            .catch(error => console.error(`Error removing book ${bookId} from wishlist:`, error));
    };

    
    

    return (
        <div className="flex min-h-screen">
            <SidebarNav showFilters={true} />
            <div className="flex-1 p-6 bg-gray-100">
                <div className="pt-6">
                    <h1 className="text-2xl font-bold mb-4">Wishlist 📖</h1>

                    {loading ? (
                        <div className="grid gap-8 mb-6 lg:mb-16 md:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} role="status" className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center">
                                    <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded-sm sm:w-96 dark:bg-gray-700">
                                        <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18"><path d="..." /></svg>
                                    </div>
                                    <div className="w-full">
                                        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                                        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
                                        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                                        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[440px] mb-2.5"></div>
                                        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[460px] mb-2.5"></div>
                                        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-8 mb-6 lg:mb-16 md:grid-cols-2">
                            {wishlistBooks.map((book) => (
                                <div key={book.id} className="relative items-center bg-gray-50 rounded-lg shadow sm:flex dark:bg-gray-800 dark:border-gray-700">
                                    <Link to={`/books/${book.id}`}>
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
                                                {traderCounts[book.id] !== undefined ? `${traderCounts[book.id]} Traders` : "Loading..."}
                                            </span>
                                            <Link to={`/books/${book.id}`} className="bg-blue-500 text-white px-4 py-2 rounded-lg">View Book</Link>
                                        </div>
                                    </div>
                                    <button
                                        className="absolute top-0 right-0 m-6 p-1 bg-white rounded-full shadow"
                                        onClick={() => removeFromWishlist(book)}
                                    >
                                        <FaHeart className="text-red-500 hover:text-gray-400 transition-colors duration-200" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;