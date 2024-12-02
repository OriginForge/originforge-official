import { Scene } from "phaser";
import { ImageProcessor } from './ImageProcessor';
import { SeededRandom } from './SeededRandom';
import axios from 'axios';

export default class RandomGenerator extends Scene {
    constructor() {
        super('RandomGenerator');
        this.imageProcessor = null;
        this.currentSeed = Date.now();
        this.seedHistory = [];
        this.usedColors = [];
        this.baseEggs = Array.from({length: 50}, (_, i) => `egg${i + 1}`);
        this.lastGeneratedImage = null;
        this.testImage = null;
    }

    
    create() {
        const bg = this.add.rectangle(0, 0, 
            this.cameras.main.width, 
            this.cameras.main.height, 
            0x000000, 0.7);
        bg.setOrigin(0);
        
        this.imageProcessor = new ImageProcessor({
            seed: this.currentSeed,
            excludeColors: [
                {color: [255, 255, 255], tolerance: 3}, // #FFFFFF
                {color: [57, 57, 70], tolerance: 2},
                {color: [0, 0, 0], tolerance: 3} // #000000
            ]
        });

        this.box = this.add.rectangle(
            this.cameras.main.centerX, 
            this.cameras.main.centerY/2, 
            300, 300, 
            0x1a1a1a, 0.9
        ).setStrokeStyle(2, 0x4a90e2);

        this.createEggContainer();
        this.createEggImage();
        this.createButton();
        this.createSeedInfo();
        this.createTestButtons();
    }

    createEggContainer() {
        this.eggContainer = this.add.container(
            this.cameras.main.centerX, 
            this.cameras.main.centerY/2
        );
    }
    
    createEggImage() {
        const baseImage = this.selectBaseImageByPattern();
        this.eggImage = this.add.image(0, -20, baseImage).setScale(4);
        this.eggContainer.add(this.eggImage);
    }

