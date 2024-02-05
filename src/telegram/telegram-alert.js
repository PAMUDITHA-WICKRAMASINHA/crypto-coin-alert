const axios = require("axios");

const telegramAlert = async (data) => {
  const botToken = "6950658266:AAGRc2n_hKaZer2OdCiF7FRGhX0kJGdz6jo";
  const chatId = "-1002006185971";

  const baseUrl = `https://api.telegram.org/bot${botToken}`;

  // Send a message
  async function sendMessage() {
    try {
      const messageData = {
        chat_id: chatId,
        text: `COIN ALERTS\n\nCoin Name: ${data.symbol} -> Getting ${data.signal} Signal\n\nPrice: ${data.price}\n${data.time}`,
      };

      const response = await axios.post(`${baseUrl}/sendMessage`, messageData);

      if (response.data.ok) {
        console.log("Message sent successfully");
      } else {
        console.error(
          "Failed to send message:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  await sendMessage();
};

module.exports = { telegramAlert };
