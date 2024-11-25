import { Scene } from 'phaser';
import { EventBus } from '../../EventBus';
import { gameData } from '../../managers/GameDataManager';
import { createExitButton } from './components/ExitButton';
import { createCharacterSection } from './components/CharacterSection';
import { createCharacterNameSection } from './components/CharacterNameSection';
import { createInventorySection } from './components/InventorySection';
import { createStatsSection } from './components/StatsSection';

export default class RegisterBox extends Scene {
    constructor() {
        super('RegisterBox');
        this.initializeState();
    }

    initializeState() {
        this.gameData = gameData;
        this.currentScale = 0.5;
        this.padding = 0;
        this.isDragging = false;
        this.isEditing = false;
        this.isCharacterSelected = false;
        this.selectedSlotIndex = -1;
    }

    create() {
        this.setupEventListeners();
        this.createRegisterContainer();
    }

    setupEventListeners() {
        EventBus.on('wallet-connected', this.handleWalletConnect, this);
        EventBus.on('player-data-updated', this.handlePlayerDataUpdate, this);
    }

    createRegisterContainer() {
        const registerBox = this.add.image(0, 0, 'modalBox_bg')
            .setScale(this.currentScale);

        const exitBtn = createExitButton(this, registerBox, this.padding);
        const characterSection = createCharacterSection(this, registerBox);
        const characterNameSection = createCharacterNameSection(
            this, 
            characterSection, 
            characterSection.list[0]
        );
        const inventorySection = createInventorySection(this, registerBox);
        const statsSection = createStatsSection(this, registerBox, inventorySection);

        const registerContainer = this.add.container(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            [
                registerBox,
                exitBtn,
                characterSection,
                characterNameSection,
                inventorySection,
                statsSection
            ]
        );

        this.setupDragBehavior(registerBox, registerContainer);
    }

    setupDragBehavior(registerBox, container) {
        registerBox.setInteractive();
        
        registerBox.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.dragStartPos = {
                x: pointer.x - container.x,
                y: pointer.y - container.y
            };
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                container.x = pointer.x - this.dragStartPos.x;
                container.y = pointer.y - this.dragStartPos.y;
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });
    }

    handleWalletConnect() {
        console.log('wallet-connected');
    }

    handlePlayerDataUpdate() {
        console.log('player-data-updated');
    }

    destroy() {
        EventBus.off('wallet-connected', this.handleWalletConnect, this);
        EventBus.off('player-data-updated', this.handlePlayerDataUpdate, this);
        super.destroy();
    }
}