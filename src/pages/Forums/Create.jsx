import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SidebarNav from '../../components/SideBar';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();

    const handleCreatePost = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('https://bookie.laravel.cloud/api/posts', {
                title,
                content
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Post created:', response.data);
            navigate('/forums');
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post');
        }
    };

    return (
        <div className="flex min-h-screen">
            <SidebarNav />
            <div className="flex-1 p-6 bg-gray-100">
                <h1 className="text-2xl font-bold mb-4">Create Post</h1>
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <input
                        className="w-full p-2 border rounded-lg mb-2"
                        type="text"
                        placeholder="Post Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        className="w-full p-2 border rounded-lg mb-2"
                        rows="5"
                        placeholder="Post Content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                        onClick={handleCreatePost}
                    >
                        Create Post
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;