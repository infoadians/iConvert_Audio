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
                <div
                    className="color-swatch-mini"
                    style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', backgroundColor: `hsl(${primaryHue}, 70%, 60%)` }}
                ></div>
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
