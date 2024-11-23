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
        this.selectedSlotIndex = -1; // 선택된 슬롯의 인덱스를 저장
    }

    create() {
        this.createItemAnimations();
        this.createRegisterContainer();
    }

    createItemAnimations() {
                // item1 애니메이션
                this.anims.create({
                    key: 'item1_anim',
                    frames: this.anims.generateFrameNumbers('item1', { start: 0, end: 8 }),
                    frameRate: 8,
                    repeat: -1
                });
        
                // item2 애니메이션
                this.anims.create({
                    key: 'item2_anim',
                    frames: this.anims.generateFrameNumbers('item2', { start: 0, end: 8 }),
                    frameRate: 8,
                    repeat: -1
                });
        
                // item3 애니메이션
                this.anims.create({
                    key: 'item3_anim',
                    frames: this.anims.generateFrameNumbers('item3', { start: 0, end: 8 }),
                    frameRate: 8,
                    repeat: -1
                });
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
        
        // inventory 2x5 그리드 생성
        const inventoryContainer = this.add.container(0, 0);
        const slotSize = 40; // 슬롯 크기
        const padding = 3; // 패딩 크기
        
        // 아이템 이미지 배열과 슬롯 배열
        const items = ['item1', 'item2', 'item3', 'item4', 'item5'];
        const slots = [];
        const slotContainers = [];
        
        // 선택 표시자와 보더 생성
        const inventorySelect = this.add.image(0, 0, 'inventory_select')
            .setScale(0.15)
            .setVisible(false);

        // 보더 그래픽 생성
        const inventoryBorder = this.add.graphics();
        inventoryBorder.lineStyle(2, 0xFFD700);
        inventoryBorder.strokeRect(-20, -20, 40, 40);
        inventoryBorder.setVisible(false);

        // 반짝이는 애니메이션 추가 (선택 표시자와 보더 모두에 적용)
        this.tweens.add({
            targets: [inventorySelect, inventoryBorder],
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 캐릭터 스테이트 컨테이너 생성
        const characterState = this.add.image(0, 0, 'inventory').setScale(1);
        const characterStateContainer = this.add.container(0, 22);

        // 캐릭터 스테이트 정보 추가
        const stateTextStyle = {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { 
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 2,
                fill: true
            }
        };

        const baseX = -120; // 좌측 정렬을 위한 기준 X 좌표
        const spacing = 35; // 텍스트 간격

        const idText = this.add.text(baseX, -2 * spacing, 'ID: Player123', stateTextStyle);
        const levelText = this.add.text(baseX, -1 * spacing, 'Level: 15', stateTextStyle);
        const heartText = this.add.text(baseX, 0, '❤️ 100/100', stateTextStyle);
        const expText = this.add.text(baseX, 1 * spacing, 'EXP: 1500/2000', stateTextStyle);
        const ofAmountText = this.add.text(baseX, 2 * spacing, 'OF: 1,000', stateTextStyle);

        // 각 텍스트에 호버 효과 추가
        [idText, levelText, heartText, expText, ofAmountText].forEach(text => {
            text.setInteractive();
            text.on('pointerover', () => {
                text.setScale(1.1);
                text.setStyle({ ...stateTextStyle, color: '#ffff00' });
            });
            text.on('pointerout', () => {
                text.setScale(1.0);
                text.setStyle({ ...stateTextStyle, color: '#ffffff' });
            });
        });

        characterStateContainer.add([
            characterState,
            idText,
            levelText,
            heartText,
            expText,
            ofAmountText
        ]).setScale(this.currentScale + 0.1);

        
        

        // 슬롯과 아이템 생성 및 컨테이너에 추가
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 5; col++) {
                const x = col * (slotSize + padding) - (2 * (slotSize + padding));
                const y = row * (slotSize + padding) - (2 * (slotSize + padding));
                
                // 각 슬롯을 위한 개별 컨테이너 생성
                const slotContainer = this.add.container(x, y);
                slotContainers.push(slotContainer);
                
                const slot = this.add.image(0, 0, 'inventory')
                    .setScale(0.15)
                    .setInteractive();
                
                const slotIndex = row * 5 + col;
                
                slot.on('pointerover', () => {
                    if (this.selectedSlotIndex === -1) {
                        inventorySelect.setVisible(true);
                        inventoryBorder.setVisible(true);
                        inventorySelect.setPosition(slotContainer.x, slotContainer.y);
                        inventoryBorder.setPosition(slotContainer.x, slotContainer.y);
                    }
                });

                slot.on('pointerout', () => {
                    slot.clearTint();
                    if (this.selectedSlotIndex === -1) {
                        inventorySelect.setVisible(false);
                        inventoryBorder.setVisible(false);
                    }
                });

                slot.on('pointerdown', () => {
                    // 이전에 선택된 슬롯이 있다면 선택 해제
                    if (this.selectedSlotIndex !== -1) {
                        slots[this.selectedSlotIndex].clearTint();
                    }
                    
                    // 현재 슬롯 선택
                    this.selectedSlotIndex = slotIndex;
                    slot.setTint(0x808080);
                    
                    // 선택 표시자와 보더 위치 설정 및 표시
                    inventorySelect.setVisible(true);
                    inventoryBorder.setVisible(true);
                    inventorySelect.setPosition(slotContainer.x, slotContainer.y);
                    inventoryBorder.setPosition(slotContainer.x, slotContainer.y);
                });
                
                slots.push(slot);
                slotContainer.add(slot);
                
                // 첫 5개 슬롯에만 test 아이템 추가
                if (row === 0 && col < items.length) {
                    const item = this.add.sprite(0, 0, items[col])
                        .setScale(1)
                        .setOrigin(0.5);
                    
                    // 처음 3개 아이템에 대해서만 애니메이션 적용
                    if (col < 3) {
                        item.play(`${items[col]}_anim`).setScale(1.5);
                    }
                    
                    slotContainer.add(item);
                }
                
                inventoryContainer.add(slotContainer);
            }
        }
        
        inventoryContainer.add([inventorySelect, inventoryBorder]);
        
        // 인벤토리 컨테이너 스케일 설정
        inventoryContainer.setScale(this.currentScale + 0.5);
        
        // 인벤토리 컨테이너를 레지스터박스 하단에 고정
        const inventoryY = registerBox.displayHeight / 2 - (inventoryContainer.height * (this.currentScale + 0.5)) / 2;
        inventoryContainer.setPosition(0, inventoryY);
        characterStateContainer.setPosition(0, inventoryContainer.height + 20);
        const registerContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY,[
            registerBox,
            exitBtn,
            resizeHandle,
            characterContainer,
            characterNameContainer,
            inventoryContainer,
            characterStateContainer
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
                    0,
                    -registerBox.displayHeight/2 + 70 + this.padding
                );

                characterNameContainer.setPosition(
                    0,
                    characterContainer.y + characterImage.displayHeight - 40
                );

                // 캐릭터 이름 컨테이너 스케일 조정
                characterName.setScale(this.currentScale + 0.7);
                nameInput.setScale(this.currentScale+1);
                displayedText.setScale(this.currentScale);
                warningText.setScale(this.currentScale);

                // 인벤토리 컨테이너 전체 스케일 조정
                inventoryContainer.setScale(this.currentScale+0.5);

                // 캐릭터 스테이트 컨테이너 스케일 조정
                characterStateContainer.setScale(this.currentScale + 0.1);

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


    update() {
        // 브라우저 창 크기가 변경되었는지 확인
        const currentWidth = window.innerWidth;
        const currentHeight = window.innerHeight;
        
        if (this.lastWidth !== currentWidth || this.lastHeight !== currentHeight) {
            // 현재 크기 저장
            this.lastWidth = currentWidth;
            this.lastHeight = currentHeight;
            
            // 기존 컨테이너 제거
            this.children.removeAll(true);
            
            // 게임 캔버스 크기 조정
            this.scale.resize(currentWidth, currentHeight);
            
            // 카메라 뷰포트 업데이트 
            this.cameras.main.setViewport(0, 0, currentWidth, currentHeight);
            
            // 새로운 컨테이너 생성
            this.createRegisterContainer();
        }
    }
}