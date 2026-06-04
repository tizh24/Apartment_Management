import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
    value: string;
    label: string;
}

export interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    icon?: React.ComponentType<any>;
    className?: string;
}

export function CustomSelect({
    value,
    onChange,
    options,
    icon: Icon,
    className,
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Get current label
    const selectedOption = options.find((opt) => opt.value === value) || options[0];

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={cn("relative inline-block text-left shrink-0", className)}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white border border-[#fcd5ce] hover:border-[#ffb5a7] rounded-xl px-3 py-1.5 text-xs text-[#3f2d28] font-bold shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 outline-none select-none min-w-[130px] justify-between"
            >
                <div className="flex items-center gap-1.5 truncate">
                    {Icon && <Icon className="h-3.5 w-3.5 text-[#ff385c] shrink-0" />}
                    <span className="truncate">{selectedOption?.label}</span>
                </div>
                <ChevronDown
                    className={cn(
                        "h-3 w-3 text-[#caa79a] transition-transform duration-200 shrink-0",
                        isOpen && "transform rotate-180 text-[#ff385c]"
                    )}
                />
            </button>

            {/* Dropdown Options Box with smooth entrance animation */}
            {isOpen && (
                <div className="absolute left-0 mt-1.5 w-full min-w-[180px] rounded-xl border border-[#fcd5ce] bg-white shadow-lg z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200 origin-top">
                    {options.map((opt) => {
                        const isSelected = opt.value === value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleSelect(opt.value)}
                                className={cn(
                                    "w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer block outline-none select-none truncate",
                                    isSelected
                                        ? "bg-[#fff8f6] text-[#ff385c] font-black"
                                        : "text-[#3f2d28] hover:bg-[#fff8f6] hover:text-[#ff385c]"
                                )}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
