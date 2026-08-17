import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  section: { marginBottom: 10 },
  title: { fontSize: 20, marginBottom: 15, fontWeight: 'bold' },
  label: { fontWeight: 'bold', width: 100 },
  row: { flexDirection: 'row', marginBottom: 5 },
});

export interface IncidentPdfProps {
  data: any;
}

export function IncidentReportDocument({ data }: IncidentPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Incident Report</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>ID:</Text>
            <Text>{data?.id || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Description:</Text>
            <Text>{data?.description || 'No description provided'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Created At:</Text>
            <Text>{data?.created_at || 'N/A'}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}