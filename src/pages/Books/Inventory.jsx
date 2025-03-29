import React from 'react';
import SidebarNav from '../../components/SideBar';
import { FaHeart } from 'react-icons/fa';

const Inventory = () => {
    const books = [
        { title: "The Great Gatsby", author: "F. Scott Fitzgerald", image: "/images/gatsby.png" },
        { title: "1984", author: "George Orwell", image: "/images/1984.png" },
        { title: "To Kill a Mockingbird", author: "Harper Lee", image: "/images/mockingbird.png" }
    ];

    return (
        <div className="flex">
            <SidebarNav />
            <div className="flex-1 p-6 bg-yellow-50">
                <div className="pt-6">
                    <h2 className='display-6 mb-5'>Here are all your books; choose your book's availability for trade</h2>
                    <h1 className="text-2xl font-bold mb-4">My Books 📖</h1>
                    <div className="grid gap-8 mb-6 lg:mb-16 md:grid-cols-2">
                        {books.map((book, index) => (
                            <div key={index} className="relative items-center bg-gray-50 rounded-lg shadow sm:flex dark:bg-gray-800 dark:border-gray-700">
                                <a href="/singlebook">
                                    <img className="w-full rounded-lg sm:rounded-none sm:rounded-l-lg" src='images/bookimage.jpg' alt={`${book.title} cover`} />
                                </a>
                                <div className="p-5 flex flex-col space-between">
                                    <div className='flex justify-between items-center'>
                                        <div>
                                            <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                <a href="/physicalbook">{book.title}</a>
                                            </h3>
                                            <span className="text-gray-500 dark:text-gray-400">by {book.author}</span>
                                        </div>  
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <select className="text-l me-4 rounded-lg px-4 py-2">
                                            <option value="available">Available</option>
                                            <option value="unavailable">Unavailable</option>
                                        </select>
                                        <a href="/physicalbook" className="bg-blue-500 text-white px-4 py-2 rounded-lg">View Book</a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inventory;