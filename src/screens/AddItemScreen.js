import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

import { CATEGORIES, STORAGE_LOCATIONS } from '../constants/categories';
import { getCategoryFromName, getDefaultShelfLife } from '../constants/shelfLifeData';
import { addItem } from '../services/database';
import { scheduleExpiryNotification } from '../services/notificationService';
import { getTodayString, addDaysToDate } from '../utils/dateUtils';
import * as Crypto from 'expo-crypto';

export default function AddItemScreen({ navigation, route }) {
  const editItem = route.params?.item;
  const isEditing = !!editItem;

  const [itemName, setItemName] = useState(editItem?.itemName || '');
  const [category, setCategory] = useState(editItem?.category || 'other');
  const [storageLocation, setStorageLocation] = useState(editItem?.storageLocation || 'fridge');
  const [quantity, setQuantity] = useState(editItem?.quantity?.toString() || '1');
  const [purchaseDate, setPurchaseDate] = useState(editItem?.purchaseDate || getTodayString());
  const [expiryDate, setExpiryDate] = useState(editItem?.expiryDate || '');
  const [shelfLifeDays, setShelfLifeDays] = useState(editItem?.shelfLifeDays?.toString() || '7');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('purchase');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isEditing && itemName.length > 2) {
      const detectedCategory = getCategoryFromName(itemName);
      if (detectedCategory && detectedCategory !== 'other') setCategory(detectedCategory);
      const defaultShelfLife = getDefaultShelfLife(itemName, storageLocation);
      setShelfLifeDays(defaultShelfLife.toString());
      setExpiryDate(addDaysToDate(purchaseDate, defaultShelfLife));
    }
  }, [itemName, storageLocation, purchaseDate, isEditing]);

  useEffect(() => {
    if (!isEditing && purchaseDate && shelfLifeDays) {
      setExpiryDate(addDaysToDate(purchaseDate, parseInt(shelfLifeDays) || 7));
    }
  }, [shelfLifeDays, purchaseDate, isEditing]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      if (datePickerMode === 'purchase') setPurchaseDate(dateString);
      else setExpiryDate(dateString);
    }
  };

  const validateForm = () => {
    if (!itemName.trim()) { Alert.alert('Error', 'Please enter an item name'); return false; }
    if (!expiryDate) { Alert.alert('Error', 'Please set an expiry date'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const newItem = {
        id: editItem?.id || Crypto.randomUUID(),
        itemName: itemName.trim(),
        originalReceiptName: editItem?.originalReceiptName || itemName.trim(),
        category, storageLocation, purchaseDate, expiryDate,
        shelfLifeDays: parseInt(shelfLifeDays) || 7,
        status: 'fresh',
        quantity: parseInt(quantity) || 1,
        createdAt: editItem?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addItem(newItem);
      await scheduleExpiryNotification(newItem);
      Alert.alert('Success', isEditing ? 'Item updated successfully!' : 'Item added to pantry!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Item' : 'Add Item'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Item Name *</Text>
          <TextInput style={styles.input} value={itemName} onChangeText={setItemName} placeholder="e.g., Organic Bananas" placeholderTextColor="#94a3b8" autoFocus={!isEditing} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.optionsGrid}>
            {Object.values(CATEGORIES).map((cat) => (
              <TouchableOpacity key={cat.id} style={[styles.optionChip, category === cat.id && { backgroundColor: cat.color + '20', borderColor: cat.color }]} onPress={() => setCategory(cat.id)}>
                <Ionicons name={cat.icon} size={16} color={category === cat.id ? cat.color : '#94a3b8'} />
                <Text style={[styles.optionText, category === cat.id && { color: cat.color, fontWeight: '700' }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Storage Location</Text>
          <View style={styles.optionsRow}>
            {Object.values(STORAGE_LOCATIONS).map((loc) => (
              <TouchableOpacity key={loc.id} style={[styles.storageChip, storageLocation === loc.id && { backgroundColor: loc.color + '20', borderColor: loc.color }]} onPress={() => setStorageLocation(loc.id)}>
                <Ionicons name={loc.icon} size={18} color={storageLocation === loc.id ? loc.color : '#94a3b8'} />
                <Text style={[styles.storageText, storageLocation === loc.id && { color: loc.color, fontWeight: '700' }]}>{loc.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity(Math.max(1, (parseInt(quantity) || 1) - 1).toString())}>
              <Ionicons name="remove" size={20} color="#64748b" />
            </TouchableOpacity>
            <TextInput style={styles.quantityInput} value={quantity} onChangeText={setQuantity} keyboardType="number-pad" textAlign="center" />
            <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity(((parseInt(quantity) || 0) + 1).toString())}>
              <Ionicons name="add" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Dates</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateButton} onPress={() => { setDatePickerMode('purchase'); setShowDatePicker(true); }}>
              <Ionicons name="calendar-outline" size={18} color="#64748b" />
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>Purchased</Text>
                <Text style={styles.dateValue}>{purchaseDate}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateButton} onPress={() => { setDatePickerMode('expiry'); setShowDatePicker(true); }}>
              <Ionicons name="alarm-outline" size={18} color="#64748b" />
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>Expires</Text>
                <Text style={[styles.dateValue, !expiryDate && { color: '#94a3b8' }]}>{expiryDate || 'Select date'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Shelf Life (days)</Text>
          <TextInput style={styles.input} value={shelfLifeDays} onChangeText={setShelfLifeDays} keyboardType="number-pad" placeholder="7" placeholderTextColor="#94a3b8" />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={new Date(datePickerMode === 'purchase' ? purchaseDate : (expiryDate || getTodayString()))}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={datePickerMode === 'expiry' ? new Date(purchaseDate) : undefined}
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading} activeOpacity={0.8}>
          <LinearGradient colors={['#10b981', '#059669']} style={styles.saveButtonGradient}>
            <Text style={styles.saveButtonText}>{isLoading ? 'Saving...' : (isEditing ? 'Update Item' : 'Add to Pantry')}</Text>
            <Ionicons name="checkmark" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 8 : 16, paddingBottom: 12, backgroundColor: '#f8fafc' },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: '#f1f5f9' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  placeholder: { width: 40 },
  content: { flex: 1, paddingHorizontal: 20 },
  section: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1e293b', borderWidth: 1.5, borderColor: '#e2e8f0', fontWeight: '500' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f1f5f9', borderWidth: 1.5, borderColor: 'transparent', gap: 6 },
  optionText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  optionsRow: { flexDirection: 'row', gap: 10 },
  storageChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: '#f1f5f9', borderWidth: 1.5, borderColor: 'transparent', gap: 8 },
  storageText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  quantityButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  quantityInput: { width: 80, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14, fontSize: 18, fontWeight: '700', color: '#1e293b', borderWidth: 1.5, borderColor: '#e2e8f0' },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateButton: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: '#e2e8f0', gap: 10 },
  dateTextContainer: { flex: 1 },
  dateLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  dateValue: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  footer: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  saveButton: { borderRadius: 14, overflow: 'hidden', shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  saveButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
