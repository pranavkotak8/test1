import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { STATUS_CONFIG } from '../constants/categories';

export default function StatusBadge({ status, size = 'medium' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.fresh;
  const sizes = {
    small: { paddingVertical: 2, paddingHorizontal: 8, fontSize: 10, iconSize: 10 },
    medium: { paddingVertical: 4, paddingHorizontal: 12, fontSize: 12, iconSize: 14 },
    large: { paddingVertical: 6, paddingHorizontal: 16, fontSize: 14, iconSize: 16 },
  };
  const s = sizes[size];
  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor, paddingVertical: s.paddingVertical, paddingHorizontal: s.paddingHorizontal }]}>
      <Ionicons name={config.icon} size={s.iconSize} color={config.color} style={styles.icon} />
      <Text style={[styles.text, { color: config.color, fontSize: s.fontSize }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, alignSelf: 'flex-start' },
  icon: { marginRight: 4 },
  text: { fontWeight: '700' },
});
