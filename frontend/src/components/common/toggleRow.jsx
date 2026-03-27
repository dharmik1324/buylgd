export const ToggleRow = ({ label, description, checked, onChange, icon: Icon }) => (
    <div className="flex justify-between items-center group">
        <div className="flex items-center gap-3">
            {/* આઈકનનો કલર થોડો ગ્રે રાખ્યો છે જે હોવર પર બ્લુ થશે */}
            {Icon && <Icon size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
            <div>
                {/* label માટે text-black અથવા text-[#111111] વાપરો */}
                <p className="text-sm font-bold text-black">{label}</p>
                {/* description માટે text-gray-500 વાપરો જે વંચાવામાં સરળ રહેશે */}
                <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>
            </div>
        </div>
        <button
            onClick={onChange}
            type="button"
            role="switch"
            aria-checked={checked}
            className={`w-10 h-5 rounded-full transition-all relative ${checked ? 'bg-blue-600' : 'bg-gray-200 border border-gray-300'
                }`}
        >
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-6' : 'left-1'
                }`} />
        </button>
    </div>
);

