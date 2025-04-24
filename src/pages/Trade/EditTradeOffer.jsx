import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../utils/useAuth';

const EditTradeOffer = () => {
    const { userId, tradeId } = useParams();
    const [myBooks, setMyBooks] = useState([]);
    const [theirBooks, setTheirBooks] = useState([]);
    const [myOffer, setMyOffer] = useState([]);
    const [theirOffer, setTheirOffer] = useState([]);
    const [originalMyOfferIds, setOriginalMyOfferIds] = useState([]);
    const [originalTheirOfferIds, setOriginalTheirOfferIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [mySearchTerm, setMySearchTerm] = useState('');
    const [theirSearchTerm, setTheirSearchTerm] = useState('');
    const [myConditionFilter, setMyConditionFilter] = useState('');
    const [theirConditionFilter, setTheirConditionFilter] = useState('');

    const navigate = useNavigate();
    const { token } = useAuth();
    const isEditing = !!tradeId;

    useEffect(() => {
        axios.get('https://bookie.laravel.cloud/api/self', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setCurrentUserId(response.data.data.id);
            })
            .catch(error => console.error("Error fetching user ID:", error));
    }, [token]);

    useEffect(() => {
        if (!currentUserId) return;
    
        // Fetch my books
        axios.get('https://bookie.laravel.cloud/api/book-user', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            const books = response.data.data;
            const myBooksFiltered = books.filter(book => book.user.id === currentUserId);
            setMyBooks(myBooksFiltered);
        })
        .catch(error => console.error("Error fetching books:", error));
    
        // Fetch their books
        const otherUserId = parseInt(userId);
        if (otherUserId) {
            axios.get(`https://bookie.laravel.cloud/api/book-user`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                setTheirBooks(response.data.data);
            })
            .catch(error => console.error("Error fetching their books:", error))
            .finally(() => {
                setLoading(false);
            });
        } else {
            setLoading(false); 
        }
    }, [currentUserId, userId, token]);
    
    
    
    
    

    useEffect(() => {
        if (!isEditing || !tradeId || !currentUserId) return;
    
        axios.get(`https://bookie.laravel.cloud/api/trades`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const trade = res.data.data.find(t => t.id === parseInt(tradeId));
    
            if (!trade) {
                console.error("Trade not found.");
                return;
            }
    
            console.log("Trade fetched:", trade);

            const { requester_id, receiver_id, requester_books, receiver_books } = trade;
    
            const otherUserId = currentUserId === requester_id ? receiver_id : requester_id;
    
            const selectedMyBooks = currentUserId === requester_id ? requester_books : receiver_books;
            const selectedTheirBooks = currentUserId === requester_id ? receiver_books : requester_books;
            
            setMyOffer(selectedMyBooks || []);
            setTheirOffer(selectedTheirBooks || []);
            
            setOriginalMyOfferIds((selectedMyBooks || []).map(b => b.book_user.id));
            setOriginalTheirOfferIds((selectedTheirBooks || []).map(b => b.book_user.id));
            
            // Fetch their books using the resolved otherUserId
            axios.get(`https://bookie.laravel.cloud/api/book-user`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                setTheirBooks(response.data.data);
                
            })
            .catch(error => console.error("Error fetching other user's books:", error)
        ).finally(() => {
            setLoading(false); // ✅ ALSO add this here if isEditing is true
        });
        
            
        })
        .catch(error => console.error("Error fetching trades:", error));
    }, [isEditing, tradeId, currentUserId, token]);
    
    

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
            setMyOffer(myOffer.filter(b => b.book_user.id !== book.book_user.id));
        } else {
            setTheirOffer(theirOffer.filter(b => b.book_user.id !== book.book_user.id));
        }
    };

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
            const receiverBooksToAdd = theirBookIds.filter(id => !originalTheirOfferIds.includes(id));
            const receiverBooksToRemove = originalTheirOfferIds.filter(id => !theirBookIds.includes(id));

            axios.post(`https://bookie.laravel.cloud/api/trades/${tradeId}/modify`, {
                books_to_add: booksToAdd,
                books_to_remove: booksToRemove,
                receiver_books_to_add: receiverBooksToAdd,
                receiver_books_to_remove: receiverBooksToRemove
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(() => {
                    alert("Trade modified successfully!");
                    navigate('/traderequest');
                })
                .catch(error => {
                    console.error("Modify error:", error);
                    alert("Failed to modify trade.");
                });
        } else {
            axios.post('https://bookie.laravel.cloud/api/trades', {
                requester_book_ids: myBookIds,
                receiver_book_ids: theirBookIds,
                receiver_id: parseInt(userId),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(() => {
                    alert("Trade created successfully!");
                    navigate('/traderequest');
                })
                .catch(error => {
                    console.error("Create trade error:", error);
                    alert("Failed to create trade.");
                });
        }
    };

    const filterBooks = (books, searchTerm, conditionFilter) =>
        books.filter(book => (
            (book.book?.title?.toLowerCase().includes(searchTerm) ||
                book.book?.author?.toLowerCase().includes(searchTerm)) &&
            (conditionFilter === '' || book.book_user.condition?.toLowerCase() === conditionFilter.toLowerCase())
        ));

    const filteredMyBooks = filterBooks(myBooks, mySearchTerm, myConditionFilter);
    const filteredTheirBooks = filterBooks(theirBooks, theirSearchTerm, theirConditionFilter);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-4 md:mb-6">{isEditing ? 'Edit Trade' : 'Create Trade'}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-9 gap-4">
                <div className="col-span-1 lg:col-span-4 bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-bold mb-4">Your Offer</h2>
                    {myOffer.length > 0 ? myOffer.map(book => (
                        <div key={book.book_user.id} className="flex items-center space-x-4">
                            <img src={book.book.image || '/images/bookimage.jpg'} className="w-16 h-16 rounded-lg" alt="" />
                            <div>
                                <p className="font-semibold">{book.book.title}</p>
                                <p className="text-sm text-gray-500">{book.book.author}</p>
                            </div>
                            <button className="text-red-500" onClick={() => handleRemoveFromOffer(book, true)}>Remove</button>
                        </div>
                    )) : <p>No books in your offer.</p>}
                </div>

                <div className="col-span-1 flex flex-col justify-center items-stretch space-y-4">
                    <button onClick={handleSubmitTrade} className="bg-purple-500 text-white px-4 py-2 rounded-lg w-full">
                        {isEditing ? 'Submit Changes' : 'Create Trade'}
                    </button>
                </div>

                <div className="col-span-1 lg:col-span-4 bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-bold mb-4">Their Offer</h2>
                    {theirOffer.length > 0 ? theirOffer.map(book => (
                        <div key={book.book_user.id} className="flex items-center space-x-4">
                            <img src={book.book.image || '/images/bookimage.jpg'} className="w-16 h-16 rounded-lg" alt="" />
                            <div>
                                <p className="font-semibold">{book.book.title}</p>
                                <p className="text-sm text-gray-500">{book.book.author}</p>
                            </div>
                            <button className="text-red-500" onClick={() => handleRemoveFromOffer(book, false)}>Remove</button>
                        </div>
                    )) : <p>No books in their offer.</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="font-bold text-lg mb-2">Your Inventory</h2>
                    <input type="text" placeholder="Search" className="input input-bordered w-full mb-2" onChange={e => setMySearchTerm(e.target.value.toLowerCase())} />
                    <select className="select select-bordered w-full mb-4" onChange={e => setMyConditionFilter(e.target.value)}>
                        <option value="">All Conditions</option>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                    {filteredMyBooks.map(book => (
                        <div key={book.book_user.id} className="flex items-center space-x-4 mb-2">
                            <img src={book.book?.image || '/images/bookimage.jpg'} className="w-16 h-16 rounded-lg" alt="" />
                            <div>
                                <p className="font-semibold">{book.book?.title}</p>
                                <p className="text-sm text-gray-500">{book.book?.author}</p>
                                <p className="text-sm text-gray-500">Condition: {book.book_user.condition}</p>
                            </div>
                            <button className="text-blue-500" onClick={() => handleAddToOffer(book, true)}>Add to Offer</button>
                        </div>
                    ))}
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="font-bold text-lg mb-2">Their Inventory</h2>
                    <input type="text" placeholder="Search" className="input input-bordered w-full mb-2" onChange={e => setTheirSearchTerm(e.target.value.toLowerCase())} />
                    <select className="select select-bordered w-full mb-4" onChange={e => setTheirConditionFilter(e.target.value)}>
                        <option value="">All Conditions</option>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                    {filteredTheirBooks.map(book => (
                        <div key={book.book_user.id} className="flex items-center space-x-4 mb-2">
                            <img src={book.book?.image || '/images/bookimage.jpg'} className="w-16 h-16 rounded-lg" alt="" />
                            <div>
                                <p className="font-semibold">{book.book?.title}</p>
                                <p className="text-sm text-gray-500">{book.book?.author}</p>
                                <p className="text-sm text-gray-500">Condition: {book.book_user.condition}</p>
                            </div>
                            <button className="text-blue-500" onClick={() => handleAddToOffer(book, false)}>Add to Offer</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EditTradeOffer;
