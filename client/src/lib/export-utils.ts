import type { GuaranteeLetterWithRelations } from "@shared/schema";

export async function exportToExcel(data: GuaranteeLetterWithRelations[], filename: string) {
  try {
    // Create CSV content from data
    const headers = [
      'Banka',
      'Proje',
      'Mektup Türü',
      'Sözleşme Tutarı',
      'Mektup Yüzdesi',
      'Mektup Tutarı',
      'Komisyon Oranı',
      'Para Birimi',
      'Alım Tarihi',
      'Mektup Tarihi',
      'Son Geçerlilik Tarihi',
      'Durum',
      'Notlar'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        `"${row.bank?.name || ''}"`,
        `"${row.project?.name || ''}"`,
        `"${row.letterType || ''}"`,
        row.contractAmount || '0',
        row.letterPercentage || '0',
        row.letterAmount || '0',
        row.commissionRate || '0',
        row.currency || '',
        row.purchaseDate || '',
        row.letterDate || '',
        row.expiryDate || '',
        row.status || '',
        `"${row.notes || ''}"`
      ].join(','))
    ].join('\n');

    // Add BOM for proper UTF-8 encoding in Excel
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename.replace('.xlsx', '.csv'));
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Excel export failed');
  }
}

export async function exportToPDF(data: GuaranteeLetterWithRelations[], filename: string) {
  try {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Teminat Mektupları Raporu</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .header { text-align: center; margin-bottom: 20px; }
          .currency { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Teminat Mektupları Raporu</h1>
          <p>Tarih: ${new Date().toLocaleDateString('tr-TR')}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Banka</th>
              <th>Proje</th>
              <th>Tür</th>
              <th>Sözleşme Tutarı</th>
              <th>Mektup Tutarı</th>
              <th>Para Birimi</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.bank?.name || ''}</td>
                <td>${row.project?.name || ''}</td>
                <td>${row.letterType || ''}</td>
                <td class="currency">${row.contractAmount || '0'}</td>
                <td class="currency">${row.letterAmount || '0'}</td>
                <td>${row.currency || ''}</td>
                <td>${row.status || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename.replace('.pdf', '.html'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Note: For actual PDF generation, you would need a library like jsPDF or Puppeteer
    // This implementation creates an HTML file that can be printed to PDF
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('PDF export failed');
  }
}
