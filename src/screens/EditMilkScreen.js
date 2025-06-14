import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Snackbar,
  HelperText,
} from 'react-native-paper';
import { milkService } from '../services/milkService';
import { handleApiError } from '../utils/errorHandler';
import BackgroundImage from '../components/BackgroundImage';
import ShiftDropdown from '../components/ShiftDropdown';
import QualityDropdown from '../components/QualityDropdown';

const EditMilkScreen = ({ navigation, route }) => {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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

  useEffect(() => {
    if (!route.params?.recordId) {
      navigation.goBack();
      return;
    }

    loadRecord(route.params.recordId);
  }, [route.params]);

  const loadRecord = async (recordId) => {
    try {
      setLoading(true);
      
      // In a real app, we would fetch the specific record
      // For now, we'll assume we have the full record from the route params
      const milkRecord = route.params.record;
      
      if (!milkRecord) {
        setSnackbarMessage('Failed to load milk record');
        setSnackbarVisible(true);
        navigation.goBack();
        return;
      }

      setRecord(milkRecord);
      
      // Populate form fields
      setQuantity(milkRecord.amount?.toString() || '');
      setFatContent(milkRecord.fat?.toString() || '');
      setProteinContent(milkRecord.protein?.toString() || '');
      setLactoseContent(milkRecord.lactose?.toString() || '');
      setSomaticCount(milkRecord.somatic_cell_count?.toString() || '');
      setBacteriaCount(milkRecord.bacteria_count?.toString() || '');
      setCollectionDate(milkRecord.date || new Date().toISOString().split('T')[0]);
      setShift(milkRecord.shift || 'Morning');
      setQuality(milkRecord.quality || 'Good');
      setNotes(milkRecord.notes || '');
    } catch (error) {
      console.error('Error loading milk record:', error);
      setSnackbarMessage('Failed to load milk record details');
      setSnackbarVisible(true);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

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

  const handleUpdateRecord = async () => {
    if (!validateForm() || !record) {
      return;
    }

    setSaving(true);

    try {
      const milkData = {
        amount: parseFloat(quantity),
        fat: fatContent ? parseFloat(fatContent) : null,
        protein: proteinContent ? parseFloat(proteinContent) : null,
        lactose: lactoseContent ? parseFloat(lactoseContent) : null,
        somatic_cell_count: somaticCount ? parseInt(somaticCount) : null,
        bacteria_count: bacteriaCount ? parseInt(bacteriaCount) : null,
        quality: quality || 'Good',
        shift: shift || 'Morning',
        notes: notes.trim() || null,
        date: collectionDate || new Date().toISOString().split('T')[0],
      };

      const { data, error } = await milkService.updateMilkRecord(record.id, milkData);

      const showError = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
      };

      if (error) {
        handleApiError(error, showError);
      } else {
        setSnackbarMessage('Milk record updated successfully!');
        setSnackbarVisible(true);
        
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

  const handleDeleteRecord = async () => {
    if (!record) return;

    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this milk record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              const { data, error } = await milkService.deleteMilkRecord(record.id);
              
              const showError = (message) => {
                setSnackbarMessage(message);
                setSnackbarVisible(true);
              };
              
              if (error) {
                handleApiError(error, showError);
              } else {
                setSnackbarMessage('Record deleted successfully!');
                setSnackbarVisible(true);
                
                // Wait a moment to show success message before navigating back
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
          }
        }
      ]
    );
  };

  return (
    <BackgroundImage>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <Card style={styles.card}>
            <Card.Content>
              <Title>Edit Milk Record</Title>
              
              {/* Cow Information */}
              <View style={styles.section}>
                <Paragraph style={styles.sectionTitle}>Cow Information</Paragraph>
                <Paragraph>Tag: {record?.cows?.tag_number}</Paragraph>
                <Paragraph>Name: {record?.cows?.name}</Paragraph>
              </View>

              {/* Collection Information */}
              <View style={styles.section}>
                <Paragraph style={styles.sectionTitle}>Collection Information</Paragraph>
                
                <TextInput
                  label="Collection Date"
                  value={collectionDate}
                  mode="outlined"
                  style={styles.input}
                  editable={false}
                  right={<TextInput.Icon icon="calendar" />}
                />
                
                <ShiftDropdown
                  selectedShift={shift}
                  onSelect={(selectedShift) => {
                    setShift(selectedShift);
                    setErrors({ ...errors, shift: undefined });
                  }}
                  style={styles.input}
                  disabled={saving}
                />
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

              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleUpdateRecord}
                  style={styles.updateButton}
                  disabled={saving}
                  loading={saving}
                >
                  {saving ? 'Updating...' : 'Update Record'}
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={handleDeleteRecord}
                  style={styles.deleteButton}
                  color="#F44336"
                  disabled={saving}
                >
                  Delete Record
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>

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
  input: {
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 24,
  },
  updateButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderColor: '#F44336',
  },
});

export default EditMilkScreen;
