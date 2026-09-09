import { View, Text, StyleSheet } from 'react-native';

type RiskBannerProps = {
  temperament?: string;
  biteRisk?: string;
  overallRiskLevel?: string;
};

export default function RiskBanner({
  temperament,
  biteRisk,
  overallRiskLevel,
}: RiskBannerProps) {
  // Check for 'medium' or 'caution' to trigger the yellow warning state
  const isCaution =
    overallRiskLevel?.toLowerCase() === 'caution' ||
    overallRiskLevel?.toLowerCase() === 'medium' ||
    temperament === 'Reactive' ||
    biteRisk === 'Caution';

  const isHighRisk =
    overallRiskLevel?.toLowerCase() === 'high' ||
    overallRiskLevel?.toLowerCase() === 'critical' ||
    temperament === 'Aggressive' ||
    biteRisk === 'High';

  if (isHighRisk) {
    return (
      <View style={[styles.banner, styles.bannerHighRisk]}>
        <Text style={styles.bannerTitle}>🚨 HIGH RISK PROFILE</Text>
        <Text style={styles.bannerSub}>
          Strict handling protocols required. Double restraint advised.
        </Text>
      </View>
    );
  }

  if (isCaution) {
    return (
      <View style={[styles.banner, styles.bannerCaution]}>
        <Text style={styles.bannerTitleCaution}>⚠️ CAUTION / SENSITIVE PROFILE</Text>
        <Text style={styles.bannerSubCaution}>
          Active triggers detected. Exercise extra care during handling and grooming.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.banner, styles.bannerLowRisk]}>
      <Text style={styles.bannerTitleLow}>✅ LOW RISK PROFILE</Text>
      <Text style={styles.bannerSubLow}>Standard handling procedures apply.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  bannerLowRisk: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  bannerTitleLow: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 2,
  },
  bannerSubLow: {
    fontSize: 12,
    color: '#15803d',
  },
  bannerCaution: {
    backgroundColor: '#fefce8',
    borderColor: '#fef08a',
  },
  bannerTitleCaution: {
    fontSize: 14,
    fontWeight: '800',
    color: '#854d0e',
    marginBottom: 2,
  },
  bannerSubCaution: {
    fontSize: 12,
    color: '#a16207',
  },
  bannerHighRisk: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991b1b',
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 12,
    color: '#b91c1c',
  },
});