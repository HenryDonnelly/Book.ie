import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import { useAuth } from '../../utils/useAuth';
import SideBarNav from '../../components/SideBar';

const BookUserCreate = () => {
    const { token } = useAuth();
    const location = useLocation();
    const navigate = useNavigate(); // Initialize useNavigate
    const params = new URLSearchParams(location.search);
    const bookIdFromQuery = params.get('book_id');

    // If there's no book_id in the query string, handle appropriately (e.g., show error or redirect)
    if (!bookIdFromQuery) {
        return <div>Book ID not found in URL!</div>;
    }

    const [formData, setFormData] = useState({
        book_id: bookIdFromQuery,  // Set book_id to the one from the URL query
        condition: 'New', 
        status: 'available', 
        note: ''
    });

    const [selectedFile, setSelectedFile] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            // Step 1: Submit the form data
            const response = await axios.post('https://bookie.laravel.cloud/api/book-user/', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            console.log('Book listed successfully:', response.data);
    
            let bookUserId = response.data?.data?.id;
    
            if (!bookUserId) {
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
    
            // Step 2: Upload image if file is selected
            if (selectedFile) {
                await uploadImage(bookUserId);
            }
    
            // Step 3: After everything is completed, navigate to the book page
            console.log('Redirecting to:', `/books/${formData.book_id}`);
            alert('Book listed successfully!');

    
        } catch (error) {
            console.error('Error listing book:', error);
            alert('Failed to list the book.');
        }
        finally{
            navigate(-1)
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
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image.');
        }
    };

    return (
        <div className='flex'>
            <SideBarNav />
            <div className='align-items-center justify-center flex-1 bg-gray-100'>
                <div className="p-6 flex align-items-center justify-center min-h-screen">
                    <div>
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

                            {/* Button for submitting the form */}
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookUserCreate;
