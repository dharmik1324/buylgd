import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Shield, Globe, Monitor, MapPin,
    ChevronLeft, ChevronRight,
    AlertCircle, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import api from "../../services/api";

export const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({ successRate: 0, failedCount: 0, mfaCount: 0 });
    const [totalResults, setTotalResults] = useState(0);
    const isDarkMode = useSelector((state) => state.theme?.isDarkMode ?? true);

    const pageBg = isDarkMode ? "bg-[#0b0e14] text-gray-300" : "bg-slate-50 text-slate-700";
    const cardBg = isDarkMode ? "bg-[#12161d] border-[#111111]" : "bg-white border-slate-200";
    const borderCol = isDarkMode ? "border-[#111111]" : "border-slate-200";
    const headText = isDarkMode ? "text-white" : "text-slate-900";
    const rowText = isDarkMode ? "text-gray-400" : "text-slate-600";
    const subText = isDarkMode ? "text-gray-500" : "text-slate-400";
    const rowHover = isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50";
    const avatarBg = isDarkMode ? "bg-[#111111] border-gray-700" : "bg-slate-100 border-slate-300";
    const tabDefault = isDarkMode ? "text-gray-400 hover:text-white" : "text-slate-500 hover:text-slate-900";

    const API_URL = "/admin/reports/access-logs";

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get(
                `${API_URL}?statusType=${activeTab}&page=${page}&limit=8`
            );
            setLogs(response.data.logs);
            setTotalPages(response.data.totalPages);
            setStats(response.data.stats);
            setTotalResults(response.data.totalLogs);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [activeTab, page]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setPage(1);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            time:
                date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }) + ' UTC'
        };
    };

    return (
        <div className={`min-h-screen p-8 font-sans transition-colors duration-300 ${pageBg}`}>
            {/* Header Tabs */}
            <div className={`flex justify-between items-center border-b ${borderCol} mb-6`}>
                <div className={`flex gap-8 text-sm font-normal border-b ${borderCol} pb-0`}>
                    {['all', 'mfa', 'failed'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`pb-2 transition-all ${activeTab === tab
                                ? 'border-b-2 border-blue-500 text-blue-400'
                                : tabDefault
                                }`}
                        >
                            {tab === 'all'
                                ? 'All Access Logs'
                                : tab === 'mfa'
                                    ? 'MFA Verified'
                                    : 'Critical Alerts'}
                        </button>
                    ))}
                </div>

                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-normal text-sm"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Table */}
            <div className={`rounded-lg overflow-hidden border mb-6 shadow-2xl ${cardBg}`}>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm uppercase tracking-wider min-w-[1000px] table-auto">
                        <thead>
                            <tr className={`text-gray-500 border-b ${borderCol}`}>
                                <th className="px-6 py-4 font-normal">User Identity</th>
                                <th className="px-6 py-4 font-normal">Event Timestamp</th>
                                <th className="px-6 py-4 font-normal">IP Address</th>
                                <th className="px-6 py-4 font-normal">Environment</th>
                                <th className="px-6 py-4 font-normal">Access Point</th>
                                <th className="px-6 py-4 font-normal text-right">
                                    Operational Status
                                </th>
                            </tr>
                        </thead>

                        <tbody className={`divide-y ${isDarkMode ? 'divide-[#111111]/50' : 'divide-slate-200/50'}`}>
                            {loading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg ${isDarkMode ? 'bg-[#111111]' : 'bg-slate-200'}`} />
                                                <div className="space-y-2">
                                                    <div className={`h-3 w-32 rounded ${isDarkMode ? 'bg-[#111111]' : 'bg-slate-200'}`} />
                                                    <div className={`h-2 w-24 rounded ${isDarkMode ? 'bg-[#111111]' : 'bg-slate-200'}`} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`h-3 w-28 rounded mb-2 ${isDarkMode ? 'bg-[#111111]' : 'bg-slate-200'}`} />
                                            <div className={`h-2 w-20 rounded ${isDarkMode ? 'bg-[#111111]' : 'bg-slate-200'}`} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`h-3 w-24 rounded ${isDarkMode ? 'bg-[#111111]' : 'bg-slate-200'}`} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`h-3 w-20 rounded ${isDarkMode ? 'bg-[#111111]' : 'bg-slate-200'}`} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`h-3 w-24 rounded ${isDarkMode ? 'bg-[#111111]' : 'bg-slate-200'}`} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={`h-6 w-20 rounded ml-auto ${isDarkMode ? 'bg-[#111111]' : 'bg-slate-200'}`} />
                                        </td>
                                    </tr>
                                ))
                            ) : logs.length > 0 ? (
                                logs.map((log, idx) => {
                                    const formatted = formatDate(log.time);

                                    return (
                                        <tr
                                            key={log._id || idx}
                                            className={`${log.highlight
                                                ? 'bg-red-950/10'
                                                : rowHover
                                                } transition-colors group`}
                                        >
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center border ${log.highlight
                                                        ? 'bg-red-950/10 border-red-500/30'
                                                        : `${avatarBg} group-hover:border-gray-600`
                                                        }`}
                                                >
                                                    {log.highlight ? (
                                                        <AlertCircle
                                                            className="text-red-500"
                                                            size={20}
                                                        />
                                                    ) : (
                                                        <div className="text-xs font-normal text-blue-500">
                                                            {log.user.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <div
                                                        className={`font-normal normal-case text-sm ${log.highlight
                                                            ? 'text-red-400'
                                                            : headText
                                                            }`}
                                                    >
                                                        {log.user}
                                                    </div>
                                                    <div className={`text-[10px] lowercase ${subText}`}>
                                                        {log.email}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className={`px-6 py-4 normal-case leading-tight ${rowText}`}>
                                                {formatted.date}
                                                <br />
                                                <span className={`text-[10px] font-mono ${subText}`}>
                                                    {formatted.time}
                                                </span>
                                            </td>

                                            <td className={`px-6 py-4 font-mono text-[11px] ${rowText}`}>
                                                {log.ip}
                                            </td>

                                            <td className={`px-6 py-4 flex items-center gap-2 normal-case ${rowText}`}>
                                                <Monitor
                                                    size={14}
                                                    className={subText}
                                                />
                                                {log.env}
                                            </td>

                                            <td className={`px-6 py-4 normal-case ${rowText}`}>
                                                <MapPin
                                                    size={14}
                                                    className={`inline mr-2 ${subText}`}
                                                />
                                                {log.loc}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <span
                                                    className={`px-3 py-1.5 rounded-md text-[9px] font-normal tracking-widest ${log.statusType === 'success'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                        : log.statusType === 'mfa'
                                                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                        }`}
                                                >
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-20 text-center"
                                    >
                                        <p className="text-gray-600  normal-case">
                                            No access records identified in the
                                            current sector.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className={`p-4 border-t ${borderCol} flex justify-between items-center text-xs text-gray-500 font-normal`}>
                    <div className="uppercase tracking-widest text-[10px]">
                        Registry Analysis: {logs.length} of {totalResults} entries
                    </div>

                    <div className="flex gap-2 items-center">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            className={`p-1.5 rounded border ${isDarkMode ? 'border-[#111111] hover:bg-[#111111]' : 'border-slate-200 hover:bg-slate-50'} disabled:opacity-20`}
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {(function () {
                            const pages = [];
                            const maxVisible = 5;
                            let start = Math.max(1, page - 2);
                            let end = Math.min(totalPages, start + maxVisible - 1);

                            if (end - start + 1 < maxVisible) {
                                start = Math.max(1, end - maxVisible + 1);
                            }

                            if (start > 1) {
                                pages.push(1);
                                if (start > 2) pages.push('...');
                            }

                            for (let i = start; i <= end; i++) {
                                pages.push(i);
                            }

                            if (end < totalPages) {
                                if (end < totalPages - 1) pages.push('...');
                                pages.push(totalPages);
                            }

                            return pages.map((p, i) => (
                                <button
                                    key={i}
                                    disabled={p === '...'}
                                    onClick={() => p !== '...' && setPage(p)}
                                    className={`px-3 py-1 rounded text-[10px] sm:text-xs min-w-[32px] transition-all ${p === page
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : p === '...'
                                            ? 'cursor-default text-gray-600'
                                            : isDarkMode ? 'border border-slate-800 hover:bg-[#111111] text-gray-500' : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                                        }`}
                                >
                                    {p}
                                </button>
                            ));
                        })()}

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className={`p-1.5 rounded border ${isDarkMode ? 'border-[#111111] hover:bg-[#111111]' : 'border-slate-200 hover:bg-slate-50'} disabled:opacity-20`}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Cards */}
            <div className="grid grid-cols-2 gap-6">
                <div className={`rounded-lg border p-6 h-64 relative overflow-hidden group ${cardBg}`}>
                    <div className={`flex items-center gap-2 text-sm font-normal mb-4 uppercase tracking-tighter ${headText}`}>
                        <Globe size={18} className="text-blue-500" />
                        Sector Traffic Analysis
                    </div>
                </div>

                <div className={`rounded-lg border p-6 shadow-xl ${cardBg}`}>
                    <div className={`flex items-center gap-2 text-sm font-normal mb-6 uppercase tracking-tighter ${headText}`}>
                        <Shield size={18} className="text-blue-500" />
                        Authentication Health
                    </div>
                </div>
            </div>
        </div>
    );
};

