import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
// Removed DateTimePicker import since date is readonly
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Chip,
  ActivityIndicator,
  Snackbar,
  HelperText,
  Divider,
} from 'react-native-paper';
import { cowService } from '../services/cowService';
import { milkService } from '../services/milkService';
import { handleApiError } from '../utils/errorHandler';
import { extractCowIdFromQR } from '../utils/qrCodeUtils';
import QRScanner from '../components/QRScanner';
import BackgroundImage from '../components/BackgroundImage';
import CowDropdown from '../components/CowDropdown';
import ShiftDropdown from '../components/ShiftDropdown';
import QualityDropdown from '../components/QualityDropdown';

const RecordMilkScreen = ({ navigation, route }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [selectedCow, setSelectedCow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Cow selection states
  const [cows, setCows] = useState([]);
  const [cowsLoading, setCowsLoading] = useState(false);

  // Removed menu states for dropdowns since we're using custom dropdowns now

  // Form fields
  const [quantity, setQuantity] = useState('');
  const [fatContent, setFatContent] = useState('');
  const [proteinContent, setProteinContent] = useState('');
  const [lactoseContent, setLactoseContent] = useState('');
  const [somaticCount, setSomaticCount] = useState('');
  const [bacteriaCount, setBacteriaCount] = useState('');
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('Morning');
  const [quality, setQuality] = useState('Good');
  const [notes, setNotes] = useState('');

  // Form validation
  const [errors, setErrors] = useState({});

  // Check if cow was passed from QR scan or navigation
  useEffect(() => {
    if (route.params?.cow) {
      setSelectedCow(route.params.cow);
    }
  }, [route.params]);

  // Load all cows for dropdown selection
  useEffect(() => {
    const loadCows = async () => {
      setCowsLoading(true);
      try {
        const { data, error } = await cowService.getAllMilkingCows();
        if (error) {
          console.error('Error loading cows:', error);
          setSnackbarMessage('Failed to load cows list');
          setSnackbarVisible(true);
        } else {
          setCows(data || []);
        }
      } catch (error) {
        console.error('Error loading cows:', error);
        setSnackbarMessage('Failed to load cows list');
        setSnackbarVisible(true);
      } finally {
        setCowsLoading(false);
      }
    };

    loadCows();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!selectedCow) {
      newErrors.cow = 'Please select a cow';
    }
    
    if (!collectionDate) {
      newErrors.collectionDate = 'Collection date is required';
    }
    
    if (!shift) {
      newErrors.shift = 'Shift is required';
    }

    if (!quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }

    if (fatContent && (isNaN(parseFloat(fatContent)) || parseFloat(fatContent) < 0)) {
      newErrors.fatContent = 'Please enter a valid fat content';
    }

    if (proteinContent && (isNaN(parseFloat(proteinContent)) || parseFloat(proteinContent) < 0)) {
      newErrors.proteinContent = 'Please enter a valid protein content';
    }
    
    if (lactoseContent && (isNaN(parseFloat(lactoseContent)) || parseFloat(lactoseContent) < 0)) {
      newErrors.lactoseContent = 'Please enter a valid lactose content';
    }
    
    if (somaticCount && (isNaN(parseInt(somaticCount)) || parseInt(somaticCount) < 0)) {
      newErrors.somaticCount = 'Please enter a valid somatic cell count';
    }
    
    if (bacteriaCount && (isNaN(parseInt(bacteriaCount)) || parseInt(bacteriaCount) < 0)) {
      newErrors.bacteriaCount = 'Please enter a valid bacteria count';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleQRScan = async (scannedData) => {
    setShowScanner(false);
    setLoading(true);

    try {
      // Extract cow ID from QR code (handles both direct UUIDs and JSON objects)
      const cowId = extractCowIdFromQR(scannedData);
      console.log('Using cow ID for lookup:', cowId);
      
      const { data: cow, error } = await cowService.getCowById(cowId);
      
      if (error || !cow) {
        Alert.alert(
          'Cow Not Found',
          `No cow found with ID: ${cowId}`,
          [{ text: 'OK' }]
        );
        return;
      }

      // Check if the cow is a calf
      if (cow.is_calf) {
        Alert.alert(
          'Cannot Record Milk',
          'This is a calf. Milk production can only be recorded for mature cows.',
          [{ text: 'OK' }]
        );
        return;
      }

      setSelectedCow(cow);
      setSnackbarMessage(`Cow selected: ${cow.tag_number} - ${cow.name}`);
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error finding cow:', error);
      Alert.alert('Error', 'Failed to find cow information');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMilkRecord = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const milkData = {
        cow_id: selectedCow.id,
        amount: parseFloat(quantity), // Using 'amount' instead of 'quantity' to match the database schema
        fat: fatContent ? parseFloat(fatContent) : null, // Using 'fat' instead of 'fat_content'
        protein: proteinContent ? parseFloat(proteinContent) : null, // Using 'protein' instead of 'protein_content'
        lactose: lactoseContent ? parseFloat(lactoseContent) : null,
        somatic_cell_count: somaticCount ? parseInt(somaticCount) : null,
        bacteria_count: bacteriaCount ? parseInt(bacteriaCount) : null,
        quality: quality || 'Good',
        shift: shift || 'Morning',
        notes: notes.trim() || null,
        date: collectionDate || new Date().toISOString().split('T')[0], // Using the selected date or today
      };

      const { data, error } = await milkService.createMilkRecord(milkData);

      const showError = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
      };

      if (error) {
        handleApiError(error, showError);
      } else {
        setSnackbarMessage('Milk record saved successfully!');
        setSnackbarVisible(true);
        
        // Reset form
        setQuantity('');
        setFatContent('');
        setProteinContent('');
        setLactoseContent('');
        setSomaticCount('');
        setBacteriaCount('');
        setCollectionDate(new Date().toISOString().split('T')[0]);
        setShift('Morning');
        setQuality('Good');
        setNotes('');
        setSelectedCow(null);
        setErrors({});
        
        // Navigate back to MilkRecords with refresh flag
        setTimeout(() => {
          navigation.navigate('MainTabs', {
            screen: 'MilkRecords',
            params: { refresh: true }
          });
        }, 1500);
      }
    } catch (error) {
      const showError = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
      };
      handleApiError(error, showError);
    } finally {
      setSaving(false);
    }
  };

  const clearSelection = () => {
    setSelectedCow(null);
    setErrors({ ...errors, cow: undefined });
  };

  // Removed handleDateChange since date is readonly

  if (showScanner) {
    return (
      <QRScanner
        onScan={handleQRScan}
        onClose={() => setShowScanner(false)}
        title="Scan Cow Tag"
      />
    );
  }

  return (
    <BackgroundImage>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <Card style={styles.card}>
            <Card.Content>
              <Title>Record Milk Production</Title>
              
              {/* Cow Selection */}
              <View style={styles.section}>
                <Paragraph style={styles.sectionTitle}>Select Cow</Paragraph>
                
                {selectedCow ? (
                  <View style={styles.selectedCowContainer}>
                    <Chip
                      icon="cow"
                      onClose={clearSelection}
                      style={styles.cowChip}
                    >
                      {selectedCow.tag_number} - {selectedCow.name}
                    </Chip>
                    {selectedCow.breed && (
                      <Paragraph style={styles.cowDetails}>
                        Breed: {selectedCow.breed}
                      </Paragraph>
                    )}
                  </View>
                ) : (
                  <View style={styles.selectionContainer}>
                    <View style={styles.selectionButtons}>
                      <Button
                        mode="contained"
                        onPress={() => setShowScanner(true)}
                        icon="qrcode-scan"
                        style={[styles.selectionButton, { marginRight: 8 }]}
                        disabled={loading}
                      >
                        Scan QR
                      </Button>
                      
                      <CowDropdown
                        cows={cows}
                        selectedCow={selectedCow}
                        onSelect={(cow) => {
                          setSelectedCow(cow);
                          setErrors({ ...errors, cow: undefined });
                        }}
                        loading={cowsLoading}
                        disabled={loading}
                        style={[styles.selectionButton, { marginLeft: 8 }]}
                      />
                    </View>
                    
                    {errors.cow && (
                      <HelperText type="error" visible={true} style={styles.errorText}>
                        {errors.cow}
                      </HelperText>
                    )}
                  </View>
                )}
              </View>

              {/* Collection Information */}
              <View style={styles.section}>
                <Paragraph style={styles.sectionTitle}>Collection Information</Paragraph>
                
                <TextInput
                  label="Collection Date *"
                  value={collectionDate}
                  mode="outlined"
                  style={styles.input}
                  editable={false}
                  right={<TextInput.Icon icon="calendar" />}
                />
                <HelperText type="info" visible={true}>
                  Today's date is automatically set
                </HelperText>
                
                <ShiftDropdown
                  selectedShift={shift}
                  onSelect={(selectedShift) => {
                    setShift(selectedShift);
                    setErrors({ ...errors, shift: undefined });
                  }}
                  style={styles.input}
                  error={!!errors.shift}
                  disabled={saving}
                />
                {errors.shift && (
                  <HelperText type="error" visible={true}>
                    {errors.shift}
                  </HelperText>
                )}
              </View>

              {/* Milk Production Form */}
              <View style={styles.section}>
                <Paragraph style={styles.sectionTitle}>Milk Production Details</Paragraph>
                
                <TextInput
                  label="Total Quantity (L) *"
                  value={quantity}
                  onChangeText={setQuantity}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.input}
                  error={!!errors.quantity}
                  disabled={saving}
                />
                {errors.quantity && (
                  <HelperText type="error" visible={true}>
                    {errors.quantity}
                  </HelperText>
                )}
                
                <QualityDropdown
                  selectedQuality={quality}
                  onSelect={(selectedQuality) => {
                    setQuality(selectedQuality);
                  }}
                  style={styles.input}
                  disabled={saving}
                />
              </View>

              {/* Quality Parameters */}
              <View style={styles.section}>
                <Paragraph style={styles.sectionTitle}>Quality Parameters</Paragraph>
                
                <TextInput
                  label="Fat (%)"
                  value={fatContent}
                  onChangeText={setFatContent}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.input}
                  error={!!errors.fatContent}
                  disabled={saving}
                />
                {errors.fatContent && (
                  <HelperText type="error" visible={true}>
                    {errors.fatContent}
                  </HelperText>
                )}

                <TextInput
                  label="Protein (%)"
                  value={proteinContent}
                  onChangeText={setProteinContent}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.input}
                  error={!!errors.proteinContent}
                  disabled={saving}
                />
                {errors.proteinContent && (
                  <HelperText type="error" visible={true}>
                    {errors.proteinContent}
                  </HelperText>
                )}
                
                <TextInput
                  label="Lactose (%)"
                  value={lactoseContent}
                  onChangeText={setLactoseContent}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.input}
                  error={!!errors.lactoseContent}
                  disabled={saving}
                />
                {errors.lactoseContent && (
                  <HelperText type="error" visible={true}>
                    {errors.lactoseContent}
                  </HelperText>
                )}
                
                <TextInput
                  label="Somatic Cell Count (thousands/ml)"
                  value={somaticCount}
                  onChangeText={setSomaticCount}
                  mode="outlined"
                  keyboardType="number-pad"
                  style={styles.input}
                  error={!!errors.somaticCount}
                  disabled={saving}
                />
                {errors.somaticCount && (
                  <HelperText type="error" visible={true}>
                    {errors.somaticCount}
                  </HelperText>
                )}
                
                <TextInput
                  label="Bacteria Count (CFU/ml)"
                  value={bacteriaCount}
                  onChangeText={setBacteriaCount}
                  mode="outlined"
                  keyboardType="number-pad"
                  style={styles.input}
                  error={!!errors.bacteriaCount}
                  disabled={saving}
                />
                {errors.bacteriaCount && (
                  <HelperText type="error" visible={true}>
                    {errors.bacteriaCount}
                  </HelperText>
                )}

                <TextInput
                  label="Notes (optional)"
                  value={notes}
                  onChangeText={setNotes}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                  disabled={saving}
                />
              </View>

              <Button
                mode="contained"
                onPress={handleSaveMilkRecord}
                style={styles.saveButton}
                disabled={saving || loading}
                loading={saving}
              >
                {saving ? 'Saving...' : 'Save Milk Record'}
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Remove the DateTimePicker component since date is readonly */}

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={4000}
        >
          {snackbarMessage}
        </Snackbar>
      </KeyboardAvoidingView>
    </BackgroundImage>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    elevation: 4,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    overflow: 'visible',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#4FC3F7',
  },
  selectedCowContainer: {
    marginVertical: 8,
  },
  cowChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderRadius: 12,
  },
  cowDetails: {
    color: '#666',
    fontSize: 14,
  },
  selectionContainer: {
    marginVertical: 8,
    zIndex: 1000,
  },
  selectionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectionButton: {
    flex: 1,
    borderRadius: 12,
  },
  errorText: {
    marginTop: 4,
  },
  scanContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  scanButton: {
    marginBottom: 8,
    borderRadius: 12,
  },
  input: {
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 8,
    borderRadius: 16,
  },
});

export default RecordMilkScreen;
