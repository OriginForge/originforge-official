export function createCharacterSection(scene, registerBox) {
    const characterContainer = scene.add.container(
        0,
        -registerBox.displayHeight/2 + 70 + scene.padding
    );

    // 캐릭터 이미지 생성
    const characterImage = scene.add.image(0, 0, 'characterBox_com')
        .setScale(scene.currentScale + 3);

    // 캐릭터 생성 및 효과 적용
    const character = scene.add.image(0, 0, 'character');
    character.preFX.addPixelate(-5);

    // 호버 효과 추가
    characterImage.setInteractive()
        .on('pointerover', () => {
            characterImage.setTexture('characterBox');
            scene.tweens.add({
                targets: characterImage,
                scaleX: (scene.currentScale + 3.1),
                scaleY: (scene.currentScale + 3.1),
                duration: 100
            });
        })
        .on('pointerout', () => {
            if (!scene.isCharacterSelected) {
                characterImage.setTexture('characterBox_com');
                scene.tweens.add({
                    targets: characterImage,
                    scaleX: (scene.currentScale + 3),
                    scaleY: (scene.currentScale + 3),
                    duration: 100
                });
            }
        })
        .on('pointerdown', () => {
            scene.isCharacterSelected = !scene.isCharacterSelected;
            characterImage.setTexture('characterBox');
            scene.tweens.add({
                targets: characterImage,
                scaleX: (scene.currentScale + 2.9),
                scaleY: (scene.currentScale + 2.9),
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    if (!scene.isCharacterSelected) {
                        characterImage.setTexture('characterBox_com');
                    }
                }
            });
        });

    characterContainer.add([characterImage, character]);
    return characterContainer;
} 