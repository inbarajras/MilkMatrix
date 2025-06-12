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
} from 'react-native-paper';
import { milkService } from '../services/milkService';
import { handleApiError } from '../utils/errorHandler';
import BackgroundImage from '../components/BackgroundImage';

const MilkRecordsScreen = ({ navigation }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadMilkRecords();
  }, []);

  const loadMilkRecords = async () => {
    try {
      setLoading(true);
      
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
    await loadMilkRecords();
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
