import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SidebarNav from '../../components/SideBar'; // Ensure the path is correct

const SinglePost = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`https://bookie.laravel.cloud/api/posts/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('Post Fetch Response:', response.data.data);
                setPost(response.data.data);
                setComments(response.data.data.comments || []);
            } catch (error) {
                console.error('Error fetching post:', error);
            }
        };

        fetchPost();
    }, [id]);

    const handleAddComment = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`https://bookie.laravel.cloud/api/posts/${id}/comments`, {
                text: newComment 
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Comment Add Response:', response.data.data);
            setComments([...comments, response.data.data]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Failed to add comment');
        }
    };

    if (!post) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex min-h-screen">
            <SidebarNav />
            <div className="flex-1 p-6 bg-gray-100">
                <h1 className="text-2xl font-bold">{post.title}</h1>
                <div className="text-gray-500 text-sm mb-4">
                    <div className='flex space-x-2'>
                    <p>Posted by {post.username} • Created on {new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                    </div>

                <p className="text-gray-700 mb-5">{post.content}</p>
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    
                    <h3 className="text-lg font-bold mb-2">Comments</h3>
                    <div className="mt-4">
                        <textarea
                            className="w-full p-2 border rounded-lg mb-2"
                            rows="3"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                            onClick={handleAddComment}
                        >
                            Add Comment
                        </button>
                    </div>

                    {comments.map((comment, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded-lg mb-2">
                            <div className="text-gray-700">{comment.text}</div>
                            <div className="text-gray-500 text-sm">- {comment.username}</div>
                        </div>
                    ))}
                    
                </div>
            </div>
        </div>
    );
};

export default SinglePost;