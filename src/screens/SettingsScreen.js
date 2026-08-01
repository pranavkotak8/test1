import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNotificationSettings, updateNotificationSettings, initDatabase } from '../services/database';
import { clearAllScheduledNotifications, scheduleAllPendingNotifications } from '../services/notificationService';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    enabled: true,
    threeDaysBefore: true,
    oneDayBefore: true,
    dayOfExpiry: true,
    morningTime: '08:00',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const data = await getNotificationSettings();
      if (data) {
        setSettings({
          enabled: !!data.enabled,
          threeDaysBefore: !!data.threeDaysBefore,
          oneDayBefore: !!data.oneDayBefore,
          dayOfExpiry: !!data.dayOfExpiry,
          morningTime: data.morningTime || '08:00',
        });
      }
    } catch (error) { console.error('Error loading settings:', error); }
    finally { setLoading(false); }
  };

  const updateSetting = async (key, value) => {
    try {
      const updated = { ...settings, [key]: value };
      setSettings(updated);
      await updateNotificationSettings({ [key]: value ? 1 : 0 });
      if (key === 'enabled' && value) await scheduleAllPendingNotifications();
      else if (key === 'enabled' && !value) await clearAllScheduledNotifications();
    } catch (error) { console.error('Error updating settings:', error); }
  };

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This will permanently delete all pantry items. This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: async () => {
        try {
          const db = await initDatabase();
          await db.runAsync('DELETE FROM pantry_items');
          await clearAllScheduledNotifications();
          Alert.alert('Success', 'All data has been cleared.');
        } catch (error) { Alert.alert('Error', 'Failed to clear data.'); }
      }},
    ]);
  };

  const SettingRow = ({ icon, label, value, onToggle, color = '#10b981' }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: '#e2e8f0', true: color + '80' }} thumbColor={value ? color : '#fff'} ios_backgroundColor="#e2e8f0" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <SettingRow icon="notifications" label="Enable Notifications" value={settings.enabled} onToggle={(v) => updateSetting('enabled', v)} />
            {settings.enabled && (
              <>
                <View style={styles.divider} />
                <SettingRow icon="timer" label="3 Days Before" value={settings.threeDaysBefore} onToggle={(v) => updateSetting('threeDaysBefore', v)} color="#3b82f6" />
                <View style={styles.divider} />
                <SettingRow icon="alarm" label="1 Day Before" value={settings.oneDayBefore} onToggle={(v) => updateSetting('oneDayBefore', v)} color="#f59e0b" />
                <View style={styles.divider} />
                <SettingRow icon="alert-circle" label="Day of Expiry" value={settings.dayOfExpiry} onToggle={(v) => updateSetting('dayOfExpiry', v)} color="#ef4444" />
              </>
            )}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.dangerRow} onPress={handleClearData}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#fee2e2' }]}>
                  <Ionicons name="trash" size={18} color="#ef4444" />
                </View>
                <Text style={[styles.settingLabel, { color: '#ef4444' }]}>Clear All Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Built with</Text>
              <Text style={styles.infoValue}>React Native + Expo</Text>
            </View>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Smart Pantry Tracker</Text>
          <Text style={styles.footerSubtext}>Never waste food again 🌱</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 16 : 24, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  section: { marginTop: 8, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94a3b8', marginBottom: 10, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1.5, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 64 },
  dangerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  infoLabel: { fontSize: 15, fontWeight: '600', color: '#64748b' },
  infoValue: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  footer: { alignItems: 'center', paddingVertical: 40 },
  footerText: { fontSize: 16, fontWeight: '700', color: '#94a3b8' },
  footerSubtext: { fontSize: 13, color: '#cbd5e1', marginTop: 4 },
});
