import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, STORAGE_LOCATIONS } from '../constants/categories';

export default function CategoryFilter({ selected, onSelect, type = 'category' }) {
  const items = type === 'category'
    ? [{ id: 'all', label: 'All', icon: 'apps', color: '#64748b' }, ...Object.values(CATEGORIES)]
    : [{ id: 'all', label: 'All', icon: 'apps', color: '#64748b' }, ...Object.values(STORAGE_LOCATIONS)];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container} style={styles.scrollView}>
      {items.map((item) => {
        const isSelected = selected === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.chip, isSelected && { backgroundColor: item.color + '20', borderColor: item.color }]}
            onPress={() => onSelect(isSelected ? 'all' : item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name={item.icon} size={14} color={isSelected ? item.color : '#94a3b8'} style={styles.chipIcon} />
            <Text style={[styles.chipText, isSelected && { color: item.color, fontWeight: '700' }]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { maxHeight: 50 },
  container: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1.5, borderColor: 'transparent' },
  chipIcon: { marginRight: 6 },
  chipText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
});
