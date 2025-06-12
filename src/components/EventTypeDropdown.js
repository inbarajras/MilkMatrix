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

const eventTypes = [
  { value: 'Vaccination', label: 'Vaccination', icon: 'needle' },
  { value: 'Illness', label: 'Illness', icon: 'thermometer' },
  { value: 'Injury', label: 'Injury', icon: 'bandage' },
  { value: 'Pregnancy Check', label: 'Pregnancy Check', icon: 'baby' },
  { value: 'Breeding', label: 'Breeding', icon: 'heart' },
  { value: 'Treatment', label: 'Treatment', icon: 'medical-bag' },
  { value: 'Routine Check', label: 'Routine Check', icon: 'stethoscope' },
  { value: 'Other', label: 'Other', icon: 'dots-horizontal' },
];

const EventTypeDropdown = ({ 
  selectedEventType, 
  onSelect, 
  loading = false, 
  disabled = false,
  style,
  error = false 
}) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (eventType) => {
    onSelect(eventType.value);
    setVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      <Button
        mode="outlined"
        onPress={() => setVisible(true)}
        icon="medical-bag"
        style={[styles.button, error && styles.errorButton]}
        disabled={loading || disabled}
        loading={loading}
      >
        {loading ? 'Loading...' : selectedEventType || 'Select Event Type'}
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
                    <Text style={styles.title}>Select Event Type</Text>
                    <Divider style={styles.divider} />
                    
                    <ScrollView 
                      style={styles.scrollView}
                      showsVerticalScrollIndicator={true}
                    >
                      {eventTypes.map((eventType) => (
                        <List.Item
                          key={eventType.value}
                          title={eventType.label}
                          onPress={() => handleSelect(eventType)}
                          style={styles.listItem}
                          titleStyle={styles.listItemTitle}
                          left={(props) => <List.Icon {...props} icon={eventType.icon} color="#4FC3F7" />}
                          right={(props) => selectedEventType === eventType.value ? <List.Icon {...props} icon="check" color="#4FC3F7" /> : null}
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

export default EventTypeDropdown;
