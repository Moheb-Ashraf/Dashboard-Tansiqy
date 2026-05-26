import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import AdminLoading from "../../Components/AdminLoading";

function ManageNews() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchNews() {
        try {
            setLoading(true);
            const { data } = await api.get("api/News");
            setNews(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Fetch News Error", error);
            Swal.fire("خطأ", getErrorMessage(error, "تعذر تحميل الأخبار"), "error");
        } finally {
            setLoading(false);
        }
    }

    async function deleteNews(id) {
        const result = await Swal.fire({
            title: 'هل أنت متأكد؟',
            text: "سيتم حذف هذا الخبر نهائياً!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`api/News/${id}`);
                setNews((prev) => prev.filter(n => n.id !== id));
                Swal.fire('تم!', 'تم حذف الخبر بنجاح.', 'success');
            } catch (error) {
                console.error("Delete Error:", error.response);
                Swal.fire('خطأ', getErrorMessage(error, 'فشل حذف الخبر، تأكد من الصلاحيات.'), 'error');
            }
        }
    }

    useEffect(() => {
        fetchNews();
    }, []);

    if (loading) return <AdminLoading />;

    return (
        <div className="animate-fade-in p-4" dir="rtl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">إدارة الأخبار</h1>
                    <p className="text-slate-500 text-sm italic">عدد الأخبار المنشورة: {news.length}</p>
                </div>
                <Link to="/admin/add-news" className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100">
                    + إضافة خبر جديد
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all group">
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase font-sans">
                                    {new Date(item.date).toLocaleDateString('ar-EG')}
                                </span>
                                <span className="text-[10px] text-slate-300 font-sans uppercase tracking-widest">ID: {item.id}</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">{item.title}</h3>
                            <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed mb-4">{item.description}</p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                            <Link to={`/admin/edit-news/${item.id}`} className="text-amber-500 hover:text-amber-600 font-bold flex items-center gap-2">
                                <i className="fa-solid fa-pen-to-square"></i> تعديل
                            </Link>

                            <button 
                                onClick={() => deleteNews(item.id)} 
                                className="text-red-400 hover:text-red-600 font-bold flex items-center gap-2 transition-colors cursor-pointer"
                            >
                                <i className="fa-solid fa-trash-can"></i> حذف الخبر
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {news.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                    <i className="fa-solid fa-newspaper text-5xl text-slate-100 mb-4"></i>
                    <p className="text-slate-400 font-medium italic">لا توجد أخبار في النظام</p>
                </div>
            )}
        </div>
    );
}

export default ManageNews;
