export function exportAsPdf(title: string, text: string) {
  // Create a printable HTML and trigger browser print/save as PDF
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 700px; margin: 40px auto; padding: 20px; color: #1a1a2e; }
        h1 { font-size: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
        .meta { color: #64748b; font-size: 12px; margin-bottom: 24px; }
        pre { white-space: pre-wrap; word-wrap: break-word; font-size: 14px; line-height: 1.7; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="meta">Scanned on ${new Date().toLocaleString()} · DocScanner AI</p>
      <pre>${text}</pre>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}
