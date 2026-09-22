import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReceiptPDF } from './ReceiptPDF';

interface ReceiptData {
  id: string;
  name: string;
  service: string;
  date: string;
  amount: string;
}

export function ReceiptDownloadButton({ receiptData }: { receiptData: ReceiptData }) {
  return (
    <PDFDownloadLink
      document={
        <ReceiptPDF 
          customerName={receiptData.name} 
          serviceName={receiptData.service} 
          date={receiptData.date} 
          amount={receiptData.amount} 
        />
      }
      fileName={`receipt-${receiptData.id}.pdf`}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition inline-block text-center"
    >
      {/* @ts-ignore */}
      {({ loading }) => (loading ? 'Generating PDF...' : 'Download Receipt PDF')}
    </PDFDownloadLink>
  );
}