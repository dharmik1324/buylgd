import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDiamonds } from '../../store/diamondSlice';
import {
    Clock,
    Package,
    Tag,
    Layers,
    Search,
    Filter,
    ArrowDownRight,
    History,
    Activity,
    Download,
    RefreshCw
} from 'lucide-react';

export const Reports = () => {
    const dispatch = useDispatch();
    const { data, totalDiamonds, loading } = useSelector(state => state.diamonds);
    const isDarkMode = useSelector(state => state.theme?.isDarkMode ?? true);

    const pageBg = isDarkMode ? "bg-[#0b0f1a] text-slate-200" : "bg-slate-50 text-slate-700";
    const cardBg = isDarkMode ? "bg-[#111623] border-slate-800" : "bg-white border-slate-200";
    const tableHdrBg = isDarkMode ? "bg-[#0b0f1a]/80" : "bg-slate-100/80";
    const inputBg = isDarkMode ? "bg-[#0b0f1a] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900";
    const headText = isDarkMode ? "text-white" : "text-slate-900";
    const borderCol = isDarkMode ? "border-slate-800" : "border-slate-200";

    // Dynamic stats based on purchase/deduction data
    const purchaseStats = useMemo(() => {
        const totalValue = data.reduce(
            (acc, curr) => acc + (Number(curr.Final_Price) || 0),
            0
        );

        return [
            {
                label: "TOTAL OUTFLOW",
                value: `$${totalValue.toLocaleString()}`,
                trend: "Live Sync",
                icon: <ArrowDownRight className="text-rose-400" size={20} />,
                bg: "bg-rose-500/10"
            },
            {
                label: "ASSETS DEDUCTED",
                value: data.length.toLocaleString(),
                trend: "Inventory Impact",
                icon: <History className="text-blue-400" size={20} />,
                bg: "bg-blue-500/10"
            },
            {
                label: "SYSTEM STATUS",
                value: "Active",
                trend: "Operational",
                icon: <Activity className="text-emerald-400" size={20} />,
                bg: "bg-emerald-500/10"
            }
        ];
    }, [data]);

    return (
        <div className={`p-8 min-h-screen font-sans transition-colors duration-300 ${pageBg}`}>
            {/* Header */}
            <div className={`flex justify-between items-end mb-8 border-b pb-6 ${borderCol}`}>
                <div>
                    <h1 className={`text-3xl font-normal tracking-tight ${headText}`}>
                        Purchase & Deduction Log
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Viewing real-time asset removals and transaction values.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => dispatch(fetchDiamonds({ page: 1, limit: 12 }))}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-normal transition-all shadow-lg shadow-blue-900/20"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                    {/* <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-900/20">
                        <Download size={14} /> Export CSV
                    </button> */}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {purchaseStats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* Table Container */}
            <div className={`rounded-2xl border shadow-2xl overflow-hidden ${cardBg}`}>
                {/* Search + Filters */}
                <div className={`p-5 flex justify-between items-center gap-4 border-b ${isDarkMode ? 'bg-[#161b2a]/50 border-slate-800' : 'bg-slate-50/50 border-slate-200'}`}>
                    <div className="relative flex-1 max-w-md">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                            size={16}
                        />
                        <input
                            type="text"
                            placeholder="Search by Stock No or Shape..."
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-blue-500/50 transition-all ${inputBg}`}
                        />
                    </div>
                    <button className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-normal transition-all ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                        <Filter size={14} /> More Filters
                    </button>
                </div>

                {/* Loader OR Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-16 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-400 text-sm tracking-wide">
                                    Loading Purchase Records...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <table className="w-full text-left min-w-[800px]">
                                <thead className={tableHdrBg}>
                                    <tr className={`text-[10px] font-normal text-slate-500 uppercase tracking-widest border-b ${borderCol}`}>
                                        <th className="px-8 py-5 flex items-center gap-2">
                                            <Package size={14} /> Products
                                        </th>
                                        <th className="px-6 py-5">
                                            <Clock size={14} className="inline mr-2" /> Time
                                        </th>
                                        <th className="px-6 py-5 text-center">
                                            <Layers size={14} className="inline mr-2" /> Quantity
                                        </th>
                                        <th className="px-6 py-5 text-right">
                                            <Tag size={14} className="inline mr-2" /> Price
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                                    {data.map((item) => (
                                        <tr
                                            key={item._id}
                                            className="hover:bg-blue-500/[0.03] transition-all group"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className={`w-12 h-12 rounded-lg p-1 border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                                            <img
                                                                src={item.Diamond_Image}
                                                                className="w-full h-full object-contain"
                                                                alt="product"
                                                            />
                                                        </div>
                                                        <div className={`absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 rounded-full ${isDarkMode ? 'border-[#111623]' : 'border-white'}`}></div>
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-normal leading-tight transition-colors ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'}`}>
                                                            {item.Weight} ct {item.Shape}
                                                        </p>
                                                        <p className={`text-[10px] font-mono uppercase mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                            {item.Stock_No || 'ASSET-ID'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-normal ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
                                                        Oct 24, 2023
                                                    </span>
                                                    <span className={`text-[10px] font-normal tracking-wider ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                                                        02:20:55 PM
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-center">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 font-normal text-xs">
                                                    - 1
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-right">
                                                <div className="flex flex-col items-end">
                                                    <p className={`text-sm font-normal tabular-nums ${isDarkMode ? 'text-white' : 'text-slate-900 font-medium'}`}>
                                                        ${Number(item.Final_Price || 0).toLocaleString()}
                                                    </p>
                                                    <p className={`text-[10px] line-through ${isDarkMode ? 'text-slate-500 decoration-slate-700' : 'text-slate-400 decoration-slate-300'}`}>
                                                        ${Number(item.Price || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {data.length === 0 && (
                                <div className="p-16 text-center border-t border-slate-800">
                                    <Package
                                        className="mx-auto text-slate-800 mb-4"
                                        size={48}
                                    />
                                    <p className="text-slate-500">
                                        No purchase records found in the current ledger.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, trend, icon, bg }) => {
    const isDarkMode = useSelector(state => state.theme?.isDarkMode ?? true);
    const cardBg = isDarkMode ? "bg-[#111623] border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300";
    const headText = isDarkMode ? "text-white" : "text-slate-900";
    return (
        <div className={`p-6 rounded-2xl border flex justify-between items-center shadow-lg transition-colors ${cardBg}`}>
            <div>
                <p className="text-[10px] font-normal text-slate-500 tracking-widest uppercase mb-1">
                    {label}
                </p>
                <h3 className={`text-2xl font-normal mb-1 ${headText}`}>{value}</h3>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-normal text-slate-400 uppercase tracking-tighter">
                        {trend}
                    </span>
                </div>
            </div>
            <div className={`p-4 rounded-2xl border border-white/5 ${bg}`}>
                {icon}
            </div>
        </div>
    );
};

