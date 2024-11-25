export function createCharacterNameSection(scene, characterContainer, characterImage) {
    const characterNameContainer = scene.add.container(
        0,
        characterContainer.y + characterImage.displayHeight - 40
    );

    const characterName = scene.add.image(0, 0, 'character_name')
        .setScale(scene.currentScale + 0.7);

    const nameInput = scene.add.text(0, 0, '', {
        fontSize: '26px',
        color: '#000000',
        fontStyle: 'bold',
        backgroundColor: '#ffffff'
    }).setOrigin(0.5);

    const displayedText = scene.add.text(0, 0, '', {
        fontSize: '26px',
        color: '#000000',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    const warningText = scene.add.text(0, 30, '', {
        fontSize: '16px',
        color: '#ff0000',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    const showWarning = (message) => {
        warningText.setText(message);
        warningText.setVisible(true);
        setTimeout(() => warningText.setVisible(false), 2000);
    };

    const removeKeyboardListener = () => {
        if (scene.keyboardListener) {
            scene.input.keyboard.off('keydown', scene.keyboardListener);
            scene.keyboardListener = null;
        }
    };

    const completeTextInput = () => {
        if (nameInput.text.length < 2) {
            showWarning('최소 2자 이상 입력해주세요');
            return;
        }
        scene.isEditing = false;
        nameInput.setVisible(false);
        displayedText.setVisible(true);
        displayedText.setText(nameInput.text);
        characterName.setTexture('character_name');
        removeKeyboardListener();
    };

    characterName.setInteractive()
        .on('pointerover', () => {
            characterName.setTexture('character_name_com');
        })
        .on('pointerout', () => {
            if (!scene.isEditing) {
                characterName.setTexture('character_name');
            }
        })
        .on('pointerdown', () => {
            characterName.setTexture('character_name_com');
            nameInput.setVisible(true);
            displayedText.setVisible(false);
            scene.isEditing = true;

            removeKeyboardListener();

            scene.keyboardListener = (event) => {
                if (!scene.isEditing) return;

                if (event.keyCode === 13) { // Enter
                    completeTextInput();
                } else if (event.keyCode === 8) { // Backspace
                    nameInput.text = nameInput.text.slice(0, -1);
                } else if (event.keyCode === 27) { // ESC
                    scene.isEditing = false;
                    nameInput.setVisible(false);
                    displayedText.setVisible(true);
                    characterName.setTexture('character_name');
                    removeKeyboardListener();
                } else if (event.keyCode === 16) { // Shift
                    return;
                } else {
                    const isValidInput = /^[a-zA-Z0-9]$/.test(event.key);
                    if (isValidInput && nameInput.text.length < 12) {
                        nameInput.text += event.key;
                    } else if (!isValidInput && event.keyCode !== 16) {
                        showWarning('영어와 숫자만 입력 가능합니다');
                    } else if (nameInput.text.length >= 12) {
                        showWarning('최대 12자까지 입력 가능합니다');
                    }
                }
                nameInput.setText(nameInput.text);
            };

            scene.input.keyboard.on('keydown', scene.keyboardListener);
        });

    characterNameContainer.add([characterName, nameInput, displayedText, warningText]);
    nameInput.setVisible(false);
    warningText.setVisible(false);

    // 외부에서 completeTextInput을 호출할 수 있도록 이벤트 리스너 추가
    characterNameContainer.on('complete-text-input', completeTextInput);

    return characterNameContainer;
} 