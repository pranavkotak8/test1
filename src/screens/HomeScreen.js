import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import ItemCard from '../components/ItemCard';
import EmptyState from '../components/EmptyState';
import StatsCard from '../components/StatsCard';

import { getAllItems, deleteItem, updateItemStatus, getInventoryStats } from '../services/database';
import { cancelItemNotifications } from '../services/notificationService';
import { getStatusFromExpiry } from '../utils/dateUtils';

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStorage, setSelectedStorage] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const allItems = await getAllItems({ excludeConsumed: true });
      const inventoryStats = await getInventoryStats();
      const updatedItems = allItems.map(item => ({
        ...item,
        status: getStatusFromExpiry(item.expiryDate, item.status === 'consumed')
      }));
      setItems(updatedItems);
      setStats({
        ...inventoryStats,
        total: parseInt(inventoryStats.total) || 0,
        fresh: parseInt(inventoryStats.fresh) || 0,
        expiring_soon: parseInt(inventoryStats.expiring_soon) || 0,
        expired: parseInt(inventoryStats.expired) || 0,
      });
      applyFilters(updatedItems, searchQuery, selectedCategory, selectedStorage, activeTab);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load pantry items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedCategory, selectedStorage, activeTab]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const applyFilters = (data, search, category, storage, tab) => {
    let filtered = [...data];
    if (search) {
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(search.toLowerCase()) ||
        (item.originalReceiptName && item.originalReceiptName.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (category !== 'all') filtered = filtered.filter(item => item.category === category);
    if (storage !== 'all') filtered = filtered.filter(item => item.storageLocation === storage);
    if (tab === 'expiring') filtered = filtered.filter(item => item.status === 'expiring_soon');
    else if (tab === 'expired') filtered = filtered.filter(item => item.status === 'expired');
    setFilteredItems(filtered);
  };

  const handleSearch = (text) => { setSearchQuery(text); applyFilters(items, text, selectedCategory, selectedStorage, activeTab); };
  const handleCategoryChange = (category) => { setSelectedCategory(category); applyFilters(items, searchQuery, category, selectedStorage, activeTab); };
  const handleStorageChange = (storage) => { setSelectedStorage(storage); applyFilters(items, searchQuery, selectedCategory, storage, activeTab); };
  const handleTabChange = (tab) => { setActiveTab(tab); applyFilters(items, searchQuery, selectedCategory, selectedStorage, tab); };

  const handleDelete = async (id) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await cancelItemNotifications(id); await deleteItem(id); loadData(); }
        catch (error) { Alert.alert('Error', 'Failed to delete item'); }
      }},
    ]);
  };

  const handleConsume = async (id) => {
    try { await cancelItemNotifications(id); await updateItemStatus(id, 'consumed'); loadData(); }
    catch (error) { Alert.alert('Error', 'Failed to mark item as consumed'); }
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Pantry</Text>
          <Text style={styles.headerSubtitle}>{stats?.total || 0} items tracked</Text>
        </View>
        <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('ReceiptScan')}>
          <LinearGradient colors={['#10b981', '#059669']} style={styles.scanButtonGradient}>
            <Ionicons name="scan" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <StatsCard stats={stats} />
      <View style={styles.tabContainer}>
        {[
          { id: 'all', label: 'All Items', icon: 'grid' },
          { id: 'expiring', label: 'Expiring Soon', icon: 'warning' },
          { id: 'expired', label: 'Expired', icon: 'alert-circle' },
        ].map(tab => (
          <TouchableOpacity key={tab.id} style={[styles.tab, activeTab === tab.id && styles.tabActive]} onPress={() => handleTabChange(tab.id)}>
            <Ionicons name={tab.icon} size={14} color={activeTab === tab.id ? '#10b981' : '#94a3b8'} style={styles.tabIcon} />
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <SearchBar value={searchQuery} onChangeText={handleSearch} />
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Category</Text>
        <CategoryFilter selected={selectedCategory} onSelect={handleCategoryChange} type="category" />
      </View>
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Storage</Text>
        <CategoryFilter selected={selectedStorage} onSelect={handleStorageChange} type="storage" />
      </View>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>{filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard item={item} onPress={(item) => navigation.navigate('ItemDetail', { item })} onDelete={handleDelete} onConsume={handleConsume} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon={activeTab === 'expiring' ? "timer-outline" : activeTab === 'expired' ? "trash-outline" : "basket-outline"}
            title={activeTab === 'expiring' ? "No expiring items" : activeTab === 'expired' ? "No expired items" : "Your pantry is empty"}
            subtitle={activeTab === 'expiring' ? "Great job keeping things fresh!" : activeTab === 'expired' ? "You're doing great!" : "Scan a receipt or add items manually to get started"}
          />
        }
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddItem')} activeOpacity={0.8}>
        <LinearGradient colors={['#10b981', '#059669']} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  listContent: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#94a3b8', marginTop: 2, fontWeight: '500' },
  scanButton: { borderRadius: 14, overflow: 'hidden', shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  scanButtonGradient: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 14 },
  tabContainer: { flexDirection: 'row', marginHorizontal: 16, marginTop: 8, marginBottom: 4, backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 10 },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabIcon: { marginRight: 6 },
  tabText: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
  tabTextActive: { color: '#10b981', fontWeight: '700' },
  filterSection: { marginTop: 4 },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginLeft: 20, marginBottom: 4, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  resultsHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  resultsText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  fab: { position: 'absolute', right: 20, bottom: 24, borderRadius: 16, overflow: 'hidden', shadowColor: '#10b981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  fabGradient: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 16 },
});
