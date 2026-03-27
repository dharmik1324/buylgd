import { Outlet } from "react-router-dom";
import { Header } from "../../diamond/header";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { updateHoldRealtime, releaseHoldRealtime } from "../../../store/diamondSlice";
import { socket } from "../../../socket";

export const AppLayout = () => {
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const dispatch = useDispatch();

    useEffect(() => {
        socket.on("hold-updated", (diamond) => {
            dispatch(updateHoldRealtime(diamond));
        });

        socket.on("hold-released", (id) => {
            dispatch(releaseHoldRealtime(id));
        });

        return () => {
            socket.off("hold-updated");
            socket.off("hold-released");
        };
    }, [dispatch]);

    return (
        <div className={isDarkMode ? "bg-gray-950 text-white" : "bg-white text-black"}>
            <Header />
            <main className="min-h-screen">
                <Outlet />
            </main>
            {/* <Footer /> */}
        </div>
    );
};

export default AppLayout;

