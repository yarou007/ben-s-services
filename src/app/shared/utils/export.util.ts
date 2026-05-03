export interface CsvExportOptions {
  filename: string;
  rows: Array<Record<string, unknown>>;
}

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function buildCsv(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const headerLine = headers.map((header) => escapeCsvValue(header)).join(',');

  const lines = rows.map((row) =>
    headers
      .map((header) => escapeCsvValue(row[header]))
      .join(',')
  );

  return [headerLine, ...lines].join('\n');
}

export function downloadCsv({ filename, rows }: CsvExportOptions): void {
  const csv = buildCsv(rows);
  if (!csv) {
    return;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function todayForFileName(): string {
  return new Date().toISOString().slice(0, 10);
}
