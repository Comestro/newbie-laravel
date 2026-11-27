import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
    value,
    onChange,
    onSearch,
    onSubmit,
    onClear,
    debounceMs = 300,
    placeholder = 'Search...',
    className = 'w-full sm:w-72',
    inputClassName = '',
    size = 'sm',
}) {
    const isMd = size === 'md';
    const hasValue = Boolean(value);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // Cancel any pending debounce when value is cleared externally (e.g., page navigation)
    useEffect(() => {
        if (!value && timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, [value]);

    const handleChange = (e) => {
        const nextValue = e.target.value;
        onChange?.(nextValue);

        if (onSearch) {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                onSearch(nextValue);
            }, debounceMs);
        }
    };

    const handleClear = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        onChange?.('');
        onSearch?.('');
        onClear?.();
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (timerRef.current) clearTimeout(timerRef.current);
        if (onSubmit) {
            onSubmit(e);
        } else {
            onSearch?.(value);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !onSubmit && onSearch) {
            e.preventDefault();
            if (timerRef.current) clearTimeout(timerRef.current);
            onSearch(value);
        }
    };

    const content = (
        <>
            <Search
                className={`text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isMd ? 'w-4 h-4 left-3' : 'w-3.5 h-3.5'
                }`}
            />
            <input
                type="text"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`w-full rounded-lg border border-slate-200/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition ${
                    isMd
                        ? 'pl-9 py-1.5 text-sm bg-slate-50 focus:bg-white'
                        : 'pl-8 py-1.5 text-xs bg-white'
                } ${hasValue ? 'pr-7' : 'pr-3'} ${inputClassName}`}
            />
            {hasValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Clear search"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </>
    );

    if (onSubmit) {
        return (
            <form onSubmit={handleFormSubmit} className={`relative ${className}`}>
                {content}
            </form>
        );
    }

    return <div className={`relative ${className}`}>{content}</div>;
}
