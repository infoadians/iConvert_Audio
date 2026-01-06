import React, { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
    primaryHue: number;
    setPrimaryHue: (hue: number) => void;
    t: any;
}

const COLORS = [
    { hue: 249, label: 'Indigo' },
    { hue: 217, label: 'Blue' },
    { hue: 280, label: 'Purple' },
    { hue: 339, label: 'Pink' },
    { hue: 10, label: 'Red' },
    { hue: 25, label: 'Orange' },
    { hue: 142, label: 'Green' },
    { hue: 180, label: 'Teal' },
    { hue: 200, label: 'Cyan' },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ primaryHue, setPrimaryHue }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node) &&
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative">
            <div
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="color-picker-trigger"
                title="Change Theme Color"
            >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-3M9.707 3.293l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L5 3.586V2a1 1 0 011-1h2a1 1 0 011 1v1.586l1.293-1.293a1 1 0 111.414 1.414z" />
                    <circle cx="12" cy="7" r="1.5" fill="currentColor" />
                    <circle cx="17" cy="10" r="1.5" fill="currentColor" />
                    <circle cx="17" cy="15" r="1.5" fill="currentColor" />
                </svg>
            </div>

            {isOpen && (
                <div ref={popoverRef} className="palette-popover">
                    {COLORS.map((color) => (
                        <button
                            key={color.hue}
                            onClick={() => {
                                setPrimaryHue(color.hue);
                                setIsOpen(false);
                            }}
                            className={`color-swatch ${primaryHue === color.hue ? 'active' : ''}`}
                            style={{ backgroundColor: `hsl(${color.hue}, 70%, 60%)` }}
                            title={color.label}
                            aria-label={color.label}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
