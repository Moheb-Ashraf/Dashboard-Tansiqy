import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { api, getErrorMessage } from "../../api/client";
import AdminLoading from "../../Components/AdminLoading";

function EditUniversity() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [colleges, setColleges] = useState([]);
    const [universityTypes, setUniversityTypes] = useState([]);
    const [typesLoading, setTypesLoading] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [currentImageUrl, setCurrentImageUrl] = useState("");

    const [formData, setFormData] = useState({
        id: parseInt(id),
        nameAr: "",
        nameEn: "",
        type: 1,
        officialWebsite: "",
        location: "",
        governorate: 1,
        lastYearCoordination: 0,
        fees: 0,
        informationSources: "",
        description: ""
    });

    useEffect(() => {
        (async () => {
            try {
                setTypesLoading(true);
                const { data } = await api.get("api/Universities/types");
                const mapped = (Array.isArray(data) ? data : []).map((t, i) => ({
                    id: i + 1,
                    typeNameAr: t.typeNameAr,
                    totalUniversities: t.totalUniversities ?? 0,
                }));
                setUniversityTypes(mapped);
            } catch (error) {
                console.error(error);
                setUniversityTypes([]);
            } finally {
                setTypesLoading(false);
            }
        })();
    }, []);

    const fetchCurrentData = useCallback(async () => {
        try {
            setFetching(true);
            const { data } = await api.get(`api/Universities/${id}?_=${Date.now()}`);
            setFormData({
                id: data.id,
                nameAr: data.nameAr || "",
                nameEn: data.nameEn || "",
                type: data.type || 1,
                officialWebsite: data.officialWebsite || "",
                location: data.location || "",
                governorate: data.governorate || 1,
                lastYearCoordination: data.lastYearCoordination || 0,
                fees: data.fees || 0,
                informationSources: data.informationSources || "",
                description: data.description || ""
            });
            setColleges(data.colleges || []);
            setCurrentImageUrl(data.image || "");
            setImageFile(null);
            setRemoveImage(false);
        } catch (error) {
            console.error(error);
            Swal.fire("خطأ", "تعذر جلب بيانات الجامعة", "error");
        } finally {
            setFetching(false);
        }
    }, [id]);


    // delete collage 
    async function deleteCollege(collegeId) {
        const result = await Swal.fire({
            title: 'هل أنت متأكد من الحذف؟',
            text: "لن تتمكن من استرجاع بيانات هذه الكلية مرة أخرى!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'نعم، احذف الآن',
            cancelButtonText: 'تراجع'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`api/Universities/colleges/${collegeId}`);

                //  to update the front when update data 
                setColleges(colleges.filter(c => c.id !== collegeId));
                
                Swal.fire('تم الحذف!', 'تمت إزالة الكلية بنجاح من قاعدة البيانات.', 'success');
            } catch (error) {
                console.error("Delete Error:", error.response?.data);
                Swal.fire('فشل الحذف', getErrorMessage(error, "حدث خطأ أثناء الحذف، ربما الكلية غير موجودة"), 'error');
            }
        }
    }

    useEffect(() => {
        fetchCurrentData();
    }, [fetchCurrentData]);

    async function handleUpdate(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const uniId = parseInt(id, 10);
            let formattedWebsite = (formData.officialWebsite || "").trim();
            if (formattedWebsite && !formattedWebsite.startsWith("http")) {
                formattedWebsite = `https://${formattedWebsite}`;
            }

            // Swagger: PUT /api/Universities/{id} + multipart/form-data (PascalCase)
            const payload = new FormData();
            payload.append("Id", String(uniId));
            payload.append("NameAr", formData.nameAr || "");
            payload.append("NameEn", formData.nameEn || "");
            payload.append("Type", String(parseInt(formData.type, 10)));
            payload.append("OfficialWebsite", formattedWebsite);
            payload.append("Location", formData.location || "");
            payload.append("Governorate", String(parseInt(formData.governorate, 10)));
            payload.append("LastYearCoordination", String(parseFloat(formData.lastYearCoordination) || 0));
            payload.append("Fees", String(parseFloat(formData.fees) || 0));
            payload.append("InformationSources", formData.informationSources || "");
            payload.append("Description", formData.description || "");

            if (imageFile) {
                payload.append("ImageFile", imageFile);
            }
            if (removeImage) {
                payload.append("RemoveImage", "true");
            }

            const response = await api.put(`api/Universities/${uniId}`, payload);

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'تم التحديث!',
                    text: 'تم تعديل بيانات الجامعة بنجاح',
                    timer: 2000,
                    showConfirmButton: false
                });
                await fetchCurrentData();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'فشل التحديث',
                text: getErrorMessage(error, "حدث خطأ أثناء الحفظ"),
            });
        } finally {
            setLoading(false);
        }
    }

    if (fetching) return <AdminLoading />;

    return <>
        <div className="max-w-4xl mx-auto p-4 animate-fade-in" dir="rtl">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">تعديل بيانات الجامعة</h1>
                    <p className="text-slate-500 mt-1 italic font-sans">معرف الجامعة (ID): {id}</p>
                </div>
                <button onClick={() => navigate(-1)} className="bg-white p-3 cursor-pointer rounded-2xl shadow-sm text-slate-500 hover:text-blue-600 transition">
                    <i className="fa-solid fa-arrow-left"></i> رجوع
                </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-8">
                
                {/* Basic Information Form */}
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">اسم الجامعة (عربي)</label>
                            <input 
                                required type="text" value={formData.nameAr}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">اسم الجامعة (إنجليزي)</label>
                            <input 
                                required type="text" value={formData.nameEn}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
                                onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">نوع الجامعة</label>
                            <select 
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: parseInt(e.target.value)})}
                                disabled={typesLoading}
                            >
                                {universityTypes.length > 0 ? (
                                    universityTypes.map((t) => (
                                        <option key={t.id} value={t.id}>{t.typeNameAr}</option>
                                    ))
                                ) : (
                                    <>
                                        <option value="1">حكومية</option>
                                        <option value="2">خاصة</option>
                                        <option value="3">أهلية</option>
                                        <option value="4">معهد عالي</option>
                                        <option value="5">أجنبية</option>
                                        <option value="6">تكنولوجية</option>
                                        <option value="7">ذات طبيعة خاصة</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">التنسيق %</label>
                            <input 
                                type="number" step="0.1" value={formData.lastYearCoordination}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                                onChange={(e) => setFormData({...formData, lastYearCoordination: parseFloat(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">المصاريف</label>
                            <input 
                                type="number" value={formData.fees}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                                onChange={(e) => setFormData({...formData, fees: parseFloat(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">الموقع الرسمي</label>
                            <input 
                                type="text" value={formData.officialWebsite}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                                onChange={(e) => setFormData({...formData, officialWebsite: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">الموقع الجغرافي</label>
                            <input 
                                type="text" value={formData.location}
                                placeholder="مثال: مدينة نصر"
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* collages*/}
                <div className="mt-12">
                    <div className="flex justify-between items-center mb-6 px-2">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                            <i className="fa-solid fa-graduation-cap text-blue-600"></i>
                            الكليات التابعة لهذه الجامعة
                        </h2>
                        
                        {/* add new collage */}
                        <Link 
                            to={`/admin/add-college`} 
                            state={{ universityId: id }} 
                            className="bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-2xl font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2 shadow-sm border border-emerald-100"
                        >
                            <i className="fa-solid fa-plus-circle"></i>
                            إضافة كلية جديدة
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {colleges.map((college) => (
                            <div key={college.id} className="bg-white p-5 rounded-4xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-blue-200 transition-all">
                                <div>
                                    <h4 className="font-bold text-slate-700">{college.nameAr}</h4>
                                    <p className="text-xs text-slate-400 font-sans">ID: {college.id}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link 
                                        to={`/admin/edit-college/${id}/${college.id}`}
                                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                    >
                                        تعديل الكلية
                                    </Link>
                                    {/* delete collage */}
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); deleteCollege(college.id) }}
                                        className="bg-red-50 text-red-500 px-4 py-2 cursor-pointer rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center gap-1"
                                    >
                                        <i className="fa-solid fa-trash-can text-[10px]"></i> حذف
                                    </button>
                                </div>
                            </div>
                        ))}
                        {colleges.length === 0 && (
                            <div className="col-span-full bg-slate-50 p-10 rounded-4xl text-center border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 italic">لا توجد كليات مضافة لهذه الجامعة بعد.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description Textarea */}
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-4">وصف الجامعة</label>
                        <textarea 
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 min-h-48"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">صورة الجامعة</label>
                        {currentImageUrl && !removeImage && (
                            <img
                                src={currentImageUrl}
                                alt="صورة الجامعة الحالية"
                                className="w-28 h-28 object-cover rounded-2xl border border-slate-200 mb-3"
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            onChange={(e) => {
                                setImageFile(e.target.files?.[0] || null);
                                if (e.target.files?.[0]) setRemoveImage(false);
                            }}
                        />
                        {currentImageUrl && (
                            <label className="mt-3 flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={removeImage}
                                    onChange={(e) => {
                                        setRemoveImage(e.target.checked);
                                        if (e.target.checked) setImageFile(null);
                                    }}
                                />
                                حذف الصورة الحالية
                            </label>
                        )}
                    </div>
                </div>

                {/* Save Button */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-5 bg-slate-900 text-white font-black text-xl rounded-3xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                    ) : "تحديث بيانات الجامعة الآن"}
                </button>
            </form>
        </div>
    </>
}

export default EditUniversity;