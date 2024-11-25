export function createStatsSection(scene, registerBox, inventorySection) {
    const characterState = scene.add.image(0, 0, 'inventory').setScale(1);
    const characterStateContainer = scene.add.container(0, 0);

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

    const baseX = -120;
    const spacing = 35;

    const stats = [
        { key: 'ID', value: 'Player123' },
        { key: 'Level', value: '15' },
        { key: '❤️', value: '100/100' },
        { key: 'EXP', value: '1500/2000' },
        { key: 'OF', value: '1,000' }
    ];

    const statTexts = stats.map((stat, index) => {
        const text = scene.add.text(
            baseX, 
            (index - 2) * spacing, 
            `${stat.key}: ${stat.value}`, 
            stateTextStyle
        );

        setupTextInteraction(text, stateTextStyle);
        return text;
    });

    characterStateContainer
        .add([characterState, ...statTexts])
        .setScale(scene.currentScale + 0.1);

    // 캐릭터 이름과 인벤토리 사이에 위치하도록 수정
    const characterNameHeight = 150; // 캐릭터 이름 섹션의 대략적인 높이
    characterStateContainer.setPosition(
        0, 
        -registerBox.displayHeight/4 + characterNameHeight
    );

    return characterStateContainer;
}

function setupTextInteraction(text, baseStyle) {
    text.setInteractive()
        .on('pointerover', () => {
            text.setScale(1.1);
            text.setStyle({ 
                ...baseStyle, 
                color: '#ffff00' 
            });
        })
        .on('pointerout', () => {
            text.setScale(1.0);
            text.setStyle({ 
                ...baseStyle, 
                color: '#ffffff' 
            });
        });
} 