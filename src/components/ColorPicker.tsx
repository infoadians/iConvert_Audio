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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.707-.153 2.332-.394 1.183-.456 1.668-1.47 1.668-2.606 0-1.5 1.5-2.5 3-2.5 1.954 0 3-1.045 3-3 0-5.5-4.5-10-10-10Z" />
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
