import { Scene } from "phaser";
import { ImageProcessor } from './ImageProcessor';
import { SeededRandom } from './SeededRandom';

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
                {color: [255, 255, 255], tolerance: 3},
                {color: [57, 57, 70], tolerance: 2}
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

            // 새로운 테스트 박스 생성
            const testBox = this.add.rectangle(
                this.cameras.main.centerX + 350, 
                this.cameras.main.centerY/2, 
                300, 300, 
                0x1a1a1a, 0.9
            ).setStrokeStyle(2, 0x4a90e2);

            // 테스트 컨테이너 생성
            const testContainer = this.add.container(
                this.cameras.main.centerX + 350,
                this.cameras.main.centerY/2
            );

            // 이전 테스트 이미지가 있다면 제거
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

            // 테스트 이미지 생성 및 컨테이너에 추가
            this.testImage = this.add.image(0, -20, testTextureKey).setScale(4);
            testContainer.add(this.testImage);

            // 테스트 정보 텍스트 추가
            const testText = this.add.text(0, 40, '', { 
                fontSize: '16px', 
                fill: '#fff' 
            }).setOrigin(0.5);
            
            const colorInfo = colorSet.map(color => color.hex).join(', ');
            testText.setText(
                `Test Render\nSeed: ${seed}\nBase: ${baseImage}\nColors: ${colorInfo}`
            ).setLineSpacing(5);
            
            testContainer.add(testText);

            // metadata 생성 및 출력
            const metadata = {
                description: "Origin-Forge SBT",
                image: canvas.toDataURL(),
                name: `Seed: ${seed}`,
                attributes: [
                    {
                        trait_type: "Base Pattern",
                        value: baseImage
                    },
                    ...colorSet.map(color => ({
                        trait_type: "Color",
                        value: color.hex
                    }))
                ]
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

            const metadata = {
                description: "Origin-Forge SBT",
                image: canvas.toDataURL(),
                name: `Seed: ${seed}`,
                attributes: [
                    {
                        trait_type: "Base Pattern",
                        value: baseImage
                    },
                    ...colorSet.map(color => ({
                        trait_type: "Color",
                        value: color.hex
                    }))
                ]
            };

            const jsonString = JSON.stringify(metadata);
            const jsonBase64 = 'data:application/json;base64,' + btoa(jsonString);
            
            console.log('Generated Metadata (Base64):', jsonBase64);
            console.log('Original Metadata:', metadata);

            this.eggImage.setTexture(textureKey);
            
            const colorInfo = colorSet.map(color => color.hex).join(', ');
            this.seedText.setText(
                `Seed: ${seed}\nBase: ${baseImage}\nColors: ${colorInfo}`
            ).setLineSpacing(5);

            if (!this.seedHistory.includes(seed)) {
                this.seedHistory.push(seed);
            }

            this.usedColors = colorSet;

            this.lastGeneratedImage = {
                seed,
                baseImage,
                textureKey,
                colorSet
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
        
        // 동일한 시드와 베이스 이미지로 새로 생성
        const imageFile = this.textures.get(baseImage)?.getSourceImage();
        this.imageProcessor.setSeed(seed);
        const { colorSet: newColors } = await this.imageProcessor.processImage(imageFile);

        // 결과 비교
        const isIdentical = JSON.stringify(originalColors) === JSON.stringify(newColors);
        
        this.seedText.setText(
            `Verification Result:\n` +
            `Seed: ${seed}\n` +
            `Base: ${baseImage}\n` +
            `Match: ${isIdentical ? '✓ Identical' : '✗ Different'}`
        ).setLineSpacing(5);
    }
}