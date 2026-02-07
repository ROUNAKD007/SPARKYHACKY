/**
 * Computes color composition for an uploaded image.
 * Matches against a target hex color.
 * Returns { matchRatio: number, qualified: boolean, colorHex: string }
 * Threshold: 0.7 (70%)
 */
export const checkColorMatch = async (file, targetHex) => {
    return new Promise((resolve) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Scale down for speed
            const width = 64;
            const height = 64;
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            let matchedPixels = 0;
            const totalPixels = width * height;

            // Parse target hex
            const rT = parseInt(targetHex.slice(1, 3), 16);
            const gT = parseInt(targetHex.slice(3, 5), 16);
            const bT = parseInt(targetHex.slice(5, 7), 16);

            // Threshold for "closeness" in RGB space
            // 70% match requirement is for TOTAL pixels, but how close must a pixel be?
            // Let's say euclidean distance < 100 (out of ~441 max) is a "match".
            // Adjust threshold as desired. Tighter = harder.
            const DISTANCE_THRESHOLD = 150;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // alpha data[i+3] ignored

                const dist = Math.sqrt(
                    Math.pow(r - rT, 2) +
                    Math.pow(g - gT, 2) +
                    Math.pow(b - bT, 2)
                );

                if (dist < DISTANCE_THRESHOLD) {
                    matchedPixels++;
                }
            }

            const matchRatio = matchedPixels / totalPixels;
            URL.revokeObjectURL(objectUrl);

            resolve({
                matchRatio: parseFloat(matchRatio.toFixed(2)),
                qualified: matchRatio >= 0.70,
                colorHex: targetHex
            });
        };

        img.onerror = () => {
            resolve({ matchRatio: 0, qualified: false, colorHex: targetHex });
        };

        img.src = objectUrl;
    });
};
