import axios from "axios";
import { useEffect, useState } from "react";
import AdminLoading from "../../Components/AdminLoading";

function AdminStats() {
    const [stats, setStats] = useState({
        universitiesCount: 0,
        collegesCount: 0,
        newsCount: 0,
        contactsCount: 0,
    });
    const [loading, setLoading] = useState(true);

    async function fetchCounts() {
        try {
            setLoading(true);


            // get universities
            const types = [1, 2, 3, 4, 5, 6];
            
            const requests = types.map(t => 
                axios.get(`/api/proxy?path=api/Universities/type/${t}`).catch(() => ({ data: [] }))
            );

            const responses = await Promise.all(requests);
            const allUniversities = responses.flatMap(res => res.data);
            const totalColleges = allUniversities.reduce((sum, uni) => sum + (uni.collegesCount || 0), 0);
            let totalNews = 0;
            try {
                const resNews = await axios.get("/api/proxy?path=api/News").catch(() => ({ data: [] }));
                totalNews = Array.isArray(resNews.data) ? resNews.data.length : 0;
            } 
            catch (e) { console.log("News API not available"); }

            setStats({
                universitiesCount: allUniversities.length,
                collegesCount: totalColleges,
                newsCount: totalNews,
                contactsCount: 0, 
            });

        } 
        catch (error) {
            console.error("Error fetching stats:", error);
        } 
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCounts();
    }, []);

    if (loading) return <AdminLoading />;

    const cards = [
        { title: "إجمالي الجامعات", value: stats.universitiesCount, icon: "fa-university", color: "from-blue-600 to-blue-400" },
        { title: "إجمالي الكليات", value: stats.collegesCount, icon: "fa-graduation-cap", color: "from-emerald-600 to-emerald-400" },
        { title: "أخبار منشورة", value: stats.newsCount, icon: "fa-newspaper", color: "from-purple-600 to-purple-400" },
        { title: "طلبات التواصل", value: stats.contactsCount, icon: "fa-envelope-open-text", color: "from-amber-600 to-amber-400" },
    ];

    return (
        <div className="space-y-8 animate-fade-in" dir="rtl">
            <div>
                <h1 className="text-3xl font-black text-slate-800">لوحة الإحصائيات</h1>
                <p className="text-slate-500 mt-1">الأرقام الحقيقية المسجلة في قاعدة البيانات</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <div key={index} className="bg-white rounded-4xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
                        <div className="space-y-1">
                            <p className="text-slate-400 text-sm font-bold">{card.title}</p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{card.value}</h3>
                        </div>
                        <div className={`w-14 h-14 bg-linear-to-br ${card.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                            <i className={`fa-solid ${card.icon} text-xl`}></i>
                        </div>
                    </div>
                ))}
            </div>

            {/*   notes */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-4">مرحباً بك مجدداً في نظام تنسيقي</h2>
                    <p className="text-slate-400 max-w-2xl leading-relaxed">
                        يمكنك من خلال لوحة التحكم إضافة الجامعات الجديدة، تعديل بيانات الكليات، وإدارة الأقسام الدراسية. جميع التعديلات تظهر فوراً للطلاب في الموقع الرسمي.
                    </p>
                </div>
                <i className="fa-solid fa-shield-check absolute -bottom-10 -left-10 text-[15rem] text-white/5 rotate-12"></i>
            </div>
        </div>
    );
}

export default AdminStats;