import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, Save, Trash2, Plus, Edit2, CheckCircle2, AlertCircle } from "lucide-react";
import { 
    fetchInventoryApis, 
    createInventoryApi, 
    updateInventoryApi, 
    deleteInventoryApi 
} from "../../store/inventoryApiSlice";

export const InventoryApiModal = ({ open, onClose }) => {
    const dispatch = useDispatch();
    const { apis, loading } = useSelector(state => state.inventoryApi);
    const isDarkMode = useSelector(state => state.theme?.isDarkMode ?? true);

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        url: "",
        method: "GET",
        body: "",
        headers: "",
        isActive: true
    });




    useEffect(() => {
        if (open) {
            dispatch(fetchInventoryApis());
        }
    }, [dispatch, open]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { fetchDiamonds } = await import("../../store/diamondSlice");
        
        if (editingId) {
            await dispatch(updateInventoryApi({ id: editingId, formData }));
        } else {
            await dispatch(createInventoryApi(formData));
        }
        
        // Refresh the diamonds list in the background
        dispatch(fetchDiamonds({ page: 1, limit: 12 }));
        
        resetForm();
    };

    const handleEdit = (api) => {
        setFormData({
            name: api.name || "",
            url: api.url,
            method: api.method,
            body: api.body || "",
            headers: api.headers || "",
            isActive: api.isActive
        });
        setEditingId(api._id);

        setIsAdding(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this API configuration?")) {
            dispatch(deleteInventoryApi(id));
        }
    };

    const resetForm = () => {
        setFormData({ name: "", url: "", method: "GET", body: "", headers: "", isActive: true });
        setIsAdding(false);
        setEditingId(null);
    };


    if (!open) return null;

    const modalBg = isDarkMode ? "bg-[#0F171F]" : "bg-white";
    const border = isDarkMode ? "border-slate-800" : "border-slate-200";
    const textMain = isDarkMode ? "text-white" : "text-slate-900";
    const inputBg = isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className={`relative w-full max-w-4xl rounded-[24px] border shadow-2xl overflow-hidden ${modalBg} ${border}`}
                >

                    <div className={`px-6 py-5 border-b flex justify-between items-center ${border}`}>
                        <div className="flex items-center gap-3">
                            <Globe size={20} className="text-blue-500" />
                            <h2 className={`text-lg font-normal ${textMain}`}>Inventory API Management</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors text-slate-500">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        {!isAdding ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Configured APIs</p>
                                    <button 
                                        onClick={() => setIsAdding(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs transition-all"
                                    >
                                        <Plus size={14} /> Add New API
                                    </button>
                                </div>

                                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                    {apis.length === 0 ? (
                                        <div className="text-center py-12 border border-dashed rounded-2xl border-slate-800">
                                            <Globe className="mx-auto mb-3 text-slate-700" size={32} />
                                            <p className="text-sm text-slate-500">No external APIs configured</p>
                                        </div>
                                    ) : (
                                        apis.map((api) => (
                                            <div key={api._id} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'} ${border} flex items-center justify-between group`}>
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${api.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                                        {api.isActive ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0 mr-4">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <p className={`text-sm font-medium truncate ${textMain}`}>{api.name || "Unnamed API"}</p>
                                                            <span className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full border ${api.method === 'POST' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                                                {api.method}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 truncate">{api.url}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <button 
                                                        onClick={() => handleEdit(api)}
                                                        className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-colors"
                                                        title="Edit API"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(api._id)}
                                                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                                                        title="Delete API"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Display Name</label>
                                        <input 
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g., Dharmatech API"
                                            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-blue-500 transition-all ${inputBg}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Endpoint URL</label>
                                        <input 
                                            type="url"
                                            name="url"
                                            value={formData.url}
                                            onChange={handleChange}
                                            required
                                            placeholder="https://api.example.com/diamonds"
                                            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-blue-500 transition-all ${inputBg}`}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">HTTP Method</label>
                                            <select 
                                                name="method"
                                                value={formData.method}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-blue-500 transition-all cursor-pointer ${inputBg}`}
                                            >
                                                <option value="GET">GET</option>
                                                <option value="POST">POST</option>
                                            </select>
                                        </div>
                                        <div className="flex items-end pb-3">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <div className="relative">
                                                    <input 
                                                        type="checkbox"
                                                        name="isActive"
                                                        checked={formData.isActive}
                                                        onChange={handleChange}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-10 h-5 rounded-full transition-colors ${formData.isActive ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
                                                    <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                                </div>
                                                <span className="text-xs text-slate-400">Enable this API</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Request Body (Authentication / JSON)</label>
                                        <textarea 
                                            name="body"
                                            value={formData.body}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder='{ "auth_key": "your_key", "action": "getData" }'
                                            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-blue-500 transition-all font-mono ${inputBg}`}
                                        />
                                        <p className="text-[10px] text-slate-500 mt-1 italic">Note: For GET requests, these will be sent as query parameters.</p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Request Headers (JSON)</label>
                                        <textarea 
                                            name="headers"
                                            value={formData.headers}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder='{ "Authorization": "Bearer token", "Content-Type": "application/json" }'
                                            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-blue-500 transition-all font-mono ${inputBg}`}
                                        />
                                    </div>
                                </div>



                                <div className="flex gap-3 pt-2">
                                    {editingId && (
                                        <button 
                                            type="button"
                                            onClick={() => handleDelete(editingId)}
                                            className="px-5 py-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    <button 
                                        type="button"
                                        onClick={resetForm}
                                        className={`flex-1 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${isDarkMode ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                                    >
                                        Cancel
                                    </button>

                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Save size={16} />
                                            {editingId ? "Update Configuration" : "Save Configuration"}
                                        </div>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className={`p-6 border-t ${border} bg-slate-900/10`}>
                        <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">
                            Syncing with these APIs will clear and rebuild your asset repository.
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
