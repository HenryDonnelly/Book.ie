import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './utils/useAuth';
// import Layout from './pages/Layout';
import TopNavbar from './components/Navbar2';
import TradeRequests from './pages/Trade/tradeRequest';
import SingleBook from './pages/Books/SingleBook';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Books/Inventory';
import Wishlist from './pages/Wishlist';
import Index from './pages/Books/index';
import PhysicalBook from './pages/Books/PhysicalBook';
import Chat from './pages/chatroom/Chat';
import FriendsList from './pages/Friendslist';
import Forum from './pages/Forums/Forum';
import SinglePost from './pages/Forums/Singlepost';
import CreatePost from './pages/Forums/Create';
import CreateBook from './pages/Books/Create';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import BookUserCreate from './pages/Books/BookUserCreate';
function App() {

  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthenticated(true);
    }
  }, []);

  return (
      <Router>
            <AuthProvider>

        <ConditionalNavbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/traderequest" element={<TradeRequests />} />
          <Route path="/books/:id" element={<SingleBook />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/index" element={<Index />} />
          <Route path="/physicalBook" element={<PhysicalBook />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/friends" element={<FriendsList />} />
          <Route path="/forums" element={<Forum />} />
          <Route path="/singlePost/:id" element={<SinglePost />} />
          <Route path="/createpost" element={<CreatePost />} />
          <Route path="/create" element={<CreateBook />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/book_user_create" element={<BookUserCreate />} />

          {/* Add more routes as needed */}
        </Routes>
        </AuthProvider>

      </Router>
  );
}

function ConditionalNavbar() {
  const location = useLocation();
  const hideNavbarRoutes = ['/'];

  return !hideNavbarRoutes.includes(location.pathname) ? <TopNavbar /> : null;
}

export default App;