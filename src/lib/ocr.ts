import Tesseract from "tesseract.js";

export interface OcrResult {
  text: string;
  confidence: number;
  language: string;
}

async function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 2400 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Grayscale + contrast boost
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        // Contrast stretch: push toward black or white
        const contrast = Math.min(255, Math.max(0, (gray - 128) * 1.4 + 128));
        d[i] = d[i + 1] = d[i + 2] = contrast;
      }
      ctx.putImageData(imageData, 0, 0);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(URL.createObjectURL(file));
    };

    img.src = url;
  });
}

function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")           // collapse spaces/tabs
    .replace(/\n{3,}/g, "\n\n")        // max 2 consecutive blank lines
    .replace(/[^\S\n]+$/gm, "")        // trailing spaces per line
    .replace(/^\s+|\s+$/g, "")         // trim overall
    .replace(/([a-z])-\n([a-z])/g, "$1$2"); // rejoin hyphenated line breaks
}

export async function performOcr(
  file: File,
  onProgress?: (progress: number, status: string) => void
): Promise<OcrResult> {
  onProgress?.(5, "Preprocessing image...");

  const isImage = file.type.startsWith("image/");
  const imageUrl = isImage ? await preprocessImage(file) : URL.createObjectURL(file);

  try {
    onProgress?.(15, "Initializing OCR engine...");

    const result = await Tesseract.recognize(imageUrl, "eng+fra+deu+spa+ita+por", {
      logger: (m) => {
        if (m.status === "recognizing text" && typeof m.progress === "number") {
          onProgress?.(15 + m.progress * 78, "Scanning document...");
        }
      },
    });

    onProgress?.(95, "Cleaning up text...");

    return {
      text: cleanText(result.data.text),
      confidence: result.data.confidence,
      language: (result.data as any).script || "Latin",
    };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
