// Kiosk translations. English and Vietnamese are fully supported; Spanish is
// provided as an optional third language. The admin dashboard is English-only.

export type Lang = "en" | "vi" | "es";

export interface KioskDict {
  langName: string;
  welcome: {
    title: string;
    subtitle: string;
    appointment: string;
    consultation: string;
    walkIn: string;
    giftCard: string;
    withSomeone: string;
    privacy: string;
    tapToBegin: string;
  };
  info: {
    title: string;
    subtitle: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    birthday: string;
    optional: string;
    preferredLanguage: string;
    languages: { en: string; vi: string; es: string; other: string };
    firstVisit: string;
    yes: string;
    no: string;
    returningPrompt: string;
    findMe: string;
    lookingUp: string;
    welcomeBack: string;
    notFound: string;
    errors: { firstName: string; lastName: string; phone: string; email: string };
  };
  services: {
    title: string;
    subtitle: string;
    hasAppointment: string;
    yes: string;
    no: string;
    notSure: string;
    appointmentTime: string;
    staffMember: string;
    serviceBooked: string;
    bookingHelp: string;
    bookingYes: string;
    bookingLater: string;
    bookingInfo: string;
    errorNoService: string;
  };
  details: {
    title: string;
    removalHeading: string;
    tattooColor: string;
    colors: Record<string, string>;
    tattooAge: string;
    tattooAgePlaceholder: string;
    triedLaser: string;
    triedSaline: string;
    photoPrompt: string;
    photoButton: string;
    photoChosen: string;
    photoRemove: string;
    goal: string;
    goals: { complete: string; lighten: string; correct: string; advice: string };
    facialHeading: string;
    skinConcern: string;
    concerns: Record<string, string>;
    prescription: string;
    recentTreatment: string;
    bodyScrubHeading: string;
    femaleOnly: string;
    femaleConfirm: string;
    contraindications: string;
    safetyQuestion: string;
    safetyPlaceholder: string;
    safetyDisclaimer: string;
    yes: string;
    no: string;
  };
  referral: {
    title: string;
    whoReferred: string;
    whoReferredPlaceholder: string;
  };
  consent: {
    title: string;
    subtitle: string;
    smsLabel: string;
    emailLabel: string;
    note: string;
    privacyPolicy: string;
    terms: string;
    smsTerms: string;
  };
  review: {
    title: string;
    subtitle: string;
    edit: string;
    name: string;
    phone: string;
    email: string;
    birthday: string;
    language: string;
    firstVisit: string;
    visitType: string;
    services: string;
    appointment: string;
    referral: string;
    smsConsent: string;
    emailConsent: string;
    granted: string;
    declined: string;
    signature: string;
    signHere: string;
    clear: string;
    statement: string;
    back: string;
    confirm: string;
    submitting: string;
    submitError: string;
  };
  confirmation: {
    title: string;
    subtitle: string;
    service: string;
    appointmentTime: string;
    waitMessage: string;
    returnButton: string;
    autoReturn: string;
  };
  visitTypes: Record<string, string>;
  common: {
    back: string;
    continue: string;
    skip: string;
    startOver: string;
    stillThere: string;
    resetNotice: string;
  };
}

