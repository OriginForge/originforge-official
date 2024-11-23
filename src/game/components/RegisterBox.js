import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export default class RegisterBox extends Scene {
    constructor() {
        super('RegisterBox');
        this.isDragging = false;
        this.isResizing = false;
        this.dragStartPos = { x: 0, y: 0 };
        this.startScale = 0.5;
        this.currentScale = this.startScale;
        this.resizeStartDistance = 0; // 리사이즈 시작 시의 거리
        this.resizeStartScale = 0; // 리사이즈 시작 시의 스케일
        this.padding = 0; // 컨테이너 내부 패딩 값
        this.isEditing = false; // 이름 편집 상태
        this.keyboardListener = null; // 키보드 리스너 저장용
        this.warningText = null; // 경고 텍스트를 위한 변수
    }

    create() {
        this.createRegisterContainer();
    }

    createRegisterContainer() {
        const registerBox = this.add.image(0, 0, 'modalBox_bg').setScale(this.currentScale);

        // 리사이즈 핸들 생성
        const resizeHandle = this.add.graphics();
        const drawResizeHandle = (color = 0xFFFFFF, lineWidth = 2) => {
            resizeHandle.clear();
            resizeHandle.lineStyle(lineWidth, color, 0.8);
            resizeHandle.beginPath();
            resizeHandle.moveTo(registerBox.displayWidth/2 - 15 - this.padding, registerBox.displayHeight/2 - this.padding);
            resizeHandle.lineTo(registerBox.displayWidth/2 - this.padding, registerBox.displayHeight/2 - this.padding);
            resizeHandle.lineTo(registerBox.displayWidth/2 - this.padding, registerBox.displayHeight/2 - 15 - this.padding);
            resizeHandle.strokePath();
        };
        
        drawResizeHandle();
        
        // 리사이즈 핸들의 히트 영역 설정
        const resizeHitArea = new Phaser.Geom.Rectangle(
            registerBox.displayWidth/2 - 15 - this.padding,
            registerBox.displayHeight/2 - 15 - this.padding,
            15,
            15
        );
        resizeHandle.setInteractive(resizeHitArea, Phaser.Geom.Rectangle.Contains);

        const exitBtn = this.add.image(
            registerBox.displayWidth/2 - 20 - this.padding, 
            -registerBox.displayHeight/2 + 20 + this.padding, 
            'prev_exitBtn'
        ).setScale(1.5);
        
        exitBtn.setInteractive();
        exitBtn.on('pointerover', () => {
            exitBtn.setTexture('exitBtn');
        });
        exitBtn.on('pointerout', () => {
            exitBtn.setTexture('prev_exitBtn');
        });
        exitBtn.on('pointerdown', () => {
            exitBtn.setTexture('exitBtn');
            alert('exit');
        });

        // 캐릭터 이미지와 관련 요소들을 담을 컨테이너 생성
        const characterContainer = this.add.container(
            0, // x 좌표를 0으로 설정하여 중앙 정렬
            -registerBox.displayHeight/2 + 70 + this.padding
        );
        
        const characterImage = this.add.image(0, 0, 'characterBox_com')
            .setScale(this.currentScale + 3);
        
        characterImage.setInteractive();
        characterImage.on('pointerover', () => {
            characterImage.setTexture('characterBox');
        });
        characterImage.on('pointerout', () => {
            characterImage.setTexture('characterBox_com');
        });
        characterImage.on('pointerdown', () => {
            characterImage.setTexture('characterBox');
            alert('exit');
        });

        const character = this.add.image(0, 0, 'character')
        character.preFX.addPixelate(-5);

        // 캐릭터 이름 컨테이너 생성 - 캐릭터 이미지 아래 중앙 정렬
        const characterNameContainer = this.add.container(
            0, // x 좌표를 0으로 설정하여 중앙 정렬
            characterContainer.y + characterImage.displayHeight - 40
        );
        const characterName = this.add.image(0, 0, 'character_name').setScale(this.currentScale + 0.7);
        const nameInput = this.add.text(0, 0, '', {
            fontSize: '26px',
            color: '#000000',
            fontStyle: 'bold',
            backgroundColor: '#ffffff'
        }).setOrigin(0.5);

        const displayedText = this.add.text(0, 0, '', {
            fontSize: '26px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 경고 메시지 텍스트 생성
        const warningText = this.add.text(0, 30, '', {
            fontSize: '16px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        warningText.setVisible(false);
        characterNameContainer.add([characterName, nameInput, displayedText, warningText]);
        nameInput.setVisible(false);
        
        characterName.setInteractive();
        characterName.on('pointerover', () => {
            characterName.setTexture('character_name_com');
        });
        characterName.on('pointerout', () => {
            if (!this.isEditing) {
                characterName.setTexture('character_name');
            }
        });
        
        // 키보드 이벤트 리스너 제거 함수
        const removeKeyboardListener = () => {
            if (this.keyboardListener) {
                this.input.keyboard.off('keydown', this.keyboardListener);
                this.keyboardListener = null;
            }
        };

        // 경고 메시지를 표시하고 숨기는 함수
        const showWarning = (message) => {
            warningText.setText(message);
            warningText.setVisible(true);
            setTimeout(() => {
                warningText.setVisible(false);
            }, 2000);
        };

        // 텍스트 입력 완료 처리 함수
        const completeTextInput = () => {
            if (nameInput.text.length < 2) {
                showWarning('최소 2자 이상 입력해주세요');
                return;
            }
            this.isEditing = false;
            nameInput.setVisible(false);
            displayedText.setVisible(true);
            displayedText.setText(nameInput.text);
            characterName.setTexture('character_name');
            removeKeyboardListener();
        };

        characterName.on('pointerdown', () => {
            characterName.setTexture('character_name_com');
            nameInput.setVisible(true);
            displayedText.setVisible(false);
            this.isEditing = true;
            
            // 이전 리스너 제거
            removeKeyboardListener();
            
            // 새로운 키보드 리스너 생성
            this.keyboardListener = (event) => {
                if (!this.isEditing) return;
                
                if (event.keyCode === 13) { // Enter key
                    completeTextInput();
                } else if (event.keyCode === 8) { // Backspace
                    nameInput.text = nameInput.text.slice(0, -1);
                } else if (event.keyCode === 27) { // ESC key
                    this.isEditing = false;
                    nameInput.setVisible(false);
                    displayedText.setVisible(true);
                    characterName.setTexture('character_name');
                    removeKeyboardListener();
                } else if (event.keyCode === 16) { // Shift key
                    return; // Shift 키 무시
                } else {
                    const isValidInput = /^[a-zA-Z0-9]$/.test(event.key);
                    if (isValidInput && nameInput.text.length < 12) {
                        nameInput.text += event.key;
                    } else if (!isValidInput && event.keyCode !== 16) { // Shift 키가 아닐 때만 경고
                        showWarning('영어와 숫자만 입력 가능합니다');
                    } else if (nameInput.text.length >= 12) {
                        showWarning('최대 12자까지 입력 가능합니다');
                    }
                }
                nameInput.setText(nameInput.text);
            };
            
            this.input.keyboard.on('keydown', this.keyboardListener);
        });

        characterContainer.add([characterImage, character]);
        
        const registerContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY,[
            registerBox,
            exitBtn,
            resizeHandle,
            characterContainer,
            characterNameContainer
        ]);

        registerBox.setInteractive();
        
        registerBox.on('pointerdown', (pointer) => {
            if (this.isEditing) {
                completeTextInput();
            }
            this.isDragging = true;
            this.dragStartPos = {
                x: pointer.x - registerContainer.x,
                y: pointer.y - registerContainer.y
            };
        });
        
        // 리사이즈 핸들 이벤트
        resizeHandle.on('pointerover', () => {
            drawResizeHandle(0x00ff00, 3);
        });

        resizeHandle.on('pointerout', () => {
            if (!this.isResizing) {
                drawResizeHandle();
            }
        });

        resizeHandle.on('pointerdown', (pointer) => {
            if (this.isEditing) {
                completeTextInput();
            }
            this.isResizing = true;
            drawResizeHandle(0x0000ff, 3);
            
            // 리사이즈 시작 시점의 거리와 스케일 저장
            const dx = pointer.x - registerContainer.x;
            const dy = pointer.y - registerContainer.y;
            this.resizeStartDistance = Math.sqrt(dx * dx + dy * dy);
            this.resizeStartScale = this.currentScale;
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                registerContainer.x = pointer.x - this.dragStartPos.x;
                registerContainer.y = pointer.y - this.dragStartPos.y;
            }
            
            if (this.isResizing) {
                const dx = pointer.x - registerContainer.x;
                const dy = pointer.y - registerContainer.y;
                const currentDistance = Math.sqrt(dx * dx + dy * dy);
                
                // 거리의 변화 비율을 기반으로 스케일 조정
                const distanceRatio = currentDistance / this.resizeStartDistance;
                const minScale = 0.3;
                const newScale = Math.max(minScale, this.resizeStartScale * distanceRatio);
                
                this.currentScale = newScale;
                registerBox.setScale(this.currentScale);
                
                exitBtn.setPosition(
                    registerBox.displayWidth/2 - 20 - this.padding,
                    -registerBox.displayHeight/2 + 20 + this.padding
                );

                characterContainer.setPosition(
                    0, // x 좌표를 0으로 유지하여 중앙 정렬 유지
                    -registerBox.displayHeight/2 + 70 + this.padding
                );

                // 캐릭터 이름 컨테이너 위치 업데이트 - 중앙 정렬 유지
                characterNameContainer.setPosition(
                    0,
                    characterContainer.y + characterImage.displayHeight - 50
                );

                // 캐릭터 이름 컨테이너 스케일 조정
                characterName.setScale(this.currentScale + 0.7);
                nameInput.setScale(this.currentScale+1);
                displayedText.setScale(this.currentScale);
                warningText.setScale(this.currentScale);

                drawResizeHandle(0x0000ff, 3);
                
                const newHitArea = new Phaser.Geom.Rectangle(
                    registerBox.displayWidth/2 - 15 - this.padding,
                    registerBox.displayHeight/2 - 15 - this.padding,
                    15,
                    15
                );
                resizeHandle.input.hitArea = newHitArea;
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
            if (this.isResizing) {
                this.isResizing = false;
                drawResizeHandle();
            }
        });

        // 전체 게임 영역에 대한 포인터 다운 이벤트 추가
        this.input.on('pointerdown', (pointer) => {
            if (this.isEditing) {
                // 클릭된 위치가 nameInput 영역 밖인지 확인
                const nameInputBounds = nameInput.getBounds();
                if (!Phaser.Geom.Rectangle.Contains(nameInputBounds, pointer.x, pointer.y)) {
                    completeTextInput();
                }
            }
        });
    }
}