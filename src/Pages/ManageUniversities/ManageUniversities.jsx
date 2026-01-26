import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import AdminLoading from "../../Components/AdminLoading";

export default function ManageUniversities() {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("adminToken");

    async function fetchUniversities() {
        try {
            setLoading(true);
            const types = [1, 2, 3, 4, 5, 6];
            const requests = types.map(t => 
                axios.get(`/api/proxy?path=api/Universities/type/${t}`).catch(() => ({ data: [] }))
            );
            const responses = await Promise.all(requests);
            const allData = responses.flatMap(res => res.data);
            setUniversities(allData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function deleteUniversity(id) {
        const result = await Swal.fire({
            title: 'هل أنت متأكد؟',
            text: "سيتم حذف هذه الجامعة نهائياً!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/proxy?path=api/Universities/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('تم!', 'تم الحذف بنجاح.', 'success');
                fetchUniversities();
            } catch (error) {
                Swal.fire('خطأ', 'فشل الحذف، تأكد من الصلاحيات.', 'error');
            }
        }
    }

    useEffect(() => { fetchUniversities(); }, []);

    if (loading) return <AdminLoading />;

    return (
        <div className="animate-fade-in" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">إدارة الجامعات</h1>
                    <p className="text-slate-500 italic">إجمالي الجامعات المسجلة: {universities.length}</p>
                </div>
                <button onClick={fetchUniversities} className="bg-white p-3 rounded-2xl shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                    <i className="fa-solid fa-arrows-rotate ml-2"></i> تحديث القائمة
                </button>
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {universities.map((uni) => (
                    <div key={uni.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        
                        <div>
                            {/* Header: Name & Type */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <i className="fa-solid fa-university"></i>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full text-slate-500">
                                    ID: {uni.id}
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-slate-800 mb-1 line-clamp-1">{uni.nameAr}</h3>
                            <p className="text-slate-400 text-xs font-sans mb-4">{uni.nameEn}</p>

                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-slate-600 gap-2">
                                    <i className="fa-solid fa-location-dot text-red-400 w-4"></i>
                                    <span>{uni.location || "غير محدد"}</span>
                                </div>
                                <div className="flex items-center text-sm text-slate-600 gap-2">
                                    <i className="fa-solid fa-graduation-cap text-blue-400 w-4"></i>
                                    <span>تنسيق: <span className="font-bold">{uni.lastYearCoordination}%</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Actions Buttons */}
                        <div className="mt-6 pt-6 border-t border-slate-50 flex gap-3">
                            <Link 
                                to={`/admin/edit-university/${uni.id}`}
                                className="flex-1 bg-amber-50 text-amber-600 py-3 rounded-2xl font-bold text-center hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <i className="fa-solid fa-pen-to-square"></i>
                                تعديل
                            </Link>
                            <button 
                                onClick={() => deleteUniversity(uni.id)}
                                className="flex-1 bg-red-50 text-red-600 py-3 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <i className="fa-solid fa-trash-can"></i>
                                حذف
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}