import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import AdminLoading from "../../Components/AdminLoading";

function ManageNews() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("adminToken");

    // Fetch all news
    async function fetchNews() {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/proxy?path=api/News");
            setNews(data);
        } catch (error) {
            console.error("Fetch News Error", error);
        } finally {
            setLoading(false);
        }
    }

    // Delete news function based on API: DELETE /api/News/{id}
    async function deleteNews(id) {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This news will be permanently deleted!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                // Send DELETE request via proxy
                await axios.delete(`/api/proxy?path=api/News/${id}`, {
                    headers: { 
                        'Authorization': `Bearer ${token}` 
                    }
                });

                // Update UI locally
                setNews(news.filter(n => n.id !== id));
                
                Swal.fire('Deleted!', 'The news has been removed.', 'success');
            } catch (error) {
                console.error("Delete Error:", error.response);
                Swal.fire('Error', 'Failed to delete news. Check permissions.', 'error');
            }
        }
    }

    useEffect(() => {
        fetchNews();
    }, []);

    if (loading) return <AdminLoading />;

    return (
        <div className="animate-fade-in p-4" dir="rtl">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">إدارة الأخبار</h1>
                    <p className="text-slate-500 text-sm italic">You have {news.length} news published</p>
                </div>
                <Link to="/admin/add-news" className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100">
                    + إضافة خبر جديد
                </Link>
            </div>

            {/* News Cards Grid */}
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

                        {/* Action Buttons */}
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

            {/* Empty State */}
            {news.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                    <i className="fa-solid fa-newspaper text-5xl text-slate-100 mb-4"></i>
                    <p className="text-slate-400 font-medium italic">No news found in the system</p>
                </div>
            )}
        </div>
    );
}

export default ManageNews;