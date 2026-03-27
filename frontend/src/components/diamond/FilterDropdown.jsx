
export const FilterDropdown = ({ label, value, onChange, options = [] }) => {
    return (
        <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
            <div className="bg-white border border-gray-200 rounded-lg p-2">
                {options.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-50 rounded">
                        <input
                            type="radio"
                            name={label}
                            value={opt.value}
                            checked={value === opt.value}
                            onChange={() => onChange(opt.value)}
                            className="w-4 h-4 text-blue-500 accent-blue-500"
                        />
                        <div className="text-sm text-gray-700">{opt.label}</div>
                    </label>
                ))}
            </div>
        </div>
    );
}

