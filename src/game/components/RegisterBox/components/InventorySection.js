export function createInventorySection(scene, registerBox) {
    const inventoryContainer = scene.add.container(0, 0);
    const slotSize = 40;
    const padding = 3;
    
    const items = ['item1', 'item2', 'item3', 'item4', 'item5'];
    const slots = [];
    const slotContainers = [];
    
    // 선택 표시자와 보더 생성
    const inventorySelect = scene.add.image(0, 0, 'inventory_select')
        .setScale(0.15)
        .setVisible(false);

    const inventoryBorder = scene.add.graphics();
    inventoryBorder.lineStyle(2, 0xFFD700);
    inventoryBorder.strokeRect(-20, -20, 40, 40);
    inventoryBorder.setVisible(false);

    // 반짝이는 애니메이션
    scene.tweens.add({
        targets: [inventorySelect, inventoryBorder],
        alpha: 0.5,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // 툴팁 스타일 정의
    const tooltipStyle = {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
        fixedWidth: 200,
        align: 'left'
    };

    // 툴팁 컨테이너 생성
    const tooltipContainer = scene.add.container(0, 0);
    tooltipContainer.setDepth(1000);
    
    const tooltipBg = scene.add.graphics();
    const tooltipText = scene.add.text(0, 0, '', tooltipStyle);
    tooltipContainer.add([tooltipBg, tooltipText]);
    tooltipContainer.setVisible(false);
    
    // 아이템 데이터 정의
    const itemsData = {
        item1: { 
            name: '블루 크리스탈',
            description: '희귀한 마법의 크리스탈\n공격력 +10',
            rarity: '희귀',
            stats: { attack: 10 }
        },
        item2: { 
            name: '레드 크리스탈',
            description: '강력한 파워의 크리스탈\n체력 +20',
            rarity: '영웅',
            stats: { hp: 20 }
        },
        item3: { 
            name: '그린 크리스탈',
            description: '신비한 자연의 크리스탈\n마나 +15',
            rarity: '고급',
            stats: { mana: 15 }
        }
    };

    function showTooltip(item, x, y) {
        const itemData = itemsData[item];
        if (!itemData) return;

        const rarityColors = {
            '일반': '#ffffff',
            '고급': '#1eff00',
            '희귀': '#0070dd',
            '영웅': '#a335ee'
        };

        tooltipText.setText([
            `${itemData.name}`,
            `등급: ${itemData.rarity}`,
            '',
            `${itemData.description}`,
        ].join('\n'));
        
        tooltipText.setColor(rarityColors[itemData.rarity]);

        // 툴팁 배경 그리기
        tooltipBg.clear();
        tooltipBg.fillStyle(0x000000, 0.8);
        tooltipBg.fillRoundedRect(
            -5,
            -5,
            tooltipText.width + 10,
            tooltipText.height + 10,
            5
        );

        // 툴팁을 아이템 우측에 표시
        tooltipContainer.setPosition(x + 20, y -  15);
        tooltipContainer.setVisible(true);
    }

    function hideTooltip() {
        tooltipContainer.setVisible(false);
    }

    // 슬롯 생성
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 5; col++) {
            const x = col * (slotSize + padding) - (2 * (slotSize + padding));
            const y = row * (slotSize + padding) - (2 * (slotSize + padding));
            
            const slotContainer = scene.add.container(x, y);
            slotContainers.push(slotContainer);
            
            const slot = scene.add.image(0, 0, 'inventory')
                .setScale(0.15)
                .setInteractive();
            
            const slotIndex = row * 5 + col;
            setupSlotInteractions(scene, slot, slotContainer, slotIndex, slots, inventorySelect, inventoryBorder, showTooltip, hideTooltip, items);
            
            slots.push(slot);
            slotContainer.add(slot);
            
            // 첫 줄에만 테스트 아이템 추가
            if (row === 0 && col < items.length) {
                const item = scene.add.sprite(0, 0, items[col])
                    .setScale(1)
                    .setOrigin(0.5)
                    .setInteractive();
                
                // 아이템 이벤트 핸들러 추가
                item.on('pointerover', function() {
                    const worldPos = this.getWorldTransformMatrix();
                    showTooltip(items[col], worldPos.tx, worldPos.ty);
                });
                
                item.on('pointerout', function() {
                    if (scene.selectedSlotIndex !== slotIndex) {
                        hideTooltip();
                    }
                });

                // 아이템 클릭 이벤트 추가
                item.on('pointerdown', () => {
                    if (scene.selectedSlotIndex === slotIndex) {
                        // 이미 선택된 슬롯을 다시 클릭한 경우
                        slots[scene.selectedSlotIndex].clearTint();
                        scene.selectedSlotIndex = -1;
                        hideTooltip();
                        inventorySelect.setVisible(false);
                        inventoryBorder.setVisible(false);
                        return;
                    }

                    if (scene.selectedSlotIndex !== -1) {
                        slots[scene.selectedSlotIndex].clearTint();
                        hideTooltip();
                    }
                    
                    scene.selectedSlotIndex = slotIndex;
                    slot.setTint(0x808080);
                    
                    inventorySelect.setVisible(true);
                    inventoryBorder.setVisible(true);
                    inventorySelect.setPosition(slotContainer.x, slotContainer.y);
                    inventoryBorder.setPosition(slotContainer.x, slotContainer.y);

                    const worldPos = item.getWorldTransformMatrix();
                    showTooltip(items[col], worldPos.tx, worldPos.ty);
                });

                if (col < 3) {
                    item.play(`${items[col]}_anim`).setScale(1.5);
                }
                
                slotContainer.add(item);
            }
            
            inventoryContainer.add(slotContainer);
        }
    }
    
    inventoryContainer.add([inventorySelect, inventoryBorder]);
    inventoryContainer.setScale(scene.currentScale + 0.5);

    // 인벤토리 위치 설정
    const inventoryY = registerBox.displayHeight / 2 - (inventoryContainer.height * (scene.currentScale + 0.5)) / 2;
    inventoryContainer.setPosition(0, inventoryY);

    // registerBox에 클릭 이벤트 추가
    registerBox.setInteractive();
    registerBox.on('pointerdown', (pointer) => {
        if (scene.selectedSlotIndex !== -1) {
            slots[scene.selectedSlotIndex].clearTint();
            scene.selectedSlotIndex = -1;
            hideTooltip();
            inventorySelect.setVisible(false);
            inventoryBorder.setVisible(false);
        }
    });

    return inventoryContainer;
}

