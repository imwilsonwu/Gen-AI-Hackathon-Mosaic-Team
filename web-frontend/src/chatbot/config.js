import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
  initialMessages: [createChatBotMessage(`Hello! Please enter your destination and needs here. We may ask you some questions. You can stop at any time and press the "Generate Route" button to get the recommended routes.`)],
};

export default config;