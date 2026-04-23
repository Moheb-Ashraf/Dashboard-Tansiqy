import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function AddNews() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // data structure based on swagger
    const [newsData, setNewsData] = useState({
        title: "",
        date: new Date().toISOString().split('T')[0], // default to today
        description: ""
    });

    const token = localStorage.getItem("adminToken");

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const dataToSend = {
            ...newsData,
            // convert date to ISO format required by API
            date: new Date(newsData.date).toISOString() 
        };

        try {
            await axios.post("/api/proxy?path=api/News", dataToSend, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            Swal.fire("نجاح", "تم نشر الخبر بنجاح", "success");
            navigate("/admin/news");
        } catch (error) {
            console.error(error);
            Swal.fire("خطأ", "فشل في نشر الخبر، تأكد من الصلاحيات", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-4 animate-fade-in" dir="rtl">
            <div className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-black text-slate-800 mb-8 border-r-4 border-purple-600 pr-4">إضافة خبر جديد</h1>

            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-purple-600 transition-colors cursor-pointer">
                    <i className="fa-solid fa-arrow-left text-2xl"></i>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                <div>
                    <label className="block text-sm font-bold mb-2">عنوان الخبر</label>
                    <input 
                        required 
                        type="text" 
                        placeholder="أدخل عنواناً جذاباً للخبر..."
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        onChange={(e) => setNewsData({...newsData, title: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2">تاريخ النشر</label>
                    <input 
                        required 
                        type="date" 
                        value={newsData.date}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 font-sans"
                        onChange={(e) => setNewsData({...newsData, date: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2">تفاصيل الخبر</label>
                    <textarea 
                        required 
                        placeholder="اكتب محتوى الخبر بالتفصيل هنا..."
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 min-h-[12rem]"
                        onChange={(e) => setNewsData({...newsData, description: e.target.value})}
                    ></textarea>
                </div>

                <button disabled={loading} type="submit" className="w-full py-5 bg-slate-900 text-white font-black text-xl rounded-3xl hover:bg-purple-600 transition-all shadow-xl disabled:opacity-50">
                    {loading ? "جاري النشر..." : "نشر الخبر الآن"}
                </button>
            </form>
        </div>
    );
}

export default AddNews;