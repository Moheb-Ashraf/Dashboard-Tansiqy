import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await axios.post("/api/proxy?path=api/Auth/login", {
                email: email,
                password: password, 
                
            });

            if (data.token || data.jwtToken) {
                localStorage.setItem("adminToken", data.token || data.jwtToken);
                
                Swal.fire({
                    icon: "success",
                    title: "تم التحقق بنجاح",
                    text: "مرحباً بك في لوحة الإدارة",
                    timer: 1500,
                    showConfirmButton: false,
                });

                navigate("/admin/stats");
            }

        } catch (error) {
            console.error("Login Error:", error);
            Swal.fire({
                icon: "error",
                title: "فشل تسجيل الدخول",
                text: error.response?.data?.message || "تأكد من صحة البريد الإلكتروني وكلمة المرور",
            });
        } finally {
            setLoading(false);
        }
    }

    return <>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6" dir="rtl">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border border-gray-100">
                
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200">
                        <i className="fa-solid fa-shield-halved text-3xl text-white"></i>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800">تنسيقي <span className="text-blue-600">Admin</span></h1>
                    <p className="text-slate-400 mt-2 font-medium italic">بوابة إدارة النظام</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                    
                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 mr-1">البريد الإلكتروني</label>
                        <div className="relative">
                            <i className="fa-solid fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pr-12 pl-4 focus:border-blue-500 focus:bg-white outline-none transition-all font-sans text-slate-700"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 mr-1">كلمة المرور</label>
                        <div className="relative">
                            <i className="fa-solid fa-key absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pr-12 pl-4 focus:border-blue-500 focus:bg-white outline-none transition-all font-sans text-slate-700"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>دخول للمسؤولين</span>
                                <i className="fa-solid fa-right-to-bracket text-sm"></i>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                    <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">
                        &copy; {new Date().getFullYear()} Tansiky Dashboard System
                    </p> 
                    <span className="text-xs font-bold text-slate-400">😂😂 Created By Eng Moheb & Eng Mena 😜😜</span>
                </div>
            </div>
        </div>
    </>
}

export default Login;