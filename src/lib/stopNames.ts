const SHORT_NAMES: Record<string, string> = {
  'Mingora General Stand': 'Mingora',
  'Kanju Chowk': 'Kanju',
  Dherai: 'Dherai',
  'Kabal Chowk': 'Kabal',
  Sirsinai: 'Sirsinai',
  'Matta General Stand': 'Matta',
  'Mingora / Fizagat': 'Fizagat',
  'Charbagh Chowk': 'Charbagh',
  'Khwazakhela Bypass': 'Khwazakhela',
  Fatehpur: 'Fatehpur',
  'Madyan Stand': 'Madyan',
  'Bahrain Bazaar': 'Bahrain',
};

export function shortStopName(name: string): string {
  return SHORT_NAMES[name] ?? name.split(' ')[0];
}
