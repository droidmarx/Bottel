module.exports = (req, res) => {
  res.status(200).json({ message: 'Webhook pronto para atualizações do Telegram.' });
  // Configurar webhook: https://api.telegram.org/bot<TOKEN>/setWebhook?url=<SUA_URL_VERCEL>/api/webhook
};