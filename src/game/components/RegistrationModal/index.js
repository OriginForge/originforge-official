import axios from 'axios';
import {gameData} from '../../managers/GameDataManager';

export default class RegistrationModal {
    constructor(scene) {
        this.scene = scene;
        this.modalBg = null;
        this.isDragging = false;
        this.isEditing = false;
        this.warningText = null;
        this.nameInput = null;
        this.displayedText = null;
        this.cursor = null;
        this.cursorBlink = null;
        this.nftPreview = null;
        this.isAnimating = false;
        this.resultModal = null;
        this.nickname = '';
        this.loadingText = null;
        this.loadingDots = '';
        this.loadingTimer = null;
        this.mintButton = null;
        this.createParticleTexture();
    }

    createParticleTexture() {
        // 동적으로 파티클 텍스처 생성
        const graphics = this.scene.add.graphics();
        
        // 별 모양 그리기
        const starPoints = 5;
        const outerRadius = 15;
        const innerRadius = 7;
        const angle = Math.PI / starPoints;
        
        graphics.lineStyle(2, 0xf7d794, 1);
        graphics.beginPath();
        
        for (let i = 0; i <= starPoints * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const currAngle = i * angle - Math.PI / 2;
            const x = 16 + radius * Math.cos(currAngle);
            const y = 16 + radius * Math.sin(currAngle);
            
            if (i === 0) {
                graphics.moveTo(x, y);
            } else {
                graphics.lineTo(x, y);
            }
        }
        
        graphics.closePath();
        graphics.strokePath();
        
        // 별 내부 채우기
        graphics.fillStyle(0xf7d794, 0.8);
        graphics.fill();
        
        // 중앙 하이라이트
        graphics.fillStyle(0xffeaa7, 1);
        graphics.fillCircle(16, 16, 3);
        
        // 빛나는 효과
        graphics.lineStyle(1, 0xffeaa7, 0.6);
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI / 2) * i;
            const startX = 16 + Math.cos(angle) * 5;
            const startY = 16 + Math.sin(angle) * 5;
            const endX = 16 + Math.cos(angle) * 20;
            const endY = 16 + Math.sin(angle) * 20;
            
