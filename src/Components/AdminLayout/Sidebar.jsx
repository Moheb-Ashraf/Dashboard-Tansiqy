import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Sidebar({ isOpen, setIsOpen }) {
    const navigate = useNavigate();
    const location = useLocation(); 

    function handleLogout() {
        Swal.fire({
            title: "هل أنت متأكد؟",
            text: "سيتم تسجيل خروجك من لوحة التحكم",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "نعم، خروج",
            cancelButtonText: "إلغاء"
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("adminToken");
                navigate("/login");
            }
        });
    }

    const menuItems = [
        { name: "الإحصائيات", path: "/admin/stats", icon: "fa-chart-pie" },
        { name: "إدارة الجامعات", path: "/admin/universities", icon: "fa-university" },
        { name: "إضافة جامعة", path: "/admin/add-university", icon: "fa-plus-circle" },
        { name: "إضافة كلية", path: "/admin/add-college", icon: "fa-graduation-cap" },
        { name: "الأخبار", path: "/admin/news", icon: "fa-newspaper" },
    ];

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            <aside className={`
                fixed lg:sticky top-0 right-0 h-screen bg-slate-900 text-white p-6 flex flex-col shadow-2xl z-50 transition-transform duration-300
                ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"} 
                w-72
            `}>
                
                {/* Branding & Close Button */}
                <div className="flex items-center justify-between mb-10 px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
                            <i className="fa-solid fa-gauge-high"></i>
                        </div>
                        <span className="text-xl font-black tracking-tight">تنسيقي <span className="text-blue-500">PRO</span></span>
                    </div>
                    
                    <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <i className="fa-solid fa-xmark text-2xl"></i>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all cursor-pointer duration-300 group ${
                                location.pathname === item.path 
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                                : "hover:bg-slate-800 text-slate-400 hover:text-white"
                            }`}
                        >
                            <i className={`fa-solid ${item.icon} text-lg ${location.pathname === item.path ? "text-white" : "group-hover:text-blue-400"}`}></i>
                            <span className="font-bold">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="pt-6 border-t border-slate-800">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-3.5 w-full rounded-2xl cursor-pointer text-red-400 hover:bg-red-500/10 transition-all font-bold"
                    >
                        <i className="fa-solid fa-right-from-bracket"></i>
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;