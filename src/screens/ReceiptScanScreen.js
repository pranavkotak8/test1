import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

import { scanReceipt } from '../services/ocrService';
import { getCategoryFromName, getDefaultShelfLife } from '../constants/shelfLifeData';
import { CATEGORIES, STORAGE_LOCATIONS } from '../constants/categories';
import { addItem } from '../services/database';
import { scheduleExpiryNotification } from '../services/notificationService';
import { getTodayString, addDaysToDate } from '../utils/dateUtils';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export default function ReceiptScanScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  const [storeName, setStoreName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(getTodayString());
  const [showCamera, setShowCamera] = useState(false);
  const [saving, setSaving] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const pickImage = async (source) => {
    if (source === 'camera') {
      if (hasPermission === null) {
        Alert.alert('Loading', 'Requesting camera permission...');
        return;
      }
      if (hasPermission === false) {
        Alert.alert('Permission Required', 'Camera permission is needed to scan receipts.');
        return;
      }
      setShowCamera(true);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0]);
      processReceipt(result.assets[0].base64);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 });
      setImage(photo);
      setShowCamera(false);
      processReceipt(photo.base64);
    }
  };

  const processReceipt = async (base64) => {
    setScanning(true);
    try {
      const result = await scanReceipt(base64, true);
      const enrichedItems = result.items.map((item, index) => {
        const category = getCategoryFromName(item.name);
        const shelfLife = getDefaultShelfLife(item.name, 'fridge');
        return {
          id: `temp_${index}`,
          itemName: item.name,
          originalReceiptName: item.originalName,
          category,
          storageLocation: category === 'frozen' ? 'freezer' : category === 'pantry' ? 'pantry' : 'fridge',
          purchaseDate: result.purchaseDate,
          expiryDate: addDaysToDate(result.purchaseDate, shelfLife),
          shelfLifeDays: shelfLife,
          quantity: 1,
          price: item.price,
          selected: true,
        };
      });
      setStoreName(result.storeName);
      setPurchaseDate(result.purchaseDate);
      setScannedItems(enrichedItems);
    } catch (error) {
      Alert.alert('Scan Failed', error.message || 'Failed to process receipt. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const updateItem = (id, field, value) => {
    setScannedItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'shelfLifeDays') updated.expiryDate = addDaysToDate(updated.purchaseDate, parseInt(value) || 7);
      if (field === 'purchaseDate') updated.expiryDate = addDaysToDate(value, updated.shelfLifeDays || 7);
      if (field === 'itemName' && !item.isManuallyEdited) {
        updated.category = getCategoryFromName(value);
        updated.shelfLifeDays = getDefaultShelfLife(value, updated.storageLocation);
        updated.expiryDate = addDaysToDate(updated.purchaseDate, updated.shelfLifeDays);
      }
      return updated;
    }));
  };

  const toggleItemSelection = (id) => {
    setScannedItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const removeItem = (id) => {
    setScannedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveAll = async () => {
    const selectedItems = scannedItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item to save.');
      return;
    }
    setSaving(true);
    try {
      for (const item of selectedItems) {
        const newItem = {
          id: uuidv4(),
          itemName: item.itemName,
          originalReceiptName: item.originalReceiptName,
          category: item.category,
          storageLocation: item.storageLocation,
          purchaseDate: item.purchaseDate,
          expiryDate: item.expiryDate,
          shelfLifeDays: item.shelfLifeDays,
          status: 'fresh',
          quantity: item.quantity,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await addItem(newItem);
        await scheduleExpiryNotification(newItem);
      }
      Alert.alert('Success', `${selectedItems.length} items added to your pantry!`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving items:', error);
      Alert.alert('Error', 'Failed to save some items. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addManualItem = () => {
    const newItem = {
      id: `temp_${Date.now()}`,
      itemName: '',
      originalReceiptName: '',
      category: 'other',
      storageLocation: 'fridge',
      purchaseDate: purchaseDate,
      expiryDate: addDaysToDate(purchaseDate, 7),
      shelfLifeDays: 7,
      quantity: 1,
      price: '',
      selected: true,
      isManuallyEdited: true,
    };
    setScannedItems(prev => [...prev, newItem]);
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <Camera style={styles.camera} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity onPress={() => setShowCamera(false)} style={styles.cameraButton}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.cameraFooter}>
              <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </Camera>
      </View>
    );
  }

  if (scanning) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#f0fdf4', '#f8fafc']} style={styles.loadingGradient}>
          <View style={styles.scanningAnimation}>
            <Ionicons name="scan" size={64} color="#10b981" />
          </View>
          <Text style={styles.loadingTitle}>Scanning Receipt...</Text>
          <Text style={styles.loadingSubtitle}>Our AI is reading and categorizing your items</Text>
          <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 24 }} />
        </LinearGradient>
      </View>
    );
  }

  if (scannedItems.length > 0) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Review Items</Text>
            <Text style={styles.headerSubtitle}>{storeName} • {purchaseDate}</Text>
          </View>
          <TouchableOpacity onPress={addManualItem} style={styles.backButton}>
            <Ionicons name="add" size={24} color="#10b981" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>{scannedItems.filter(i => i.selected).length} of {scannedItems.length} selected</Text>
          {scannedItems.map((item) => (
            <View key={item.id} style={[styles.reviewCard, !item.selected && styles.reviewCardDisabled]}>
              <View style={styles.reviewHeader}>
                <TouchableOpacity style={[styles.checkbox, item.selected && styles.checkboxChecked]} onPress={() => toggleItemSelection(item.id)}>
                  {item.selected && <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>
                <TextInput style={[styles.reviewNameInput, !item.selected && styles.disabledInput]} value={item.itemName} onChangeText={(text) => updateItem(item.id, 'itemName', text)} editable={item.selected} placeholder="Item name" placeholderTextColor="#94a3b8" />
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                  <Ionicons name="close-circle" size={22} color="#ef4444" />
                </TouchableOpacity>
              </View>
              <View style={styles.reviewDetails}>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryRow}>
                      {Object.values(CATEGORIES).map(cat => (
                        <TouchableOpacity key={cat.id} style={[styles.miniChip, item.category === cat.id && { backgroundColor: cat.color + '20', borderColor: cat.color }]} onPress={() => updateItem(item.id, 'category', cat.id)} disabled={!item.selected}>
                          <Text style={[styles.miniChipText, item.category === cat.id && { color: cat.color, fontWeight: '700' }]}>{cat.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Storage</Text>
                  <View style={styles.storageRow}>
                    {Object.values(STORAGE_LOCATIONS).map(loc => (
                      <TouchableOpacity key={loc.id} style={[styles.miniChip, item.storageLocation === loc.id && { backgroundColor: loc.color + '20', borderColor: loc.color }]} onPress={() => updateItem(item.id, 'storageLocation', loc.id)} disabled={!item.selected}>
                        <Text style={[styles.miniChipText, item.storageLocation === loc.id && { color: loc.color, fontWeight: '700' }]}>{loc.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Shelf Life</Text>
                  <TextInput style={[styles.smallInput, !item.selected && styles.disabledInput]} value={item.shelfLifeDays?.toString()} onChangeText={(text) => updateItem(item.id, 'shelfLifeDays', text)} keyboardType="number-pad" editable={item.selected} />
                  <Text style={styles.reviewLabel}>Qty</Text>
                  <TextInput style={[styles.smallInput, !item.selected && styles.disabledInput]} value={item.quantity?.toString()} onChangeText={(text) => updateItem(item.id, 'quantity', text)} keyboardType="number-pad" editable={item.selected} />
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Expires</Text>
                  <Text style={styles.expiryText}>{item.expiryDate}</Text>
                </View>
              </View>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveAll} disabled={saving} activeOpacity={0.8}>
            <LinearGradient colors={['#10b981', '#059669']} style={styles.saveButtonGradient}>
              <Text style={styles.saveButtonText}>{saving ? 'Saving...' : `Save ${scannedItems.filter(i => i.selected).length} Items`}</Text>
              <Ionicons name="checkmark-done" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Receipt</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.scanOptions}>
        <TouchableOpacity style={styles.scanOption} onPress={() => pickImage('camera')}>
          <LinearGradient colors={['#10b981', '#059669']} style={styles.scanOptionGradient}>
            <Ionicons name="camera" size={40} color="#fff" />
            <Text style={styles.scanOptionText}>Take Photo</Text>
            <Text style={styles.scanOptionSubtext}>Use camera to scan receipt</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.scanOption} onPress={() => pickImage('gallery')}>
          <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.scanOptionGradient}>
            <Ionicons name="images" size={40} color="#fff" />
            <Text style={styles.scanOptionText}>Choose Photo</Text>
            <Text style={styles.scanOptionSubtext}>Select from gallery</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Tips for best results</Text>
        <View style={styles.tipItem}><Ionicons name="sunny" size={16} color="#f59e0b" /><Text style={styles.tipText}>Ensure good lighting</Text></View>
        <View style={styles.tipItem}><Ionicons name="scan" size={16} color="#f59e0b" /><Text style={styles.tipText}>Keep receipt flat and in frame</Text></View>
        <View style={styles.tipItem}><Ionicons name="eye" size={16} color="#f59e0b" /><Text style={styles.tipText}>Make sure text is clearly visible</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 8 : 16, paddingBottom: 12 },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: '#f1f5f9' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  headerCenter: { alignItems: 'center' },
  headerSubtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  placeholder: { width: 40 },
  scanOptions: { padding: 20, gap: 16 },
  scanOption: { borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  scanOptionGradient: { padding: 28, alignItems: 'center' },
  scanOptionText: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 12 },
  scanOptionSubtext: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  tipsContainer: { marginHorizontal: 20, marginTop: 8, backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1.5, borderColor: '#e2e8f0' },
  tipsTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  tipItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  tipText: { fontSize: 14, color: '#64748b' },
  loadingContainer: { flex: 1 },
  loadingGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  scanningAnimation: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  loadingTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  loadingSubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 12, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  reviewCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  reviewCardDisabled: { opacity: 0.5, backgroundColor: '#f8fafc' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#10b981', borderColor: '#10b981' },
  reviewNameInput: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1e293b', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  disabledInput: { color: '#94a3b8' },
  reviewDetails: { gap: 10 },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', width: 70, textTransform: 'uppercase', letterSpacing: 0.5 },
  categoryRow: { flexDirection: 'row', gap: 6 },
  storageRow: { flexDirection: 'row', gap: 6 },
  miniChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: 'transparent' },
  miniChipText: { fontSize: 11, fontWeight: '600', color: '#64748b' },
  smallInput: { width: 50, backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, fontSize: 13, fontWeight: '700', color: '#1e293b', textAlign: 'center' },
  expiryText: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  footer: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  saveButton: { borderRadius: 14, overflow: 'hidden', shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  saveButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'space-between' },
  cameraHeader: { padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  cameraButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  cameraFooter: { paddingBottom: 40, alignItems: 'center' },
  captureButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#fff' },
  captureButtonInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
});
