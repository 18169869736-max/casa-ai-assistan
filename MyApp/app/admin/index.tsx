import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../src/components';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext.web';

interface User {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: string;
  isActive: boolean;
  isAdmin: boolean;
  manualPremium: boolean;
  isPremium: boolean;
  subscriptionStatus: string;
  subscriptionPlanType: string | null;
  totalGenerations: number;
}

interface ApiUsageStats {
  user_id: string;
  email: string;
  total_calls: number;
  calls_last_24h: number;
  calls_last_7d: number;
  calls_last_30d: number;
  last_call_at: string | null;
}

// Use relative API paths for web (works on both localhost and deployed)
const API_BASE_URL = Platform.OS === 'web'
  ? '/api'  // Relative path for web - works on any domain
  : (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api');

export default function AdminDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [usageStats, setUsageStats] = useState<ApiUsageStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'users' | 'usage'>('users');
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedUserUsage, setSelectedUserUsage] = useState<any>(null);

  const adminEmail = user?.email;

  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (authLoading) {
      return;
    }

    // Only redirect to login if auth is done loading and user is not authenticated
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    // Load dashboard data once authenticated
    loadDashboardData();
  }, [isAuthenticated, authLoading]);

  const loadDashboardData = async () => {
    try {
      setError(null);
      await Promise.all([loadUsers(), loadUsageStats()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/get-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmail }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch users');
    }

    const data = await response.json();
    setUsers(data.users);
  };

  const loadUsageStats = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/get-usage-stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmail }),
    });

    if (!response.ok) {
      console.error('Failed to fetch usage stats');
      return;
    }

    const data = await response.json();
    setUsageStats(data.stats || []);
  };

  const toggleUserActive = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/toggle-active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail,
          userId,
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle user status');
      }

      await loadUsers();
      Alert.alert('Success', `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const toggleUserPremium = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/toggle-premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail,
          userId,
          manualPremium: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle premium status');
      }

      await loadUsers();
      Alert.alert('Success', `Premium access ${!currentStatus ? 'granted' : 'revoked'} successfully`);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const viewUserUsage = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/get-usage-stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user usage');
      }

      const data = await response.json();
      setSelectedUserUsage(data);
      setShowUsageModal(true);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.isActive).length,
    premiumUsers: users.filter((u) => u.isPremium).length,
    totalGenerations: users.reduce((sum, u) => sum + u.totalGenerations, 0),
  };

  // Show loading while auth is initializing or dashboard is loading
  if (authLoading || loading) {
    return (
      <ScreenWrapper>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Admin Dashboard</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {authLoading ? 'Authenticating...' : 'Loading dashboard...'}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Admin Dashboard</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.error} />
          <Text style={styles.errorText}>Error Loading Dashboard</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Dashboard</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Statistics Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{stats.totalUsers}</Text>
              <Text style={styles.statTitle}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.statValue}>{stats.activeUsers}</Text>
              <Text style={styles.statTitle}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star" size={24} color="#f59e0b" />
              <Text style={styles.statValue}>{stats.premiumUsers}</Text>
              <Text style={styles.statTitle}>Premium</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="images" size={24} color="#8b5cf6" />
              <Text style={styles.statValue}>{stats.totalGenerations}</Text>
              <Text style={styles.statTitle}>Generations</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'users' && styles.tabActive]}
            onPress={() => setSelectedTab('users')}
          >
            <Ionicons
              name="people"
              size={20}
              color={selectedTab === 'users' ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.tabText, selectedTab === 'users' && styles.tabTextActive]}>Users</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'usage' && styles.tabActive]}
            onPress={() => setSelectedTab('usage')}
          >
            <Ionicons
              name="analytics"
              size={20}
              color={selectedTab === 'usage' ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.tabText, selectedTab === 'usage' && styles.tabTextActive]}>
              API Usage
            </Text>
          </TouchableOpacity>
        </View>

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <>
            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            {/* Users List */}
            {filteredUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    {user.fullName && <Text style={styles.userName}>{user.fullName}</Text>}
                    <Text style={styles.userDate}>
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.badges}>
                    {user.isAdmin && (
                      <View style={[styles.badge, styles.badgeAdmin]}>
                        <Text style={styles.badgeText}>Admin</Text>
                      </View>
                    )}
                    {user.isPremium && (
                      <View style={[styles.badge, styles.badgePremium]}>
                        <Text style={styles.badgeText}>Premium</Text>
                      </View>
                    )}
                    {!user.isActive && (
                      <View style={[styles.badge, styles.badgeInactive]}>
                        <Text style={styles.badgeText}>Inactive</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.userStats}>
                  <View style={styles.userStat}>
                    <Text style={styles.userStatLabel}>Generations</Text>
                    <Text style={styles.userStatValue}>{user.totalGenerations}</Text>
                  </View>
                  <View style={styles.userStat}>
                    <Text style={styles.userStatLabel}>Subscription</Text>
                    <Text style={styles.userStatValue}>
                      {user.subscriptionStatus === 'active' && '✓ Active'}
                      {user.subscriptionStatus === 'trial' && '⏱ Trial'}
                      {user.subscriptionStatus === 'past_due' && '⚠ Past Due'}
                      {user.subscriptionStatus === 'none' && (user.manualPremium ? '✓ Manual' : '✗ None')}
                    </Text>
                  </View>
                </View>

                <View style={styles.userActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, !user.isActive && styles.actionButtonSuccess]}
                    onPress={() => toggleUserActive(user.id, user.isActive)}
                  >
                    <Ionicons
                      name={user.isActive ? 'close-circle' : 'checkmark-circle'}
                      size={18}
                      color="#fff"
                    />
                    <Text style={styles.actionButtonText}>
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPremium]}
                    onPress={() => toggleUserPremium(user.id, user.manualPremium)}
                  >
                    <Ionicons name="star" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>
                      {user.manualPremium ? 'Revoke Premium' : 'Grant Premium'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonInfo]}
                    onPress={() => viewUserUsage(user.id)}
                  >
                    <Ionicons name="analytics" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>View Usage</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* API Usage Tab */}
        {selectedTab === 'usage' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>API Usage Statistics</Text>
            {usageStats.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="analytics-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.emptyStateText}>No API usage data available yet</Text>
              </View>
            ) : (
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 2 }]}>User</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>24h</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>7d</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Total</Text>
                </View>
                {usageStats.map((stat, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
                      {stat.email || 'Anonymous'}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                      {stat.calls_last_24h}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                      {stat.calls_last_7d}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                      {stat.total_calls}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Usage Details Modal */}
      <Modal visible={showUsageModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>API Usage Details</Text>
              <TouchableOpacity onPress={() => setShowUsageModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {selectedUserUsage && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.usageStatRow}>
                  <Text style={styles.usageStatLabel}>Total Calls:</Text>
                  <Text style={styles.usageStatValue}>{selectedUserUsage.stats.total_calls}</Text>
                </View>
                <View style={styles.usageStatRow}>
                  <Text style={styles.usageStatLabel}>Last 24 Hours:</Text>
                  <Text style={styles.usageStatValue}>{selectedUserUsage.stats.calls_last_24h}</Text>
                </View>
                <View style={styles.usageStatRow}>
                  <Text style={styles.usageStatLabel}>Last 7 Days:</Text>
                  <Text style={styles.usageStatValue}>{selectedUserUsage.stats.calls_last_7d}</Text>
                </View>
                <View style={styles.usageStatRow}>
                  <Text style={styles.usageStatLabel}>Last 30 Days:</Text>
                  <Text style={styles.usageStatValue}>{selectedUserUsage.stats.calls_last_30d}</Text>
                </View>

                {selectedUserUsage.endpointBreakdown && (
                  <>
                    <Text style={styles.sectionTitle}>Endpoint Breakdown</Text>
                    {Object.entries(selectedUserUsage.endpointBreakdown).map(([endpoint, count]) => (
                      <View key={endpoint} style={styles.usageStatRow}>
                        <Text style={styles.usageStatLabel}>{endpoint}:</Text>
                        <Text style={styles.usageStatValue}>{count as number}</Text>
                      </View>
                    ))}
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  placeholder: {
    width: 32,
  },
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    marginTop: Spacing.lg,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  errorDetail: {
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.background,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  statTitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  tabActive: {
    backgroundColor: Colors.primary + '15',
  },
  tabText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
  userCard: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  userName: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  userDate: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  badges: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  badgeAdmin: {
    backgroundColor: '#ef4444',
  },
  badgePremium: {
    backgroundColor: '#f59e0b',
  },
  badgeInactive: {
    backgroundColor: '#6b7280',
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    color: '#fff',
    fontWeight: Typography.weights.bold,
  },
  userStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  userStat: {
    flex: 1,
  },
  userStatLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  userStatValue: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  userActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  actionButtonSuccess: {
    backgroundColor: '#10b981',
  },
  actionButtonPremium: {
    backgroundColor: '#f59e0b',
  },
  actionButtonInfo: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: '#fff',
  },
  table: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.primary + '15',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableHeaderText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  tableRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableCell: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyStateText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  modalBody: {
    maxHeight: 400,
  },
  usageStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  usageStatLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  usageStatValue: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
});
