export const INDONESIAN_NUMBERS: Record<number, string[]> = {
  0: ['nol', 'null', 'kosong', 'zero', '0'],
  1: ['satu', 'one', '1'],
  2: ['dua', 'two', '2'],
  3: ['tiga', 'three', '3'],
  4: ['empat', 'four', '4'],
  5: ['lima', 'five', '5'],
  6: ['enam', 'six', '6'],
  7: ['tujuh', 'seven', '7'],
  8: ['delapan', 'eight', '8'],
  9: ['sembilan', 'nine', '9'],
};

export const INDONESIAN_DISPLAY: Record<number, string> = {
  0: 'nol',
  1: 'satu',
  2: 'dua',
  3: 'tiga',
  4: 'empat',
  5: 'lima',
  6: 'enam',
  7: 'tujuh',
  8: 'delapan',
  9: 'sembilan',
};

// Generate 5 random digits (0-9)
export function generateRandom5Digits(): number[] {
  const digits: number[] = [];
  for (let i = 0; i < 5; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }
  return digits;
}

// Convert word to digit if matches Indonesian word or direct number
export function wordToDigit(rawWord: string): number | null {
  const clean = rawWord.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
  if (!clean) return null;

  // Direct digit check
  if (/^\d$/.test(clean)) {
    return parseInt(clean, 10);
  }

  for (const [digitStr, words] of Object.entries(INDONESIAN_NUMBERS)) {
    const digit = parseInt(digitStr, 10);
    if (words.some(w => clean === w || clean.includes(w))) {
      return digit;
    }
  }

  return null;
}

// Checks if spoken transcript contains the target 5 digits in order
export function checkSpokenDigits(
  targetDigits: number[],
  transcript: string
): { matchedIndices: boolean[]; isComplete: boolean; detectedDigits: number[] } {
  const words = transcript.toLowerCase().split(/\s+/);
  const detectedDigits: number[] = [];

  for (const w of words) {
    const d = wordToDigit(w);
    if (d !== null) {
      detectedDigits.push(d);
    }
  }

  const matchedIndices: boolean[] = [false, false, false, false, false];
  let targetPointer = 0;

  for (const d of detectedDigits) {
    if (targetPointer < targetDigits.length && d === targetDigits[targetPointer]) {
      matchedIndices[targetPointer] = true;
      targetPointer++;
    }
  }

  const isComplete = targetPointer === targetDigits.length;

  return {
    matchedIndices,
    isComplete,
    detectedDigits,
  };
}
