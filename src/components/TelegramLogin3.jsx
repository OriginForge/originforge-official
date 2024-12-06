import { LoginButton } from '@telegram-auth/react'
import axios from 'axios';
import { useState } from 'react';

export const TelegramLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    if (isLoggedIn) {
        return null;
    }

    return <LoginButton 
        botUsername={"elementa_test_bot"}
        buttonSize="small"
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
}