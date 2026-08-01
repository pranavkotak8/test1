import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StatsCard({ stats }) {
  if (!stats) return null;
  const statItems = [
    { key: 'fresh', label: 'Fresh', icon: 'leaf', color: '#10b981' },
    { key: 'expiring_soon', label: 'Expiring', icon: 'warning', color: '#f59e0b' },
    { key: 'expired', label: 'Expired', icon: 'alert-circle', color: '#ef4444' },
    { key: 'total', label: 'Total', icon: 'cube', color: '#3b82f6' },
  ];

  return (
    <View style={styles.container}>
      {statItems.map((item) => (
        <View key={item.key} style={styles.statBox}>
          <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
            <Ionicons name={item.icon} size={20} color={item.color} />
          </View>
          <Text style={[styles.count, { color: item.color }]}>{stats[item.key] || 0}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16, marginVertical: 12, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: '#e2e8f0' },
  statBox: { alignItems: 'center', flex: 1 },
  iconCircle: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  count: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  label: { fontSize: 11, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
});
