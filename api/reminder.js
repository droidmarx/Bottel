const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const response = await axios.get(process.env.MOCK_API_URL);
    const appointments = response.data;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const startOfDay = new Date(today + 'T07:00:00'); // Início da janela de lembretes (7:00)
    const endOfDay = new Date(today + 'T20:00:00');   // Fim da janela (20:00)

    const todayAppointments = appointments.filter(apt => apt.appointment_date === today);

    let sentCount = 0;
    for (const apt of todayAppointments) {
      const [aptHour, aptMin] = apt.appointment_time.split(':').map(Number);
      const aptTime = new Date(today);
      aptTime.setHours(aptHour, aptMin, 0, 0);

      const reminderTime = new Date(aptTime.getTime() - 60 * 60 * 1000); // 1 hora antes

      // Verifica se o lembrete deveria ter sido enviado entre 7:00 e 20:00 e ainda não foi (simplificado)
      if (reminderTime >= startOfDay && reminderTime <= endOfDay && aptTime > now) {
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