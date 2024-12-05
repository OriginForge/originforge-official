import React, { useEffect, useState } from 'react';
import { useLiff } from 'react-liff';

export const LineLogin = () => {
    const [displayName, setDisplayName] = useState('');
    const { error, isLoggedIn, isReady, liff } = useLiff();

    useEffect(() => {
        if (!isLoggedIn) return;

        (async () => {
            const profile = await liff.getProfile();
            setDisplayName(`${profile.displayName} (${profile.userId})`);
        })();
    }, [liff, isLoggedIn]);

    if (error) return null;
    if (!isReady) return null;

    if (!isLoggedIn) {
        return (
            <button
                onClick={liff.login}
                className="flex items-center gap-2 font-pixelify text-sm rounded-md px-3 py-1.5 transition-colors duration-200 
                         border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white"
            >
                LINE 로그인
            </button>
        );
    }

    return (
        <button
            onClick={liff.logout} 
            className="flex items-center gap-2 font-pixelify text-sm rounded-md px-3 py-1.5 transition-colors duration-200
                     border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white"
        >
            {displayName} (로그아웃)
        </button>
    );
}