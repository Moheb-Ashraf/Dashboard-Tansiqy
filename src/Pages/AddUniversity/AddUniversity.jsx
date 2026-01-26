import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function AddUniversity() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nameAr: "",
        nameEn: "",
        type: 1, 
        officialWebsite: "",
        location: "",
        governorate: 1,
        lastYearCoordination: 0,
        fees: 0,
        informationSources: "",
        description: "",
        branches: [] 
    });

    const universityTypes = [
        { id: 1, name: "حكومية" }, { id: 2, name: "خاصة" }, { id: 3, name: "أهلية" },
        { id: 4, name: "معهد عالي" }, { id: 5, name: "أجنبية" }, { id: 6, name: "تكنولوجية" }
    ];

    const governorates = [
        { id: 1, name: "القاهرة" }, { id: 2, name: "الجيزة" }, { id: 3, name: "الإسكندرية" },
        { id: 19, name: "أسيوط" }, { id: 15, name: "الشرقية" }, { id: 20, name: "سوهاج" }
    ];

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem("adminToken");

        try {
            const response = await axios.post("/api/proxy?path=api/Universities", formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201 || response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'تمت الإضافة!',
                    text: 'تم إنشاء الجامعة الجديدة بنجاح في قاعدة البيانات',
                    confirmButtonText: 'حسناً'
                });
                navigate("/admin/universities"); 
            }
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.status === 401 
                ? "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى" 
                : "فشل في إضافة الجامعة، تأكد من إدخال جميع الحقول بشكل صحيح";
            
            Swal.fire({
                icon: 'error',
                title: 'خطأ في الإرسال',
                text: errorMsg,
            });
        } finally {
            setLoading(false);
        }
    }

    return <>
        <div className="max-w-4xl mx-auto p-4 animate-fade-in" dir="rtl">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800">إضافة جامعة جديدة</h1>
                <p className="text-slate-500 mt-1 italic">قم بتعبئة التفاصيل لإدراج الجامعة في النظام</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
                
                {/*information*/}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 mr-1">اسم الجامعة (عربي)</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="مثال: جامعة القاهرة"
                            onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 mr-1">اسم الجامعة (إنجليزي)</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
                            placeholder="Example: Cairo University"
                            onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 mr-1">نوع الجامعة</label>
                        <select 
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setFormData({...formData, type: parseInt(e.target.value)})}
                        >
                            {universityTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 mr-1">المحافظة</label>
                        <select 
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setFormData({...formData, governorate: parseInt(e.target.value)})}
                        >
                            {governorates.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 mr-1">تنسيق العام الماضي %</label>
                        <input 
                            type="number" 
                            step="0.1"
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                            placeholder="85.5"
                            onChange={(e) => setFormData({...formData, lastYearCoordination: parseFloat(e.target.value)})}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 mr-1">المصاريف السنوية (ج.م)</label>
                        <input 
                            type="number" 
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                            placeholder="50000"
                            onChange={(e) => setFormData({...formData, fees: parseFloat(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 mr-1">الموقع الرسمي</label>
                        <input 
                            type="text" 
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                            placeholder="www.university.edu.eg"
                            onChange={(e) => setFormData({...formData, officialWebsite: e.target.value})}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2 mr-1">وصف الجامعة</label>
                    <textarea 
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 min-h-37.5"
                        placeholder="اكتب نبذة مختصرة عن تاريخ الجامعة ومميزاتها..."
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                </div>

                {/* زر الإرسال */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-5 bg-slate-900 text-white font-black text-xl rounded-3xl hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <i className="fa-solid fa-plus-circle"></i>
                            إدراج الجامعة في النظام
                        </>
                    )}
                </button>
            </form>
        </div>
    </>
}

export default AddUniversity;