import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Share, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { CATEGORIES, STORAGE_LOCATIONS, STATUS_CONFIG } from '../constants/categories';
import { deleteItem, updateItemStatus } from '../services/database';
import { cancelItemNotifications } from '../services/notificationService';
import { formatFullDate, getDaysUntilExpiry } from '../utils/dateUtils';
import StatusBadge from '../components/StatusBadge';

export default function ItemDetailScreen({ navigation, route }) {
  const { item: initialItem } = route.params;
  const [item, setItem] = useState(initialItem);
  const [showActions, setShowActions] = useState(false);

  const category = CATEGORIES[item.category?.toUpperCase()] || CATEGORIES.OTHER;
  const storage = STORAGE_LOCATIONS[item.storageLocation?.toUpperCase()] || STORAGE_LOCATIONS.FRIDGE;
  const daysLeft = getDaysUntilExpiry(item.expiryDate);
  const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.fresh;

  const handleDelete = () => {
    Alert.alert('Delete Item', `Are you sure you want to delete "${item.itemName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await cancelItemNotifications(item.id); await deleteItem(item.id); navigation.goBack(); }
        catch (error) { Alert.alert('Error', 'Failed to delete item'); }
      }},
    ]);
  };

  const handleConsume = async () => {
    try { await cancelItemNotifications(item.id); await updateItemStatus(item.id, 'consumed'); setItem(prev => ({ ...prev, status: 'consumed' })); Alert.alert('Great!', `"${item.itemName}" marked as consumed.`); }
    catch (error) { Alert.alert('Error', 'Failed to update item'); }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Pantry Item: ${item.itemName}\nCategory: ${category.label}\nStorage: ${storage.label}\nExpires: ${formatFullDate(item.expiryDate)} (${daysLeft >= 0 ? daysLeft + ' days left' : Math.abs(daysLeft) + ' days overdue'})`,
      });
    } catch (error) { console.error(error); }
  };

  const DetailRow = ({ icon, label, value, color }) => (
    <View style={styles.detailRow}>
      <View style={[styles.detailIcon, { backgroundColor: (color || '#64748b') + '15' }]}>
        <Ionicons name={icon} size={18} color={color || '#64748b'} />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[statusConfig.bgColor, '#f8fafc']} style={styles.headerGradient}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#1e293b" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowActions(true)} style={styles.backButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#1e293b" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <View style={[styles.categoryIconLarge, { backgroundColor: category.color + '20' }]}>
              <Ionicons name={category.icon} size={32} color={category.color} />
            </View>
            <Text style={styles.itemName}>{item.itemName}</Text>
            {item.originalReceiptName && item.originalReceiptName !== item.itemName && (
              <Text style={styles.originalName}>Receipt name: {item.originalReceiptName}</Text>
            )}
            <View style={{ marginTop: 12 }}>
              <StatusBadge status={item.status} size="large" />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Freshness Timeline</Text>
            <Text style={[styles.progressStatus, { color: statusConfig.color }]}>
              {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days remaining`}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {
              width: `${Math.max(0, Math.min(100, (daysLeft / (item.shelfLifeDays || 7)) * 100))}%`,
              backgroundColor: statusConfig.color,
            }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Purchased</Text>
            <Text style={styles.progressLabel}>Today</Text>
            <Text style={styles.progressLabel}>Expiry</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Item Details</Text>
          <DetailRow icon={category.icon} label="Category" value={category.label} color={category.color} />
          <DetailRow icon={storage.icon} label="Storage" value={storage.label} color={storage.color} />
          <DetailRow icon="cube-outline" label="Quantity" value={`${item.quantity} ${item.quantity > 1 ? 'units' : 'unit'}`} />
          <DetailRow icon="calendar-outline" label="Purchase Date" value={formatFullDate(item.purchaseDate)} />
          <DetailRow icon="alarm-outline" label="Expiry Date" value={formatFullDate(item.expiryDate)} color={statusConfig.color} />
          <DetailRow icon="time-outline" label="Shelf Life" value={`${item.shelfLifeDays} days`} />
          <DetailRow icon="create-outline" label="Added On" value={formatFullDate(item.createdAt?.split('T')[0])} />
        </View>

        <View style={styles.quickActions}>
          {item.status !== 'consumed' && item.status !== 'expired' && (
            <TouchableOpacity style={styles.actionButton} onPress={handleConsume}>
              <LinearGradient colors={['#10b981', '#059669']} style={styles.actionGradient}>
                <Ionicons name="checkmark-done" size={20} color="#fff" />
                <Text style={styles.actionText}>Mark as Consumed</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={() => navigation.navigate('AddItem', { item })}>
            <Ionicons name="create-outline" size={20} color="#3b82f6" />
            <Text style={[styles.actionText, { color: '#3b82f6' }]}>Edit Item</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showActions} transparent animationType="slide" onRequestClose={() => setShowActions(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowActions(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalItem} onPress={() => { setShowActions(false); handleShare(); }}>
              <Ionicons name="share-outline" size={22} color="#3b82f6" />
              <Text style={styles.modalItemText}>Share Item</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalItem} onPress={() => { setShowActions(false); navigation.navigate('AddItem', { item }); }}>
              <Ionicons name="create-outline" size={22} color="#3b82f6" />
              <Text style={styles.modalItemText}>Edit Item</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalItem, styles.modalItemDanger]} onPress={() => { setShowActions(false); handleDelete(); }}>
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
              <Text style={[styles.modalItemText, { color: '#ef4444' }]}>Delete Item</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowActions(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerGradient: { paddingBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 8 : 16, paddingBottom: 8 },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.8)' },
  headerContent: { alignItems: 'center', paddingHorizontal: 20 },
  categoryIconLarge: { width: 72, height: 72, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  itemName: { fontSize: 24, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  originalName: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
  progressSection: { marginHorizontal: 20, marginTop: 16, backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1.5, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressTitle: { fontSize: 14, fontWeight: '700', color: '#475569' },
  progressStatus: { fontSize: 13, fontWeight: '700' },
  progressBar: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  detailsCard: { marginHorizontal: 20, marginTop: 16, backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1.5, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  detailIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 12, fontWeight: '600', color: '#94a3b8', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  quickActions: { marginHorizontal: 20, marginTop: 20, gap: 12 },
  actionButton: { borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  actionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  secondaryButton: { backgroundColor: '#eff6ff', borderWidth: 1.5, borderColor: '#bfdbfe', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  actionText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, paddingTop: 12 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0', alignSelf: 'center', marginBottom: 16 },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalItemDanger: { borderBottomWidth: 0 },
  modalItemText: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  modalCancel: { marginTop: 8, paddingVertical: 16, alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12 },
  modalCancelText: { fontSize: 16, fontWeight: '700', color: '#64748b' },
});
