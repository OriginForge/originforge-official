import React, { useState } from 'react';
import { Lang } from '../game/managers/LanguageManager';
// import { retrieveLaunchParams } from '@telegram-apps/sdk';
export const TelegramLogin = () => {
    const [displayName, setDisplayName] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false); 
    const [isDisabled, setIsDisabled] = useState(false);
    // const { initDataRaw, initData } = retrieveLaunchParams();

    
    const getButtonIcon = () => {        
        if (isPressed) return '/assets/connector/telegram/btn_press.png';
        if (isHovered) return '/assets/connector/telegram/btn_hover.png';
        return '/assets/connector/telegram/btn_base.png';
    };

    const getButtonStyle = () => {
        if (isDisabled) {
            return 'bg-white border border-[#E5E5E5] border-opacity-60 text-[#1E1E1E] text-opacity-20';
        }
        
        const baseStyle = 'bg-[#24A1DE]';
        if (isPressed) {
            return `${baseStyle} relative after:absolute after:inset-0 after:bg-black after:opacity-30`;
        }
        if (isHovered) {
            return `${baseStyle} relative after:absolute after:inset-0 after:bg-black after:opacity-10`;
        }
        return baseStyle;
    };

    const currentLang = Lang.getCurrentLanguage();
    const content = languageTexts[currentLang] || languageTexts.en;

    const handleTelegramLogin = () => {
        // 텔레그램 로그인 로직 구현
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (window.Telegram && window.Telegram.WebApp) {
            // Telegram WebApp API 사용 가능

            console.log(window.Telegram.WebApp.initDataUnsafe);
            if (user) {
                setDisplayName(`${user.first_name} ${user.last_name || ''} (${user.id})`);
            }
        } else {
            console.log('Telegram WebApp API not available');
        }
    };

    return (
        <button
            onClick={!isDisabled ? handleTelegramLogin : undefined}
            onMouseEnter={() => !isDisabled && setIsHovered(true)}
            onMouseLeave={() => {
                if (!isDisabled) {
                    setIsHovered(false);
                    setIsPressed(false);
                }
            }}
            onMouseDown={() => !isDisabled && setIsPressed(true)}
            onMouseUp={() => !isDisabled && setIsPressed(false)}
            disabled={isDisabled}
            className={`
                relative
                flex items-center
                w-full h-12
                rounded-md
                font-sans font-medium text-base
                transition-all duration-200
                overflow-hidden
                ${getButtonStyle()}
                ${!isDisabled && 'text-white'}
            `}
            style={{
                direction: currentLang === 'ar' ? 'rtl' : 'ltr'
            }}
        >
            <div className="flex items-center justify-center w-[52px] h-full relative">
                <img 
                    src={getButtonIcon()}
                    alt="Telegram Logo"
                    className="w-6 h-6 z-20"
                />
                <div className="absolute right-0 top-2 bottom-2 w-px bg-black bg-opacity-[0.08] z-10" />
            </div>
            <div className="flex-1 text-center pr-[52px] z-20">
                {displayName || content.text}
            </div>
        </button>
    );
};

const languageTexts = {
    en: { text: 'Continue with Telegram', short: 'Telegram' },
    ja: { text: 'Telegramで続ける', short: 'Telegram' },
    ko: { text: 'Telegram으로 계속하기', short: 'Telegram' }
};