    createButton() {
        this.button = this.add.text(0, 80, 'Generate', { 
            fontSize: '20px', 
            fill: '#fff',
            backgroundColor: '#4a4a4a',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        this.button.setInteractive();
        this.button.on('pointerdown', () => {
            this.createRunGenerator();
        });

        this.eggContainer.add(this.button);
    }

    createSeedInfo() {
        this.seedText = this.add.text(0, 40, '', { 
            fontSize: '16px', 
            fill: '#fff' 
        }).setOrigin(0.5);
        this.eggContainer.add(this.seedText);
    }

    createTestButtons() {
        this.testButton = this.add.text(0, 120, 'Test Render', { 
            fontSize: '20px', 
            fill: '#fff',
            backgroundColor: '#4a4a4a',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        this.verifyButton = this.add.text(0, 160, 'Verify Last Generation', { 
            fontSize: '20px', 
            fill: '#fff',
            backgroundColor: '#4a4a4a',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        this.testButton.setInteractive();
        this.verifyButton.setInteractive();
        
        this.testButton.on('pointerdown', () => this.testRender());
        this.verifyButton.on('pointerdown', () => this.verifyLastGeneration());

        this.eggContainer.add(this.testButton);
        this.eggContainer.add(this.verifyButton);
    }

    async testRender() {
        try {
            const seedInput = prompt("Enter seed value:");
            const baseEggInput = prompt("Enter base egg number (1-50):");
            
            if (!seedInput || !baseEggInput) return;
            
            const seed = parseInt(seedInput);
            const baseImage = `egg${baseEggInput}`;

            const testBox = this.add.rectangle(
                this.cameras.main.centerX + 350, 
                this.cameras.main.centerY/2, 
                300, 300, 
                0x1a1a1a, 0.9
            ).setStrokeStyle(2, 0x4a90e2);

            const testContainer = this.add.container(
                this.cameras.main.centerX + 350,
                this.cameras.main.centerY/2
            );

            if (this.testImage) {
                this.testImage.destroy();
                this.textures.remove(`test_${this.currentSeed}`);
            }

            const imageFile = this.textures.get(baseImage)?.getSourceImage();
            if (!imageFile) {
                throw new Error(`Failed to get source image for ${baseImage}`);
            }

            this.imageProcessor.setSeed(seed);
            const { canvas, colorSet } = await this.imageProcessor.processImage(imageFile);

            const testTextureKey = `test_${seed}`;
            const texture = this.textures.createCanvas(testTextureKey, canvas.width, canvas.height);
            texture.draw(0, 0, canvas);
            texture.refresh();

            this.testImage = this.add.image(0, -20, testTextureKey).setScale(4);
            testContainer.add(this.testImage);

            const testText = this.add.text(0, 40, '', { 
                fontSize: '16px', 
                fill: '#fff' 
            }).setOrigin(0.5);
            
            const filteredColors = colorSet.filter(color => 
                color.hex.toUpperCase() !== '#000000' && 
                color.hex.toUpperCase() !== '#FFFFFF'
            );
            
            const colorInfo = filteredColors.map(color => color.hex).join(', ');
            testText.setText(
                `Test Render\nSeed: ${seed}\nBase: ${baseImage}\nColors: ${colorInfo}`
            ).setLineSpacing(5);
            
            testContainer.add(testText);

            // Convert canvas to high quality SVG data URL
            const highResCanvas = document.createElement('canvas');
            highResCanvas.width = 64;
            highResCanvas.height = 64;
            const ctx = highResCanvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(canvas, 0, 0, 64, 64);

            const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" shape-rendering="crispEdges">
                <image width="100%" height="100%" href="${highResCanvas.toDataURL('image/png', 1.0)}"/>
            </svg>`;
            const svgBase64 = btoa(svgString);
            const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;

            // Generate random attributes
            const attributes = [
                {
                    "trait_type": "BaseEgg", 
                    "value": baseEggInput
                },
                {
                    "trait_type": "Seed",
                    "value": seed
                },
                {
                    "trait_type": "Colors",
                    "value": filteredColors.length
                },
                {
                    "trait_type": "ColorSet",
                    "value": filteredColors.map(color => color.hex).join(', ')
                },
            ];

            const metadata = {
                name: "OpenSea Creatures",
                description: "OpenSea Creatures are adorable aquatic beings primarily for demonstrating what can be done using the OpenSea platform. Adopt one today to try out all the OpenSea buying, selling, and bidding feature set.",
                image: svgDataUrl,
                attributes: attributes
            };

            const jsonString = JSON.stringify(metadata);
            const jsonBase64 = 'data:application/json;base64,' + btoa(jsonString);
            
            console.log('Test Metadata (Base64):', jsonBase64);
            console.log('Test Original Metadata:', metadata);

        } catch (error) {
            console.error('Test render failed:', error);
            this.seedText.setText(`Test render failed: ${error.message}`);
        }
    }

    async createRunGenerator() {
        try {
            const baseImage = this.selectBaseImageByPattern();
            const imageFile = this.textures.get(baseImage)?.getSourceImage();
            
            if (!imageFile) {
                throw new Error(`Failed to get source image for ${baseImage}`);
            }

            const newSeed = Date.now();
            this.imageProcessor.setSeed(newSeed);
            this.currentSeed = newSeed;

            const { canvas, seed, colorSet } = await this.imageProcessor.processImage(imageFile);

            const textureKey = `generated_${seed}`;
            const texture = this.textures.createCanvas(textureKey, canvas.width, canvas.height);
            texture.draw(0, 0, canvas);
            texture.refresh();

            // Convert canvas to high quality SVG data URL
            const highResCanvas = document.createElement('canvas');
            highResCanvas.width = 64;
            highResCanvas.height = 64;
            const ctx = highResCanvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(canvas, 0, 0, 64, 64);

            const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" shape-rendering="crispEdges">
                <image width="100%" height="100%" href="${highResCanvas.toDataURL('image/png', 1.0)}"/>
            </svg>`;
            const svgBase64 = btoa(svgString);
            const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;

            // Generate attributes based on the generated image
            const baseNumber = parseInt(baseImage.replace('egg', ''));
            const filteredColors = colorSet.filter(color => 
                color.hex.toUpperCase() !== '#000000' && 
                color.hex.toUpperCase() !== '#FFFFFF'
            );
            
            const attributes = [
                {
                    "trait_type": "BaseEgg", 
                    "value": baseNumber
                },
                {
                    "trait_type": "Seed",
                    "value": seed
                },
                {
                    "trait_type": "Colors",
                    "value": filteredColors.length
                },
                {
                    "trait_type": "ColorSet",
                    "value": filteredColors.map(color => color.hex).join(', ')
                },
            ];

            const metadata = {
                name: "Origin Egg",
                description: "Origin Egg is a collection of 50 unique eggs, each with a different pattern and color set.",
                image: svgDataUrl,
                attributes: attributes
            };

            const jsonString = JSON.stringify(metadata);
            const jsonBase64 = 'data:application/json;base64,' + btoa(jsonString);
            
            console.log('Generated Metadata (Base64):', jsonBase64);
            console.log('Original Metadata:', metadata);

            this.eggImage.setTexture(textureKey);
            
            const colorInfo = filteredColors.map(color => color.hex).join(', ');
            this.seedText.setText(
                `Seed: ${seed}\nBase: ${baseImage}\nColors: ${colorInfo}`
            ).setLineSpacing(5);

            if (!this.seedHistory.includes(seed)) {
                this.seedHistory.push(seed);
            }

            this.usedColors = filteredColors;

            this.lastGeneratedImage = {
                seed,
                baseImage,
                textureKey,
                colorSet: filteredColors
            };

            
        } catch (error) {
            console.error('Generation failed:', error);
            this.seedText.setText(`Generation failed: ${error.message}`);
        }
    }

    selectBaseImageByPattern() {
        const seededRandom = new SeededRandom(this.currentSeed);
        const patternIndex = Math.floor(seededRandom.random() * this.baseEggs.length);
        return this.baseEggs[patternIndex];
    }

    async verifyLastGeneration() {
        if (!this.lastGeneratedData) {
            this.seedText.setText('No previous generation to verify');
            return;
        }

        const { seed, baseImage, colorSet: originalColors } = this.lastGeneratedData;
        
        const imageFile = this.textures.get(baseImage)?.getSourceImage();
        this.imageProcessor.setSeed(seed);
        const { colorSet: newColors } = await this.imageProcessor.processImage(imageFile);

        const filteredOriginalColors = originalColors.filter(color => 
            color.hex.toUpperCase() !== '#000000' && 
            color.hex.toUpperCase() !== '#FFFFFF'
        );
        const filteredNewColors = newColors.filter(color => 
            color.hex.toUpperCase() !== '#000000' && 
            color.hex.toUpperCase() !== '#FFFFFF'
        );

        const isIdentical = JSON.stringify(filteredOriginalColors) === JSON.stringify(filteredNewColors);
        
        this.seedText.setText(
            `Verification Result:\n` +
            `Seed: ${seed}\n` +
            `Base: ${baseImage}\n` +
            `Match: ${isIdentical ? '✓ Identical' : '✗ Different'}`
        ).setLineSpacing(5);
    }

    async generateNFT(scene) {
        try {
            const currentSeed = Date.now();
            const imageProcessor = new ImageProcessor({
                seed: currentSeed,
                excludeColors: [
                    {color: [255, 255, 255], tolerance: 3},
                    {color: [57, 57, 70], tolerance: 2},
                    {color: [0, 0, 0], tolerance: 3}
                ]
            });

            const seededRandom = new SeededRandom(currentSeed);
            const baseEggs = Array.from({length: 50}, (_, i) => `egg${i + 1}`);
            const patternIndex = Math.floor(seededRandom.random() * baseEggs.length);
            const baseImage = baseEggs[patternIndex];

            const imageFile = scene.textures.get(baseImage)?.getSourceImage();
            if (!imageFile) {
                throw new Error(`Failed to get source image for ${baseImage}`);
            }

            const { canvas, seed, colorSet } = await imageProcessor.processImage(imageFile);

            const textureKey = `generated_${seed}`;
            const texture = scene.textures.createCanvas(textureKey, canvas.width, canvas.height);
            texture.draw(0, 0, canvas);
            texture.refresh();

            const filteredColors = colorSet.filter(color => 
                color.hex.toUpperCase() !== '#000000' && 
                color.hex.toUpperCase() !== '#FFFFFF'
            );

            return {
                seed,
                baseImage,
                textureKey,
                colorSet: filteredColors
            };
        } catch (error) {
            console.error('NFT Generation failed:', error);
            throw error;
        }
    }
}