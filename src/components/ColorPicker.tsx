import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

export const ColorPicker: React.FC<ColorPickerProps> = ({ primaryHue, setPrimaryHue, t }) => {
    return (
        <Select
            value={primaryHue.toString()}
            onValueChange={(val) => setPrimaryHue(parseInt(val))}
        >
            <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Theme">
                    <div className="flex items-center gap-2">
                        <div
                            className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: `hsl(${primaryHue}, 95%, 60%)` }}
                        />
                        <span className="text-xs font-medium">
                            {COLORS.find(c => c.hue === primaryHue)?.label || 'Custom'}
                        </span>
                    </div>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {COLORS.map((color) => (
                    <SelectItem key={color.hue} value={color.hue.toString()}>
                        <div className="flex items-center gap-2">
                            <div
                                className="h-4 w-4 rounded-full border border-white/20"
                                style={{ backgroundColor: `hsl(${color.hue}, 95%, 60%)` }}
                            />
                            <span>{color.label}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
