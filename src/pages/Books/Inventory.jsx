import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../utils/useAuth';
import SidebarNav from '../../components/SideBar';

const Inventory = () => {
    const { token, user } = useAuth();
    const [books, setBooks] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch current user data
    useEffect(() => {
        if (!token) return;

        axios.get('https://bookie.laravel.cloud/api/self', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setCurrentUserId(response.data.data.id); 
        })
        .catch(error => {
            console.error("Error fetching user info:", error);
        });
    }, [token]);

    useEffect(() => {
        if (!currentUserId || !token) return;
    
        setLoading(true);
        axios.get('https://bookie.laravel.cloud/api/book-user', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            if (response.data && Array.isArray(response.data.data)) {
                const userBooks = response.data.data.filter(bookUser => bookUser.user.id === currentUserId);
                setBooks(userBooks);
                console.log(userBooks);
            } else {
                console.error("Unexpected API response format", response.data);
            }
        })
        .catch(error => {
            console.error("Error fetching user's books:", error);
        })
        .finally(() => setLoading(false));
    }, [currentUserId, token]);

    const handleAvailabilityChange = (bookId, newStatus) => {
        const updatedBooks = books.map(book => {
            if (book.book.id === bookId) {
                return {
                    ...book,
                    book_user: {
                        ...book.book_user,
                        status: newStatus
                    }
                };
            }
            return book;
        });

        setBooks(updatedBooks);

        axios.put(
            `https://bookie.laravel.cloud/api/book-user/${bookId}`,
            { status: newStatus },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(response => {
            console.log('Availability updated successfully');
        })
        .catch(error => {
            console.error('Error updating availability:', error);
        });
    };

    return (
        <div className="flex">
            <SidebarNav />
            <div className="flex-1 p-6 bg-gray-100">
                <div className="pt-6">
                    <h2 className="text-4xl mb-5">
                        Here are all your books; choose your book's availability for trade
                    </h2>
                    <h1 className="text-2xl font-bold mb-4">My Books 📖</h1>

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
                            {books.length > 0 ? (
                                books.map((book, index) => (
                                    <div key={index} className="relative items-center bg-gray-50 rounded-lg shadow sm:flex dark:bg-gray-800 dark:border-gray-700">
                                        <a href={`/singlebook/${book.book.id}`}>
                                            <img
                                                className="w-full rounded-lg sm:rounded-none sm:rounded-l-lg p-3"
                                                src={book.book.image || '/images/bookimage.jpg'}
                                                alt={`${book.title} cover`}
                                            />
                                        </a>
                                        <div className="p-5 flex flex-col space-between">
                                            <div className='flex justify-between items-center'>
                                                <div>
                                                    <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                        <a href={`/physicalbook/${book.book.id}`}>{book.book.title}</a>
                                                    </h3>
                                                    <span className="text-gray-500 dark:text-gray-400">by {book.book.author}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-4">
                                                {/* <select
                                                    className="text-l me-4 rounded-lg px-4 py-2"
                                                    value={book.book_user.status}
                                                    onChange={(e) => handleAvailabilityChange(book.book.id, e.target.value)}
                                                >
                                                    <option value="available">Available</option>
                                                    <option value="unavailable">Unavailable</option>
                                                </select> */}
                                                <a href={`/book-user/${book.user.id}/${book.book.id}`} className="ml-4 bg-blue-200 text-black px-4 py-2 rounded-lg">
                                                    View Book
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No books found.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Inventory;