import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // verify token
    const token = localStorage.getItem("adminToken");

    if (!token) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="flex bg-slate-50 min-h-screen font-sans" dir="rtl">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex justify-between items-center px-4 md:px-8">
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                            <i className="fa-solid fa-bars-staggered text-lg"></i>
                        </button>
                        
                        <h2 className="text-slate-400 font-medium hidden md:block">لوحة الإدارة</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-left md:text-right hidden sm:block">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">المسؤول</p>
                            <p className="text-sm font-bold text-slate-800 italic">مدير النظام</p>
                        </div>
                        <span className="bg-blue-600 shadow-lg shadow-blue-200 text-white p-2 rounded-xl w-10 h-10 flex items-center justify-center">
                            <i className="fa-solid fa-user-tie"></i>
                        </span>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;