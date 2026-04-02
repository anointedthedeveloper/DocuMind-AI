import Tesseract from "tesseract.js";

export interface OcrResult {
  text: string;
  confidence: number;
  language: string;
}

export async function performOcr(
  file: File,
  onProgress?: (progress: number, status: string) => void
): Promise<OcrResult> {
  onProgress?.(10, "Initializing OCR engine...");

  const imageUrl = URL.createObjectURL(file);

  try {
    const result = await Tesseract.recognize(imageUrl, "eng+fra+deu+spa+ita+por", {
      logger: (m) => {
        if (m.status === "recognizing text" && typeof m.progress === "number") {
          onProgress?.(10 + m.progress * 80, "Scanning document...");
        }
      },
    });

    onProgress?.(95, "Finalizing...");

    return {
      text: result.data.text.trim(),
      confidence: result.data.confidence,
      language: (result.data as any).script || "Latin",
    };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
