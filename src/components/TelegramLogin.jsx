import { LoginButton } from '@telegram-auth/react'
import axios from 'axios';
import { useState } from 'react';
import { Lang } from '../game/managers/LanguageManager';

export const TelegramLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    if (isLoggedIn) {
        return null;
    }

    const getButtonStyle = () => {
        if (isDisabled) {
            return 'bg-white border border-[#E5E5E5] border-opacity-60 text-[#1E1E1E] text-opacity-20';
        }
        
        const baseStyle = 'bg-[#229ED9]';
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

    return (
        <button
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
                    src="/assets/connector/telegram/telegram-logo.png"
                    alt="Telegram Logo"
                    className="w-6 h-6 z-20"
                />
                <div className="absolute right-0 top-2 bottom-2 w-px bg-black bg-opacity-[0.08] z-10" />
            </div>
            <div className="flex-1 text-center pr-[52px] z-20">
                <LoginButton 
                    botUsername={"elementa_test_bot"}
                    buttonSize="large"
                    cornerRadius={5}
                    showAvatar={false}
                    lang="en"
                    onAuthCallback={async (data) => {
                        try {
                            setIsLoading(true);
                            const response = await axios.post(`https://api.origin-forge.com/auth/telegram`, {
                                ...data
                            });
                            
                            if (response.data.success) {
                                setIsLoggedIn(true);
                            } else {
                                alert('로그인에 실패했습니다.');
                            }
                        } catch (error) {
                            alert('로그인 처리 중 오류가 발생했습니다.');
                            console.error(error);
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                />
            </div>
        </button>
    );
};

const languageTexts = {
    en: { text: 'Telegram', short: 'Telegram' },
    ja: { text: 'Telegram', short: 'Telegram' },
    ko: { text: 'Telegram', short: 'Telegram' },
};