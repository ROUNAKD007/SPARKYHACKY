const HEX_COLOR_REGEX = /^#?[0-9a-fA-F]{6}$/;

const hexToRgb = (hex) => {
    if (!HEX_COLOR_REGEX.test(hex)) {
        throw new Error(`Invalid color hex: ${hex}`);
    }

    const clean = hex.replace('#', '');
    return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16),
    };
};

const calculateMatchRatio = (pixels, target, threshold) => {
    let matchedPixels = 0;
    const totalPixels = pixels.length / 4;

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        const distance = Math.sqrt(
            (r - target.r) * (r - target.r) +
            (g - target.g) * (g - target.g) +
            (b - target.b) * (b - target.b)
        );

        if (distance <= threshold) {
            matchedPixels += 1;
        }
    }

    return totalPixels === 0 ? 0 : matchedPixels / totalPixels;
};

export const checkColorMatch = async (file, targetHex, options = {}) => {
    const sampleWidth = options.sampleWidth || 64;
    const sampleHeight = options.sampleHeight || 64;
    const threshold = options.threshold || 80;
    const target = hexToRgb(targetHex);

    return new Promise((resolve) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);

        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = sampleWidth;
            canvas.height = sampleHeight;

            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (!context) {
                URL.revokeObjectURL(objectUrl);
                resolve({ matchRatio: 0, qualified: false });
                return;
            }

            context.drawImage(image, 0, 0, sampleWidth, sampleHeight);
            const pixels = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
            const matchRatioRaw = calculateMatchRatio(pixels, target, threshold);
            const matchRatio = Number(matchRatioRaw.toFixed(4));

            URL.revokeObjectURL(objectUrl);
            resolve({
                matchRatio,
                qualified: matchRatio >= 0.7,
            });
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve({ matchRatio: 0, qualified: false });
        };

        image.src = objectUrl;
    });
};
