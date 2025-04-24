import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SidebarNav from '../../components/SideBar';
import { FaHeart } from 'react-icons/fa';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { useAuth } from '../../utils/useAuth';
import Filter from '../../components/Filter';

const Index = () => {
    const { token } = useAuth();
    const [books, setBooks] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortByNewest, setSortByNewest] = useState(true);
    const [traderCounts, setTraderCounts] = useState({});
    const [isTrending, setIsTrending] = useState(false);
    const [genresList, setGenresList] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [showGenres, setShowGenres] = useState(false);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 10;

    useEffect(() => {
        if (!token) return;
        const fetchBooks = async () => {
            try {
                const res = await axios.get('https://bookie.laravel.cloud/api/books', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const sorted = res.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setBooks(sorted);
                fetchTraderCounts(sorted);
            } catch (err) {
                console.error('Book fetch error', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchWishlist = async () => {
            try {
                const res = await axios.get('https://bookie.laravel.cloud/api/wishlist', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const backendWishlist = res.data.data.map(item => item.id);
                setWishlist(backendWishlist);
            } catch (err) {
                console.error('Wishlist fetch error', err);
            }
        };

        const fetchGenres = async () => {
            try {
                const res = await axios.get('https://bookie.laravel.cloud/api/genres', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setGenresList(res.data);
            } catch (err) {
                console.error('Genre fetch error', err);
            }
        };

        fetchBooks();
        fetchWishlist();
        fetchGenres();
    }, [token]);

    const fetchTraderCounts = (books) => {
        axios.get('https://bookie.laravel.cloud/api/book-user/', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            const counts = {};
            res.data.data.forEach(entry => {
                const id = entry.book.id;
                counts[id] = (counts[id] || 0) + 1;
            });
            setTraderCounts(counts);
        }).catch(err => console.error('Trader counts error', err));
    };

    const toggleWishlist = (bookId) => {
        const alreadyInWishlist = wishlist.includes(bookId);
        const updated = alreadyInWishlist
            ? wishlist.filter(id => id !== bookId)
            : [...wishlist, bookId];
        setWishlist(updated);
        axios.post('https://bookie.laravel.cloud/api/wishlist/toggle', {
            book_id: bookId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        }).catch(err => console.error('Wishlist toggle error', err));
    };

    const handleGenreChange = (genreId) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(id => id !== genreId)
                : [...prev, genreId]
        );
        setCurrentPage(1); // reset pagination
    };

    const filteredBooks = useMemo(() => {
        return books.filter(book => {
            const matchSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(searchTerm.toLowerCase());
            const matchGenres = selectedGenres.length === 0 || book.genres.some(g => selectedGenres.includes(g.id));
            return matchSearch && matchGenres;
        });
    }, [books, searchTerm, selectedGenres]);

    const sortedBooks = useMemo(() => {
        return isTrending
            ? [...filteredBooks].sort((a, b) => (traderCounts[b.id] || 0) - (traderCounts[a.id] || 0))
            : filteredBooks;
    }, [filteredBooks, isTrending, traderCounts]);

    // Pagination
    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = sortedBooks.slice(indexOfFirstBook, indexOfLastBook);
    const totalPages = Math.ceil(sortedBooks.length / booksPerPage);

    return (
        <div className="flex min-h-screen">
            <SidebarNav showFilters={true} />
            <div className="flex-1 p-6 bg-gray-100">
                <div className="pt-6">
                    <Link to="/create" className="mt-3 text-indigo-600 hover:underline">List a Book</Link>
                    <h1 className="text-2xl font-bold mb-4">Books 📖</h1>

                    <div className="flex flex-wrap space-x-4 mb-4">
                        <Filter setSearchTerm={setSearchTerm} />
                        <button className="px-4 py-2 rounded-lg bg-blue-200 text-black" onClick={() => setIsTrending(!isTrending)}>
                            Trending
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-blue-200 text-black" onClick={() => {
                            setSortByNewest(!sortByNewest);
                            setBooks([...books].reverse());
                        }}>
                            {sortByNewest ? "Oldest" : "Newest"}
                        </button>
                    </div>

                    <button
                        className="bg-blue-200 text-black px-4 py-2 rounded-lg mb-4 flex items-center space-x-2"
                        onClick={() => setShowGenres(!showGenres)}
                    >
                        {showGenres ? <HiChevronUp /> : <HiChevronDown />}
                        <span>{showGenres ? 'Hide Genres' : 'Show Genres'}</span>
                    </button>

                    {showGenres && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {genresList.map((genre) => (
                                <div
                                    key={genre.id}
                                    className={`px-4 py-2 rounded-full cursor-pointer ${selectedGenres.includes(genre.id) ? 'bg-blue-400 text-black' : 'bg-blue-200 text-gray-700'}`}
                                    onClick={() => handleGenreChange(genre.id)}
                                >
                                    {genre.name}
                                </div>
                            ))}
                        </div>
                    )}

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
                        <>
                            <div className="grid gap-8 mb-6 lg:mb-16 md:grid-cols-2">
                                {currentBooks.map((book) => {
                                    const isInWishlist = wishlist.includes(book.id);
                                    return (
                                        <div key={book.id} className="relative items-center bg-gray-50 rounded-lg shadow sm:flex dark:bg-gray-800 dark:border-gray-700">
                                            <Link to={`/books/${book.id}`}>
                                                <img
                                                    className="w-full rounded-lg sm:rounded-none sm:rounded-l-lg p-3"
                                                    src={book.image || '/images/bookimage.jpg'}
                                                    alt={`${book.title} cover`}
                                                />
                                            </Link>
                                            <div className="p-5 flex flex-col justify-between flex-grow">
                                                <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                    {book.title}
                                                </h3>
                                                <span className="text-gray-500 dark:text-gray-400">by {book.author}</span>
                                                <div className="flex items-center mt-4">
                                                    <span className="text-xl text-gray-500 dark:text-gray-400">
                                                        {traderCounts[book.id] || 0} Traders
                                                    </span>
                                                    <Link
                                                        to={`/books/${book.id}`}
                                                        className="ml-5 bg-blue-200 text-black px-4 py-2 rounded-lg text-center hover:bg-blue-400 transition"
                                                    >
                                                        View Book
                                                    </Link>
                                                </div>
                                                <span className="mt-5 text-gray-500 dark:text-gray-400">listed at {book.created_at}</span>
                                            </div>
                                            <button
                                                className="absolute top-0 right-0 m-6 p-1 bg-white rounded-full shadow transition-all duration-200"
                                                onClick={() => toggleWishlist(book.id)}
                                            >
                                                <FaHeart
                                                    className={`text-2xl transition-all ${isInWishlist ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
                                                />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex justify-center space-x-4">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <span className="self-center">Page {currentPage} of {totalPages}</span>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Index;
