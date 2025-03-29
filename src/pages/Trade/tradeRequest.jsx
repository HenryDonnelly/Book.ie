import React from 'react';
import SidebarNav from "../../components/SideBar";
import { FaUser, FaExchangeAlt } from 'react-icons/fa';

const TradeRequests = () => {
    const requests = [
        {
            user: "Alexa",
            books: [
                { title: "The Great Gatsby", image: "/images/gatsby.png" },
                { title: "To Kill a Mockingbird", image: "/images/mockingbird.png" }
            ],
            status: "Pending",
            offer: [
                { title: "The Great Gatsby", image: "/images/gatsby.png" },
                { title: "To Kill a Mockingbird", image: "/images/mockingbird.png" }
            ],
            receive: [
                { title: "1984", image: "/images/1984.png" },
                { title: "Brave New World", image: "/images/bravenewworld.png" }
            ]
        },
        {
            user: "Bob",
            books: [
                { title: "1984", image: "/images/1984.png" }
            ],
            status: "Accepted",
            offer: [
                { title: "1984", image: "/images/1984.png" }
            ],
            receive: [
                { title: "To Kill a Mockingbird", image: "/images/mockingbird.png" }
            ]
        }
    ];

    return (
        <div className="flex">
            <SidebarNav />
            <div className="flex-1 p-6 bg-yellow-50">
                <h1 className="text-2xl font-bold mb-4">Trade Requests 🔄</h1>
                <ul className="space-y-6">
                    {requests.map((req, index) => (
                        <li key={index} className="p-6 bg-white rounded-lg shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <FaUser className="text-gray-500 mr-2" />
                                    <p className="text-lg"><strong>{req.user}</strong> wants to trade:</p>
                                </div>
                                <span className={`text-sm px-2 py-1 rounded ${req.status === "Pending" ? "bg-yellow-500" : "bg-green-500"} text-white`}>
                                    {req.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="w-1/3 p-4 bg-gray-100 rounded-lg relative">
                                    <h3 className="text-center font-bold mb-2">You Offer</h3>
                                    <div className="flex flex-wrap justify-center">
                                        {req.offer.map((book, idx) => (
                                            <div key={idx} className="m-2">
                                                <img src='images/bookimage.jpg' alt="Offer" className="w-24 h-32 object-cover rounded-lg mb-1" />
                                               <p className="text-xs text-center">{book.title}</p>
                                            </div>
                                        ))}
                                    </div> 
                                </div>
                                <div className="flex flex-col items-center mx-4">
                                    <FaExchangeAlt className="text-3xl text-gray-500 mb-5" />
                                    <div className="flex space-x-2">
                                        <button className="bg-green-500 font-bold text-white px-4 py-2 rounded-lg">Accept</button>
                                        <button className="bg-blue-500 font-bold text-white px-4 py-2 rounded-lg">Change Offer</button>
                                        <button className="bg-red-500 font-bold text-white px-4 py-2 rounded-lg">Decline</button>
                                    </div>
                                </div>
                                <div className="w-1/3 p-4 bg-gray-100 rounded-lg relative">
                                    <h3 className="text-center font-bold mb-2">You Receive</h3>
                                    <div className="flex flex-wrap justify-center">
                                        {req.receive.map((book, idx) => (
                                            <div key={idx} className="m-2">
                                                <img src='images/bookimage.jpg' alt="Receive" className="w-24 h-32 object-cover rounded-lg mb-1" />
                                                <p className="text-xs text-center">{book.title}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TradeRequests;