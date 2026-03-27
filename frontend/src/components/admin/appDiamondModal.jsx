import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addDiamond, updateDiamond } from "../../store/diamondSlice";
import { X, Save, PlusCircle, LayoutGrid, Info, Tag, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const AddDiamondModal = ({ open, onClose, editData }) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme?.isDarkMode ?? true);
  const { loading } = useSelector(state => state.diamonds);

  const [formData, setFormData] = useState({
    Shape: "",
    Weight: "",
    Color: "",
    Clarity: "",
    Cut: "",
    Polish: "",
    Symmetry: "",
    Lab: "",
    Price_Per_Carat: "",
    Final_Price: "",
    Stock_ID: "",
    Stock_No: "",
    Diamond_Image: "",
    Availability: "Available",
    Certificate_No: ""
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        Shape: editData.Shape || "",
        Weight: editData.Weight || "",
        Color: editData.Color || "",
        Clarity: editData.Clarity || "",
        Cut: editData.Cut || "",
        Polish: editData.Polish || "",
        Symmetry: editData.Symmetry || "",
        Lab: editData.Lab || "",
        Price_Per_Carat: editData.Price_Per_Carat || "",
        Final_Price: editData.Final_Price || "",
        Stock_ID: editData.Stock_ID || "",
        Stock_No: editData.Stock_No || "",
        Diamond_Image: editData.Diamond_Image || "",
        Availability: editData.Availability || "Available",
        Certificate_No: editData.Certificate_No || ""
      });
    } else {
      setFormData({
        Shape: "", Weight: "", Color: "", Clarity: "", Cut: "",
        Polish: "", Symmetry: "", Lab: "", Price_Per_Carat: "",
        Final_Price: "", Stock_ID: "", Stock_No: "", Diamond_Image: "",
        Availability: "Available", Certificate_No: ""
      });
    }
  }, [editData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-calculate Final Price if Weight and Price per carat are available
      if (name === "Weight" || name === "Price_Per_Carat") {
        const w = name === "Weight" ? Number(value) : Number(prev.Weight);
        const p = name === "Price_Per_Carat" ? Number(value) : Number(prev.Price_Per_Carat);
        if (w && p) {
          newData.Final_Price = (w * p).toFixed(2);
        }
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await dispatch(updateDiamond({ id: editData._id, formData })).unwrap();
      } else {
        await dispatch(addDiamond(formData)).unwrap();
      }
      onClose();
    } catch (err) {
      console.error("Failed to save diamond:", err);
    }
  };

  if (!open) return null;

  const modalBg = isDarkMode ? "bg-[#111922] border-slate-800" : "bg-white border-slate-200";
  const headerBg = isDarkMode ? "bg-[#161F29]" : "bg-slate-50";
  const inputBg = isDarkMode ? "bg-[#0B1219] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900";
  const labelText = isDarkMode ? "text-slate-500" : "text-slate-400";

  const sections = [
    {
      title: "Basic Identity",
      icon: <LayoutGrid size={16} />,
      fields: [
        { label: "Stock ID", name: "Stock_ID", placeholder: "e.g. D12345" },
        { label: "Reference No", name: "Stock_No", placeholder: "e.g. BLG-123" },
        { label: "Lab", name: "Lab", placeholder: "e.g. GIA, IGI" },
        { label: "Certificate #", name: "Certificate_No", placeholder: "e.g. 546251..." },
      ]
    },
    {
      title: "Physical Specs",
      icon: <Info size={16} />,
      fields: [
        { label: "Shape", name: "Shape", type: "select", options: ["Round", "Pear", "Emerald", "Princess", "Oval", "Heart", "Marquise", "Radiant", "Cushion"] },
        { label: "Weight (ct)", name: "Weight", type: "number", step: "0.01" },
        { label: "Color", name: "Color", type: "select", options: ["D", "E", "F", "G", "H", "I", "J", "K", "Fancy"] },
        { label: "Clarity", name: "Clarity", type: "select", options: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"] },
      ]
    },
    {
      title: "Cut & Polish",
      icon: <PlusCircle size={16} />,
      fields: [
        { label: "Cut", name: "Cut", type: "select", options: ["Excellent", "Very Good", "Good", "Fair"] },
        { label: "Polish", name: "Polish", type: "select", options: ["Excellent", "Very Good", "Good", "Fair"] },
        { label: "Symmetry", name: "Symmetry", type: "select", options: ["Excellent", "Very Good", "Good", "Fair"] },
        { label: "Status", name: "Availability", type: "select", options: ["Available", "Reserved", "Sold"] },
      ]
    },
    {
      title: "Valuation",
      icon: <Tag size={16} />,
      fields: [
        { label: "Price / Carat ($)", name: "Price_Per_Carat", type: "number" },
        { label: "Final Price ($)", name: "Final_Price", type: "number" },
      ]
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border overflow-hidden flex flex-col ${modalBg}`}
        >
          {/* Header */}
          <header className={`px-10 py-8 flex justify-between items-center shrink-0 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'} ${headerBg}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                {editData ? <Save size={24} /> : <PlusCircle size={24} />}
              </div>
              <div>
                <h1 className={`text-2xl font-normal ${isDarkMode ? 'text-white' : 'text-slate-900'} tracking-tight uppercase`}>
                  {editData ? "Modify Asset" : "Add New Asset"}
                </h1>
                <p className="text-[10px] text-slate-500 font-normal uppercase tracking-widest mt-0.5">Inventory Management System</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-3 rounded-2xl ${isDarkMode ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-300'} transition-all`}
            >
              <X size={20} />
            </button>
          </header>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
              {sections.map((section, sidx) => (
                <div key={sidx} className="space-y-6">
                  <div className={`flex items-center gap-2 pb-4 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                    <div className="text-blue-500">{section.icon}</div>
                    <h3 className="text-[10px] font-normal uppercase tracking-[0.2em] text-slate-500">{section.title}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {section.fields.map((field, fidx) => (
                      <div key={fidx} className="space-y-2">
                        <label className={`text-[9px] font-normal uppercase tracking-[0.1em] ml-1 ${labelText}`}>
                          {field.label}
                        </label>
                        {field.type === "select" ? (
                          <select
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            required
                            className={`w-full px-5 py-3 rounded-xl border text-xs font-normal outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none ${inputBg}`}
                          >
                            <option value="">Select</option>
                            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input
                            type={field.type || "text"}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            step={field.step}
                            required={field.name !== "Stock_No" && field.name !== "Certificate_No"}
                            className={`w-full px-5 py-3 rounded-xl border text-xs font-normal focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${inputBg}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Media Section */}
              <div className="md:col-span-2 space-y-6">
                <div className={`flex items-center gap-2 pb-4 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                  <ImageIcon size={16} className="text-blue-500" />
                  <h3 className="text-[10px] font-normal uppercase tracking-[0.2em] text-slate-500">Media Assets</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={`text-[9px] font-normal uppercase tracking-[0.1em] ml-1 ${labelText}`}>Diamond Image URL</label>
                    <input
                      type="text"
                      name="Diamond_Image"
                      value={formData.Diamond_Image}
                      onChange={handleChange}
                      placeholder="Paste image URL here..."
                      className={`w-full px-5 py-4 rounded-2xl border text-xs font-normal focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${inputBg}`}
                    />
                  </div>
                  {formData.Diamond_Image && (
                    <div className={`w-full h-48 rounded-2xl border ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-slate-200 bg-slate-50'} flex items-center justify-center overflow-hidden p-4`}>
                      <img src={formData.Diamond_Image} alt="Preview" className="max-h-full max-w-full object-contain drop-shadow-2xl" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-10 flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className={`px-8 py-4 rounded-2xl text-[10px] font-normal uppercase tracking-[0.2em] transition-all border ${isDarkMode ? 'text-slate-500 border-slate-800 hover:text-white hover:border-slate-500' : 'text-slate-500 border-slate-200 hover:text-slate-900 hover:border-slate-400'}`}
              >
                Discard Changes
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] text-[10px] font-normal uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
              >
                {loading ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  editData ? <Save size={16} /> : <PlusCircle size={16} />
                )}
                <span>{editData ? "Confirm Modification" : "Add to Inventory"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

