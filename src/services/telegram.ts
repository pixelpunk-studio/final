const TELEGRAM_BOT_TOKEN = "8277248918:AAGAdMSmMuK9Ndt9P9zF7gEksDb4LMVuTlo";
const TELEGRAM_CHAT_ID = "6435291269";

export async function sendTelegramAlert(message: string): Promise<void> {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram alert:", error);
  }
}

export function formatAdminLoginAlert(email: string): string {
  return `🔐 <b>Admin Login</b>\n\nEmail: ${email}\nTime: ${new Date().toLocaleString()}`;
}

export function formatContentChangeAlert(section: string, action: string): string {
  return `✏️ <b>Content Update</b>\n\nSection: ${section}\nAction: ${action}\nTime: ${new Date().toLocaleString()}`;
}

export function formatContactSubmissionAlert(data: { name: string; email: string; phone: string }): string {
  return `📧 <b>New Contact Submission</b>\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nTime: ${new Date().toLocaleString()}`;
}

export function formatReviewSubmissionAlert(data: { username: string; rating: number }): string {
  return `⭐ <b>New Review</b>\n\nUser: ${data.username}\nRating: ${data.rating}/5\nTime: ${new Date().toLocaleString()}`;
}
