import React from 'react';

export default function CategoryIcon({ icon, name = '', className = 'w-8 h-8', textClassName = 'text-2xl' }) {
    const isImage = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('blob:') || icon.startsWith('data:'));

    if (isImage) {
        return (
            <img
                src={icon}
                alt={name}
                className={`object-contain rounded-lg shrink-0 ${className}`}
            />
        );
    }

    return <span className={`leading-none shrink-0 ${textClassName}`}>{icon || '📦'}</span>;
}

