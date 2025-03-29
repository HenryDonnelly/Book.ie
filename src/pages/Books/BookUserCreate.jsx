import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../utils/useAuth';

const BookUserCreate = () => {
    const { token } = useAuth();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const defaultBookId = params.get('book_id') || '';

    const [formData, setFormData] = useState({
        book_id: defaultBookId,
        condition: 'New', 
        status: 'available', 
        note: ''
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [bookUserId, setBookUserId] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://bookie.laravel.cloud/api/book-user/', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            console.log('Book listed successfully:', response.data);
            alert(response.data.message || 'Book listed successfully!');
    
            // Try to extract book_user_id from response (if API provides it)
            let bookUserId = response.data?.data?.id;
    
            if (!bookUserId) {
                // If not found in response, fetch the latest book user record
                const bookUserResponse = await axios.get('https://bookie.laravel.cloud/api/book-user/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
    
                const latestBookUser = bookUserResponse.data.data.find(
                    (bookUser) => bookUser.book_id === formData.book_id
                );
    
                if (latestBookUser) {
                    bookUserId = latestBookUser.id;
                }
            }
    
            if (!bookUserId) {
                console.warn("Could not determine book_user_id for image upload.");
                return;
            }
    
            console.log("Book User ID found:", bookUserId);
    
            // If a file is selected, upload the image
            if (selectedFile) {
                await uploadImage(bookUserId);
            }
        } catch (error) {
            console.error('Error listing book:', error);
            alert('Failed to list the book.');
        }
    };
    

    const uploadImage = async (bookUserId) => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('book_user_id', bookUserId);
        formData.append('name', selectedFile);

        try {
            const response = await axios.post('https://bookie.laravel.cloud/api/book-user-image', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Image uploaded successfully:', response.data);
            alert('Image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image.');
        }
    };

    return (
        <div className="p-6 flex align-items-center justify-center min-h-screen">
            <div className=''>
                <h1 className="text-2xl font-bold mb-4">List Your Book</h1>
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                    <input type="hidden" name="book_id" value={formData.book_id} />

                    <label className="block">
                        Condition:
                        <select name="condition" value={formData.condition} onChange={handleChange} className="border p-2 w-full">
                            <option value="New">New</option>
                            <option value="Fine">Fine</option>
                            <option value="Very Good">Very Good</option>
                            <option value="Good">Good</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </label>

                    <label className="block">
                        Status:
                        <select name="status" value={formData.status} onChange={handleChange} className="border p-2 w-full">
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                        </select>
                    </label>

                    <label className="block">
                        Note:
                        <textarea placeholder='Additional notes about the book' name="note" value={formData.note} onChange={handleChange} className="border p-2 w-full"></textarea>
                    </label>

                    <label className="block">
                        Upload Book Image:
                        <input type="file" onChange={handleFileChange} className="border p-2 w-full" />
                    </label>

                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default BookUserCreate;
