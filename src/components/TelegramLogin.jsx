import { LoginButton} from '@telegram-auth/react'
import axios from 'axios';
export const TelegramLogin = () => {
    return <LoginButton 
    // testbot
        botUsername={"the_elementa_test_bot"}
        buttonSize="large" // "large" | "medium" | "small"
        cornerRadius={5} // 0 - 20
        showAvatar={true} // true | false
        lang="en"
        onAuthCallback={(data)=> {
            console.log(data);
            axios.post(`https://api.origin-forge.com/auth/telegram`, {
                ...data
            });
        }}
    />
}