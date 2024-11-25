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
            setupSlotInteractions(scene, slot, slotContainer, slotIndex, slots, inventorySelect, inventoryBorder);
            
            slots.push(slot);
            slotContainer.add(slot);
            
            // 첫 줄에만 테스트 아이템 추가
            if (row === 0 && col < items.length) {
                const item = scene.add.sprite(0, 0, items[col])
                    .setScale(1)
                    .setOrigin(0.5);
                
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

    return inventoryContainer;
}

function setupSlotInteractions(scene, slot, slotContainer, slotIndex, slots, inventorySelect, inventoryBorder) {
    slot.on('pointerover', () => {
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
            inventorySelect.setVisible(false);
            inventoryBorder.setVisible(false);
        }
    });

    slot.on('pointerdown', () => {
        if (scene.selectedSlotIndex !== -1) {
            slots[scene.selectedSlotIndex].clearTint();
        }
        
        scene.selectedSlotIndex = slotIndex;
        slot.setTint(0x808080);
        
        inventorySelect.setVisible(true);
        inventoryBorder.setVisible(true);
        inventorySelect.setPosition(slotContainer.x, slotContainer.y);
        inventoryBorder.setPosition(slotContainer.x, slotContainer.y);
    });
} 