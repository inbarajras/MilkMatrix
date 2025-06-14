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
  Snackbar,
  Button,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { milkService } from '../services/milkService';
import { handleApiError } from '../utils/errorHandler';
import BackgroundImage from '../components/BackgroundImage';

const MilkRecordsScreen = ({ navigation, route }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load milk records when screen first mounts
  useEffect(() => {
    loadMilkRecords();
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
      loadMilkRecords(false, showUpdateMessage);
      return () => {}; // cleanup function
    }, [route.params?.refresh])
  );

  const loadMilkRecords = async (showFullScreenLoading = true, showUpdateMessage = false) => {
    try {
      if (showFullScreenLoading) {
        setLoading(true);
      }
      
      const showError = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
      };
      
      // For now, get today's records. In a full app, you might want pagination
      const { data, error } = await milkService.getTodayMilkRecords();
      
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
    await loadMilkRecords(false, true); // Show update message on manual refresh
    setRefreshing(false);
  };

  const filteredRecords = records.filter(record => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      record.cows?.tag_number?.toLowerCase().includes(query) ||
      record.cows?.name?.toLowerCase().includes(query) ||
      record.amount?.toString().includes(query)
    );
  });

  const handleEditRecord = (record) => {
    navigation.navigate('EditMilk', { recordId: record.id, record: record });
  };

  const renderMilkRecord = ({ item }) => (
    <Card style={styles.recordCard}>
      <Card.Content>
        <View style={styles.recordHeader}>
          <View style={styles.cowInfo}>
            <Title style={styles.cowTag}>{item.cows?.tag_number}</Title>
            <Paragraph style={styles.cowName}>{item.cows?.name}</Paragraph>
          </View>
          <View style={styles.quantityInfo}>
            <Title style={styles.quantity}>{item.amount}L</Title>
            <Paragraph style={styles.recordTime}>
              {new Date(item.created_at).toLocaleTimeString()}
            </Paragraph>
          </View>
        </View>
        
        <View style={styles.recordDetails}>
          {item.fat && (
            <Chip style={styles.detailChip} compact>
              Fat: {item.fat}%
            </Chip>
          )}
          {item.protein && (
            <Chip style={styles.detailChip} compact>
              Protein: {item.protein}%
            </Chip>
          )}
        </View>
        
        {item.notes && (
          <Paragraph style={styles.notes}>{item.notes}</Paragraph>
        )}

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
        {searchQuery ? 'No records match your search' : 'No milk records found'}
      </Paragraph>
    </View>
  );

  if (loading) {
    return (
      <BackgroundImage
        gradientColors={['rgba(79, 195, 247, 0.3)', 'rgba(79, 195, 247, 0.7)']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Paragraph style={styles.loadingText}>Loading milk records...</Paragraph>
        </View>
      </BackgroundImage>
    );
  }

  return (
    <BackgroundImage
      gradientColors={['rgba(79, 195, 247, 0.3)', 'rgba(79, 195, 247, 0.7)']}
    >
      <View style={styles.innerContainer}>
        <Searchbar
          placeholder="Search by cow tag, name, or quantity..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      
      <FlatList
        data={filteredRecords}
        renderItem={renderMilkRecord}
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
        onPress={() => navigation.navigate('MainTabs', { screen: 'RecordMilk' })}
        label="Add Record"
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
      </View>
    </BackgroundImage>
  );
};

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
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
  quantityInfo: {
    alignItems: 'flex-end',
  },
  quantity: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  recordTime: {
    fontSize: 12,
    color: '#666',
  },
  recordDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
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
  detailChip: {
    marginRight: 8,
    marginBottom: 4,
    borderRadius: 10,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
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

export default MilkRecordsScreen;
