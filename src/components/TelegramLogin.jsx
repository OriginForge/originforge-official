import { LoginButton} from '@telegram-auth/react'
import axios from 'axios';
export const TelegramLogin = () => {
    return <LoginButton 
    // testbot
        botUsername={"7355830225:AAELimJfV7OhRSVEgHdzfR0SZUZDizBniBs"}
        onAuthCallback={(data)=> {
            console.log(data);
            axios.post(`https://api.origin-forge.com/auth/telegram`, {
                ...data
            });
        }}
    />
}