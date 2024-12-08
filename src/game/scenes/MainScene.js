import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import Dialog from '../components/Dialog/Dialog';
import {gameData} from '../managers/GameDataManager';
import axios from 'axios';
import RegistrationModal from '../components/RegistrationModal/index'
export default class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
        this.background = null;
        this.spawnArea = null;
        this.stars = [];
        this.dusts = [];
        this.resizeTimeout = null;
        this.isAnimating = false;
        this.lastGameSize = null; // 마지막 게임 사이즈 저장
        this.planetContainer = null; // 행성 컨테이너 추가
        this.imageGenerator = null;
        // 카메라 초기화
        this.cameraConfig = {
            width: 0,
            height: 0,
            centerX: 0,
            centerY: 0
        };
    }

    init() {
        // 카메라 설정 업데이트
        this.cameraConfig.width = this.scale.width;
        this.cameraConfig.height = this.scale.height;
        this.cameraConfig.centerX = this.scale.width / 2;
        this.cameraConfig.centerY = this.scale.height / 2;

        this.cameras.main.fadeIn(100);
        const fxCamera = this.cameras.main.postFX.addPixelate(40);
        this.add.tween({
            targets: fxCamera,
            duration: 700,
            amount: -1,
        });
        
        this.isZoomed = false;
        this.currentZoomedPlanet = null;
        this.zoomInProgress = false;
        
        // 초기 게임 사이즈 저장
        this.lastGameSize = {
            width: this.scale.width,
            height: this.scale.height
        };
    }

    preload() {
    }
    create() {
        // 카메라 설정 업데이트
        this.cameraConfig.width = this.scale.width;
        this.cameraConfig.height = this.scale.height;
        this.cameraConfig.centerX = this.scale.width / 2;
        this.cameraConfig.centerY = this.scale.height / 2;

        this.background = this.add.image(this.cameraConfig.centerX, this.cameraConfig.centerY, 'background');
        this.updateBackgroundScale();
        // 잠시 주석
        // this.crateRandomGenButton()        
        this.spawnArea = this.calculateSpawnArea();

        EventBus.emit('current-scene-ready', this);    
        
        this.createBackgroundAnimation();
        this.createPlanetAnimation();        
    
        const dialog = new Dialog(this);
        dialog.show({
            content: [
                'The sky above the port was the color of television, tuned to a dead channel.',
                '`It\'s not like I\'m using,\' Case heard someone say, as he shouldered his way ',
                'through the crowd around the door of the Chat. `It\'s like my body\'s developed',
                'this massive drug deficiency.\' It was a Sprawl voice and a Sprawl joke.',
                'The Chatsubo was a bar for professional expatriates; you could drink there for',
                'a week and never hear two words in Japanese.',
            ],
            style: {
                fontFamily: 'Pixelify Sans',
                fontSize: '20px',
                color: '#ffffff',
            },
            width: 500,
            height: 400,
            typewriterSpeed: 50,
        });
        
        this.scale.on('resize', this.handleResize, this);

        // check-wallet 이벤트 리스너 추가
        EventBus.on('check-wallet', () => {
            this.checkWallet();
        });
    }
    

    calculateSpawnArea() {
        return {
            x: -this.cameraConfig.width * 2,
            y: -this.cameraConfig.height * 2,
            width: this.cameraConfig.width * 5,
            height: this.cameraConfig.height * 5
        };
    }

    handleResize(gameSize) {
        // 최소 크기 변화 체크 (10픽셀 이상 차이날 때만 리사이즈 처리)
        const sizeChanged = Math.abs(this.lastGameSize.width - gameSize.width) > 10 || 
                          Math.abs(this.lastGameSize.height - gameSize.height) > 10;
                          
        if (!sizeChanged) return;

        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        this.resizeTimeout = setTimeout(() => {
            this.lastGameSize = {
                width: gameSize.width,
                height: gameSize.height
            };
            
            // 카메라 설정 업데이트
            this.cameraConfig.width = gameSize.width;
            this.cameraConfig.height = gameSize.height;
            this.cameraConfig.centerX = gameSize.width / 2;
            this.cameraConfig.centerY = gameSize.height / 2;
            
            this.updateBackgroundScale();
            
            if (this.isAnimating) {
                this.cleanupAnimations();
            }

            // 행성 위치 업데이트
            if (this.planetContainer) {
                this.planetContainer.setPosition(this.cameraConfig.centerX, this.cameraConfig.centerY);
            }

            this.spawnArea = this.calculateSpawnArea();
            this.createBackgroundAnimation();
            
        }, 200);
    }

    cleanupAnimations() {
        this.stars.forEach(star => {
            if (star.tween) {
                star.tween.remove();
            }
            star.destroy();
        });
        this.dusts.forEach(dust => {
            if (dust.tween) {
                dust.tween.remove();
            }
            dust.destroy();
        });
        this.stars = [];
        this.dusts = [];
    }

    updateBackgroundScale() {
        if (this.background) {
            const scaleX = this.cameraConfig.width / this.background.width;
            const scaleY = this.cameraConfig.height / this.background.height;
            const scale = Math.max(scaleX, scaleY);
            
            this.background.setPosition(this.cameraConfig.centerX, this.cameraConfig.centerY)
                          .setScale(scale);
        }
    }

    createPlanetAnimation() {
        const tooltipStyle = {
            fontFamily: 'Pixelify Sans',
            fontSize: '20px',
            color: '#ffffff',
            padding: { x: 15, y: 10 },
            fontWeight: '500',
            fontStyle: 'normal'
        };

        this.planetContainer = this.add.container(this.cameraConfig.centerX, this.cameraConfig.centerY);

        const tooltipBg = this.add.graphics();
        tooltipBg.fillStyle(0x000000, 0.8);
        tooltipBg.lineStyle(2, 0x4a90e2);
        tooltipBg.fillRoundedRect(-100, -160, 200, 40, 10);
        tooltipBg.strokeRoundedRect(-100, -160, 200, 40, 10);
        tooltipBg.setAlpha(0);

        const nodePlanet = this.add.sprite(0, 0, 'nodePlanet');
        const tooltipText = this.add.text(0, -140, 'Origin-Forge Planet', tooltipStyle)
            .setOrigin(0.5)
            .setAlpha(0);

        this.planetContainer.add([nodePlanet, tooltipBg, tooltipText]);
        const isConnected = gameData.isConnected;
        nodePlanet.play('nodePlanet_anim').setScale(3).setInteractive()
            .on('pointerdown', () => {
                this.tweens.add({
                    targets: nodePlanet,
                    scale: 2.8,
                    duration: 100,
                    yoyo: true,
                    ease: 'Cubic.easeOut'
                });
                
                // nodePlanet.removeInteractive();
                // this.scene.launch('RegisterBox');
                
                
            })
            .on('pointerover', () => {
                this.tweens.add({
                    targets: [tooltipBg, tooltipText],
                    alpha: 1,
                    duration: 200,
                    ease: 'Cubic.easeOut'
                });
                
                this.tweens.add({
                    targets: nodePlanet,
                    scale: 3.2,
                    duration: 300,
                    ease: 'Cubic.easeOut'
                });
            })
            .on('pointerout', () => {
                this.tweens.add({
                    targets: [tooltipBg, tooltipText],
                    alpha: 0,
                    duration: 200,
                    ease: 'Cubic.easeIn'
                });
                
                this.tweens.add({
                    targets: nodePlanet,
                    scale: 3,
                    duration: 300,
                    ease: 'Cubic.easeOut'
                });
            });
    }

    createBackgroundAnimation() {
        if (!this.spawnArea) return;
        
        this.isAnimating = true;

        const starPool = this.stars.length ? this.stars : Array(1000).fill().map(() => 
            this.add.circle(0, 0, Phaser.Math.Between(1, 2), 0xFFFFFF)
        );
        
        const dustPool = this.dusts.length ? this.dusts : Array(500).fill().map(() => 
            this.add.circle(0, 0, 1, 0x8888FF, 0.3)
        );

        starPool.forEach(star => {
            if (!this.spawnArea) return;
            
            star.setPosition(
                Phaser.Math.Between(this.spawnArea.x, this.spawnArea.x + this.spawnArea.width),
                Phaser.Math.Between(this.spawnArea.y, this.spawnArea.y + this.spawnArea.height)
            );
            
            if (!star.tween) {
                star.tween = this.tweens.add({
                    targets: star,
                    alpha: 0.2,
                    duration: Phaser.Math.Between(1000, 3000),
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });

        dustPool.forEach(dust => {
            if (!this.spawnArea) return;
            
            dust.setPosition(
                Phaser.Math.Between(this.spawnArea.x, this.spawnArea.x + this.spawnArea.width),
                Phaser.Math.Between(this.spawnArea.y, this.spawnArea.y + this.spawnArea.height)
            );
            
            if (!dust.tween) {
                dust.tween = this.tweens.add({
                    targets: dust,
                    x: dust.x + Phaser.Math.Between(-200, 200),
                    y: dust.y + Phaser.Math.Between(-200, 200),
                    alpha: 0,
                    duration: Phaser.Math.Between(3000, 6000),
                    repeat: -1,
                    onRepeat: () => {
                        if (!this.spawnArea) return;
                        dust.setPosition(
                            Phaser.Math.Between(this.spawnArea.x, this.spawnArea.x + this.spawnArea.width),
                            Phaser.Math.Between(this.spawnArea.y, this.spawnArea.y + this.spawnArea.height)
                        );
                        dust.alpha = 0.3;
                    }
                });
            }
        });

        this.stars = starPool;
        this.dusts = dustPool;
    }

    async checkWallet() {
        const walletAddress = gameData.getWalletAddress();
        if(walletAddress) {
            // 반투명한 검은색 배경 추가
            const darkOverlay = this.add.rectangle(0, 0, 
                this.cameraConfig.width,
                this.cameraConfig.height,
                0x000000, 0.7
            ).setOrigin(0);
            darkOverlay.setDepth(100);

            // 모든 게임 오브젝트의 상호작용 비활성화
            this.input.enabled = false;

            // 로딩 텍스트 생성
            const loadingText = this.add.text(this.cameraConfig.centerX, this.cameraConfig.centerY, 'check wallet...', {
                fontFamily: 'Pixelify Sans',
                fontSize: '24px',
                color: '#ffffff'
            }).setOrigin(0.5);
            loadingText.setDepth(101);

            // 로딩 텍스트 애니메이션
            this.tweens.add({
                targets: loadingText,
                alpha: 0.3,
                duration: 800,
                ease: 'Power2',
                yoyo: true,
                repeat: -1
            });

            // 로딩 텍스트 점 애니메이션
            let dots = 0;
            const updateDots = () => {
                dots = (dots + 1) % 4;
                loadingText.setText('check wallet' + '.'.repeat(dots));
            };
            
            const dotTimer = this.time.addEvent({
                delay: 500,
                callback: updateDots,
                loop: true
            });

            try {
                // const response = await axios.get('https://api.origin-forge.com/isUser', {
                //     params: { walletAddress }
                // });
                
    
                // if(response.data.isUser) {
                //     alert('User is registered');
                // } else {
                    const registrationModal = new RegistrationModal(this);
                    registrationModal.show();
                // }
                
                dotTimer.destroy();
                loadingText.destroy();
                darkOverlay.destroy();
                this.input.enabled = true;
                
            } catch (error) {
                // 타이머 정지
                dotTimer.destroy();
                // 로딩 텍스트와 오버레이 제거
                loadingText.destroy();
                darkOverlay.destroy();
                // 상호작용 다시 활성화 
                this.input.enabled = true;
                console.error('Failed to check wallet:', error);
            }
        } else {
            console.log('Please connect your wallet to continue.');
        }
    }

    destroy() {
        this.cleanupAnimations();
        this.scale.off('resize', this.handleResize, this);
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        // check-wallet 이벤트 리스너 제거
        EventBus.off('check-wallet');
        super.destroy();
    }
}
