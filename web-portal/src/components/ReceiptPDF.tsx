import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica', color: '#333' },
  header: { fontSize: 20, marginBottom: 20, textAlign: 'center', color: '#4F46E5', fontWeight: 'bold' },
  section: { margin: 10, padding: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  bold: { fontWeight: 'bold' },
  total: { marginTop: 20, borderTop: '1px solid #ccc', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', fontSize: 14 }
});

export function ReceiptPDF({ customerName, serviceName, date, amount }: { customerName: string; serviceName: string; date: string; amount: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>Groomer Safety System - Receipt</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Customer Name:</Text>
            <Text style={styles.bold}>{customerName}</Text>
          </View>
          <View style={styles.row}>
            <Text>Service Provided:</Text>
            <Text style={styles.bold}>{serviceName}</Text>
          </View>
          <View style={styles.row}>
            <Text>Date:</Text>
            <Text>{date}</Text>
          </View>
        </View>
        <View style={styles.total}>
          <Text>Total Paid:</Text>
          <Text>{amount}</Text>
        </View>
      </Page>
    </Document>
  );
}