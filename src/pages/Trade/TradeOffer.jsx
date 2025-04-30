import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../utils/useAuth';
import SidebarNav from '../../components/SideBar';
const TradeOffer = () => {
    const { token } = useAuth();

    const { userId, tradeId } = useParams();
    const [myBooks, setMyBooks] = useState([]);
    const [theirBooks, setTheirBooks] = useState([]);
    const [myOffer, setMyOffer] = useState([]);
    const [theirOffer, setTheirOffer] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [mySearchTerm, setMySearchTerm] = useState('');
    const [theirSearchTerm, setTheirSearchTerm] = useState('');
    const [myConditionFilter, setMyConditionFilter] = useState('');
    const [theirConditionFilter, setTheirConditionFilter] = useState('');
    const isEditing = !!tradeId;

    const [originalMyOfferIds, setOriginalMyOfferIds] = useState([]);

    useEffect(() => {
        if (isEditing) {
            axios.get(`https://bookie.laravel.cloud/api/trades/${tradeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    const originalOffer = res.data.data.requester_books; // or receiver_books
                    setMyOffer(originalOffer);
                    setOriginalMyOfferIds(originalOffer.map(b => b.book_user.id));
                });
        }
    }, [isEditing, token, tradeId]);



    const navigate = useNavigate();



    useEffect(() => {
        axios.get('https://bookie.laravel.cloud/api/self', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setCurrentUserId(response.data.data.id);
            })
            .catch(error => console.error("Error fetching current user ID:", error));
    }, [token]);

    useEffect(() => {
        if (!currentUserId) return;

        axios.get('https://bookie.laravel.cloud/api/book-user', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                console.log("Fetched Books:", response.data.data); // Debugging
                const books = response.data.data;

                // Filter books for the current user
                setMyBooks(books.filter(book => book.user.id === currentUserId));

                // Filter books for the other user
                setTheirBooks(books.filter(book => book.user.id === parseInt(userId)));
            })
            .catch(error => console.error("Error fetching books:", error))
            .finally(() => setLoading(false));
    }, [currentUserId, userId, token]);

    const handleAddToOffer = (book, isMine) => {
        if (isMine) {
            if (!myOffer.some(b => b.book_user.id === book.book_user.id)) {
                setMyOffer([...myOffer, book]);
            }
        } else {
            if (!theirOffer.some(b => b.book_user.id === book.book_user.id)) {
                setTheirOffer([...theirOffer, book]);
            }
        }
    };

    const handleRemoveFromOffer = (book, isMine) => {
        if (isMine) {
            setMyOffer(myOffer.filter(b => b.id !== book.id));
        } else {
            setTheirOffer(theirOffer.filter(b => b.id !== book.id));
        }
    };

    const filteredMyBooks = myBooks.filter(book =>
        (book.book?.title?.toLowerCase().includes(mySearchTerm) ||
            book.book?.author?.toLowerCase().includes(mySearchTerm)) &&
        (myConditionFilter === '' || book.book_user.condition?.toLowerCase() === myConditionFilter)
    );

    const filteredTheirBooks = theirBooks.filter(book =>
        (book.book?.title?.toLowerCase().includes(theirSearchTerm) ||
            book.book?.author?.toLowerCase().includes(theirSearchTerm)) &&
        (theirConditionFilter === '' || book.book_user.condition?.toLowerCase() === theirConditionFilter)
    );

    const handleSubmitTrade = () => {
        if (myOffer.length === 0 || theirOffer.length === 0) {
            alert("Both offers must have at least one book.");
            return;
        }

        const myBookIds = myOffer.map(book => book.book_user.id);
        const theirBookIds = theirOffer.map(book => book.book_user.id);

        if (isEditing) {
            const booksToAdd = myBookIds.filter(id => !originalMyOfferIds.includes(id));
            const booksToRemove = originalMyOfferIds.filter(id => !myBookIds.includes(id));

            axios.post(
                `https://bookie.laravel.cloud/api/trades/${tradeId}/modify`,
                {
                    books_to_add: booksToAdd,
                    books_to_remove: booksToRemove,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
                .then(() => {
                    alert("Trade modified successfully!");
                    navigate('/traderequest');
                })
                .catch(error => {
                    console.error("Error modifying trade:", error);
                    alert("Failed to modify trade.");
                });

        } else {
            axios.post(
                'https://bookie.laravel.cloud/api/trades',
                {
                    requester_book_ids: myBookIds,
                    receiver_book_ids: theirBookIds,
                    receiver_id: parseInt(userId),
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
                .then(() => {
                    alert("Trade created successfully!");
                    navigate('/traderequest');
                })
                .catch(error => {
                    console.error("Error creating trade:", error);
                    alert("Failed to create trade.");
                });
        }
    };



    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className='flex'>
            <SidebarNav />

            <div>
                <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
                    <h1 className="text-2xl font-bold mb-4 md:mb-6">Trade Request</h1>

                    {/* Top Section: Offers */}
                    <div className="grid grid-cols-1 lg:grid-cols-9 gap-4">
                        {/* Box 1: Your Offer */}
                        <div className="col-span-1 lg:col-span-4 bg-white p-4 rounded-lg shadow">
                            <h2 className="text-lg font-bold mb-4">Your Offer</h2>
                            {myOffer.length > 0 ? (
                                <div className="grid gap-4">
                                    {myOffer.map(book => (
                                        <div key={book.id} className="flex items-center space-x-4">
                                            <img
                                                src={book.book.image || '/images/bookimage.jpg'}
                                                alt={`${book.book.title} cover`}
                                                className="w-16 h-16 rounded-lg"
                                            />
                                            <div>
                                                <h3 className="text-md font-bold">{book.book.title}</h3>
                                                <p className="text-sm text-gray-500">by {book.book.author}</p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFromOffer(book, true)}
                                                className="text-red-500 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No books in your offer.</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="col-span-1 flex flex-col justify-center items-stretch space-y-4">

                            <button
                                onClick={handleSubmitTrade}
                                className="bg-purple-500 text-white px-4 py-2 rounded-lg w-full"
                            >
                                {isEditing ? "Submit Changes" : "Create Trade"}
                            </button>


                        </div>


                        {/* Box 2: Their Offer */}
                        <div className="col-span-1 lg:col-span-4 bg-white p-4 rounded-lg shadow">
                            <h2 className="text-lg font-bold mb-4">Their Offer</h2>
                            {theirOffer.length > 0 ? (
                                <div className="grid gap-4">
                                    {theirOffer.map(book => (
                                        <div key={book.id} className="flex items-center space-x-4">
                                            <img
                                                src={book.book.image || '/images/bookimage.jpg'}
                                                alt={`${book.book.title} cover`}
                                                className="w-16 h-16 rounded-lg"
                                            />
                                            <div>
                                                <h3 className="text-md font-bold">{book.book.title}</h3>
                                                <p className="text-sm text-gray-500">by {book.book.author}</p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFromOffer(book, false)}
                                                className="text-red-500 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No books in their offer.</p>
                            )}
                        </div>
                    </div>

                    {/* Bottom Section: Inventories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-4 md:mt-8">
                        {/* Box 3: Your Inventory */}
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h2 className="text-lg font-bold mb-4">Your Inventory</h2>
                            <div className="flex items-center space-x-4 mb-4">
                                {/* Search Input */}
                                <input
                                    type="text"
                                    placeholder="Search by title or author"
                                    className="input input-bordered w-full"
                                    onChange={(e) => setMySearchTerm(e.target.value.toLowerCase())}
                                />
                                {/* Condition Dropdown */}
                                <select
                                    className="select select-bordered"
                                    onChange={(e) => setMyConditionFilter(e.target.value)}
                                >
                                    <option value="">All Conditions</option>
                                    <option value="new">New</option>
                                    <option value="fine">Fine</option>
                                    <option value="very good">Very Good</option>
                                    <option value="good">Good</option>
                                    <option value="poor">Poor</option>
                                </select>
                            </div>
                            {filteredMyBooks.length > 0 ? (
                                <div className="grid gap-4">
                                    {filteredMyBooks.map(book => (
                                        <div key={book.book_user.id} className="flex items-center space-x-4">
                                            <img
                                                src={book.book?.image || '/images/bookimage.jpg'}
                                                alt={`${book.book?.title || 'Book'} cover`}
                                                className="w-16 h-16 rounded-lg"
                                            />
                                            <div>
                                                <h3 className="text-md font-bold">{book.book?.title || 'Untitled'}</h3>
                                                <p className="text-sm text-gray-500">by {book.book?.author || 'Unknown'}</p>
                                                <p className="text-sm text-gray-500">Condition: {book.book_user.condition}</p>
                                            </div>
                                            <button
                                                onClick={() => handleAddToOffer(book, true)}
                                                className="text-blue-500 hover:underline"
                                            >
                                                Add to Offer
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No books in your inventory.</p>
                            )}
                        </div>

                        {/* Box 4: Their Inventory */}
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h2 className="text-lg font-bold mb-4">Their Inventory</h2>
                            <div className="flex items-center space-x-4 mb-4">
                                {/* Search Input */}
                                <input
                                    type="text"
                                    placeholder="Search by title or author"
                                    className="input input-bordered w-full"
                                    onChange={(e) => setTheirSearchTerm(e.target.value.toLowerCase())}
                                />
                                {/* Condition Dropdown */}
                                <select
                                    className="select select-bordered"
                                    onChange={(e) => setTheirConditionFilter(e.target.value)}
                                >
                                    <option value="">All Conditions</option>
                                    <option value="new">New</option>
                                    <option value="fine">Fine</option>
                                    <option value="very good">Very Good</option>
                                    <option value="good">Good</option>
                                    <option value="poor">Poor</option>
                                </select>
                            </div>
                            {filteredTheirBooks.length > 0 ? (
                                <div className="grid gap-4">
                                    {filteredTheirBooks.map(book => (
                                        <div key={book.book_user.id} className="flex items-center space-x-4">
                                            <img
                                                src={book.book?.image || '/images/bookimage.jpg'}
                                                alt={`${book.book?.title || 'Book'} cover`}
                                                className="w-16 h-16 rounded-lg"
                                            />
                                            <div>
                                                <h3 className="text-md font-bold">{book.book?.title || 'Untitled'}</h3>
                                                <p className="text-sm text-gray-500">by {book.book?.author || 'Unknown'}</p>
                                                <p className="text-sm text-gray-500">Condition: {book.book_user.condition}</p>
                                            </div>
                                            <button
                                                onClick={() => handleAddToOffer(book, false)}
                                                className="text-blue-500 hover:underline"
                                            >
                                                Add to Offer
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No books in their inventory.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default TradeOffer;