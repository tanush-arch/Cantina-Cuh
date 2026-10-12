import { createWorker } from 'tesseract.js';

class OCRService {
  constructor() {
    this.worker = null;
    this.isProcessing = false;
  }

  async recognize(imageSource, { lang = 'eng', onProgress } = {}) {
    if (this.isProcessing) {
      throw new Error('An OCR process is already underway. Please wait.');
    }

    this.isProcessing = true;

    try {
      // Map UI language to Tesseract language codes
      const tessLang = lang.startsWith('ta') ? 'tam+eng' : 'eng';
      
      const worker = await createWorker(tessLang, 1, {
        logger: (m) => {
          if (onProgress && m.status && typeof m.progress === 'number') {
            onProgress({
              status: m.status,
              progress: Math.round(m.progress * 100),
            });
          }
        },
      });

      const { data } = await worker.recognize(imageSource);
      await worker.terminate();

      this.isProcessing = false;
      return {
        text: data.text ? data.text.trim() : '',
        confidence: data.confidence,
      };
    } catch (err) {
      this.isProcessing = false;
      throw err;
    }
  }
}

export const ocrService = new OCRService();
