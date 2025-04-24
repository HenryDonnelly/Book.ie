import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation
import SidebarNav from "../../components/SideBar";
import { FaUser, FaExchangeAlt } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../utils/useAuth';

const TradeRequests = () => {
    const { token } = useAuth();
    const [currentUserId, setCurrentUserId] = useState(null);
    const [requests, setRequests] = useState([]);
    const [books, setBooks] = useState({});
    const [usernames, setUsernames] = useState({});
    const [activeTab, setActiveTab] = useState('pending');
    const navigate = useNavigate();
    const location = useLocation(); // Get the current location

    const pendingTrades = requests.filter(req => req.status === "pending");
    const acceptedDeclinedTrades = requests.filter(req =>
        req.status === "accepted" || req.status === "rejected"
    );
    const changedTrades = requests.filter(req => req.status === "changed");

    useEffect(() => {
        // Read the 'tab' query parameter and set the active tab
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [location.search]);

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
        // Fetch trade requests
        axios.get('https://bookie.laravel.cloud/api/trades', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setRequests(response.data.data || []);

                const userIds = [
                    ...new Set(response.data.data.flatMap(req => [req.requester_id, req.receiver_id]))
                ];
                userIds.forEach(id => {
                    axios.get(`https://bookie.laravel.cloud/api/users/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                        .then(userResponse => {
                            setUsernames(prev => ({
                                ...prev,
                                [id]: userResponse.data.data.username
                            }));
                        })
                        .catch(error => console.error(`Error fetching user ${id}:`, error));
                });
            })
            .catch(error => console.error("Error fetching trade requests:", error));
    }, [token]);

    useEffect(() => {
        axios.get('https://bookie.laravel.cloud/api/book-user', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                const bookData = response.data.data.reduce((acc, book) => {
                    acc[book.book_user.id] = book.book;
                    return acc;
                }, {});
                setBooks(bookData);
            })
            .catch(error => console.error("Error fetching books:", error));
    }, [token]);

    const handleAcceptTrade = (tradeId) => {
        axios.post(`https://bookie.laravel.cloud/api/trades/${tradeId}/accept`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => alert("Trade accepted successfully!"))
            .catch(error => console.error("Error accepting trade:", error));
    };

    const handleDeclineTrade = (tradeId) => {
        axios.post(`https://bookie.laravel.cloud/api/trades/${tradeId}/reject`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => alert("Trade declined successfully!"))
            .catch(error => console.error("Error declining trade:", error));
    };

    const handleChangeOffer = (userId, tradeId) => {
        navigate(`/tradeoffer/${userId}/edit/${tradeId}`);
    };


    const renderTradeCard = (req, index) => {
        const tradeData = JSON.parse(req.trade_data);
        const requesterBooks = tradeData.requester_books || [];
        const receiverBooks = tradeData.receiver_books || [];
        const otherTraderName =
            req.receiver_id === currentUserId
                ? usernames[req.requester_id] || `User ${req.requester_id}`
                : usernames[req.receiver_id] || `User ${req.receiver_id}`;

        return (
            <li key={index} className="p-6 bg-white rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <FaUser className="text-gray-500 mr-2" />
                        <p className="text-lg"><strong>You</strong></p>
                    </div>
                    <div className="flex items-center">
                        <FaUser className="text-gray-500 mr-2" />
                        <p className="text-lg"><strong>{otherTraderName}</strong></p>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    {/* You Offer */}
                    <div className="w-1/3 p-4 bg-gray-100 rounded-lg relative">
                        <h3 className="text-center font-bold mb-2">You Offer</h3>
                        <div className="flex flex-wrap justify-center">
                            {requesterBooks.map((bookId, idx) => (
                                <div key={idx} className="m-2">
                                    <img
                                        src={books[bookId]?.image || '/images/bookimage.jpg'}
                                        alt="Offer"
                                        className="w-24 h-32 object-cover rounded-lg mb-1"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col items-center mx-4">
                        <FaExchangeAlt className="text-3xl text-gray-500 mb-5" />
                        {req.receiver_id === currentUserId && req.status === "pending" ? (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleAcceptTrade(req.id)}
                                    className="bg-green-500 font-bold text-white px-4 py-2 rounded-lg"
                                >
                                    Accept
                                </button>
                                <button className='bg-blue-600 font-bold text-white px-4 py-2 rounded-lg' onClick={() => handleChangeOffer(req.receiver_id, req.id)}>
                                    Change Offer
                                </button>

                                <button
                                    onClick={() => handleDeclineTrade(req.id)}
                                    className="bg-red-500 font-bold text-white px-4 py-2 rounded-lg"
                                >
                                    Decline
                                </button>
                            </div>
                        ) : (
                            <span
                                className={`text-sm px-2 py-1 rounded ${req.status === "pending"
                                    ? "bg-yellow-500"
                                    : req.status === "accepted"
                                        ? "bg-green-600"
                                        : req.status === "rejected"
                                            ? "bg-red-500"
                                            : "bg-purple-500"
                                    } text-white`}
                            >
                                {req.status}
                            </span>
                        )}
                    </div>

                    {/* You Receive */}
                    <div className="w-1/3 p-4 bg-gray-100 rounded-lg relative">
                        <h3 className="text-center font-bold mb-2">You Receive</h3>
                        <div className="flex flex-wrap justify-center">
                            {receiverBooks.map((bookId, idx) => (
                                <div key={idx} className="m-2">
                                    <img
                                        src={books[bookId]?.image || '/images/bookimage.jpg'}
                                        alt="Receive"
                                        className="w-24 h-32 object-cover rounded-lg mb-1"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </li>
        );
    };

    return (
        <div className="flex">
            <SidebarNav />
            <div className="flex-1 p-6 bg-gray-100">
                <h1 className="text-2xl font-bold mb-4">Trade Requests 🔄</h1>
                <div className="flex space-x-4 mb-4">
                    {["pending", "changed", "accepted_declined"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === tab
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700"
                                }`}
                        >
                            {tab === "pending" && "Pending"}
                            {tab === "changed" && "Changed Offers"}
                            {tab === "accepted_declined" && "History"}
                        </button>
                    ))}
                </div>

                <ul className="space-y-6">
                    {activeTab === "pending" && pendingTrades.map((req, index) => renderTradeCard(req, index))}
                    {activeTab === "changed" && changedTrades.map((req, index) => renderTradeCard(req, index))}
                    {activeTab === "accepted_declined" && acceptedDeclinedTrades.map((req, index) => renderTradeCard(req, index))}

                    {activeTab === "pending" && pendingTrades.length === 0 && <p>No pending requests.</p>}
                    {activeTab === "changed" && changedTrades.length === 0 && <p>No changed offers.</p>}
                    {activeTab === "accepted_declined" && acceptedDeclinedTrades.length === 0 && <p>No accepted/declined trades.</p>}
                </ul>
            </div>
        </div>
    );
};

export default TradeRequests;