import { Sidebar } from "flowbite-react";
import { HiHome, HiBookOpen, HiRefresh, HiChat, HiArchive, HiUsers, HiChatAlt2 } from "react-icons/hi";
import { useLocation } from "react-router-dom";
import FilterSidebar from "./FilterSidebar";

const SidebarNav = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen">
      <Sidebar aria-label="Book Trading Sidebar" className="bg-yellow-100 flex flex-col w-64 h-full overflow-hidden">
        {/* Sidebar Menu */}
        <Sidebar.Items className="flex-shrink-0">
          <Sidebar.ItemGroup>
            <Sidebar.Item href="/" icon={HiHome}>Dashboard</Sidebar.Item>
            <Sidebar.Item href="/index" icon={HiBookOpen}>Library</Sidebar.Item>
            <Sidebar.Item href="/inventory" icon={HiArchive}>My Books</Sidebar.Item>
            <Sidebar.Item href="/traderequest" icon={HiRefresh}>Trade Requests</Sidebar.Item>
            <Sidebar.Item href="/chat" icon={HiChat}>Messages</Sidebar.Item>
            <Sidebar.Item href="/forums" icon={HiChatAlt2}>Forums</Sidebar.Item>
            <Sidebar.Item href="/friends" icon={HiUsers}>Friends</Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>

        {/* Show filters only on the Index page */}
        {location.pathname === "/index" && (
          <div className="flex-grow overflow-auto">
            <FilterSidebar />
          </div>
        )}
      </Sidebar>
    </div>
  );
};

export default SidebarNav;
