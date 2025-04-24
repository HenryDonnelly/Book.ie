import { Navbar, Dropdown, Avatar } from "flowbite-react";
import { useAuth } from "../utils/useAuth";
import { useNavigate } from "react-router-dom";
import { HiChevronLeft } from "react-icons/hi";


const TopNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); 
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Navbar fluid className="px-6 bg-blue-200">

<button
  onClick={handleBack}
  className=" text-gray-600 text-4xl"
>
  <HiChevronLeft></HiChevronLeft>
</button>

      <Navbar.Brand href="/">
        <span className="text-xl font-semibold">📚 Bookie</span>
      </Navbar.Brand>


      <div className="flex items-center space-x-4">
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