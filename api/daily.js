const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const response = await axios.get(process.env.MOCK_API_URL);
    const appointments = response.data;
    const today = new Date().toISOString().split('T')[0];

    const todayAppointments = appointments.filter(apt => apt.appointment_date === today);

    if (todayAppointments.length === 0) {
      await sendTelegramMessage(`Nenhum agendamento para hoje (${today}).`);
      return res.status(200).json({ message: 'Nenhum agendamento hoje.' });
    }

    let message = `📅 Agendamentos de hoje (${today}):\n\n`;
    todayAppointments.forEach(apt => {
      message += `👤 ${apt.name}\n`;
      message += `⏰ ${apt.appointment_time} - ${apt.appointment_type}\n`;
      message += `💰 Valor: R$ ${apt.maintenance_value || apt.application_value || '0'}\n`;
      message += `📱 WhatsApp: ${apt.whatsapp}\n`;
      message += `👁️ Modelo: ${apt.eyelash_model}\n\n`;
    });

    await sendTelegramMessage(message);
    res.status(200).json({ sent: todayAppointments.length, date: today });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Falha ao buscar ou enviar.' });
  }
};

async function sendTelegramMessage(text) {
  await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: process.env.CHAT_ID,
    text: text
  });
}
