import fs from 'node:fs';
import pdfParse from 'pdf-parse';

/**
 * Extract text content from a PDF file on disk.
 */
export async function extractTextFromPdf(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

/**
 * Extract text from a PDF buffer (e.g. from multer).
 */
export async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}
