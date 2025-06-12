import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Chip,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { milkService } from '../services/milkService';
import { healthService } from '../services/healthService';
import { userService } from '../services/userService';
import { handleApiError } from '../utils/errorHandler';
import BackgroundImage from '../components/BackgroundImage';

const HomeScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayMilkRecords, setTodayMilkRecords] = useState([]);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [userDisplayName, setUserDisplayName] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load user display name when user changes
  useEffect(() => {
    const loadUserDisplayName = async () => {
      if (user?.id) {
        try {
          const displayName = await userService.getUserDisplayName(user.id);
          setUserDisplayName(displayName);
        } catch (error) {
          console.warn('Could not fetch user display name:', error);
          // Fallback to email prefix if available
          if (user.email) {
            const emailPrefix = user.email.split('@')[0];
            setUserDisplayName(emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1));
          } else {
            setUserDisplayName('User');
          }
        }
      }
    };

    loadUserDisplayName();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const showError = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
      };
      
      // Load today's milk records
      const { data: milkData, error: milkError } = await milkService.getTodayMilkRecords();
      if (milkError) {
        handleApiError(milkError, showError);
      } else {
        setTodayMilkRecords(milkData || []);
      }

      // Load health alerts
      const { data: healthData, error: healthError } = await healthService.getHealthAlerts();
      if (healthError) {
        handleApiError(healthError, showError);
      } else {
        setHealthAlerts(healthData || []);
      }
    } catch (error) {
      const showError = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
      };
      handleApiError(error, showError);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signOut, style: 'destructive' },
      ]
    );
  };

  const getTotalMilkToday = () => {
    return todayMilkRecords.reduce((total, record) => total + (record.amount || 0), 0);
  };

  // Removed seed database function

  if (loading) {
    return (
      <BackgroundImage>
        <View style={styles.loadingContainer}>
          <Image 
            source={require('../../assets/milkmatrix-logo.png')}
            style={styles.loadingLogo}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color="#ffffff" />
          <Paragraph style={styles.loadingText}>Loading dashboard...</Paragraph>
        </View>
      </BackgroundImage>
    );
  }

  return (
    <BackgroundImage
      gradientColors={['rgba(79, 195, 247, 0.3)', 'rgba(79, 195, 247, 0.7)']}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Card */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Title>Welcome, {userDisplayName || 'User'}</Title>
            <Paragraph>Ready to record milk production and health events</Paragraph>
            <Button
              mode="outlined"
              onPress={handleSignOut}
              style={styles.signOutButton}
              compact
            >
              Sign Out
            </Button>
          </Card.Content>
        </Card>

        {/* Today's Summary */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title>Today's Summary</Title>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Title style={styles.summaryNumber}>{todayMilkRecords.length}</Title>
                <Paragraph>Milk Records</Paragraph>
              </View>
              <View style={styles.summaryItem}>
                <Title style={styles.summaryNumber}>{getTotalMilkToday().toFixed(1)}L</Title>
                <Paragraph>Total Milk</Paragraph>
              </View>
              <View style={styles.summaryItem}>
                <Title style={styles.summaryNumber}>{healthAlerts.length}</Title>
                <Paragraph>Health Alerts</Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Health Alerts */}
        {healthAlerts.length > 0 && (
          <Card style={styles.alertsCard}>
            <Card.Content>
              <Title style={styles.alertTitle}>Health Alerts</Title>
              {healthAlerts.slice(0, 3).map((alert) => (
                <View key={alert.id} style={styles.alertItem}>
                  <Chip
                    icon="alert"
                    mode="outlined"
                    style={[
                      styles.alertChip,
                      alert.status === 'urgent' && styles.urgentChip
                    ]}
                  >
                    {alert.cows?.tag_number} - {alert.event_type}
                  </Chip>
                </View>
              ))}
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('HealthRecords')}
                style={styles.viewAllButton}
              >
                View All Alerts
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Recent Milk Records */}
        <Card style={styles.recentCard}>
          <Card.Content>
            <Title>Recent Milk Records</Title>
            {todayMilkRecords.length > 0 ? (
              todayMilkRecords.slice(0, 3).map((record) => (
                <View key={record.id} style={styles.recordItem}>
                  <View>
                    <Paragraph style={styles.recordCow}>
                      {record.cows?.tag_number} - {record.cows?.name}
                    </Paragraph>
                    <Paragraph style={styles.recordDetails}>
                      {record.amount}L • {new Date(record.created_at).toLocaleTimeString()}
                    </Paragraph>
                  </View>
                </View>
              ))
            ) : (
              <Paragraph>No milk records today</Paragraph>
            )}
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('MainTabs', { screen: 'MilkRecords' })}
              style={styles.viewAllButton}
            >
              View All Records
            </Button>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('MainTabs', { screen: 'RecordMilk' })}
                style={styles.actionButton}
                icon="plus"
              >
                Record Milk
              </Button>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('MainTabs', { screen: 'RecordHealth' })}
                style={styles.actionButton}
                icon="medical-bag"
              >
                Health Event
              </Button>
            </View>
            
            {/* Development/Testing Button Removed */}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      {/* <FAB
        style={styles.fab}
        icon="qrcode-scan"
        onPress={() => navigation.navigate('QRScan')}
        label="Scan QR"
      /> */}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </BackgroundImage>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 150,
    height: 150,
    marginBottom: 24,
    borderRadius: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#ffffff',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  signOutButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  summaryCard: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    color: '#4FC3F7',
    fontWeight: 'bold',
  },
  alertsCard: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  alertTitle: {
    color: '#F57C00',
  },
  alertItem: {
    marginVertical: 4,
  },
  alertChip: {
    alignSelf: 'flex-start',
    borderRadius: 12,
  },
  urgentChip: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
  },
  recentCard: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordCow: {
    fontWeight: 'bold',
  },
  recordDetails: {
    color: '#666',
    fontSize: 12,
  },
  actionsCard: {
    marginBottom: 100,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  viewAllButton: {
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    backgroundColor: '#4FC3F7',
    borderRadius: 16,
  },
  snackbar: {
    bottom: 20,
    zIndex: 1000,
  },
});

export default HomeScreen;
