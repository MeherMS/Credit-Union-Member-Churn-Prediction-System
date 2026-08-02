// app/lib/downloadUtils.ts
'use client';

/**
 * Download blob as file
 */
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * Generate CSV from array of objects
 */
export const generateCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers.map((header) => {
      const value = obj[header];
      // Escape quotes and wrap in quotes if contains comma
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    })
  );

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);
};

/**
 * Generate sample CSV for download
 */
export const downloadSampleCSV = () => {
  const sampleData = [
    {
      credit_score: 619,
      country: 'France',
      gender: 'M',
      age: 42,
      tenure: 2,
      balance: 0,
      products_number: 1,
      credit_card: 1,
      active_member: 1,
      estimated_salary: 83711.77,
    },
    {
      credit_score: 608,
      country: 'Spain',
      gender: 'F',
      age: 41,
      tenure: 1,
      balance: 83351.5,
      products_number: 1,
      credit_card: 0,
      active_member: 1,
      estimated_salary: 159660.8,
    },
    {
      credit_score: 502,
      country: 'Germany',
      gender: 'F',
      age: 42,
      tenure: 8,
      balance: 159660.8,
      products_number: 3,
      credit_card: 1,
      active_member: 0,
      estimated_salary: 113755.78,
    },
  ];

  generateCSV(sampleData, 'sample_members.csv');
};