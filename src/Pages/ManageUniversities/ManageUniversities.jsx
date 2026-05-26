import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { api, getErrorMessage } from "../../api/client";
import AdminLoading from "../../Components/AdminLoading";

export default function ManageUniversities() {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [types, setTypes] = useState([]);
    const [typesLoading, setTypesLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTypeId, setSelectedTypeId] = useState(null); // null => all

    async function fetchTypes() {
        try {
            setTypesLoading(true);
            const { data } = await api.get("api/Universities/types");

            // Backend returns only typeNameAr + totalUniversities (no id),
            // so we map ids by order returned from API to keep compatibility
            // with `api/Universities/type/{id}` which expects a numeric id.
            const mapped = (Array.isArray(data) ? data : []).map((t, i) => ({
                id: i + 1,
                typeNameAr: t.typeNameAr,
                totalUniversities: t.totalUniversities ?? 0,
            }));
            setTypes(mapped);
            return mapped;
        } catch (error) {
            console.error(error);
            return [];
        } finally {
            setTypesLoading(false);
        }
    }

    async function fetchUniversitiesByTypeIds(typeIds) {
        setLoading(true);

        try {
            const requests = typeIds.map((tId) =>
                api.get(`api/Universities/type/${tId}`).catch(() => ({ data: [] }))
            );
            const responses = await Promise.all(requests);
            const allData = responses.flatMap((res) => (Array.isArray(res.data) ? res.data : []));
            setUniversities(allData);
        } catch (error) {
            console.error(error);
            setUniversities([]);
        } finally {
            setLoading(false);
        }
    }

    function filteredUniversities() {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return universities;
        return universities.filter(
            (uni) =>
                (uni.nameAr || "").toLowerCase().includes(term) ||
                (uni.nameEn || "").toLowerCase().includes(term)
        );
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
                await api.delete(`api/Universities/${id}`);
                Swal.fire('تم!', 'تم الحذف بنجاح.', 'success');
                if (selectedTypeId === null) fetchUniversitiesByTypeIds(types.map((t) => t.id));
                else fetchUniversitiesByTypeIds([selectedTypeId]);
            } catch (error) {
                console.error(error);
                Swal.fire('خطأ', getErrorMessage(error, 'فشل الحذف، تأكد من الصلاحيات.'), 'error');
            }
        }
    }

    useEffect(() => {
        (async () => {
            const mapped = await fetchTypes();
            if (mapped.length > 0) {
                setSelectedTypeId(null);
                fetchUniversitiesByTypeIds(mapped.map((t) => t.id));
            } else {
                setUniversities([]);
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (typesLoading) return;
        if (selectedTypeId === null) return;
        setSearchTerm("");
        fetchUniversitiesByTypeIds([selectedTypeId]);
    }, [selectedTypeId, typesLoading]);

    const filteredList = filteredUniversities();
    const selectedType = selectedTypeId ? types.find((t) => t.id === selectedTypeId) : null;
    const totalTypeUniversities = selectedType ? selectedType.totalUniversities : null;

    return (
        <div className=" space-y-6" dir="rtl">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">إدارة الجامعات</h1>
                    <p className="text-slate-500 italic">
                        إجمالي الجامعات (حسب النوع): {types.reduce((s, t) => s + (t.totalUniversities || 0), 0)} | النتائج الحالية: {filteredList.length}
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (selectedTypeId === null) fetchUniversitiesByTypeIds(types.map((t) => t.id));
                        else fetchUniversitiesByTypeIds([selectedTypeId]);
                    }}
                    className="bg-blue-600 text-white p-3 px-6 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer font-bold"
                    disabled={loading || typesLoading}
                >
                    <i className="fa-solid fa-arrows-rotate"></i> تحديث البيانات
                </button>
            </div>

            {/* Types Section (منظم عبر API) */}
            <div className="bg-white p-4 rounded-4xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <div className="space-y-1">
                        <h2 className="text-lg font-bold text-slate-800">اختر نوع الجامعة</h2>
                        <p className="text-xs text-slate-500">
                            {selectedTypeId === null ? "عرض كل الأنواع" : `النوع الحالي: ${selectedType?.typeNameAr ?? ""}`}
                            {typeof totalTypeUniversities === "number" ? ` (عدد الجامعات: ${totalTypeUniversities})` : ""}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setSelectedTypeId(null)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${
                                selectedTypeId === null
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
                            }`}
                            disabled={typesLoading}
                        >
                            الكل
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {typesLoading ? (
                        Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="h-16 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse" />
                        ))
                    ) : (
                        types.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setSelectedTypeId(t.id)}
                                className={`text-right px-4 py-3 rounded-2xl border transition ${
                                    selectedTypeId === t.id
                                        ? "bg-blue-600 border-blue-600 text-white"
                                        : "bg-white border-slate-200 text-slate-700 hover:border-blue-400"
                                }`}
                                disabled={loading}
                            >
                                <div className="font-bold text-sm">{t.typeNameAr}</div>
                                <div className={`text-xs mt-1 font-semibold ${selectedTypeId === t.id ? "text-white/80" : "text-slate-500"}`}>
                                    إجمالي: {t.totalUniversities}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Search */}
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
            </div>

            {loading && <AdminLoading />}

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredList.map((uni) => (
                    <div key={uni.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <i className="fa-solid fa-university"></i>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] font-bold uppercase bg-slate-100 px-3 py-1 rounded-full text-slate-500 tracking-widest">ID: {uni.id}</span>
                                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">
                                        {types.find((t) => t.id === uni.type)?.typeNameAr || "جامعة"}
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
            {!loading && filteredList.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                    <i className="fa-solid fa-box-open text-5xl text-slate-200 mb-4"></i>
                    <p className="text-slate-400 font-bold">لا توجد جامعات تطابق معايير البحث.</p>
                </div>
            )}
        </div>
    );
}