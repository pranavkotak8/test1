import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import StatusBadge from './StatusBadge';
import { CATEGORIES, STORAGE_LOCATIONS } from '../constants/categories';
import { formatDateDisplay, getDaysUntilExpiry } from '../utils/dateUtils';

export default function ItemCard({ item, onPress, onDelete, onConsume }) {
  const category = CATEGORIES[item.category?.toUpperCase()] || CATEGORIES.OTHER;
  const storage = STORAGE_LOCATIONS[item.storageLocation?.toUpperCase()] || STORAGE_LOCATIONS.FRIDGE;
  const daysLeft = getDaysUntilExpiry(item.expiryDate);

  const getBorderColor = () => {
    if (item.status === 'expired') return '#fecaca';
    if (item.status === 'expiring_soon') return '#fde68a';
    return '#e2e8f0';
  };

  const getGradientColors = () => {
    if (item.status === 'expired') return ['#fef2f2', '#ffffff'];
    if (item.status === 'expiring_soon') return ['#fffbeb', '#ffffff'];
    return ['#f0fdf4', '#ffffff'];
  };

  return (
    <TouchableOpacity onPress={() => onPress?.(item)} activeOpacity={0.7}>
      <View style={[styles.card, { borderColor: getBorderColor(), borderWidth: 1.5 }]}>
        <LinearGradient colors={getGradientColors()} style={styles.gradient}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                <Ionicons name={category.icon} size={18} color={category.color} />
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.itemName} numberOfLines={1}>{item.itemName}</Text>
                {item.originalReceiptName && item.originalReceiptName !== item.itemName && (
                  <Text style={styles.originalName} numberOfLines={1}>Receipt: {item.originalReceiptName}</Text>
                )}
              </View>
            </View>
            <StatusBadge status={item.status} size="small" />
          </View>

          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Ionicons name={storage.icon} size={14} color="#64748b" />
              <Text style={styles.detailText}>{storage.label}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color="#64748b" />
              <Text style={[styles.detailText, item.status === 'expired' && { color: '#ef4444', fontWeight: '700' }, item.status === 'expiring_soon' && { color: '#f59e0b', fontWeight: '700' }]}>
                {formatDateDisplay(item.expiryDate)}
              </Text>
            </View>
            {item.quantity > 1 && (
              <View style={styles.detailItem}>
                <Ionicons name="cube-outline" size={14} color="#64748b" />
                <Text style={styles.detailText}>x{item.quantity}</Text>
              </View>
            )}
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {
                width: `${Math.max(0, Math.min(100, (daysLeft / (item.shelfLifeDays || 7)) * 100))}%`,
                backgroundColor: item.status === 'expired' ? '#ef4444' : item.status === 'expiring_soon' ? '#f59e0b' : '#10b981'
              }]} />
            </View>
            <Text style={styles.progressText}>{daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}</Text>
          </View>

          {/* Inline action buttons instead of swipe */}
          <View style={styles.actionsRow}>
            {item.status !== 'consumed' && item.status !== 'expired' && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#d1fae5' }]} onPress={() => onConsume?.(item.id)}>
                <Ionicons name="checkmark-done" size={14} color="#10b981" />
                <Text style={[styles.actionBtnText, { color: '#10b981' }]}>Consumed</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#fee2e2' }]} onPress={() => onDelete?.(item.id)}>
              <Ionicons name="trash" size={14} color="#ef4444" />
              <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 6, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  gradient: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  categoryIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  titleContainer: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  originalName: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  details: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  progressBar: { flex: 1, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressText: { fontSize: 11, color: '#94a3b8', fontWeight: '600', minWidth: 50, textAlign: 'right' },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 },
  actionBtnText: { fontSize: 12, fontWeight: '700' },
});