            graphics.beginPath();
            graphics.moveTo(startX, startY);
            graphics.lineTo(endX, endY);
            graphics.stroke();
        }
        
        // 텍스처 생성
        graphics.generateTexture('customParticle', 32, 32);
        graphics.destroy();
    }

    show() {
        this.createModalBackground();
        this.createModalContent();
    }

    createModalBackground() {
        this.modalBg = this.scene.add.rectangle(0, 0,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000, 0.8
        ).setOrigin(0).setDepth(200).setInteractive();

        this.modalBg.on('pointerdown', (pointer) => {
            pointer.event.stopPropagation();
        });
    }

    createModalContent() {
        this.container = this.scene.add.container(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY
        ).setDepth(201);

        const panel = this.scene.add.rectangle(0, 0, 500, 600, 0x1a1a1a)
            .setStrokeStyle(2, 0x4a90e2)
            .setInteractive();

        this.setupDragBehavior(panel, this.container);

        const exitBtn = this.scene.add.image(230, -280, 'exitBtn')
            .setScale(1)
            .setInteractive()
            .on('pointerdown', () => this.destroy())
            .on('pointerover', () => exitBtn.setTint(0xff0000))
            .on('pointerout', () => exitBtn.clearTint());

        const nftBorder = this.scene.add.rectangle(0, -150, 110, 110, 0x000000)
            .setStrokeStyle(3, 0x4a90e2);

        this.nftPreview = this.scene.add.sprite(0, -150, 'egg1')
            .setScale(5);

        this.scene.tweens.add({
            targets: this.nftPreview,
            scaleX: { from: 5, to: 5.3 },
            scaleY: { from: 5, to: 5.3 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const darkOverlay = this.scene.add.rectangle(0, -150, 110, 110, 0x000000, 0.5);
        const questionMark = this.scene.add.text(0, -150, '?', {
            fontFamily: 'Pixelify Sans',
            fontSize: '48px',
            color: '#4a90e2',
        }).setOrigin(0.5);

        const titleText = this.scene.add.text(0, -50, 'Welcome to Origin-Forge', {
            fontFamily: 'Pixelify Sans',
            fontSize: '24px',
            color: '#ffffff',
        }).setOrigin(0.5);

        const descText = this.scene.add.text(0, 0, 'Mint your unique Origin-Forge NFT\nand start your journey!', {
            fontFamily: 'Pixelify Sans',
            fontSize: '18px',
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5);

        const inputLabel = this.scene.add.text(0, 40, 'Please enter your nickname:', {
            fontFamily: 'Pixelify Sans',
            fontSize: '16px',
            color: '#ffffff',
        }).setOrigin(0.5);

        const inputBg = this.scene.add.rectangle(0, 80, 300, 40, 0x2a2a2a)
            .setStrokeStyle(1, 0x4a90e2)
            .setInteractive()
            .on('pointerdown', () => {
                this.isEditing = true;
                this.nameInput.setVisible(true);
                this.displayedText.setVisible(false);
                this.cursor.setVisible(true);
                this.cursorBlink.resume();
                this.setupKeyboardListener();
            });

        this.nameInput = this.scene.add.text(0, 80, '', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Pixelify Sans'
        }).setOrigin(0.5);

        this.displayedText = this.scene.add.text(0, 80, '', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Pixelify Sans'
        }).setOrigin(0.5);

        this.cursor = this.scene.add.text(0, 80, '|', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Pixelify Sans'
        }).setOrigin(0.5).setVisible(false);

        this.cursorBlink = this.scene.tweens.add({
            targets: this.cursor,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1,
            paused: true
        });

        this.warningText = this.scene.add.text(0, 110, '', {
            fontSize: '14px',
            color: '#ff0000',
            fontFamily: 'Pixelify Sans'
        }).setOrigin(0.5).setVisible(false);

        this.mintButton = this.scene.add.rectangle(0, 150, 200, 50, 0x4a90e2)
            .setInteractive()
            .on('pointerdown', () => {
                if (this.isEditing) {
                    this.completeTextInput();
                }
                this.handleMint();
            })
            .on('pointerover', () => this.mintButton.setFillStyle(0x3a80d2))
            .on('pointerout', () => this.mintButton.setFillStyle(0x4a90e2));

        const mintText = this.scene.add.text(0, 150, 'Mint NFT', {
            fontFamily: 'Pixelify Sans',
            fontSize: '18px',
            color: '#ffffff',
        }).setOrigin(0.5);

        // 로딩 텍스트 추가
        this.loadingText = this.scene.add.text(0, 200, '', {
            fontFamily: 'Pixelify Sans',
            fontSize: '18px',
            color: '#4a90e2',
        }).setOrigin(0.5).setVisible(false);

        this.container.add([
            panel,
            nftBorder,
            this.nftPreview,
            darkOverlay,
            questionMark,
            titleText,
            descText,
            inputLabel,
            inputBg,
            this.nameInput,
            this.displayedText,
            this.cursor,
            this.warningText,
            this.mintButton,
            mintText,
            exitBtn,
            this.loadingText
        ]);

        this.nameInput.setVisible(false);
    }

    setupKeyboardListener() {
        if (this.keyboardListener) {
            this.scene.input.keyboard.off('keydown', this.keyboardListener);
        }

        this.keyboardListener = (event) => {
            if (!this.isEditing) return;

            if (event.keyCode === 8) {
                this.nameInput.text = this.nameInput.text.slice(0, -1);
            } else if (event.keyCode === 27) {
                this.cancelTextInput();
            } else if (event.keyCode === 16) {
                return;
            } else {
                const isValidInput = /^[a-zA-Z0-9]$/.test(event.key);
                if (isValidInput && this.nameInput.text.length < 12) {
                    this.nameInput.text += event.key;
                } else if (!isValidInput && event.keyCode !== 16) {
                    this.showWarning('영어와 숫자만 입력 가능합니다');
                } else if (this.nameInput.text.length >= 12) {
                    this.showWarning('최대 12자까지 입력 가능합니다');
                }
            }
            this.nameInput.setText(this.nameInput.text);
            this.displayedText.setText(this.nameInput.text);
            this.cursor.x = this.nameInput.x + (this.nameInput.width / 2) + 5;
        };

        this.scene.input.keyboard.on('keydown', this.keyboardListener);
    }

    showWarning(message) {
        this.warningText.setText(message);
        this.warningText.setVisible(true);
        setTimeout(() => this.warningText.setVisible(false), 2000);
    }

    completeTextInput() {
        if (this.nameInput.text.length < 2) {
            this.showWarning('최소 2자 이상 입력해주세요');
            return;
        }
        this.isEditing = false;
        this.nameInput.setVisible(false);
        this.displayedText.setVisible(true);
        this.displayedText.setText(this.nameInput.text);
        this.cursor.setVisible(false);
        this.cursorBlink.pause();
        if (this.keyboardListener) {
            this.scene.input.keyboard.off('keydown', this.keyboardListener);
            this.keyboardListener = null;
        }
    }

    cancelTextInput() {
        this.isEditing = false;
        this.nameInput.setVisible(false);
        this.displayedText.setVisible(true);
        this.cursor.setVisible(false);
        this.cursorBlink.pause();
        if (this.keyboardListener) {
            this.scene.input.keyboard.off('keydown', this.keyboardListener);
            this.keyboardListener = null;
        }
    }

    setupDragBehavior(panel, container) {
        panel.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.dragStartPos = {
                x: pointer.x - container.x,
                y: pointer.y - container.y
            };
        });

        this.scene.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                container.x = pointer.x - this.dragStartPos.x;
                container.y = pointer.y - this.dragStartPos.y;
            }
        });

        this.scene.input.on('pointerup', () => {
            this.isDragging = false;
        });
    }

    startLoadingAnimation() {
        this.loadingText.setVisible(true);
        this.loadingDots = '';
        if (this.loadingTimer) clearInterval(this.loadingTimer);
        
        // Mint 버튼 비활성화
        this.mintButton.setFillStyle(0x666666);
        this.mintButton.disableInteractive();
        
        this.loadingTimer = setInterval(() => {
            this.loadingDots = this.loadingDots.length >= 3 ? '' : this.loadingDots + '.';
            this.loadingText.setText('Minting in progress' + this.loadingDots);
        }, 500);
    }

    stopLoadingAnimation() {
        if (this.loadingTimer) {
            clearInterval(this.loadingTimer);
            this.loadingTimer = null;
        }
        this.loadingText.setVisible(false);
        
        // Mint 버튼 활성화
        this.mintButton.setFillStyle(0x4a90e2);
        this.mintButton.setInteractive();
    }

    async handleMint() {
        const currentText = this.isEditing ? this.nameInput.text : this.displayedText.text;
        
        if (!currentText) {
            this.showWarning('닉네임을 입력해주세요');
            return;
        }

        if (currentText.length < 2) {
            this.showWarning('최소 2자 이상 입력해주세요');
            return;
        }

        if (this.isAnimating) return;
        this.isAnimating = true;

        this.startLoadingAnimation();

        try {
            const res = await axios.post('http://localhost:3000/register', {
                userId: gameData.getWalletAddress(),
                userAddress: gameData.getWalletAddress(),
                userNickname: currentText,
                type: "BrowserWallet"
            });

            this.stopLoadingAnimation();

            this.generatedNFT = {
                baseEggNumber: res.data.baseEggNumber,
                colorSet: res.data.colorSet,
                imageBase64: res.data.imageBase64,
                seed: res.data.seed,
                tokenId: res.data.tokenId,
                txHash: res.data.txHash
            };

            // Base64 이미지를 텍스처로 로드하기 전에 이미지 객체로 변환
            const image = new Image();
            image.onload = () => {
                const key = 'nft-' + this.generatedNFT.tokenId;
                this.scene.textures.addImage(key, image);
                this.startGachaAnimation();
            };
            image.src = this.generatedNFT.imageBase64;

        } catch (error) {
            console.error('Minting failed:', error);
            this.showWarning('NFT 생성에 실패했습니다');
            this.isAnimating = false;
            this.stopLoadingAnimation();
        }
    }

    startGachaAnimation() {
        // 기존 UI 요소들 페이드아웃
        this.scene.tweens.add({
            targets: this.container.list.filter(item => item !== this.nftPreview),
            alpha: 0,
            duration: 500
        });

        // 달걀 중앙으로 이동 및 크기 확대
        this.scene.tweens.add({
            targets: this.nftPreview,
            x: 0,
            y: 0,
            scaleX: 8,
            scaleY: 8,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // 달걀 흔들기 애니메이션
                this.scene.tweens.add({
                    targets: this.nftPreview,
                    angle: { from: -5, to: 5 },
                    duration: 100,
                    yoyo: true,
                    repeat: 10,
                    onComplete: () => {
                        // 부화 효과 및 결과 표시
                        this.showHatchingEffect();
                    }
                });
            }
        });
    }

    showHatchingEffect() {
        // 부화 파티클 효과
        const particles = this.scene.add.particles(0, 0, 'customParticle', {
            x: this.scene.cameras.main.centerX,
            y: this.scene.cameras.main.centerY,
            lifespan: { min: 800, max: 1500 },
            speed: { min: 150, max: 350 },
            scale: { start: 1, end: 0.2 },
            quantity: 1,
            frequency: 50,
            angle: { min: 0, max: 360 },
            rotate: { min: 0, max: 360 },
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
            emitting: true
        });

        // 달걀 페이드아웃 및 캐릭터 페이드인
        this.scene.tweens.add({
            targets: this.nftPreview,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                // 파티클 폭발 효과
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        particles.explode(20);
                    }, i * 200);
                }
                
                setTimeout(() => {
                    particles.destroy();
                    // 여기서 결과 모달 표시
                    this.showResultModal();
                }, 1500);
            }
        });
    }
    showResultModal() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        if (this.inputElement) {
            this.inputElement.remove();
            this.inputElement = null;
        }

        if (!this.generatedNFT) {
            console.error('No NFT data found');
            return;
        }

        // 화면 크기 및 모달 크기 설정
        const { width: screenWidth, height: screenHeight } = this.scene.cameras.main;
        const isMobile = screenWidth < 768;
        const modalWidth = screenWidth * (isMobile ? 0.95 : 0.8);
        const modalHeight = screenHeight * 0.75;
        
        // 여백 및 섹션 높이 계산 - 간격 최적화
        const padding = modalHeight * 0.02; // 패딩 증가
        const headerHeight = modalHeight * 0.12;
        const nftSectionHeight = modalHeight * 0.4;
        const infoSectionHeight = modalHeight * 0.28; // 정보 섹션 높이 증가
        const buttonSectionHeight = modalHeight * 0.18;

        this.container = this.scene.add.container(screenWidth / 2, -screenHeight).setDepth(201);

        const panel = this.scene.add.rectangle(0, 0, modalWidth, modalHeight, 0x1a1a1a)
            .setStrokeStyle(3, 0x4a90e2);
        const glowEffect = this.scene.add.rectangle(0, 0, modalWidth + 8, modalHeight + 8, 0x4a90e2, 0.2)
            .setBlendMode(Phaser.BlendModes.ADD);

        const congratsText = this.scene.add.text(0, -modalHeight/2 + headerHeight/2, '✨ Congratulations! ✨', {
            fontFamily: 'Pixelify Sans',
            fontSize: isMobile ? '32px' : '48px',
            color: '#4a90e2',
        }).setOrigin(0.5);

        // NFT 섹션
        const nftContainer = this.scene.add.container(0, -modalHeight/2 + headerHeight + nftSectionHeight/2);
        const nftSize = Math.min(modalWidth * 0.4, nftSectionHeight * 0.8);
        const nftFrame = this.scene.add.rectangle(0, 0, nftSize, nftSize, 0x2a2a2a)
            .setStrokeStyle(2, 0x4a90e2);
        const nftImage = this.scene.add.image(0, 0, 'nft-' + this.generatedNFT.tokenId)
            .setScale(0)
            .setAlpha(0)
            .setOrigin(0.5);

        const textContainer = this.scene.add.container(0, nftSize/2 + padding * 1.5);
        
        const nicknameText = this.scene.add.text(0, 0, 
            this.isEditing ? this.nameInput.text : this.displayedText.text, {
            fontFamily: 'Pixelify Sans',
            fontSize: isMobile ? '28px' : '36px',
            color: '#ffffff',
        }).setOrigin(0.5);

        const tokenIdText = this.scene.add.text(0, nicknameText.height + padding,
            `🔷 Token ID: ${this.generatedNFT.tokenId}`, {
            fontFamily: 'Pixelify Sans',
            fontSize: isMobile ? '16px' : '20px',
            color: '#4a90e2',
        }).setOrigin(0.5);

        textContainer.add([nicknameText, tokenIdText]);

        // 정보 섹션 - 간격 조정
        const infoContainer = this.scene.add.container(0, -modalHeight/2 + headerHeight + nftSectionHeight + infoSectionHeight/2);
        const nftInfoText = this.scene.add.text(0, -infoSectionHeight * 0.1,
            `🥚 Base Egg: #${this.generatedNFT.baseEggNumber}`, {
            fontFamily: 'Pixelify Sans',
            fontSize: isMobile ? '18px' : '22px',
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5);

        // const colorSetText = this.scene.add.text(0, 0,
        //     `🎨 Color Set: ${this.generatedNFT.colorSet}`, {
        //     fontFamily: 'Pixelify Sans',
        //     fontSize: isMobile ? '18px' : '22px',
        //     color: '#cccccc',
        //     align: 'center'
        // }).setOrigin(0.5);

        const seedText = this.scene.add.text(0, infoSectionHeight * 0.1,
            `🌱 Seed: ${this.generatedNFT.seed.substring(0, 8)}...`, {
            fontFamily: 'Pixelify Sans',
            fontSize: isMobile ? '18px' : '22px',
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5);

        const descText = this.scene.add.text(0, infoSectionHeight * 0.4, 
            '🎉 Your unique Origin-Forge NFT\nhas been successfully minted! 🎉', {
            fontFamily: 'Pixelify Sans',
            fontSize: isMobile ? '16px' : '20px',
            color: '#4a90e2',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5);

        // 버튼 섹션 - 새로운 디자인
        const buttonContainer = this.scene.add.container(0, modalHeight/2 - buttonSectionHeight/2);
        const buttonWidth = modalWidth * 0.35; // 버튼 너비 증가
        const buttonSpacing = modalWidth * 0.06;
        const buttonHeight = buttonSectionHeight * 0.6;
        const buttonRadius = 15; // 라운드 증가

        // 메인 메뉴 버튼
        const mainMenuButton = this.scene.add.graphics();
        mainMenuButton.fillGradientStyle(0x6c5ce7, 0x5c4cd7, 0x4c3cc7, 0x4c3cc7, 1);
        mainMenuButton.fillRoundedRect(-buttonWidth - buttonSpacing/2, -buttonHeight/2, buttonWidth, buttonHeight, buttonRadius);
        mainMenuButton.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth - buttonSpacing/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => this.scene.scene.start('MainMenu'))
            .on('pointerover', () => {
                mainMenuButton.clear();
                mainMenuButton.fillGradientStyle(0x7c6cf7, 0x6c5ce7, 0x5c4cd7, 0x5c4cd7, 1);
                mainMenuButton.fillRoundedRect(-buttonWidth - buttonSpacing/2, -buttonHeight/2, buttonWidth, buttonHeight, buttonRadius);
            })
            .on('pointerout', () => {
                mainMenuButton.clear();
                mainMenuButton.fillGradientStyle(0x6c5ce7, 0x5c4cd7, 0x4c3cc7, 0x4c3cc7, 1);
                mainMenuButton.fillRoundedRect(-buttonWidth - buttonSpacing/2, -buttonHeight/2, buttonWidth, buttonHeight, buttonRadius);
            });

        // Close 버튼 텍스트를 버튼의 정중앙에 위치
        const mainMenuText = this.scene.add.text(-buttonWidth - buttonSpacing/2 + buttonWidth/2, 0, 
            'Close', {
            fontFamily: 'Pixelify Sans',
            fontSize: isMobile ? '18px' : '24px',
            color: '#ffffff',
        }).setOrigin(0.5);

        // OpenSea 버튼
        const openSeaButton = this.scene.add.graphics();
        openSeaButton.fillGradientStyle(0x2081E2, 0x1569AF, 0x1569AF, 0x1569AF, 1);
        openSeaButton.fillRoundedRect(buttonSpacing/2, -buttonHeight/2, buttonWidth, buttonHeight, buttonRadius);
        openSeaButton.setInteractive(new Phaser.Geom.Rectangle(buttonSpacing/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => {
                window.open(`https://opensea.io/assets/ethereum/CONTRACT_ADDRESS/${this.generatedNFT.tokenId}`, '_blank');
            })
            .on('pointerover', () => {
                openSeaButton.clear();
                openSeaButton.fillGradientStyle(0x3091F2, 0x2081E2, 0x2081E2, 0x2081E2, 1);
                openSeaButton.fillRoundedRect(buttonSpacing/2, -buttonHeight/2, buttonWidth, buttonHeight, buttonRadius);
            })
            .on('pointerout', () => {
                openSeaButton.clear();
                openSeaButton.fillGradientStyle(0x2081E2, 0x1569AF, 0x1569AF, 0x1569AF, 1);
                openSeaButton.fillRoundedRect(buttonSpacing/2, -buttonHeight/2, buttonWidth, buttonHeight, buttonRadius);
            });

        // OpenSea 텍스트를 버튼의 정중앙에 위치
        const openSeaText = this.scene.add.text(buttonSpacing/2 + buttonWidth/2, 0, 
            'OpenSea', {
            fontFamily: 'Pixelify Sans',
            fontSize: isMobile ? '18px' : '24px',
            color: '#ffffff',
        }).setOrigin(0.5);

        buttonContainer.add([mainMenuButton, mainMenuText, openSeaButton, openSeaText]);
        nftContainer.add([nftFrame, nftImage, textContainer]);
        infoContainer.add([nftInfoText, seedText, descText]);
        
        this.container.add([
            glowEffect,
            panel,
            congratsText,
            nftContainer,
            infoContainer,
            buttonContainer
        ]);

        // 등장 애니메이션
        this.scene.tweens.add({
            targets: this.container,
            y: screenHeight / 2,
            duration: 1000,
            ease: 'Bounce.easeOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: nftImage,
                    scaleX: isMobile ? 1.2 : 1.4,
                    scaleY: isMobile ? 1.2 : 1.4,
                    alpha: 1,
                    duration: 1000,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        this.scene.tweens.add({
                            targets: nftImage,
                            scaleX: { from: isMobile ? 1.2 : 1.4, to: isMobile ? 1.3 : 1.5 },
                            scaleY: { from: isMobile ? 1.2 : 1.4, to: isMobile ? 1.3 : 1.5 },
                            duration: 1500,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });

                        this.scene.tweens.add({
                            targets: glowEffect,
                            alpha: { from: 0.2, to: 0.4 },
                            duration: 1000,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                        
                        this.createResultParticles();
                    }
                });
            }
        });
    }

    createResultParticles() {
        const particles = this.scene.add.particles(0, 0, 'customParticle', {
            x: this.scene.cameras.main.centerX,
            y: this.scene.cameras.main.centerY,
            lifespan: { min: 1500, max: 3000 },
            speed: { min: 100, max: 300 },
            scale: { start: 0.8, end: 0.1 },
            quantity: 1,
            frequency: 100,
            angle: { min: 0, max: 360 },
            rotate: { min: 0, max: 360 },
            alpha: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            emitting: true
        }).setDepth(202);

        setTimeout(() => particles.destroy(), 3000);
    }

    destroy() {
        // 모달 배경 제거
        if (this.modalBg) {
            this.modalBg.destroy();
            this.modalBg = null;
        }

        // 컨테이너와 모든 UI 요소 제거
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }

        // 키보드 리스너 제거
        if (this.keyboardListener) {
            this.scene.input.keyboard.off('keydown', this.keyboardListener);
            this.keyboardListener = null;
        }

        // 로딩 애니메이션 타이머 제거
        if (this.loadingTimer) {
            clearInterval(this.loadingTimer);
            this.loadingTimer = null;
        }

        // 모든 트윈 애니메이션 정리
        this.scene.tweens.killAll();
        
        // MainMenu 씬 재개
        this.scene.scene.resume('MainMenu');
        
        // 현재 씬 참조 제거
        this.scene = null;
    }
}
