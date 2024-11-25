export function createExitButton(scene, registerBox, padding = 0) {
    const exitBtn = scene.add.image(
        registerBox.displayWidth/2 - 20 - padding, 
        -registerBox.displayHeight/2 + 20 + padding, 
        'prev_exitBtn'
    ).setScale(1.5);
    
    exitBtn.setInteractive()
        .on('pointerover', () => {
            exitBtn.setTexture('exitBtn');
            exitBtn.setScale(1.6);
        })
        .on('pointerout', () => {
            exitBtn.setTexture('prev_exitBtn');
            exitBtn.setScale(1.5);
        })
        .on('pointerdown', () => {
            exitBtn.setTexture('exitBtn');
            exitBtn.setScale(1.4);
        })
        .on('pointerup', () => {
            exitBtn.setScale(1.5);
            scene.destroy();
            scene.scene.start('MainMenu');
        });

    return exitBtn;
} 