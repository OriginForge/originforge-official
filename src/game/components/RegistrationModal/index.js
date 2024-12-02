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

        const mintButton = this.scene.add.rectangle(0, 150, 200, 50, 0x4a90e2)
            .setInteractive()
            .on('pointerdown', () => {
                if (this.isEditing) {
                    this.completeTextInput();
                }
                this.handleMint();
            })
            .on('pointerover', () => mintButton.setFillStyle(0x3a80d2))
            .on('pointerout', () => mintButton.setFillStyle(0x4a90e2));

        const mintText = this.scene.add.text(0, 150, 'Mint NFT', {
            fontFamily: 'Pixelify Sans',
            fontSize: '18px',
            color: '#ffffff',
        }).setOrigin(0.5);

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
            mintButton,
            mintText,
            exitBtn
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

        try {
            // RandomGenerator 씬 가져오기
            let randomGenerator = this.scene.scene.get('RandomGenerator');
            
            // RandomGenerator 씬이 없으면 시작
            if (!randomGenerator) {
                this.scene.scene.launch('RandomGenerator');
                randomGenerator = this.scene.scene.get('RandomGenerator');
                // 씬이 완전히 로드될 때까지 대기
                await new Promise(resolve => {
                    randomGenerator.events.once('create', resolve);
                });
            }

            // NFT 생성
            this.generatedNFT = await randomGenerator.generateNFT(this.scene);
            
            // 뽑기 애니메이션 시작
            this.startGachaAnimation();
        } catch (error) {
            console.error('Minting failed:', error);
            this.showWarning('NFT 생성에 실패했습니다');
            this.isAnimating = false;
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

        this.container = this.scene.add.container(
            this.scene.cameras.main.centerX,
            -this.scene.cameras.main.height
        ).setDepth(201);

        const panel = this.scene.add.rectangle(0, 0, 600, 700, 0x1a1a1a)
            .setStrokeStyle(4, 0x4a90e2);

        const congratsText = this.scene.add.text(0, -250, 'Congratulations!', {
            fontFamily: 'Pixelify Sans',
            fontSize: '48px',
            color: '#4a90e2',
        }).setOrigin(0.5);

        const nftContainer = this.scene.add.container(0, 0);
        const nftFrame = this.scene.add.rectangle(0, 0, 150, 150, 0x2a2a2a)
            .setStrokeStyle(3, 0x4a90e2);
        
        // 생성된 NFT 이미지 표시
        const nftImage = this.scene.add.sprite(0, 0, this.generatedNFT.textureKey)
            .setScale(0)
            .setAlpha(0);

        const nicknameText = this.scene.add.text(0, 180, this.isEditing ? this.nameInput.text : this.displayedText.text, {
            fontFamily: 'Pixelify Sans',
            fontSize: '32px',
            color: '#ffffff',
        }).setOrigin(0.5);

        const descText = this.scene.add.text(0, 250, 'Your unique Origin-Forge NFT\nhas been successfully minted!', {
            fontFamily: 'Pixelify Sans',
            fontSize: '24px',
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5);

        const confirmButton = this.scene.add.rectangle(0, 300, 200, 50, 0x4a90e2)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.scene.start('MainMenu');
            })
            .on('pointerover', () => confirmButton.setFillStyle(0x3a80d2))
            .on('pointerout', () => confirmButton.setFillStyle(0x4a90e2));

        const confirmText = this.scene.add.text(0, 300, 'Awesome!', {
            fontFamily: 'Pixelify Sans',
            fontSize: '24px',
            color: '#ffffff',
        }).setOrigin(0.5);

        nftContainer.add([nftFrame, nftImage]);
        this.container.add([
            panel,
            congratsText,
            nftContainer,
            nicknameText,
            descText,
            confirmButton,
            confirmText
        ]);

        // 모달 애니메이션
        this.scene.tweens.add({
            targets: this.container,
            y: this.scene.cameras.main.centerY,
            duration: 1000,
            ease: 'Bounce',
            onComplete: () => {
                // NFT 이미지 페이드인 및 스케일 애니메이션
                this.scene.tweens.add({
                    targets: nftImage,
                    scaleX: 5,
                    scaleY: 5,
                    alpha: 1,
                    duration: 1000,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        // 숨쉬는 듯한 애니메이션
                        this.scene.tweens.add({
                            targets: nftImage,
                            scaleX: { from: 5, to: 5.2 },
                            scaleY: { from: 5, to: 5.2 },
                            duration: 1000,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                        
                        // 결과 화면에서 파티클 효과 생성
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

        // 모든 트윈 애니메이션 정리
        this.scene.tweens.killAll();
        
        // MainMenu 씬 재개
        this.scene.scene.resume('MainMenu');
        
        // 현재 씬 참조 제거
        this.scene = null;
    }
}