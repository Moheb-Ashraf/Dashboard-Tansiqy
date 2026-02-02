import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import AdminLoading from "../../Components/AdminLoading";

export default function ManageUniversities() {
    const [universities, setUniversities] = useState([]);
    const [filteredUniversities, setFilteredUniversities] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); 
    const [selectedType, setSelectedType] = useState("all"); 
    
    const token = localStorage.getItem("adminToken");

    // filter data 
    const uniTypes = [
        { id: 1, name: "حكومية" }, { id: 2, name: "خاصة" }, { id: 3, name: "أهلية" },
        { id: 4, name: "معهد عالي" }, { id: 5, name: "أجنبية" }, { id: 6, name: "تكنولوجية" }
    ];

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
            setFilteredUniversities(allData); 
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let results = universities;

        // filter by type 
        if (selectedType !== "all") {
            results = results.filter(uni => uni.type === parseInt(selectedType));
        }

        // search
        if (searchTerm) {
            results = results.filter(uni => 
                uni.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                uni.nameEn?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUniversities(results);
    }, [searchTerm, selectedType, universities]);

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
        <div className=" space-y-6" dir="rtl">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">إدارة الجامعات</h1>
                    <p className="text-slate-500 italic">إجمالي الجامعات: {universities.length} | النتائج الحالية: {filteredUniversities.length}</p>
                </div>
                <button onClick={fetchUniversities} className="bg-blue-600 text-white p-3 px-6 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer font-bold">
                    <i className="fa-solid fa-arrows-rotate"></i> تحديث البيانات
                </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-4xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:flex-1">
                    <i className="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                        type="text" 
                        placeholder="ابحث باسم الجامعة عربي أو إنجليزي..." 
                        className="w-full bg-slate-50 border-none rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="w-full md:w-48 bg-slate-50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-500 hover:text-white cursor-pointer"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                >
                    <option value="all">كل الأنواع</option>
                    {uniTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUniversities.map((uni) => (
                    <div key={uni.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <i className="fa-solid fa-university"></i>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] font-bold uppercase bg-slate-100 px-3 py-1 rounded-full text-slate-500 tracking-widest">ID: {uni.id}</span>
                                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">
                                        {uniTypes.find(t => t.id === uni.type)?.name || "جامعة"}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-slate-800 mb-1 line-clamp-1">{uni.nameAr}</h3>
                            <p className="text-slate-400 text-xs font-sans mb-4">{uni.nameEn}</p>

                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-slate-600 gap-2">
                                    <i className="fa-solid fa-location-dot text-red-400 w-4 text-center"></i>
                                    <span className="truncate">{uni.location || "غير محدد"}</span>
                                </div>
                                <div className="flex items-center text-sm text-slate-600 gap-2">
                                    <i className="fa-solid fa-graduation-cap text-blue-400 w-4 text-center"></i>
                                    <span>تنسيق: <span className="font-bold">{uni.lastYearCoordination}%</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-50 flex gap-3">
                            <Link 
                                to={`/admin/edit-university/${uni.id}`}
                                className="flex-1 bg-amber-50 text-amber-600 py-3 rounded-2xl font-bold text-center hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <i className="fa-solid fa-pen-to-square"></i> تعديل
                            </Link>
                            <button 
                                onClick={() => deleteUniversity(uni.id)}
                                className="flex-1 bg-red-50 text-red-600 py-3 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <i className="fa-solid fa-trash-can"></i> حذف
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredUniversities.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                    <i className="fa-solid fa-box-open text-5xl text-slate-200 mb-4"></i>
                    <p className="text-slate-400 font-bold">لا توجد جامعات تطابق معايير البحث.</p>
                </div>
            )}
        </div>
    );
}