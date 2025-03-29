// filepath: /C:/Users/Kaho/Desktop/bookie-app/src/components/Navbar.jsx
import { Link } from "react-router-dom";
import '../css/Home.css'; // Ensure this path is correct

const Navbar = (props) => {
  return (
    <>
      <div className="bg-cardColour pb-5 w-full">
        <Link to="/" className="text-textColour">Home</Link> |
        <Link to="/about" className="text-textColour">About</Link> |
      </div>
    </>
  );
}

export default Navbar;