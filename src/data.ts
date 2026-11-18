export type WeddingEvent = {
  id: 'mehndi' | 'barat' | 'walima';
  title: string;
  english: string;
  dateLabel: string;
  weekday: string;
  timeLabel: string;
  isoLocal: string;
  venue: string;
  address: string;
  scene: string;
  detail: string;
  accent: string;
  description: string;
};

export const weddingEvents: WeddingEvent[] = [
  {
    id: 'mehndi', title: 'مہندی', english: 'MEHNDI',
    dateLabel: '۲۸ نومبر ۲۰۲۶', weekday: 'بروز ہفتہ', timeLabel: 'رات ۹:۰۰ بجے',
    isoLocal: '2026-11-28T21:00:00+05:00',
    venue: 'حمزہ ٹاؤن', address: 'حمزہ ٹاؤن، پنڈی بھٹیاں، پنجاب، پاکستان',
    scene: '/assets/mehndi-scene.webp', detail: '/assets/mehndi-detail.webp', accent: '#254735',
    description: 'رنگوں، روشنیوں اور خوشیوں سے سجی ایک یادگار شام'
  },
  {
    id: 'barat', title: 'بارات', english: 'BARAT',
    dateLabel: '۲۹ نومبر ۲۰۲۶', weekday: 'بروز اتوار', timeLabel: 'دوپہر ۱:۰۰ بجے',
    isoLocal: '2026-11-29T13:00:00+05:00',
    venue: 'حمزہ ٹاؤن', address: 'حمزہ ٹاؤن، پنڈی بھٹیاں، پنجاب، پاکستان',
    scene: '/assets/barat-scene.webp', detail: '/assets/barat-detail.webp', accent: '#7b2636',
    description: 'دعاؤں اور مسرتوں کے ساتھ نئی زندگی کا آغاز'
  },
  {
    id: 'walima', title: 'ولیمہ', english: 'WALIMA',
    dateLabel: '۳۰ نومبر ۲۰۲۶', weekday: 'بروز سوموار', timeLabel: 'دوپہر ۲:۰۰ بجے',
    isoLocal: '2026-11-30T14:00:00+05:00',
    venue: 'ملک میرج ہال', address: 'ملک میرج ہال، پنڈی بھٹیاں، پنجاب، پاکستان',
    scene: '/assets/walima-scene.webp', detail: '/assets/walima-detail.webp', accent: '#263f5c',
    description: 'محبت، اپنائیت اور دعا کے ساتھ ضیافتِ مسرت'
  }
];

export const invitationText = `بسم اللہ الرحمن الرحیم\n\nدعوتِ شادی\n\nجنابِ محترم!\nآپ کو بلال حسن فرزند ظفر اقبال کی شادی کی تقریبات میں شرکت کی پُرخلوص دعوت دی جاتی ہے۔\n\nمہندی — ۲۸ نومبر ۲۰۲۶، رات ۹ بجے، حمزہ ٹاؤن پنڈی بھٹیاں\nبارات — ۲۹ نومبر ۲۰۲۶، دوپہر ۱ بجے، حمزہ ٹاؤن پنڈی بھٹیاں\nولیمہ — ۳۰ نومبر ۲۰۲۶، دوپہر ۲ بجے، ملک میرج ہال پنڈی بھٹیاں\n\nآپ کی تشریف آوری ہمارے لیے باعثِ مسرت ہوگی۔`;