const en: KioskDict = {
  langName: "English",
  welcome: {
    title: "Welcome to Aileen’s Beauty",
    subtitle: "We’re happy you’re here. Please check in below.",
    appointment: "I Have an Appointment",
    consultation: "I’m Here for a Consultation",
    walkIn: "I’m a Walk-In",
    giftCard: "I’m Picking Up a Gift Card",
    withSomeone: "I’m Here With Someone",
    privacy:
      "Your information is kept private and used only to manage your visit and communicate with you.",
    tapToBegin: "Tap an option to begin",
  },
  info: {
    title: "Tell us about you",
    subtitle: "We’ll use this to manage your visit.",
    firstName: "First name",
    lastName: "Last name",
    phone: "Mobile phone number",
    email: "Email address",
    birthday: "Birthday",
    optional: "optional",
    preferredLanguage: "Preferred language",
    languages: { en: "English", vi: "Tiếng Việt", es: "Español", other: "Other" },
    firstVisit: "Is this your first visit?",
    yes: "Yes",
    no: "No",
    returningPrompt: "Visited us before? Enter your phone number and we’ll find your profile.",
    findMe: "Find My Profile",
    lookingUp: "Looking you up…",
    welcomeBack: "Welcome back, {name}! We’ve filled in your details — please review them.",
    notFound: "We couldn’t find that number. Please fill in your details below.",
    errors: {
      firstName: "Please enter your first name.",
      lastName: "Please enter your last name.",
      phone: "Please enter a valid 10-digit phone number.",
      email: "Please enter a valid email address.",
    },
  },
  services: {
    title: "What brings you in today?",
    subtitle: "Select all that apply.",
    hasAppointment: "Do you already have an appointment?",
    yes: "Yes",
    no: "No",
    notSure: "I’m not sure",
    appointmentTime: "Appointment time",
    staffMember: "Staff member",
    serviceBooked: "Service booked",
    bookingHelp: "Would you like help booking an appointment today?",
    bookingYes: "Yes",
    bookingLater: "Maybe later",
    bookingInfo: "I only want information",
    errorNoService: "Please choose at least one service.",
  },
  details: {
    title: "A few more details",
    removalHeading: "About your existing tattoo",
    tattooColor: "What color is the existing tattoo?",
    colors: {
      black: "Black", gray: "Gray", blue: "Blue", green: "Green", red: "Red",
      orange: "Orange", brown: "Brown", mixed: "Mixed colors", notSure: "Not sure",
    },
    tattooAge: "Approximately how old is the tattoo?",
    tattooAgePlaceholder: "e.g. 3 years",
    triedLaser: "Have you previously tried laser removal?",
    triedSaline: "Have you previously tried saline or another removal method?",
    photoPrompt: "Do you have a recent photo you would like to upload?",
    photoButton: "Upload a Photo",
    photoChosen: "Photo attached",
    photoRemove: "Remove",
    goal: "What is your goal?",
    goals: {
      complete: "Complete removal",
      lighten: "Lighten it for a new brow",
      correct: "Correct the color",
      advice: "I need professional advice",
    },
    facialHeading: "About your skin",
    skinConcern: "What is your main skin concern?",
    concerns: {
      dryness: "Dryness", acne: "Acne", melasma: "Melasma", fineLines: "Fine lines",
      wrinkles: "Wrinkles", unevenTone: "Uneven skin tone", pores: "Large pores",
      sagging: "Sagging skin", darkSpots: "Dark spots", sensitive: "Sensitive skin",
      maintenance: "General maintenance",
    },
    prescription: "Do you currently use prescription skincare products?",
    recentTreatment: "Have you had a facial or skin treatment within the past 30 days?",
    bodyScrubHeading: "Body scrub",
    femaleOnly: "Our body scrub service is available for women only.",
    femaleConfirm: "I confirm this service is for a female guest",
    contraindications:
      "Do you have sensitive skin, active rashes, open wounds, or recent surgery?",
    safetyQuestion:
      "Do you have any allergies, sensitivities, medical concerns, or medications we should know about?",
    safetyPlaceholder: "Type anything we should know (or leave blank)…",
    safetyDisclaimer:
      "This question helps us provide your service safely. It is not medical advice, and this check-in is not a medical diagnostic system.",
    yes: "Yes",
    no: "No",
  },
  referral: {
    title: "How did you hear about Aileen’s Beauty?",
    whoReferred: "Who referred you?",
    whoReferredPlaceholder: "Their name",
  },
  consent: {
    title: "Stay in touch",
    subtitle:
      "Both choices are optional — you can check in either way, and you can change your mind at any time.",
    smsLabel: "Text messages",
    emailLabel: "Email",
    note: "Marketing permission is optional and separate from your check-in.",
    privacyPolicy: "Privacy Policy",
    terms: "Terms & Conditions",
    smsTerms: "SMS Terms",
  },
  review: {
    title: "Please review your information",
    subtitle: "Tap Edit to correct anything.",
    edit: "Edit",
    name: "Name",
    phone: "Phone",
    email: "Email",
    birthday: "Birthday",
    language: "Language",
    firstVisit: "First visit",
    visitType: "Visit type",
    services: "Services",
    appointment: "Appointment",
    referral: "Heard about us",
    smsConsent: "Text updates",
    emailConsent: "Email updates",
    granted: "Yes",
    declined: "No",
    signature: "Signature",
    signHere: "Please sign with your finger",
    clear: "Clear",
    statement:
      "I confirm that the information I provided is accurate. I understand that checking in does not guarantee service availability and does not replace any service-specific consent form that may be required.",
    back: "Back",
    confirm: "Confirm Check-In",
    submitting: "Checking you in…",
    submitError: "Something went wrong. Please try again or ask our front desk for help.",
  },
  confirmation: {
    title: "You’re Checked In!",
    subtitle: "Thank you. Aileen has been notified that you have arrived.",
    service: "Service",
    appointmentTime: "Appointment time",
    waitMessage: "We’ll be with you shortly.",
    returnButton: "Return to Welcome Screen",
    autoReturn: "Returning to the welcome screen in {seconds} seconds",
  },
  visitTypes: {
    APPOINTMENT: "Appointment",
    CONSULTATION: "Consultation",
    WALK_IN: "Walk-In",
    GIFT_CARD: "Gift Card Pickup",
    ACCOMPANYING: "Here With Someone",
  },
  common: {
    back: "Back",
    continue: "Continue",
    skip: "Skip",
    startOver: "Start Over",
    stillThere: "Are you still there?",
    resetNotice: "This screen resets automatically to protect your privacy.",
  },
};

