// Exact marketing-consent wording shown on the kiosk. A copy of the wording
// the customer saw is stored with every ConsentRecord so the record is
// self-contained even if this text changes later.

export const SMS_CONSENT_WORDING: Record<"en" | "vi" | "es", string> = {
  en: "I agree to receive appointment reminders, follow-up messages, and occasional promotional text messages from Aileen's Beauty at the phone number provided. Message and data rates may apply. Message frequency varies. Reply STOP to unsubscribe.",
  vi: "Tôi đồng ý nhận tin nhắn nhắc lịch hẹn, tin nhắn theo dõi và tin nhắn khuyến mãi không thường xuyên từ Aileen's Beauty qua số điện thoại đã cung cấp. Có thể áp dụng cước phí tin nhắn và dữ liệu. Tần suất tin nhắn thay đổi. Trả lời STOP để hủy đăng ký.",
  es: "Acepto recibir recordatorios de citas, mensajes de seguimiento y mensajes de texto promocionales ocasionales de Aileen's Beauty al número de teléfono proporcionado. Pueden aplicarse tarifas de mensajes y datos. La frecuencia de los mensajes varía. Responda STOP para cancelar la suscripción.",
};

export const EMAIL_CONSENT_WORDING: Record<"en" | "vi" | "es", string> = {
  en: "I agree to receive appointment updates, beauty tips, service information, and occasional promotional emails from Aileen's Beauty. I may unsubscribe at any time.",
  vi: "Tôi đồng ý nhận thông tin cập nhật lịch hẹn, mẹo làm đẹp, thông tin dịch vụ và email khuyến mãi không thường xuyên từ Aileen's Beauty. Tôi có thể hủy đăng ký bất cứ lúc nào.",
  es: "Acepto recibir actualizaciones de citas, consejos de belleza, información de servicios y correos electrónicos promocionales ocasionales de Aileen's Beauty. Puedo cancelar la suscripción en cualquier momento.",
};

export const CONFIRM_STATEMENT: Record<"en" | "vi" | "es", string> = {
  en: "I confirm that the information I provided is accurate. I understand that checking in does not guarantee service availability and does not replace any service-specific consent form that may be required.",
  vi: "Tôi xác nhận thông tin tôi cung cấp là chính xác. Tôi hiểu rằng việc đăng ký không đảm bảo dịch vụ luôn sẵn sàng và không thay thế bất kỳ mẫu đồng ý riêng cho dịch vụ nào có thể được yêu cầu.",
  es: "Confirmo que la información que proporcioné es correcta. Entiendo que registrarme no garantiza la disponibilidad del servicio y no reemplaza ningún formulario de consentimiento específico del servicio que pueda ser requerido.",
};
