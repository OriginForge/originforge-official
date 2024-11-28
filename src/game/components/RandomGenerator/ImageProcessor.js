import { SeededRandom } from './SeededRandom';

export class ImageProcessor {
    constructor(options = {}) {
        this.currentSeed = options.seed || Date.now();
        this.seededRandom = new SeededRandom(this.currentSeed);
        this.excludeColors = options.excludeColors || [
            {color: [255, 255, 255], tolerance: 3},
            {color: [57, 57, 70], tolerance: 2}
        ];
        this.patternWeight = 0.85;
        this.usedColors = [];
    }

    setSeed(seed) {
        this.currentSeed = seed;
        this.seededRandom = new SeededRandom(this.currentSeed);
    }

    async processImage(imageFile) {
        if (!imageFile || !imageFile.width || !imageFile.height) {
            throw new Error('Invalid image file');
        }
        
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 16;
            canvas.height = 16;
            
            ctx.drawImage(imageFile, 0, 0, 16, 16);
            const imageData = ctx.getImageData(0, 0, 16, 16);
            
            const processedData = this.processPixelsWithPattern(imageData.data);
            
            const newImageData = new ImageData(processedData, canvas.width, canvas.height);
            ctx.putImageData(newImageData, 0, 0);

            return {
                canvas,
                seed: this.currentSeed,
                colorSet: this.usedColors
            };
        } catch (error) {
            console.error('Image processing failed:', error);
            throw error;
        }
    }

    processPixelsWithPattern(pixels) {
        const processed = new Uint8ClampedArray(pixels.length);
        const pixelArray = [];
        const exclusionMask = [];
        this.usedColors = [];
        
        // 색상 패턴 분석
        const colorPatterns = new Map();
        
        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];

            if (this.isExcludedColor(r, g, b)) {
                exclusionMask.push(true);
                processed[i] = r;
                processed[i + 1] = g;
                processed[i + 2] = b;
                processed[i + 3] = a;
            } else {
                exclusionMask.push(false);
                const [h, s, l] = this.rgbToHsl(r, g, b);
                const colorKey = `${Math.round(h/10)},${Math.round(s/10)},${Math.round(l/10)}`;
                
                if (!colorPatterns.has(colorKey)) {
                    colorPatterns.set(colorKey, []);
                }
                colorPatterns.get(colorKey).push(i);
                
                pixelArray.push({
                    rgb: [r, g, b],
                    hsl: [h, s, l],
                    index: i,
                    patternKey: colorKey
                });
            }
        }

        // 각 패턴별로 새로운 색상 생성
        colorPatterns.forEach((indices, patternKey) => {
            const baseHue = this.seededRandom.random() * 360;
            const [h, s, l] = patternKey.split(',').map(Number);
            
            const newHue = (baseHue + (h * 10 * this.patternWeight)) % 360;
            const newSat = Math.min(100, s * 10 * (0.9 + this.seededRandom.random() * 0.2));
            const newLight = Math.min(100, l * 10 * (0.9 + this.seededRandom.random() * 0.2));
            
            const [r, g, b] = this.hslToRgb(newHue, newSat, newLight);
            
            indices.forEach(i => {
                processed[i] = r;
                processed[i + 1] = g;
                processed[i + 2] = b;
                processed[i + 3] = pixels[i + 3];
            });
            
            this.usedColors.push({
                r: Math.round(r),
                g: Math.round(g),
                b: Math.round(b),
                hex: '#' + 
                    Math.round(r).toString(16).padStart(2,'0') + 
                    Math.round(g).toString(16).padStart(2,'0') + 
                    Math.round(b).toString(16).padStart(2,'0')
            });
        });

        return processed;
    }

    isExcludedColor(r, g, b) {
        return this.excludeColors.some(({color, tolerance}) => {
            return Math.abs(r - color[0]) <= tolerance &&
                   Math.abs(g - color[1]) <= tolerance &&
                   Math.abs(b - color[2]) <= tolerance;
        });
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h * 360, s * 100, l * 100];
    }

    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    }
}