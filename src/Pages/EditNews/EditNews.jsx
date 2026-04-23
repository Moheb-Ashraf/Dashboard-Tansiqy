import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AdminLoading from "../../Components/AdminLoading";

function EditNews() {
    const { id } = useParams(); // news id from url
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [newsData, setNewsData] = useState({
        id: parseInt(id),
        title: "",
        date: "",
        description: ""
    });

    const token = localStorage.getItem("adminToken");

    // fetch current news data
    useEffect(() => {
        async function fetchNewsDetail() {
            try {
                setFetching(true);
                const { data } = await axios.get("/api/proxy?path=api/News");
                const currentNews = data.find(n => n.id === parseInt(id));

                if (currentNews) {
                    setNewsData({
                        id: currentNews.id,
                        title: currentNews.title || "",
                        date: currentNews.date ? currentNews.date.split('T')[0] : "",
                        description: currentNews.description || ""
                    });
                }
            } catch (error) {
                console.error(error);
                Swal.fire("Error", "Failed to fetch news data", "error");
            } finally {
                setFetching(false);
            }
        }

        fetchNewsDetail();
    }, [id]);

    // handle patch request
    async function handleUpdate(e) {
        e.preventDefault();
        setLoading(true);

        const dataToPatch = {
            ...newsData,
            // convert back to ISO string for API
            date: new Date(newsData.date).toISOString()
        };

        try {
            // PATCH request to /api/News/{id}
            await axios.patch(`/api/proxy?path=api/News/${id}`, dataToPatch, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            Swal.fire({
                icon: 'success',
                title: 'تم التحديث',
                text: 'تم تعديل الخبر بنجاح',
                timer: 2000,
                showConfirmButton: false
            });
            setTimeout(() => navigate("/admin/news"), 2000);
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Failed to update news", "error");
        } finally {
            setLoading(false);
        }
    }

    if (fetching) return <AdminLoading />;

    return (
        <div className="max-w-4xl mx-auto p-4 animate-fade-in" dir="rtl">
            <div className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-black text-slate-800 border-r-4 border-purple-600 pr-4">تعديل الخبر</h1>
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-purple-600 transition-colors cursor-pointer">
                    <i className="fa-solid fa-arrow-left text-2xl"></i>
                </button>
            </div>

            <form onSubmit={handleUpdate} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                <div>
                    <label className="block text-sm font-bold mb-2">عنوان الخبر</label>
                    <input 
                        required 
                        type="text" 
                        value={newsData.title}
                        placeholder="عنوان الخبر..."
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        onChange={(e) => setNewsData({...newsData, title: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2">التاريخ</label>
                    <input 
                        required 
                        type="date" 
                        value={newsData.date}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 font-sans"
                        onChange={(e) => setNewsData({...newsData, date: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2">محتوى الخبر</label>
                    <textarea 
                        required 
                        value={newsData.description}
                        placeholder="تفاصيل الخبر..."
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 min-h-64"
                        onChange={(e) => setNewsData({...newsData, description: e.target.value})}
                    ></textarea>
                </div>

                <button disabled={loading} type="submit" className="cursor-pointer w-full py-5 bg-purple-600 text-white font-black text-xl rounded-3xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 disabled:opacity-50">
                    {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
            </form>
        </div>
    );
}

export default EditNews;