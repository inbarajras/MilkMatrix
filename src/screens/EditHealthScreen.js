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
import { healthService } from '../services/healthService';
import { handleApiError } from '../utils/errorHandler';
import BackgroundImage from '../components/BackgroundImage';
import EventTypeDropdown from '../components/EventTypeDropdown';
import StatusDropdown from '../components/StatusDropdown';

const EditHealthScreen = ({ navigation, route }) => {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Form fields
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('pending');
  const [description, setDescription] = useState('');
  const [treatment, setTreatment] = useState('');
  const [performedBy, setPerformedBy] = useState('');
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
      
      const healthRecord = route.params.record;
      
      if (!healthRecord) {
        setSnackbarMessage('Failed to load health record');
        setSnackbarVisible(true);
        navigation.goBack();
        return;
      }

      setRecord(healthRecord);
      
      // Populate form fields
      setEventType(healthRecord.event_type || '');
      setEventDate(healthRecord.event_date || new Date().toISOString().split('T')[0]);
      setStatus(healthRecord.status || 'pending');
      setDescription(healthRecord.description || '');
      // Extract treatment from medications array if available
      setTreatment(
        healthRecord.medications && 
        healthRecord.medications.length > 0 && 
        healthRecord.medications[0].name 
          ? healthRecord.medications[0].name 
          : ''
      );
      setPerformedBy(healthRecord.performed_by || '');
      setNotes(healthRecord.notes || '');
    } catch (error) {
      console.error('Error loading health record:', error);
      setSnackbarMessage('Failed to load health record details');
      setSnackbarVisible(true);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!eventType.trim()) {
      newErrors.eventType = 'Event type is required';
    }

    if (!eventDate) {
      newErrors.eventDate = 'Event date is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
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
      const healthData = {
        event_type: eventType.trim(),
        event_date: eventDate,
        status: status,
        description: description.trim(),
        medications: treatment.trim() ? [{ name: treatment.trim() }] : [],
        performed_by: performedBy.trim() || null,
        notes: notes.trim() || null,
      };

      const { data, error } = await healthService.updateHealthRecord(record.id, healthData);

      const showError = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
      };

      if (error) {
        handleApiError(error, showError);
      } else {
        setSnackbarMessage('Health record updated successfully!');
        setSnackbarVisible(true);
        
        setTimeout(() => {
          navigation.navigate('MainTabs', {
            screen: 'HealthRecords',
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
      'Are you sure you want to delete this health record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              const { data, error } = await healthService.deleteHealthRecord(record.id);
              
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
                    screen: 'HealthRecords',
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
              <Title>Edit Health Record</Title>
              
              {/* Cow Information */}
              <View style={styles.section}>
                <Paragraph style={styles.sectionTitle}>Cow Information</Paragraph>
                <Paragraph>Tag: {record?.cows?.tag_number}</Paragraph>
                <Paragraph>Name: {record?.cows?.name}</Paragraph>
              </View>

              {/* Event Information */}
              <View style={styles.section}>
                <Paragraph style={styles.sectionTitle}>Event Information</Paragraph>
                
                <EventTypeDropdown
                  selectedEventType={eventType}
                  onSelect={(selectedType) => {
                    setEventType(selectedType);
                    setErrors({ ...errors, eventType: undefined });
                  }}
                  style={styles.input}
                  error={!!errors.eventType}
                  disabled={saving}
                />
                {errors.eventType && (
                  <HelperText type="error" visible={true}>
                    {errors.eventType}
                  </HelperText>
                )}
                
                <TextInput
                  label="Event Date"
                  value={eventDate}
                  mode="outlined"
                  style={styles.input}
                  editable={false}
                  right={<TextInput.Icon icon="calendar" />}
                />
                
                <StatusDropdown
                  selectedStatus={status}
                  onSelect={(selectedStatus) => {
                    setStatus(selectedStatus);
                  }}
                  style={styles.input}
                  disabled={saving}
                />

                <TextInput
                  label="Description *"
                  value={description}
                  onChangeText={setDescription}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.description}
                  disabled={saving}
                  multiline
                  numberOfLines={2}
                />
                {errors.description && (
                  <HelperText type="error" visible={true}>
                    {errors.description}
                  </HelperText>
                )}
              </View>

              {/* Treatment Information */}
              <View style={styles.section}>
                <Paragraph style={styles.sectionTitle}>Treatment Details</Paragraph>
                
                <TextInput
                  label="Treatment/Medication"
                  value={treatment}
                  onChangeText={setTreatment}
                  mode="outlined"
                  style={styles.input}
                  disabled={saving}
                />
                
                <TextInput
                  label="Performed By"
                  value={performedBy}
                  onChangeText={setPerformedBy}
                  mode="outlined"
                  style={styles.input}
                  disabled={saving}
                />

                <TextInput
                  label="Additional Notes"
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

export default EditHealthScreen;
