const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const openPrintableTable = ({ title, columns, rows, emptyMessage = "Aucune donnee disponible" }) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeRows = Array.isArray(rows) ? rows : [];
  const printableDate = new Date().toLocaleDateString("fr-FR");

  printWindow.document.write(`
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 24px;
            color: #1f2937;
          }
          .header {
            text-align: center;
            margin-bottom: 24px;
          }
          .header h1 {
            margin: 0 0 8px;
            font-size: 24px;
            color: #1f2937;
          }
          .header p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 8px 10px;
            text-align: left;
            font-size: 12px;
            word-break: break-word;
          }
          th {
            background-color: #3a8a90;
            color: #ffffff;
            font-weight: 700;
          }
          tbody tr:nth-child(even) {
            background-color: #f9fafb;
          }
          @media print {
            body {
              margin: 12px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${escapeHtml(title)}</h1>
          <p>Date: ${escapeHtml(printableDate)}</p>
        </div>
        <table>
          <thead>
            <tr>${safeColumns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${
              safeRows.length > 0
                ? safeRows
                    .map(
                      (row) => `
                        <tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>
                      `
                    )
                    .join("")
                : `<tr><td colspan="${Math.max(safeColumns.length, 1)}" style="text-align:center;">${escapeHtml(emptyMessage)}</td></tr>`
            }
          </tbody>
        </table>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

