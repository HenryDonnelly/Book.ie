import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SidebarNav from '../../components/SideBar';
import { useAuth } from '../../utils/useAuth';
import { IoChatbubble } from 'react-icons/io5';

const Forum = () => {
    const { token } = useAuth();
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (token) {
            axios.get('https://bookie.laravel.cloud/api/posts', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then((response) => {
                    console.log('API Response:', response.data);
                    if (response.data && Array.isArray(response.data.data)) {
                        setPosts(response.data.data);
                    } else {
                        console.error('Unexpected response format:', response.data);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching posts:', error);
                });
        }
    }, [token]);

    return (
        <div className="flex min-h-screen">
            <SidebarNav />
            <div className="flex-1 p-6 bg-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Forum</h1>
                </div>

                <p className='mb-5'>
                    <Link to="/createpost" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Create Post</Link>
                </p>

                {posts.length === 0 ? (
                    <p>Loading</p>
                ) : (
                    posts.map(post => (
                        <Link to={`/singlepost/${post.id}`} key={post.id} className="block">
                            <div className="flex flex-col bg-white p-4 rounded-lg shadow mb-4 hover:bg-gray-50 transition">
                                <div className="flex items-start flex-1">
                                    <div className="flex-1">
                                        <div className="text-gray-500 mb-2 text-sm">Posted by&nbsp;
                                            <Link
                                                to={`/users/${post.user_id}`}
                                                className="text-blue-800 hover:underline"
                                            >
                                               {post.username}
                                            </Link>
                                            &nbsp;• Created on {new Date(post.created_at).toLocaleDateString()}</div>
                                        <h2 className="text-xl text-gray-800 font-bold">{post.title}</h2>
                                        <p className="text-gray-700 text-lg">{post.content}</p>
                                        <div className="flex items-center space-x-1 text-gray-700 text-md mt-2 p-2 bg-gray-200 rounded-2xl w-fit">
                                            <IoChatbubble className="text-lg" />
                                            <span>{post.comments?.length || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default Forum;