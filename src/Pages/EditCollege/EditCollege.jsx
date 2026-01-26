import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import AdminLoading from "../../Components/AdminLoading";

function EditCollege() {
    const { uniId, id } = useParams(); 
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [universities, setUniversities] = useState([]);
    const [departments, setDepartments] = useState([]); 

    const [isEditingDept, setIsEditingDept] = useState(false);

    // data new department
    const [deptFormData, setDeptFormData] = useState({
        id: 0,
        nameAr: "",
        nameEn: "",
        collegeId: parseInt(id),
        description: "",
        studyType: 1
    });

    const [formData, setFormData] = useState({
        id: parseInt(id),
        nameAr: "",
        nameEn: "",
        universityId: parseInt(uniId),
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
        additionalFees: 0
    });

    const token = localStorage.getItem("adminToken");

    // get data
    async function fetchData() {
        try {
            setFetching(true);
            const types = [1, 2, 3, 4, 5, 6];
            const requests = types.map(t => axios.get(`/api/proxy?path=api/Universities/type/${t}`).catch(() => ({ data: [] })));
            const responses = await Promise.all(requests);
            setUniversities(responses.flatMap(res => res.data));

            const { data: colleges } = await axios.get(`/api/proxy?path=api/Universities/${uniId}/colleges`);
            const currentCollege = colleges.find(c => c.id === parseInt(id));

            if (currentCollege) {
                setFormData({ ...currentCollege });
                setDepartments(currentCollege.departments || []);
            }
        } catch (error) {
            Swal.fire("خطأ", "تعذر جلب بيانات الكلية", "error");
        } finally {
            setFetching(false);
        }
    }

    useEffect(() => { fetchData(); }, [id, uniId]);

    // delete department
    async function handleDeleteDepartment(deptId) {
        const result = await Swal.fire({
            title: 'هل أنت متأكد؟',
            text: "سيتم حذف هذا القسم نهائياً من الكلية!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem("adminToken");
                await axios.delete(`/api/proxy?path=api/Universities/departments/${deptId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                setDepartments(departments.filter(d => d.id !== deptId));
                Swal.fire('تم!', 'تم حذف القسم بنجاح.', 'success');
            } catch (error) {
                Swal.fire('خطأ', 'فشل حذف القسم، ربما انتهت صلاحية الجلسة', 'error');
            }
        }
    }

    // handle department submit (Add or Update Dept)
    async function handleDeptSubmit(e) {
        e.preventDefault();
        if (!deptFormData.nameAr) return;
        try {
            if (isEditingDept) {
                await axios.patch(`/api/proxy?path=api/Universities/departments/${deptFormData.id}`, deptFormData, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                Swal.fire("تم!", "تم تحديث بيانات القسم", "success");
            } else {
                const { data } = await axios.post("/api/proxy?path=api/Universities/departments", deptFormData, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                setDepartments([...departments, data]);
                Swal.fire("نجاح", "تم إضافة القسم الجديد", "success");
            }
            setDeptFormData({ id: 0, nameAr: "", nameEn: "", collegeId: parseInt(id), description: "", studyType: 1 });
            setIsEditingDept(false);
            if(isEditingDept) fetchData();
        } catch (error) { Swal.fire("خطأ", "حدثت مشكلة في القسم", "error"); }
    }

    const prepareEditDept = (dept) => {
        setDeptFormData({ ...dept, collegeId: parseInt(id) });
        setIsEditingDept(true);
        document.getElementById('dept-section-form').scrollIntoView({ behavior: 'smooth' });
    };

    // update collage using PATCH 
    async function handleUpdate(e) {
        e.preventDefault();
        setLoading(true);

        let web = formData.officialWebsite?.trim() || "";
        if (web && !web.startsWith('http')) web = `https://${web}`;

        const dataToSend = {
            ...formData,
            officialWebsite: web,
            fees: parseFloat(formData.fees) || 0,
            lastYearCoordination: parseFloat(formData.lastYearCoordination) || 0,
            feesCategoryA: parseFloat(formData.feesCategoryA) || 0,
            feesCategoryB: parseFloat(formData.feesCategoryB) || 0,
            feesCategoryC: parseFloat(formData.feesCategoryC) || 0,
            feesPerHour: parseFloat(formData.feesPerHour) || 0,
            minimumHoursPerSemester: parseInt(formData.minimumHoursPerSemester) || 0,
            additionalFees: parseFloat(formData.additionalFees) || 0,
        };

        try {
            await axios.patch(`/api/proxy?path=api/Universities/colleges/${id}`, 
                dataToSend, {
                    headers: { 
                        'Authorization': `Bearer ${token}`, 
                        'Content-Type': 'application/json' 
                    }
            });

            Swal.fire({ 
                icon: 'success', 
                title: 'تم التحديث!', 
                text: 'تم تعديل بيانات الكلية بنجاح (PATCH)', 
                timer: 2000, 
                showConfirmButton: false 
            });

            setTimeout(() => navigate("/admin/universities"), 2000);
        } 
        catch (error) { 
            console.error(error);
            Swal.fire("خطأ", "فشل التحديث، تأكد من البيانات أو الصلاحيات", "error"); 
        } 
        finally { setLoading(false); }
    }

    if (fetching) return <AdminLoading />;

    return (
        <div className="max-w-5xl mx-auto p-4 animate-fade-in mb-10" dir="rtl">
            <div className="flex justify-between items-center mb-8 border-r-4 border-amber-500 pr-4">
                <h1 className="text-3xl font-black text-slate-800">إدارة بيانات الكلية</h1>
                <button onClick={() => navigate(-1)} className="bg-white p-3 rounded-2xl shadow-sm text-slate-400 hover:text-blue-600 transition">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-8">
                {/* main information */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                    <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2"><i className="fa-solid fa-circle-info"></i> المعلومات الأساسية</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none" value={formData.universityId} onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}>
                            {universities.map(u => <option key={u.id} value={u.id}>{u.nameAr}</option>)}
                        </select>
                        <input type="number" step="0.1" value={formData.lastYearCoordination} className="p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setFormData({ ...formData, lastYearCoordination: e.target.value })} />
                        <input type="text" value={formData.nameAr} className="p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} />
                        <input type="text" value={formData.nameEn} className="p-4 bg-slate-50 rounded-2xl outline-none font-sans" onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} />
                    </div>
                </div>

                {/* website & description */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                    <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2"><i className="fa-solid fa-map-location-dot"></i> الموقع والوصف</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input type="text" value={formData.location} className="p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                        <input type="text" value={formData.officialWebsite} className="p-4 bg-slate-50 rounded-2xl outline-none font-sans" onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })} />
                        <textarea value={formData.description} className="md:col-span-2 p-4 bg-slate-50 rounded-2xl outline-none min-h-25" onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                    </div>
                </div>

                {/* fees */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                    <h2 className="text-xl font-bold text-emerald-600 flex items-center gap-2"><i className="fa-solid fa-money-bill-wave"></i> تفاصيل المصروفات</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
                        <input type="number" value={formData.fees} className="p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setFormData({ ...formData, fees: e.target.value })} />
                        <input type="number" value={formData.feesCategoryA} className="p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setFormData({ ...formData, feesCategoryA: e.target.value })} />
                        <input type="number" value={formData.feesCategoryB} className="p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setFormData({ ...formData, feesCategoryB: e.target.value })} />
                        <input type="number" value={formData.feesCategoryC} className="p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setFormData({ ...formData, feesCategoryC: e.target.value })} />
                    </div>
                </div>

                {/* departments */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10" id="dept-section-form">
                    {/* form add & edit */}
                    <div className="lg:col-span-1">
                        <div className={`bg-white p-6 rounded-4xl shadow-sm border-2 sticky top-24 transition-all ${isEditingDept ? "border-amber-400 bg-amber-50/20" : "border-slate-100"}`}>
                            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                                <i className={`fa-solid ${isEditingDept ? "fa-pen-to-square text-amber-500" : "fa-plus-circle text-emerald-500"}`}></i>
                                {isEditingDept ? "تعديل القسم" : "إضافة قسم جديد"}
                            </h3>
                            <div className="space-y-4">
                                <input  placeholder="اسم القسم" value={deptFormData.nameAr} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none" onChange={(e) => setDeptFormData({...deptFormData, nameAr: e.target.value})} />
                                <select className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none" value={deptFormData.studyType} onChange={(e) => setDeptFormData({...deptFormData, studyType: parseInt(e.target.value)})}>
                                    <option value="1">علمي رياضة</option>
                                    <option value="2">علمي علوم</option>
                                    <option value="3">أدبي</option>
                                </select>
                                <div className="flex gap-2">
                                    <button type="button" onClick={handleDeptSubmit} className={`flex-1 py-3 text-white font-bold rounded-xl transition-all ${isEditingDept ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                                        {isEditingDept ? "حفظ" : "إضافة"}
                                    </button>
                                    {isEditingDept && <button type="button" onClick={() => setIsEditingDept(false)} className="px-4 py-3 bg-slate-200 text-slate-600 rounded-xl font-bold">إلغاء</button>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* departments list */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="font-black text-slate-800 flex items-center gap-2 px-2">
                            <i className="fa-solid fa-list-ul text-blue-600"></i> الأقسام الحالية ({departments.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {departments.map((dept) => (
                                <div key={dept.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm hover:border-blue-200 transition-all">
                                    <div>
                                        <p className="font-bold text-slate-700">{dept.nameAr}</p>
                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                            {dept.studyType === 1 ? "رياضة" : dept.studyType === 2 ? "علوم" : "أدبي"}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button type="button" onClick={() => prepareEditDept(dept)} className="w-8 h-8 text-amber-500 bg-amber-50 rounded-lg hover:bg-amber-500 hover:text-white transition-all"><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                                        <button type="button" onClick={() => handleDeleteDepartment(dept.id)} className="w-8 h-8 text-red-400 bg-red-50 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                            <i className="fa-solid fa-trash-can text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button disabled={loading} type="submit" className="w-full py-5 bg-slate-900 text-white font-black text-xl rounded-3xl cursor-pointer hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50 mt-12">
                    {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div> : "حفظ بيانات الكلية النهائية"}
                </button>
            </form>
        </div>
    );
}

export default EditCollege;