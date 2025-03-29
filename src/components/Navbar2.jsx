import { Navbar, Dropdown, Avatar } from "flowbite-react";
import { useAuth } from "../utils/useAuth"; // Ensure the path is correct
import { useNavigate } from "react-router-dom";

const TopNavbar = () => {
  const { user, logout } = useAuth(); // Get `user` and `logout` function
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clear token and user state
    navigate("/login"); // Redirect to login page
  };

  const handleLogin = () => {
    navigate("/login"); // Redirect to login page
  };

  return (
    <Navbar fluid className="px-6 bg-blue-200">
      <Navbar.Brand href="/">
        <span className="text-xl font-semibold">📚 Bookie</span>
      </Navbar.Brand>

      <div className="flex items-center space-x-4">
        {/* Profile Dropdown or Sign In/Out Button */}
        {user ? (
          <Dropdown label={<Avatar alt="User Avatar" rounded />} inline>
            <Dropdown.Header>
              <span className="block text-sm font-medium">{user.name}</span>
            </Dropdown.Header>
            <Dropdown.Item href="/profile">Profile</Dropdown.Item>
            <Dropdown.Item href="/settings">Settings</Dropdown.Item>
            <Dropdown.Item onClick={handleLogout} className="text-red-500">
              Sign Out
            </Dropdown.Item>
          </Dropdown>
        ) : (
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Sign In
          </button>
        )}
      </div>
    </Navbar>
  );
};

export default TopNavbar;