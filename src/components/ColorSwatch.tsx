interface ColorSwatchProps {
    color: string;
    selected: boolean;
    onClick: () => void;
    colorName: string;
}

const colorMap: Record<string, string> = {
    'Burgundy': '#800020',
    'Black': '#000000',
    'Off White': '#FAF9F6',
    'Dark Navy': '#000080',
    'Brown': '#8B4513',
    'Olive Green': '#556B2F',
    'Baby Pink': '#FFB6C1',
    'Purple': '#800080',
    'Beige': '#F5F5DC',
    'Nude': '#E3BC9A',
    'Baby Blue': '#89CFF0',
    'Baby Yellow': '#FFFACD',
    'Baby Purple': '#E0B0FF',
    'Red': '#FF0000',
};

export function ColorSwatch({ color, selected, onClick, colorName }: ColorSwatchProps) {
    const bgColor = colorMap[color] || '#CCCCCC';
    const isLight = ['Off White', 'Beige', 'Nude', 'Baby Pink', 'Baby Yellow'].includes(color);

    return (
        <button
            onClick={onClick}
            className={`relative w-12 h-12 rounded-full transition-all duration-200 ${selected ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-110'
                }`}
            style={{ backgroundColor: bgColor }}
            title={colorName}
            aria-label={colorName}
        >
            {selected && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                        className={`w-6 h-6 ${isLight ? 'text-gray-800' : 'text-white'}`}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
            )}
            {isLight && !selected && (
                <div className="absolute inset-0 rounded-full border border-gray-300"></div>
            )}
        </button>
    );
}
