import { Scene } from 'phaser';
import { Lang } from '../../managers/LanguageManager';

export default class Dialog {
    constructor(scene) {
        this.scene = scene;
        this.isSkipped = false;
        this.currentText = '';
        this.currentLineIndex = 0;
        this.charIndex = 0;
        this.typewriterTimer = null;
        this.panel = null;
        this.text = null;
        this.keyListeners = [];
        this.content = [];
        this.helpText = null;
        this.scrollMask = null;
        this.scrollPosition = 0;
        this.isDragging = false;
        this.dragStartY = 0;
        this.maskGraphics = null;
        this.resizeListener = null;
    }

    show(options = {}) {
        const {
            content = [],
            style = {
                fontFamily: 'Pixelify Sans',
                fontSize: '25px',
                align: 'center'
            },
            typewriterSpeed = 100
        } = options;

        this.content = content;
        this.createDialog(style, typewriterSpeed);

        // 리사이즈 이벤트 리스너 추가
        this.resizeListener = () => {
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }
            this.resizeTimeout = setTimeout(() => {
                this.updateDialogPosition();
            }, 100);
        };
        window.addEventListener('resize', this.resizeListener);

        return this;
    }

    createDialog(style, typewriterSpeed) {
        // 화면 크기 가져오기
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        
        // 패널 크기 계산 (높이는 화면의 1/4)
        const panelWidth = screenWidth;
        const panelHeight = screenHeight / 4;

        // 패널 위치 계산 (하단 중앙)
        const panelX = screenWidth / 2;
        const panelY = screenHeight - (panelHeight / 2);

        // 패널 생성 - 크기를 0.8배로 축소
        this.panel = this.scene.add.image(panelX, panelY, 'dialog_box')
            .setScale(0.8)
            .setDisplaySize(panelWidth, panelHeight)
            .setDepth(1)
            .setInteractive();

        // 패널 애니메이션 시작
        this.scene.tweens.add({
            targets: this.panel,
            scaleY: 0.8,
            duration: 1000,
            ease: 'sine.inout',
            from: { scaleY: 0 },
            onComplete: () => {
                this.setupDialogComponents(panelX, panelY, panelWidth, panelHeight, style);
                this.startTypewriter(typewriterSpeed);
            }
        });
    }

    setupDialogComponents(panelX, panelY, panelWidth, panelHeight, style) {
        // 마스크 생성 (스크롤 영역 제한)
        this.maskGraphics = this.scene.add.graphics();
        this.updateMask(panelX, panelY, panelWidth, panelHeight);

        // 텍스트 생성
        this.text = this.scene.add.text(panelX, panelY, '', style)
            .setOrigin(0.5)
            .setDepth(1)
            .setWordWrapWidth(panelWidth - 100)
            .setMask(this.scrollMask);

        // 도움말 텍스트 추가
        this.helpText = this.scene.add.text(
            panelX, 
            panelY + (panelHeight/2) - 30, 
            '[Space/Enter] 스킵  [ESC] 닫기  드래그로 스크롤', 
            {
                fontFamily: 'Pixelify Sans',
                fontSize: '16px',
                color: '#888888'
            }
        )
            .setOrigin(0.5)
            .setDepth(1);

        this.setupKeyboardListeners();
        this.setupDragListeners();
    }

    updateDialogPosition() {
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        const panelWidth = screenWidth;
        const panelHeight = screenHeight / 4;
        const panelX = screenWidth / 2;
        const panelY = screenHeight - (panelHeight / 2);

        // 패널 위치 및 크기 업데이트
        this.panel.setPosition(panelX, panelY)
            .setDisplaySize(panelWidth, panelHeight);

        // 마스크 업데이트
        this.updateMask(panelX, panelY, panelWidth, panelHeight);

        // 텍스트 위치 및 래핑 업데이트
        if (this.text) {
            this.text.setPosition(panelX, panelY)
                .setWordWrapWidth(panelWidth - 100);
        }

        // 도움말 텍스트 위치 업데이트
        if (this.helpText) {
            this.helpText.setPosition(panelX, panelY + (panelHeight/2) - 30);
        }
    }

    updateMask(panelX, panelY, panelWidth, panelHeight) {
        if (this.maskGraphics) {
            this.maskGraphics.clear();
            this.maskGraphics.fillStyle(0xffffff, 0);
            this.maskGraphics.fillRect(
                panelX - (panelWidth - 100)/2,
                panelY - (panelHeight - 80)/2,
                panelWidth - 100,
                panelHeight - 80
            );
            
            if (this.scrollMask) {
                this.scrollMask.destroy();
            }
            this.scrollMask = this.maskGraphics.createGeometryMask();
            if (this.text) {
                this.text.setMask(this.scrollMask);
            }
        }
    }

    setupKeyboardListeners() {
        const skipHandler = () => this.skip();
        const escapeHandler = () => this.destroy();
        
        this.keyListeners = [
            { key: 'SPACE', handler: skipHandler },
            { key: 'ENTER', handler: skipHandler },
            { key: 'ESC', handler: escapeHandler }
        ];

        this.keyListeners.forEach(({ key, handler }) => {
            this.scene.input.keyboard.on(`keydown-${key}`, handler);
        });
    }

    setupDragListeners() {
        this.panel.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.dragStartY = pointer.y;
        });

        this.scene.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                const deltaY = this.dragStartY - pointer.y;
                this.scroll(deltaY);
                this.dragStartY = pointer.y;
            }
        });

        this.scene.input.on('pointerup', () => {
            this.isDragging = false;
        });
    }

    scroll(delta) {
        if (!this.text) return;

        const maxScroll = Math.max(0, this.text.height - (this.scene.cameras.main.height / 4 - 80));
        this.scrollPosition = Phaser.Math.Clamp(
            this.scrollPosition + delta,
            0,
            maxScroll
        );
        
        this.text.setY(
            this.scene.cameras.main.height - (this.scene.cameras.main.height / 8) - this.scrollPosition
        );
    }

    startTypewriter(delay) {
        this.typewriterTimer = this.scene.time.addEvent({
            delay,
            callback: () => {
                if (!this.isSkipped && this.currentLineIndex < this.content.length) {
                    if (this.charIndex < this.content[this.currentLineIndex].length) {
                        this.currentText += this.content[this.currentLineIndex][this.charIndex];
                        this.text.setText(this.currentText);
                        this.charIndex++;
                    } else {
                        this.currentText += '\n';
                        this.currentLineIndex++;
                        this.charIndex = 0;
                    }
                }
            },
            repeat: -1
        });
    }

    skip() {
        if (!this.isSkipped) {
            this.isSkipped = true;
            this.currentText = this.content.join('\n');
            this.text.setText(this.currentText);
            if (this.typewriterTimer) {
                this.typewriterTimer.remove();
            }
        }
    }

    destroy() {
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
        }

        this.keyListeners.forEach(({ key, handler }) => {
            this.scene.input.keyboard.off(`keydown-${key}`, handler);
        });
        
        if (this.typewriterTimer) {
            this.typewriterTimer.remove();
        }
        
        if (this.panel) {
            this.panel.destroy();
        }
        
        if (this.text) {
            this.text.destroy();
        }

        if (this.helpText) {
            this.helpText.destroy();
        }

        if (this.scrollMask) {
            this.scrollMask.destroy();
        }

        if (this.maskGraphics) {
            this.maskGraphics.destroy();
        }
    }
}