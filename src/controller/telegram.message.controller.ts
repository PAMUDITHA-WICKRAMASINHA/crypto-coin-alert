import axios from "axios";

interface MessageData {
  chat_id: string;
  text: string;
}

export const sendTelegram = async (data: any): Promise<void> => {
  const botToken = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    // console.error("Telegram token or chat ID is missing");
    return;
  }

  const baseUrl = `https://api.telegram.org/bot${botToken}`;

  const sendMessage = async (messageData: MessageData): Promise<void> => {
    try {
      const response = await axios.post(`${baseUrl}/sendMessage`, messageData);
      // response.data.ok
      //   ? console.log("Message sent successfully")
      //   : console.error("Failed to send message:", response.status, response.statusText);
    } catch (error) {
      // console.error("Error sending message:", error);
    }
  };

  const messageData: MessageData = {
    chat_id: chatId,
    text: `Crypto Alert\n\n${JSON.stringify(data, null, 2)}`,
  };

  await sendMessage(messageData);
};
