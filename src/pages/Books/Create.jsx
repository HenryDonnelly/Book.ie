import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SidebarNav from '../../components/SideBar'; // Ensure the path is correct
import { useAuth } from '../../utils/useAuth';

const CreateBook = () => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [isbn, setIsbn] = useState('');
    const [image, setImage] = useState(null);
    const [genresList, setGenresList] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await axios.get('https://bookie.laravel.cloud/api/genres', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('Fetched genres:', response.data);
                setGenresList(response.data);
            } catch (error) {
                console.error('Error fetching genres:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGenres();
    }, [token]);

    const handleGenreChange = (genreId) => {
        setSelectedGenres((prevSelectedGenres) =>
            prevSelectedGenres.includes(genreId)
                ? prevSelectedGenres.filter((id) => id !== genreId)
                : [...prevSelectedGenres, genreId]
        );
    };

    const handleCreateBook = async () => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        formData.append('description', description);
        formData.append('isbn', isbn);
        formData.append('image', image);
    
        selectedGenres.forEach((genre) => {
            formData.append('genres[]', genre);
        });

        console.log('Form data:', {
            title,
            author,
            description,
            isbn,
            image,
            genres: selectedGenres
        });
    
        try {
            const response = await axios.post('https://bookie.laravel.cloud/api/books', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Book created:', response.data);
            navigate('/index');
        } catch (error) {
            console.error('Error creating book:', error.response?.data || error);
            alert(`Failed to create book: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleSearch = async () => {
        try {
            const response = await axios.get(`https://openlibrary.org/search.json?q=${searchTerm}`);
            console.log('Search results:', response.data.docs);
            setSearchResults(response.data.docs);
        } catch (error) {
            console.error('Error searching books:', error);
        }
    };

    const handleSelectBook = (book) => {
        console.log('Selected book:', book);
        setTitle(book.title);
        setAuthor(book.author_name ? book.author_name.join(', ') : '');
        setDescription(book.first_sentence ? book.first_sentence[0] : 'No description available');
        
        // Extract ISBN from the `isbn` field or `ia` array
        const extractedIsbn = book.isbn && book.isbn.length > 0 ? book.isbn[0] : (book.ia && book.ia.length > 0 ? book.ia[0] : '');
        setIsbn(extractedIsbn);
        
        setImage(book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null);

        // Match genres with the genresList
        const matchedGenres = genresList.filter(genre => book.subject && book.subject.includes(genre.name));
        setSelectedGenres(matchedGenres.map(genre => genre.id));

        setSearchResults([]);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex min-h-screen">
            <SidebarNav />
            <div className="flex-1 p-6 bg-gray-100">
                <h1 className="text-2xl font-bold mb-4">Add Book to Library</h1>
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <input
                        className="w-full p-2 border rounded-lg mb-2"
                        type="text"
                        placeholder="Search book"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4"
                        onClick={handleSearch}
                    >
                        Search
                    </button>
                    {searchResults.length > 0 && (
                        <div className="bg-gray-100 p-4 rounded-lg mb-4">
                            {searchResults.map((book, index) => (
                                <div
                                    key={index}
                                    className="cursor-pointer p-2 hover:bg-gray-200"
                                    onClick={() => handleSelectBook(book)}
                                >
                                    {book.title} by {book.author_name ? book.author_name.join(', ') : 'Unknown'}
                                </div>
                            ))}
                        </div>
                    )}
                    {title && (
                        <div className="bg-white p-4 rounded-lg shadow mb-4">
                            <h2 className="text-xl font-bold mb-2">{title}</h2>
                            <p className="text-gray-700 mb-2">by {author}</p>
                            <textarea
                                className="w-full p-2 border rounded-lg mb-2"
                                rows="3"
                                placeholder="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <p className="text-gray-700 mb-2">ISBN: {isbn}</p>
                            {image && <img src={image} alt={`${title} cover`} className="mb-4" />}
                            <div className="mb-4">
                                <h3 className="text-lg font-bold mb-2">Genres</h3>
                                <div className="flex flex-wrap gap-2">
                                    {genresList.map((genre) => (
                                        <div
                                            key={genre.id}
                                            className={`px-4 py-2 rounded-full cursor-pointer ${selectedGenres.includes(genre.id) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                                            onClick={() => handleGenreChange(genre.id)}
                                        >
                                            {genre.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                                onClick={handleCreateBook}
                            >
                                Add to Library
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateBook;