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

const CowDropdown = ({ 
  cows = [], 
  selectedCow, 
  onSelect, 
  loading = false, 
  disabled = false,
  style 
}) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (cow) => {
    onSelect(cow);
    setVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      <Button
        mode="outlined"
        onPress={() => setVisible(true)}
        icon="cow"
        style={styles.button}
        disabled={loading || disabled}
        loading={loading}
      >
        {loading ? 'Loading...' : selectedCow ? `${selectedCow.tag_number} - ${selectedCow.name}` : 'Select Cow'}
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
                    <Text style={styles.title}>Select Cow</Text>
                    <Divider style={styles.divider} />
                    
                    <ScrollView 
                      style={styles.scrollView}
                      showsVerticalScrollIndicator={true}
                    >
                      {cows.length === 0 ? (
                        <List.Item
                          title="No cows available"
                          disabled
                          titleStyle={styles.noDataText}
                        />
                      ) : (
                        cows.map((cow) => (
                          <List.Item
                            key={cow.id}
                            title={`${cow.tag_number} - ${cow.name}`}
                            description={cow.breed ? `Breed: ${cow.breed}` : undefined}
                            onPress={() => handleSelect(cow)}
                            style={styles.listItem}
                            titleStyle={styles.listItemTitle}
                            descriptionStyle={styles.listItemDescription}
                            left={(props) => <List.Icon {...props} icon="cow" color="#4FC3F7" />}
                            right={(props) => selectedCow?.id === cow.id ? <List.Icon {...props} icon="check" color="#4FC3F7" /> : null}
                          />
                        ))
                      )}
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
  listItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cancelButton: {
    margin: 8,
  },
});

export default CowDropdown;
