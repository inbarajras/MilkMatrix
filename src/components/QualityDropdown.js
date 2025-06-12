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

const qualityOptions = [
  { value: 'Good', label: 'Good', icon: 'check-circle', color: '#4CAF50' },
  { value: 'Fair', label: 'Fair', icon: 'minus-circle', color: '#FF9800' },
  { value: 'Poor', label: 'Poor', icon: 'alert-circle', color: '#F44336' },
];

const QualityDropdown = ({ 
  selectedQuality, 
  onSelect, 
  loading = false, 
  disabled = false,
  style,
  error = false 
}) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (quality) => {
    onSelect(quality.value);
    setVisible(false);
  };

  const getSelectedOption = () => {
    return qualityOptions.find(q => q.value === selectedQuality);
  };

  return (
    <View style={[styles.container, style]}>
      <Button
        mode="outlined"
        onPress={() => setVisible(true)}
        icon="star-outline"
        style={[styles.button, error && styles.errorButton]}
        disabled={loading || disabled}
        loading={loading}
      >
        {loading ? 'Loading...' : selectedQuality || 'Select Quality'}
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
                    <Text style={styles.title}>Select Quality</Text>
                    <Divider style={styles.divider} />
                    
                    <ScrollView 
                      style={styles.scrollView}
                      showsVerticalScrollIndicator={true}
                    >
                      {qualityOptions.map((quality) => (
                        <List.Item
                          key={quality.value}
                          title={quality.label}
                          onPress={() => handleSelect(quality)}
                          style={styles.listItem}
                          titleStyle={styles.listItemTitle}
                          left={(props) => <List.Icon {...props} icon={quality.icon} color={quality.color} />}
                          right={(props) => selectedQuality === quality.value ? <List.Icon {...props} icon="check" color="#4FC3F7" /> : null}
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

export default QualityDropdown;
