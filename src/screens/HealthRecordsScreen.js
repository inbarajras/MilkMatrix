import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  FAB,
  Searchbar,
  ActivityIndicator,
  Button,
  Snackbar
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { healthService } from '../services/healthService';
import { handleApiError } from '../utils/errorHandler';
import BackgroundImage from '../components/BackgroundImage';

const HealthRecordsScreen = ({ navigation, route }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load health records when screen first mounts
  useEffect(() => {
    loadHealthRecords();
  }, []);
  
  // Reload data whenever the screen comes into focus (returning from edit screen)
  useFocusEffect(
    React.useCallback(() => {
      // Check if we should show a refresh message from route params
      const showUpdateMessage = route.params?.refresh === true;
      
      // Clear the route params to avoid showing messages multiple times
      if (showUpdateMessage) {
        navigation.setParams({ refresh: undefined });
      }
      
      // Don't show full-screen loading when returning from edit screen
      loadHealthRecords(false, showUpdateMessage);
      return () => {}; // cleanup function
    }, [route.params?.refresh])
  );

  const loadHealthRecords = async (showFullScreenLoading = true, showUpdateMessage = false) => {
    try {
      if (showFullScreenLoading) {
        setLoading(true);
      }
      
      const showError = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
      };
      
      const { data, error } = await healthService.getRecentHealthEvents(50);
      
      if (error) {
        handleApiError(error, showError);
      } else {
        setRecords(data || []);
        // Only show "Records updated" when explicitly requested (like after an edit)
        if (showUpdateMessage && data && data.length > 0) {
          setSnackbarMessage('Records updated');
          setSnackbarVisible(true);
        }
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
    await loadHealthRecords(false, true); // Show update message on manual refresh
    setRefreshing(false);
  };

  const filteredRecords = records.filter(record => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      record.cows?.tag_number?.toLowerCase().includes(query) ||
      record.cows?.name?.toLowerCase().includes(query) ||
      record.event_type?.toLowerCase().includes(query) ||
      record.description?.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'urgent':
        return '#F44336';
      case 'pending':
        return '#FF9800';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#9E9E9E';
      default:
        return '#2196F3';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'urgent':
        return 'alert-circle';
      case 'pending':
        return 'clock';
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'information';
    }
  };

  const handleEditRecord = (record) => {
    navigation.navigate('EditHealth', { recordId: record.id, record: record });
  };

  const renderHealthRecord = ({ item }) => (
    <Card style={styles.recordCard}>
      <Card.Content>
        <View style={styles.recordHeader}>
          <View style={styles.cowInfo}>
            <Title style={styles.cowTag}>{item.cows?.tag_number}</Title>
            <Paragraph style={styles.cowName}>{item.cows?.name}</Paragraph>
          </View>
          <View style={styles.statusInfo}>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
              textStyle={{ color: getStatusColor(item.status) }}
              icon={getStatusIcon(item.status)}
              compact
            >
              {item.status?.toUpperCase()}
            </Chip>
            <Paragraph style={styles.recordDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </Paragraph>
          </View>
        </View>
        
        <View style={styles.eventInfo}>
          <Chip style={styles.eventTypeChip} compact>
            {item.event_type}
          </Chip>
        </View>
        
        <Paragraph style={styles.description}>{item.description}</Paragraph>
        
        {/* Check for medications array from the database structure */}
        {item.medications && item.medications.length > 0 && item.medications[0].name && (
          <View style={styles.treatmentSection}>
            <Paragraph style={styles.treatmentLabel}>Treatment:</Paragraph>
            <Paragraph style={styles.treatment}>{item.medications[0].name}</Paragraph>
          </View>
        )}
        
        {item.notes && (
          <Paragraph style={styles.notes}>{item.notes}</Paragraph>
        )}
        
        <Paragraph style={styles.recordTime}>
          Recorded: {new Date(item.created_at).toLocaleString()}
        </Paragraph>

        <View style={styles.actionButtons}>
          <Button 
            mode="outlined" 
            onPress={() => handleEditRecord(item)}
            style={styles.editButton}
            compact
          >
            Edit
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Paragraph style={styles.emptyText}>
        {searchQuery ? 'No records match your search' : 'No health records found'}
      </Paragraph>
    </View>
  );

  if (loading) {
    return (
      <BackgroundImage>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Paragraph style={styles.loadingText}>Loading health records...</Paragraph>
        </View>
      </BackgroundImage>
    );
  }

  return (
    <BackgroundImage>
      <View style={styles.container}>
        <Searchbar
          placeholder="Search by cow, event type, or description..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <FlatList
          data={filteredRecords}
          renderItem={renderHealthRecord}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={EmptyComponent}
          showsVerticalScrollIndicator={false}
        />

        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate('MainTabs', { screen: 'RecordHealth' })}
          label="Add Record"
        />

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={4000}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </BackgroundImage>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#ffffff',
    fontSize: 16,
  },
  searchBar: {
    margin: 16,
    elevation: 4,
    borderRadius: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 100,
  },
  recordCard: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cowInfo: {
    flex: 1,
  },
  cowTag: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4FC3F7',
  },
  cowName: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  editButton: {
    borderRadius: 8,
    borderColor: '#4FC3F7',
  },
  statusInfo: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 4,
    borderRadius: 12,
  },
  recordDate: {
    fontSize: 12,
    color: '#666',
  },
  eventInfo: {
    marginBottom: 12,
  },
  eventTypeChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  treatmentSection: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#F3E5F5',
    borderRadius: 12,
  },
  treatmentLabel: {
    fontWeight: 'bold',
    color: '#7B1FA2',
    marginBottom: 4,
  },
  treatment: {
    color: '#7B1FA2',
  },
  notes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
  },
  recordTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
});

export default HealthRecordsScreen;
