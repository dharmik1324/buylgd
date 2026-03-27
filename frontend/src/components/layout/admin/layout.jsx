import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Sidebar } from "../../admin/sidebar";
import { Header } from "../../admin/header";

export const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    return (
        <div className={isDarkMode ? "bg-gray-950 text-white flex min-h-screen relative" : "bg-white text-black flex min-h-screen relative"}>
            {/* sidebar overlays on mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <Sidebar setSidebarOpen={setSidebarOpen} />
            </div>

            {/* main area */}
            <div className="flex-1 min-w-0 flex flex-col">
                <Header onToggleSidebar={toggleSidebar} />
                <main className="flex-1 w-full max-w-full overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;

