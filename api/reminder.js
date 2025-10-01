const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const response = await axios.get(process.env.MOCK_API_URL);
    const appointments = response.data;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const todayAppointments = appointments.filter(apt => apt.appointment_date === today);

    let sentCount = 0;
    for (const apt of todayAppointments) {
      const [aptHour, aptMin] = apt.appointment_time.split(':').map(Number);
      const aptTime = new Date(today);
      aptTime.setHours(aptHour, aptMin, 0, 0);

      const reminderTime = new Date(aptTime.getTime() - 60 * 60 * 1000);

      const timeDiff = Math.abs(now - reminderTime);
      if (timeDiff <= 5 * 60 * 1000) {
        const message = `⏰ Lembrete: Agendamento em 1 hora!\n\n👤 ${apt.name}\n⏰ ${apt.appointment_time} - ${apt.appointment_type}\n💰 Valor: R$ ${apt.maintenance_value || apt.application_value || '0'}\n📱 WhatsApp: ${apt.whatsapp}`;
        await sendTelegramMessage(message);
        sentCount++;
      }
    }

    res.status(200).json({ checked: todayAppointments.length, sent: sentCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Falha ao verificar lembretes.' });
  }
};

async function sendTelegramMessage(text) {
  await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: process.env.CHAT_ID,
    text: text
  });
}
