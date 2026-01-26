import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AdminLoading from "../../Components/AdminLoading";


function AddCollege() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [universities, setUniversities] = useState([]); 
    const [fetchingUnis, setFetchingUnis] = useState(true);
    const location = useLocation();



    // data 
    const [formData, setFormData] = useState({
        nameAr: "",
        nameEn: "",
        universityId: "",
        officialWebsite: "",
        location: "",
        description: "",
        fees: 0,
        lastYearCoordination: 0,
        feesCategoryA: 0,
        feesCategoryB: 0,
        feesCategoryC: 0,
        feesPerHour: 0,
        minimumHoursPerSemester: 0,
        additionalFees: 0,
        departments: [] 
    });

    // get universities
    async function fetchUniversities() {
        try {
            const types = [1, 2, 3, 4, 5, 6];
            const requests = types.map(t => axios.get(`/api/proxy?path=api/Universities/type/${t}`).catch(() => ({ data: [] })));
            const responses = await Promise.all(requests);
            setUniversities(responses.flatMap(res => res.data));
        } finally { setFetchingUnis(false); }
    }

    useEffect(() => { fetchUniversities(); }, []);
    useEffect(() => {
    if (location.state?.universityId) {
        setFormData(prev => ({ ...prev, universityId: location.state.universityId }));
    }
}, [location.state]);

    const addDepartment = () => {
        setFormData({
            ...formData,
            departments: [...formData.departments, { nameAr: "", nameEn: "", description: "", studyType: 1 }]
        });
    };

    const removeDepartment = (index) => {
        const updatedDepts = formData.departments.filter((_, i) => i !== index);
        setFormData({ ...formData, departments: updatedDepts });
    };

    const handleDeptChange = (index, field, value) => {
        const updatedDepts = [...formData.departments];
        updatedDepts[index][field] = field === "studyType" ? parseInt(value) : value;
        setFormData({ ...formData, departments: updatedDepts });
    };

    async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.universityId) return Swal.fire("تنبيه", "يرجى اختيار الجامعة أولاً", "warning");

    setLoading(true);
    const token = localStorage.getItem("adminToken");

    // fix url 
    let formattedWebsite = formData.officialWebsite.trim();
    if (formattedWebsite && !formattedWebsite.startsWith('http')) {
        formattedWebsite = `https://${formattedWebsite}`;
    }

    const dataToSend = {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn,
        universityId: parseInt(formData.universityId),
        officialWebsite: formattedWebsite,
        location: formData.location || "",
        description: formData.description || "",
        fees: parseFloat(formData.fees) || 0,
        lastYearCoordination: parseFloat(formData.lastYearCoordination) || 0,
        feesCategoryA: parseFloat(formData.feesCategoryA) || 0,
        feesCategoryB: parseFloat(formData.feesCategoryB) || 0,
        feesCategoryC: parseFloat(formData.feesCategoryC) || 0,
        feesPerHour: parseFloat(formData.feesPerHour) || 0,
        minimumHoursPerSemester: parseInt(formData.minimumHoursPerSemester) || 0,
        additionalFees: parseFloat(formData.additionalFees) || 0,

        departments: formData.departments.map(dept => ({
            nameAr: dept.nameAr,
            nameEn: dept.nameEn || "",
            description: dept.description || "",
            studyType: parseInt(dept.studyType) || 1,
            collegeId: 0 
        }))
    };

    try {

        await axios.post("/api/proxy?path=api/Universities/colleges", dataToSend, {
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            }
        });

        Swal.fire("نجاح!", "تمت إضافة الكلية والأقسام بنجاح", "success");
        navigate("/admin/universities");
    } catch (error) {
        console.error("تفاصيل خطأ السيرفر:", error.response?.data);
        
        const serverErrors = error.response?.data?.errors;
        let detailedMsg = "";
        
        if (serverErrors) {
            detailedMsg = Object.values(serverErrors).flat().join(" | ");
        } else {
            detailedMsg = error.response?.data?.title || "تأكد من البيانات المدخلة";
        }

        Swal.fire({
            icon: "error",
            title: "فشل الإرسال (خطأ 400)",
            text: detailedMsg,
        });
    } finally {
        setLoading(false);
    }
}

    if (fetchingUnis) return <AdminLoading />;

    return (
        <div className="max-w-5xl mx-auto p-4 animate-fade-in mb-10" dir="rtl">
            <h1 className="text-3xl font-black text-slate-800 mb-8 border-r-4 border-blue-600 pr-4">إضافة كلية جديدة</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/*  main information */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold mb-6 text-blue-600 flex items-center gap-2">
                        <i className="fa-solid fa-circle-info"></i> البيانات الأساسية
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">الجامعة التابعة لها</label>
                            <select required
                            value={formData.universityId}
                            className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}>
                                <option value="">اختر الجامعة...</option>
                                {universities.map(u => <option key={u.id} value={u.id}>{u.nameAr}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 font-sans italic text-slate-400 uppercase tracking-widest text-[10px]">تنسيق العام الماضي %</label>
                            <input type="number" step="0.1" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-sans focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => setFormData({ ...formData, lastYearCoordination: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">اسم الكلية (عربي)</label>
                            <input required type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">اسم الكلية (إنجليزي)</label>
                            <input required type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* location and description */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold mb-6 text-slate-700 flex items-center gap-2">
                        <i className="fa-solid fa-map-location-dot"></i> الموقع والوصف
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">الموقع التفصيلي</label>
                            <input type="text" placeholder="مثال: الحرم الجامعي الرئيسي" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-slate-400"
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">الموقع الرسمي للكلية</label>
                            <input type="text" placeholder="example.com" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-sans focus:ring-2 focus:ring-slate-400"
                                onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold mb-2">وصف الكلية</label>
                            <textarea className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-slate-400 min-h-25"
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                        </div>
                    </div>
                </div>

                {/* fees section */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold mb-6 text-emerald-600 flex items-center gap-2">
                        <i className="fa-solid fa-money-bill-wave"></i> تفاصيل المصروفات
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="md:col-span-2 lg:col-span-1">
                            <label className="block text-sm font-bold mb-2 mr-1 text-emerald-700">المصروفات السنوية</label>
                            <input type="number" placeholder="0" className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                                onChange={(e) => setFormData({ ...formData, fees: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black mb-2 uppercase tracking-widest text-slate-400">فئة (أ)</label>
                            <input type="number" placeholder="0" className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                                onChange={(e) => setFormData({ ...formData, feesCategoryA: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black mb-2 uppercase tracking-widest text-slate-400">فئة (ب)</label>
                            <input type="number" placeholder="0" className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                                onChange={(e) => setFormData({ ...formData, feesCategoryB: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black mb-2 uppercase tracking-widest text-slate-400">فئة (ج)</label>
                            <input type="number" placeholder="0" className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                                onChange={(e) => setFormData({ ...formData, feesCategoryC: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2 mr-1">سعر الساعة</label>
                            <input type="number" placeholder="0" className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                                onChange={(e) => setFormData({ ...formData, feesPerHour: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2 mr-1">أدنى ساعات للترم</label>
                            <input type="number" placeholder="12" className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                                onChange={(e) => setFormData({ ...formData, minimumHoursPerSemester: e.target.value })} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold mb-2 mr-1">رسوم إضافية (إدارية)</label>
                            <input type="number" placeholder="0" className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                                onChange={(e) => setFormData({ ...formData, additionalFees: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* departments  */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                            <i className="fa-solid fa-layer-group"></i> الأقسام التابعة للكلية
                        </h2>
                        <button type="button" onClick={addDepartment} className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-xl font-bold cursor-pointer hover:bg-emerald-600 hover:text-white transition-all text-sm shadow-sm">
                            + إضافة قسم جديد
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.departments.map((dept, index) => (
                            <div key={index} className="p-6 bg-slate-50 rounded-3xl relative border border-slate-100">
                                <button type="button" onClick={() => removeDepartment(index)} className="absolute top-4 left-4 text-red-400 hover:text-red-600 transition-colors">
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input placeholder="اسم القسم (عربي)" className="p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
                                        onChange={(e) => handleDeptChange(index, "nameAr", e.target.value)} />
                                    <select className="p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        onChange={(e) => handleDeptChange(index, "studyType", e.target.value)}>
                                        <option value="1">علمي رياضة</option>
                                        <option value="2">علمي علوم</option>
                                        <option value="3">أدبي</option>
                                    </select>
                                    <input placeholder="وصف القسم" className="p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
                                        onChange={(e) => handleDeptChange(index, "description", e.target.value)} />
                                </div>
                            </div>
                        ))}
                        {formData.departments.length === 0 && <p className="text-center text-slate-400 italic py-4">لم يتم إضافة أقسام بعد</p>}
                    </div>
                </div>

                {/*  save button  */}
                <button disabled={loading} type="submit" className="w-full py-5 bg-slate-900 text-white font-black text-xl rounded-3xl cursor-pointer hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50">
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                    ) : "حفظ الكلية في النظام"}
                </button>
            </form>
        </div>
    );
}

export default AddCollege;