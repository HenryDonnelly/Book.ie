import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import SidebarNav from '../../components/SideBar';
import { useAuth } from '../../utils/useAuth';
import { useNavigate } from 'react-router-dom';


const UsersProfile = () => {
    const { userId } = useParams(); // Get the userId from the URL
    const { token } = useAuth(); // Get the token from the authentication context
    const [currentUser, setCurrentUser] = useState(null); // Store the current user's data
    const [userData, setUserData] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFriend, setIsFriend] = useState(false); // Track friendship status
    const [friendshipId, setFriendshipId] = useState(null); // Track friendship ID for chat
    const navigate = useNavigate(); // Initialize navigate

    const handleTrade = () => {
        navigate(`/trade/${userId}`); // Redirect to the TradeOffer page with the userId
    };

    // Fetch the current user's data
    useEffect(() => {
        if (!token) return;

        axios.get('https://bookie.laravel.cloud/api/self', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setCurrentUser(response.data.data);
                console.log("Current user data:", response.data.data); // Debugging current user data
            })
            .catch(error => {
                console.error("Error fetching current user data:", error);
            });
    }, [token]);

    // Fetch profile data, books, and friendship status
    useEffect(() => {
        if (!userId || !token || !currentUser) return;

        console.log("Fetching profile for userId:", userId); // Debugging userId

        setLoading(true);

        // Fetch user data
        axios.get(`https://bookie.laravel.cloud/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setUserData(response.data.data);
            })
            .catch(error => {
                console.error("Error fetching user data:", error);
            });

        // Fetch books for the user
        axios.get('https://bookie.laravel.cloud/api/book-user', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                if (response.data && Array.isArray(response.data.data)) {
                    const userBooks = response.data.data.filter(bookUser => bookUser.user.id === parseInt(userId));
                    setBooks(userBooks);
                } else {
                    console.error("Unexpected API response format", response.data);
                }
            })
            .catch(error => {
                console.error("Error fetching user's books:", error);
            });

        // Check friendship status
        axios.get('https://bookie.laravel.cloud/api/friendships', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                const friendships = response.data.data || [];
                console.log("Friendships:", friendships); // Debugging friendships array

                const friendship = friendships.find(f =>
                    (parseInt(f.requester_id) === parseInt(userId) && parseInt(f.receiver_id) === parseInt(currentUser.id)) ||
                    (parseInt(f.receiver_id) === parseInt(userId) && parseInt(f.requester_id) === parseInt(currentUser.id))
                );

                if (friendship) {
                    console.log("Friendship found:", friendship); // Debugging friendship object
                    if (friendship.status === 'accepted') {
                        setIsFriend(true);
                        setFriendshipId(friendship.id);
                    } else {
                        setIsFriend(false); // Not friends if the status is not 'accepted'
                    }
                } else {
                    setIsFriend(false); // No friendship found
                }
            })
            .catch(error => {
                console.error("Error checking friendship status:", error);
            })
            .finally(() => setLoading(false));
    }, [userId, token, currentUser]);

    const sendFriendRequest = () => {
        axios.post('https://bookie.laravel.cloud/api/friendships', { username: userData.username }, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => alert(`Friend request sent to ${userData.username}`))
            .catch(error => console.error('Error sending friend request:', error));
    };

    if (loading) {
        return (
            <div className="flex min-h-screen">
                <SidebarNav />
                <div className="flex-1 p-6 bg-gray-100">
                    <h1 className="text-2xl font-bold mb-4">Loading Profile...</h1>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="flex min-h-screen">
                <SidebarNav />
                <div className="flex-1 p-6 bg-gray-100">
                    <h1 className="text-2xl font-bold mb-4">User not found.</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="flex">
            <SidebarNav />
            <div className="flex-1 p-6 bg-gray-100">
                <div className="pt-6">
                    <h1 className="text-4xl font-bold mb-4">{userData.username}'s Profile</h1>

                    {/* Chat or Add Friend Button */}
                    <div className="mb-6 flex space-x-4">
                        {isFriend ? (
                            <Link to={`/chat/${friendshipId}`} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                                Chat with {userData.username}
                            </Link>
                        ) : (
                            <button
                                onClick={sendFriendRequest}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg"
                            >
                                Add {userData.username} as a Friend
                            </button>
                        )}
                        <button
                            onClick={handleTrade}
                            className="bg-purple-500 text-white px-4 py-2 rounded-lg"
                        >
                            Trade with {userData.username}
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold mb-4">Books 📚</h2>

                    {books.length > 0 ? (
                        <div className="grid gap-8 mb-6 lg:mb-16 md:grid-cols-2">
                            {books.map((book, index) => (
                                <div key={index} className="relative items-center bg-gray-50 rounded-lg shadow sm:flex dark:bg-gray-800 dark:border-gray-700">
                                    <a href={`/singlebook/${book.book.id}`}>
                                        <img
                                            className="w-full rounded-lg sm:rounded-none sm:rounded-l-lg p-3"
                                            src={book.book.image || '/images/bookimage.jpg'}
                                            alt={`${book.book.title} cover`}
                                        />
                                    </a>
                                    <div className="p-5 flex flex-col space-between">
                                        <div>
                                            <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                <a href={`/physicalbook/${book.book.id}`}>{book.book.title}</a>
                                            </h3>
                                            <span className="text-gray-500 dark:text-gray-400">by {book.book.author}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No books found for this user.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UsersProfile;