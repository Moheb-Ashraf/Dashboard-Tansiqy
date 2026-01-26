
function AdminLoading() {
    return <>
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-md">
            
            <div className="relative flex items-center justify-center">
                <div className="h-24 w-24 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 shadow-sm"></div>
                
                <div className="absolute h-16 w-16 animate-[spin_2s_linear_infinite_reverse] rounded-full border-4 border-transparent border-t-emerald-500"></div>
                    <div className="absolute flex h-10 w-10 animate-pulse items-center justify-center rounded-xl bg-white shadow-lg">
                        <i className="fa-solid fa-gauge-high text-blue-600 text-lg"></i>
                    </div>
            </div>

            <div className="mt-8 text-center space-y-2">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">تنسيقي <span className="text-blue-600 text-sm italic">Admin</span></h2>
                
                <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-full origin-left animate-[pulse_1.5s_ease-in-out_infinite] bg-blue-600"></div>
                </div>
                
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">جاري جلب البيانات...</p>
            </div>
        </div>
    </>
}

export default AdminLoading;