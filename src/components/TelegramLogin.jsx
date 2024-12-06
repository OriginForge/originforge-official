import React, { useState } from 'react';
import { LoginButton } from '@telegram-auth/react';
import axios from 'axios';
import { Lang } from '../game/managers/LanguageManager';

export const TelegramLogin = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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

    if (isLoggedIn) {
        return null;
    }

    const currentLang = Lang.getCurrentLanguage();
    const content = languageTexts[currentLang] || languageTexts.en;

    const handleTelegramAuth = async (data) => {
        try {
            setIsLoading(true);
            const response = await axios.post(`https://api.origin-forge.com/auth/telegram`, {
                ...data
            });
            
            if (response.data.success) {
                setIsLoggedIn(true);
            } else {
                alert(content.error);
            }
        } catch (error) {
            alert(content.errorProcess);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
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
                disabled={isDisabled || isLoading}
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
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent
                    before:opacity-0 hover:before:opacity-100 before:transition-opacity
                `}
                style={{
                    direction: currentLang === 'ar' ? 'rtl' : 'ltr',
                    backgroundColor: '#24A1DE'
                }}
            >
                <div className="flex items-center justify-center w-[52px] h-full relative">
                    <img 
                        src="/assets/connector/telegram/btn_base.png"
                        alt="Telegram Logo"
                        className="w-6 h-6 z-20"
                    />
                    <div className="absolute right-0 top-2 bottom-2 w-px bg-black bg-opacity-[0.08] z-10" />
                </div>
                <div className="flex-1 text-center pr-[52px] z-20">
                    {content.text}
                </div>
                {isLoading && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </button>
            <div className="absolute opacity-0 pointer-events-auto">
                <LoginButton 
                    botUsername={"elementa_test_bot"}
                    buttonSize="small"
                    cornerRadius={5}
                    showAvatar={false}
                    lang={currentLang}
                    onAuthCallback={handleTelegramAuth}
                />
            </div>
        </div>
    );
};

const languageTexts = {
    en: { 
        text: 'Telegram',
        error: 'Login failed',
        errorProcess: 'An error occurred during login'
    },
    ja: { 
        text: 'Telegram',
        error: 'ログインに失敗しました',
        errorProcess: 'ログイン処理中にエラーが発生しました'
    },
    ko: { 
        text: 'Telegram',
        error: '로그인에 실패했습니다',
        errorProcess: '로그인 처리 중 오류가 발생했습니다'
    }
};