const vi: KioskDict = {
  langName: "Tiếng Việt",
  welcome: {
    title: "Chào mừng đến Aileen’s Beauty",
    subtitle: "Rất vui được đón tiếp quý khách. Vui lòng đăng ký bên dưới.",
    appointment: "Tôi có lịch hẹn",
    consultation: "Tôi đến để được tư vấn",
    walkIn: "Tôi đến trực tiếp (chưa có hẹn)",
    giftCard: "Tôi đến nhận thẻ quà tặng",
    withSomeone: "Tôi đi cùng người khác",
    privacy:
      "Thông tin của quý khách được bảo mật và chỉ dùng để phục vụ buổi hẹn và liên lạc với quý khách.",
    tapToBegin: "Chạm vào một lựa chọn để bắt đầu",
  },
  info: {
    title: "Thông tin của quý khách",
    subtitle: "Chúng tôi dùng thông tin này để phục vụ buổi hẹn của quý khách.",
    firstName: "Tên",
    lastName: "Họ",
    phone: "Số điện thoại di động",
    email: "Địa chỉ email",
    birthday: "Ngày sinh",
    optional: "không bắt buộc",
    preferredLanguage: "Ngôn ngữ ưa thích",
    languages: { en: "English", vi: "Tiếng Việt", es: "Español", other: "Khác" },
    firstVisit: "Đây có phải lần đầu quý khách đến không?",
    yes: "Phải",
    no: "Không",
    returningPrompt:
      "Đã từng đến với chúng tôi? Nhập số điện thoại để tìm hồ sơ của quý khách.",
    findMe: "Tìm hồ sơ của tôi",
    lookingUp: "Đang tìm…",
    welcomeBack: "Chào mừng {name} quay lại! Chúng tôi đã điền sẵn thông tin — vui lòng kiểm tra.",
    notFound: "Không tìm thấy số điện thoại này. Vui lòng điền thông tin bên dưới.",
    errors: {
      firstName: "Vui lòng nhập tên.",
      lastName: "Vui lòng nhập họ.",
      phone: "Vui lòng nhập số điện thoại hợp lệ (10 số).",
      email: "Vui lòng nhập địa chỉ email hợp lệ.",
    },
  },
  services: {
    title: "Hôm nay quý khách cần dịch vụ gì?",
    subtitle: "Có thể chọn nhiều dịch vụ.",
    hasAppointment: "Quý khách đã có lịch hẹn chưa?",
    yes: "Rồi",
    no: "Chưa",
    notSure: "Tôi không chắc",
    appointmentTime: "Giờ hẹn",
    staffMember: "Nhân viên phục vụ",
    serviceBooked: "Dịch vụ đã đặt",
    bookingHelp: "Quý khách có muốn được hỗ trợ đặt lịch hẹn hôm nay không?",
    bookingYes: "Có",
    bookingLater: "Để sau",
    bookingInfo: "Tôi chỉ muốn tìm hiểu thông tin",
    errorNoService: "Vui lòng chọn ít nhất một dịch vụ.",
  },
  details: {
    title: "Một vài thông tin thêm",
    removalHeading: "Về hình xăm hiện tại",
    tattooColor: "Hình xăm hiện tại có màu gì?",
    colors: {
      black: "Đen", gray: "Xám", blue: "Xanh dương", green: "Xanh lá", red: "Đỏ",
      orange: "Cam", brown: "Nâu", mixed: "Nhiều màu", notSure: "Không chắc",
    },
    tattooAge: "Hình xăm đã được khoảng bao lâu?",
    tattooAgePlaceholder: "ví dụ: 3 năm",
    triedLaser: "Quý khách đã từng thử xóa bằng laser chưa?",
    triedSaline: "Quý khách đã từng thử xóa bằng saline hoặc phương pháp khác chưa?",
    photoPrompt: "Quý khách có ảnh gần đây muốn tải lên không?",
    photoButton: "Tải ảnh lên",
    photoChosen: "Đã đính kèm ảnh",
    photoRemove: "Xóa",
    goal: "Mục tiêu của quý khách là gì?",
    goals: {
      complete: "Xóa hoàn toàn",
      lighten: "Làm nhạt để làm chân mày mới",
      correct: "Chỉnh sửa màu",
      advice: "Tôi cần được tư vấn chuyên môn",
    },
    facialHeading: "Về làn da của quý khách",
    skinConcern: "Vấn đề da chính của quý khách là gì?",
    concerns: {
      dryness: "Da khô", acne: "Mụn", melasma: "Nám", fineLines: "Nếp nhăn nhỏ",
      wrinkles: "Nếp nhăn", unevenTone: "Da không đều màu", pores: "Lỗ chân lông to",
      sagging: "Da chảy xệ", darkSpots: "Đốm nâu", sensitive: "Da nhạy cảm",
      maintenance: "Chăm sóc định kỳ",
    },
    prescription: "Quý khách có đang dùng sản phẩm chăm sóc da theo toa không?",
    recentTreatment: "Quý khách có làm facial hoặc điều trị da trong 30 ngày qua không?",
    bodyScrubHeading: "Tẩy tế bào chết toàn thân",
    femaleOnly: "Dịch vụ tẩy tế bào chết toàn thân chỉ dành cho nữ.",
    femaleConfirm: "Tôi xác nhận dịch vụ này dành cho khách nữ",
    contraindications:
      "Quý khách có da nhạy cảm, phát ban, vết thương hở, hoặc mới phẫu thuật không?",
    safetyQuestion:
      "Quý khách có dị ứng, da nhạy cảm, vấn đề sức khỏe, hoặc đang dùng thuốc gì chúng tôi cần biết không?",
    safetyPlaceholder: "Nhập thông tin chúng tôi cần biết (hoặc để trống)…",
    safetyDisclaimer:
      "Câu hỏi này giúp chúng tôi phục vụ an toàn. Đây không phải tư vấn y tế, và hệ thống đăng ký này không phải hệ thống chẩn đoán y khoa.",
    yes: "Có",
    no: "Không",
  },
  referral: {
    title: "Quý khách biết đến Aileen’s Beauty qua đâu?",
    whoReferred: "Ai đã giới thiệu quý khách?",
    whoReferredPlaceholder: "Tên người giới thiệu",
  },
  consent: {
    title: "Giữ liên lạc",
    subtitle:
      "Cả hai lựa chọn đều không bắt buộc — quý khách vẫn có thể đăng ký, và có thể thay đổi ý kiến bất cứ lúc nào.",
    smsLabel: "Tin nhắn",
    emailLabel: "Email",
    note: "Việc đồng ý nhận quảng cáo là tùy chọn và tách biệt với việc đăng ký.",
    privacyPolicy: "Chính sách bảo mật",
    terms: "Điều khoản & Điều kiện",
    smsTerms: "Điều khoản SMS",
  },
  review: {
    title: "Vui lòng kiểm tra thông tin",
    subtitle: "Chạm Sửa để chỉnh sửa.",
    edit: "Sửa",
    name: "Họ tên",
    phone: "Điện thoại",
    email: "Email",
    birthday: "Ngày sinh",
    language: "Ngôn ngữ",
    firstVisit: "Lần đầu đến",
    visitType: "Loại lượt đến",
    services: "Dịch vụ",
    appointment: "Lịch hẹn",
    referral: "Biết đến qua",
    smsConsent: "Nhận tin nhắn",
    emailConsent: "Nhận email",
    granted: "Có",
    declined: "Không",
    signature: "Chữ ký",
    signHere: "Vui lòng ký bằng ngón tay",
    clear: "Xóa",
    statement:
      "Tôi xác nhận thông tin tôi cung cấp là chính xác. Tôi hiểu rằng việc đăng ký không đảm bảo dịch vụ luôn sẵn sàng và không thay thế bất kỳ mẫu đồng ý riêng cho dịch vụ nào có thể được yêu cầu.",
    back: "Quay lại",
    confirm: "Xác nhận đăng ký",
    submitting: "Đang đăng ký…",
    submitError: "Đã có lỗi xảy ra. Vui lòng thử lại hoặc nhờ lễ tân hỗ trợ.",
  },
  confirmation: {
    title: "Đăng ký thành công!",
    subtitle: "Cảm ơn quý khách. Aileen đã được thông báo quý khách vừa đến.",
    service: "Dịch vụ",
    appointmentTime: "Giờ hẹn",
    waitMessage: "Chúng tôi sẽ phục vụ quý khách ngay.",
    returnButton: "Về màn hình chào mừng",
    autoReturn: "Tự động quay về màn hình chào mừng sau {seconds} giây",
  },
  visitTypes: {
    APPOINTMENT: "Lịch hẹn",
    CONSULTATION: "Tư vấn",
    WALK_IN: "Khách vãng lai",
    GIFT_CARD: "Nhận thẻ quà tặng",
    ACCOMPANYING: "Đi cùng người khác",
  },
  common: {
    back: "Quay lại",
    continue: "Tiếp tục",
    skip: "Bỏ qua",
    startOver: "Bắt đầu lại",
    stillThere: "Quý khách còn ở đó không?",
    resetNotice: "Màn hình sẽ tự động làm mới để bảo vệ quyền riêng tư của quý khách.",
  },
};

