import { Sidebar } from "flowbite-react";
import { HiHome, HiBookOpen, HiRefresh, HiChat, HiArchive, HiUsers, HiChatAlt2, HiHeart } from "react-icons/hi";
import { useLocation } from "react-router-dom";
import FilterSidebar from "./FilterSidebar";

const SidebarNav = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen">
      <Sidebar aria-label="Book Trading Sidebar" className="bg-yellow-100 flex flex-col w-64 h-full overflow-hidden">
        <Sidebar.Items className="flex-shrink-0">
          <Sidebar.ItemGroup>
            <Sidebar.Item href="/" icon={HiHome}>Dashboard</Sidebar.Item>
            <Sidebar.Item href="/index" icon={HiBookOpen}>Library</Sidebar.Item>
            <Sidebar.Item href="/inventory" icon={HiArchive}>My Books</Sidebar.Item>
            <Sidebar.Item href="/traderequest" icon={HiRefresh}>Trade Requests</Sidebar.Item>
            <Sidebar.Item href="/chats" icon={HiChat}>Messages</Sidebar.Item>
            <Sidebar.Item href="/forums" icon={HiChatAlt2}>Forums</Sidebar.Item>
            <Sidebar.Item href="/friends" icon={HiUsers}>Friends</Sidebar.Item>
            <Sidebar.Item href="/wishlist" icon={HiHeart}>Wishlist</Sidebar.Item>

          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    </div>
  );
};

export default SidebarNav;