function setupSlotInteractions(scene, slot, slotContainer, slotIndex, slots, inventorySelect, inventoryBorder, showTooltip, hideTooltip, items) {
    slot.on('pointerover', () => {
        // 해당 슬롯에 아이템이 있는지 확인 (첫 번째 줄의 아이템만 있음)
        if (slotIndex < 5) {  // 첫 번째 줄
            const worldPos = slotContainer.getWorldTransformMatrix();
            showTooltip(items[slotIndex], worldPos.tx, worldPos.ty);
        }

        if (scene.selectedSlotIndex === -1) {
            inventorySelect.setVisible(true);
            inventoryBorder.setVisible(true);
            inventorySelect.setPosition(slotContainer.x, slotContainer.y);
            inventoryBorder.setPosition(slotContainer.x, slotContainer.y);
        }
    });

    slot.on('pointerout', () => {
        slot.clearTint();
        if (scene.selectedSlotIndex === -1) {
            hideTooltip();
            inventorySelect.setVisible(false);
            inventoryBorder.setVisible(false);
        }
    });

    slot.on('pointerdown', () => {
        if (scene.selectedSlotIndex === slotIndex) {
            // 이미 선택된 슬롯을 다시 클릭한 경우
            slots[scene.selectedSlotIndex].clearTint();
            scene.selectedSlotIndex = -1;
            hideTooltip();
            inventorySelect.setVisible(false);
            inventoryBorder.setVisible(false);
            return;
        }

        if (scene.selectedSlotIndex !== -1) {
            slots[scene.selectedSlotIndex].clearTint();
            hideTooltip();
        }
        
        scene.selectedSlotIndex = slotIndex;
        slot.setTint(0x808080);
        
        inventorySelect.setVisible(true);
        inventoryBorder.setVisible(true);
        inventorySelect.setPosition(slotContainer.x, slotContainer.y);
        inventoryBorder.setPosition(slotContainer.x, slotContainer.y);

        if (slotIndex < 5) {
            const worldPos = slotContainer.getWorldTransformMatrix();
            showTooltip(items[slotIndex], worldPos.tx, worldPos.ty);
        }
    });
} 