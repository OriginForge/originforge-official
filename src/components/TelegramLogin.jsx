import { LoginButton } from '@telegram-auth/react'
import axios from 'axios';
import { useState, useEffect } from 'react';

export const TelegramLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            alert('로그인 완료');
        }
    }, [isLoggedIn]);

    useEffect(() => {
        // 텔레그램 버튼 스타일 강제 적용
        const style = document.createElement('style');
        style.textContent = `
            .telegram-login-button {
                position: relative !important;
                display: flex !important;
                align-items: center !important;
                width: 100% !important;
                height: 48px !important;
                border-radius: 6px !important;
                font-family: sans-serif !important;
                font-weight: 500 !important;
                font-size: 16px !important;
                transition: all 0.2s !important;
                overflow: hidden !important;
                background-color: #0088cc !important;
                color: white !important;
                border: none !important;
                cursor: pointer !important;
            }
            .telegram-login-button:hover {
                background-color: #0077b3 !important;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    return (
        <div className="relative flex items-center w-full h-12">
            <LoginButton 
                botUsername={"elementa_test_bot"}
                buttonSize="large" 
                cornerRadius={5}
                showAvatar={false}
                authCallbackUrl={`${window.location.origin}/auth/telegram`}
                lang="en"
                className="telegram-login-button"
                onAuthCallback={async (data) => {
                    try {
                        setIsLoading(true);
                        const response = await axios.post(`https://api.origin-forge.com/auth/telegram`, {
                            ...data
                        });
                        
                        if (response.data.success) {
                            setIsLoggedIn(true);
                            // 로그인 완료 처리 추가
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
    )
}