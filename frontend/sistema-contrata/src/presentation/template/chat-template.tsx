import { useState } from 'react'
import GptMessage from '../components/chat-bubbles/GptMessage';
import MyMessage from '../components/chat-bubbles/MyMessage';
import TypingLoader from '../components/loaders/TypingLoader';
import TextMessageBox from '../components/chat-input-boxes/TextMessageBox';

interface Message {
    text: string;
    isGpt: boolean;
}

const ChatTemplate = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    const handlePost = async( text: string )=>{
        setIsLoading(true);
        setMessages( (prev) => [...prev, { text: text, isGpt: false }])
        console.log('Nuevo mensaje enviado por el usuario:', text);
        setIsLoading(false)
    }
  return (
    <div className='chat-container'>
        <div className='chat-messages'>
            <div className='grid grid-cols-12 gap-y-2'>

                {/* Bienvenida */}

                <GptMessage text = "Hola, puedes escribir tu texto en español, y te ayudo con las correcciones"/>
                
                {
                    messages.map((message, index) => {
                        return message.isGpt ? (
                            <GptMessage key={index} text='esto es de openAI' />
                        ) : (
                            <MyMessage key={index} text={message.text} />
                        );
                    })
                }
                {
                    isLoading &&(
                    <div className='col-start-1 col-end-12 fade-in'>
                        <TypingLoader className='fade-in'/>
                    </div> 
                    )
                }

                
            </div>
        </div>

        <TextMessageBox
        onSendMessage={ handlePost }
        placeholder='Escribe aqui lo que deseas'
        disableCorrections
        />
    </div>
  )
}

export default ChatTemplate
