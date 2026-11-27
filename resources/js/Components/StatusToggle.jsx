import React from 'react';

export default function StatusToggle({ checked, onChange, label }) {
    const isOn = Boolean(checked);

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isOn}
            aria-label={label || (isOn ? 'Active' : 'Inactive')}
            onClick={onChange}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
                isOn ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400'
            }`}
            title={isOn ? 'Active (Click to turn off)' : 'Inactive (Click to turn on)'}
        >
            <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform duration-200 ${
                    isOn ? 'translate-x-4.5' : 'translate-x-1'
                }`}
            />
        </button>
    );
}

