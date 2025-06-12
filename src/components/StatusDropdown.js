import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Button,
  Card,
  List,
  Divider,
  Text,
  Portal,
} from 'react-native-paper';

const { height: screenHeight } = Dimensions.get('window');

const statusOptions = [
  { value: 'pending', label: 'Pending', icon: 'clock', color: '#FF9800' },
  { value: 'completed', label: 'Completed', icon: 'check-circle', color: '#4CAF50' },
  { value: 'urgent', label: 'Urgent', icon: 'alert-circle', color: '#F44336' },
  { value: 'cancelled', label: 'Cancelled', icon: 'close-circle', color: '#9E9E9E' },
];

const StatusDropdown = ({ 
  selectedStatus, 
  onSelect, 
  loading = false, 
  disabled = false,
  style,
  error = false 
}) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (status) => {
    onSelect(status.value);
    setVisible(false);
  };

  const getSelectedOption = () => {
    return statusOptions.find(s => s.value === selectedStatus);
  };

  const selectedOption = getSelectedOption();

  return (
    <View style={[styles.container, style]}>
      <Button
        mode="outlined"
        onPress={() => setVisible(true)}
        icon="flag-outline"
        style={[styles.button, error && styles.errorButton]}
        disabled={loading || disabled}
        loading={loading}
      >
        {loading ? 'Loading...' : selectedOption?.label || 'Select Status'}
      </Button>

      <Portal>
        <Modal
          visible={visible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setVisible(false)}
        >
          <TouchableOpacity 
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setVisible(false)}
          >
            <View style={styles.modalContainer}>
              <TouchableOpacity activeOpacity={1}>
                <Card style={styles.dropdownCard}>
                  <Card.Content style={styles.cardContent}>
                    <Text style={styles.title}>Select Status</Text>
                    <Divider style={styles.divider} />
                    
                    <ScrollView 
                      style={styles.scrollView}
                      showsVerticalScrollIndicator={true}
                    >
                      {statusOptions.map((status) => (
                        <List.Item
                          key={status.value}
                          title={status.label}
                          onPress={() => handleSelect(status)}
                          style={styles.listItem}
                          titleStyle={styles.listItemTitle}
                          left={(props) => <List.Icon {...props} icon={status.icon} color={status.color} />}
                          right={(props) => selectedStatus === status.value ? <List.Icon {...props} icon="check" color="#4FC3F7" /> : null}
                        />
                      ))}
                    </ScrollView>
                    
                    <Divider style={styles.divider} />
                    <Button
                      mode="text"
                      onPress={() => setVisible(false)}
                      style={styles.cancelButton}
                    >
                      Cancel
                    </Button>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    borderRadius: 12,
  },
  errorButton: {
    borderColor: '#F44336',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  dropdownCard: {
    maxHeight: screenHeight * 0.7,
    borderRadius: 16,
    elevation: 8,
  },
  cardContent: {
    padding: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4FC3F7',
    textAlign: 'center',
    padding: 16,
  },
  divider: {
    marginHorizontal: 0,
  },
  scrollView: {
    maxHeight: screenHeight * 0.5,
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  cancelButton: {
    margin: 8,
  },
});

export default StatusDropdown;