const es: KioskDict = {
  langName: "Español",
  welcome: {
    title: "Bienvenido a Aileen’s Beauty",
    subtitle: "Nos alegra tenerle aquí. Por favor regístrese abajo.",
    appointment: "Tengo una cita",
    consultation: "Vengo a una consulta",
    walkIn: "Vengo sin cita",
    giftCard: "Vengo por una tarjeta de regalo",
    withSomeone: "Acompaño a alguien",
    privacy:
      "Su información se mantiene privada y se usa solo para gestionar su visita y comunicarnos con usted.",
    tapToBegin: "Toque una opción para comenzar",
  },
  info: {
    title: "Cuéntenos sobre usted",
    subtitle: "Usaremos esto para gestionar su visita.",
    firstName: "Nombre",
    lastName: "Apellido",
    phone: "Número de teléfono móvil",
    email: "Correo electrónico",
    birthday: "Fecha de nacimiento",
    optional: "opcional",
    preferredLanguage: "Idioma preferido",
    languages: { en: "English", vi: "Tiếng Việt", es: "Español", other: "Otro" },
    firstVisit: "¿Es su primera visita?",
    yes: "Sí",
    no: "No",
    returningPrompt:
      "¿Nos ha visitado antes? Ingrese su teléfono y buscaremos su perfil.",
    findMe: "Buscar mi perfil",
    lookingUp: "Buscando…",
    welcomeBack: "¡Bienvenida de nuevo, {name}! Hemos completado sus datos — revíselos.",
    notFound: "No encontramos ese número. Complete sus datos abajo.",
    errors: {
      firstName: "Ingrese su nombre.",
      lastName: "Ingrese su apellido.",
      phone: "Ingrese un teléfono válido de 10 dígitos.",
      email: "Ingrese un correo electrónico válido.",
    },
  },
  services: {
    title: "¿Qué le trae hoy?",
    subtitle: "Seleccione todo lo que aplique.",
    hasAppointment: "¿Ya tiene una cita?",
    yes: "Sí",
    no: "No",
    notSure: "No estoy seguro",
    appointmentTime: "Hora de la cita",
    staffMember: "Miembro del personal",
    serviceBooked: "Servicio reservado",
    bookingHelp: "¿Le gustaría ayuda para reservar una cita hoy?",
    bookingYes: "Sí",
    bookingLater: "Quizás después",
    bookingInfo: "Solo quiero información",
    errorNoService: "Elija al menos un servicio.",
  },
  details: {
    title: "Algunos detalles más",
    removalHeading: "Sobre su tatuaje actual",
    tattooColor: "¿De qué color es el tatuaje actual?",
    colors: {
      black: "Negro", gray: "Gris", blue: "Azul", green: "Verde", red: "Rojo",
      orange: "Naranja", brown: "Marrón", mixed: "Colores mixtos", notSure: "No sé",
    },
    tattooAge: "¿Aproximadamente cuántos años tiene el tatuaje?",
    tattooAgePlaceholder: "ej. 3 años",
    triedLaser: "¿Ha probado antes la eliminación con láser?",
    triedSaline: "¿Ha probado solución salina u otro método de eliminación?",
    photoPrompt: "¿Tiene una foto reciente que le gustaría subir?",
    photoButton: "Subir una foto",
    photoChosen: "Foto adjunta",
    photoRemove: "Quitar",
    goal: "¿Cuál es su objetivo?",
    goals: {
      complete: "Eliminación completa",
      lighten: "Aclararlo para una ceja nueva",
      correct: "Corregir el color",
      advice: "Necesito consejo profesional",
    },
    facialHeading: "Sobre su piel",
    skinConcern: "¿Cuál es su principal preocupación de la piel?",
    concerns: {
      dryness: "Sequedad", acne: "Acné", melasma: "Melasma", fineLines: "Líneas finas",
      wrinkles: "Arrugas", unevenTone: "Tono desigual", pores: "Poros grandes",
      sagging: "Piel flácida", darkSpots: "Manchas oscuras", sensitive: "Piel sensible",
      maintenance: "Mantenimiento general",
    },
    prescription: "¿Usa actualmente productos de cuidado de la piel recetados?",
    recentTreatment: "¿Se ha hecho un facial o tratamiento en los últimos 30 días?",
    bodyScrubHeading: "Exfoliación corporal",
    femaleOnly: "Nuestro servicio de exfoliación corporal es solo para mujeres.",
    femaleConfirm: "Confirmo que este servicio es para una clienta",
    contraindications:
      "¿Tiene piel sensible, sarpullidos activos, heridas abiertas o cirugía reciente?",
    safetyQuestion:
      "¿Tiene alergias, sensibilidades, condiciones médicas o medicamentos que debamos conocer?",
    safetyPlaceholder: "Escriba lo que debamos saber (o déjelo en blanco)…",
    safetyDisclaimer:
      "Esta pregunta nos ayuda a brindar su servicio de forma segura. No es consejo médico, y este registro no es un sistema de diagnóstico médico.",
    yes: "Sí",
    no: "No",
  },
  referral: {
    title: "¿Cómo se enteró de Aileen’s Beauty?",
    whoReferred: "¿Quién le recomendó?",
    whoReferredPlaceholder: "Su nombre",
  },
  consent: {
    title: "Mantengámonos en contacto",
    subtitle:
      "Ambas opciones son opcionales — puede registrarse de cualquier manera y cambiar de opinión en cualquier momento.",
    smsLabel: "Mensajes de texto",
    emailLabel: "Correo electrónico",
    note: "El permiso de marketing es opcional y separado de su registro.",
    privacyPolicy: "Política de Privacidad",
    terms: "Términos y Condiciones",
    smsTerms: "Términos de SMS",
  },
  review: {
    title: "Revise su información",
    subtitle: "Toque Editar para corregir.",
    edit: "Editar",
    name: "Nombre",
    phone: "Teléfono",
    email: "Correo",
    birthday: "Nacimiento",
    language: "Idioma",
    firstVisit: "Primera visita",
    visitType: "Tipo de visita",
    services: "Servicios",
    appointment: "Cita",
    referral: "Nos conoció por",
    smsConsent: "Mensajes de texto",
    emailConsent: "Correos",
    granted: "Sí",
    declined: "No",
    signature: "Firma",
    signHere: "Firme con su dedo",
    clear: "Borrar",
    statement:
      "Confirmo que la información que proporcioné es correcta. Entiendo que registrarme no garantiza la disponibilidad del servicio y no reemplaza ningún formulario de consentimiento específico del servicio que pueda ser requerido.",
    back: "Atrás",
    confirm: "Confirmar registro",
    submitting: "Registrando…",
    submitError: "Algo salió mal. Intente de nuevo o pida ayuda en recepción.",
  },
  confirmation: {
    title: "¡Registro completo!",
    subtitle: "Gracias. Aileen ha sido notificada de su llegada.",
    service: "Servicio",
    appointmentTime: "Hora de la cita",
    waitMessage: "Le atenderemos en breve.",
    returnButton: "Volver a la pantalla de bienvenida",
    autoReturn: "Volviendo a la pantalla de bienvenida en {seconds} segundos",
  },
  visitTypes: {
    APPOINTMENT: "Cita",
    CONSULTATION: "Consulta",
    WALK_IN: "Sin cita",
    GIFT_CARD: "Tarjeta de regalo",
    ACCOMPANYING: "Acompañante",
  },
  common: {
    back: "Atrás",
    continue: "Continuar",
    skip: "Omitir",
    startOver: "Empezar de nuevo",
    stillThere: "¿Sigue ahí?",
    resetNotice: "Esta pantalla se reinicia automáticamente para proteger su privacidad.",
  },
};

export const DICTS: Record<Lang, KioskDict> = { en, vi, es };

export function t(lang: Lang): KioskDict {
  return DICTS[lang] ?? DICTS.en;
}
