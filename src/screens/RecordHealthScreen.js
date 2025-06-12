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
// Removed DateTimePicker import since dates are readonly
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Chip,
  List,
  ActivityIndicator,
  Snackbar,
  HelperText,
  Divider,
} from 'react-native-paper';
import { cowService } from '../services/cowService';
import { healthService } from '../services/healthService';
import { userService } from '../services/userService';
import { handleApiError } from '../utils/errorHandler';
import { extractCowIdFromQR } from '../utils/qrCodeUtils';
import QRScanner from '../components/QRScanner';
import BackgroundImage from '../components/BackgroundImage';
import CowDropdown from '../components/CowDropdown';
import EventTypeDropdown from '../components/EventTypeDropdown';
import StatusDropdown from '../components/StatusDropdown';
import { useAuth } from '../contexts/AuthContext';

const RecordHealthScreen = ({ navigation, route = {} }) => {
  const { user } = useAuth(); // Get authenticated user
  const [showScanner, setShowScanner] = useState(false);
  const [selectedCow, setSelectedCow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Cow selection states
  const [cows, setCows] = useState([]);
  const [cowsLoading, setCowsLoading] = useState(false);

  // Removed menu states since we're using custom dropdowns now

  // Form fields
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('pending');
  const [description, setDescription] = useState('');
  const [treatment, setTreatment] = useState('');
  const [performedBy, setPerformedBy] = useState('');
  // Removed followUpDate since we're skipping follow-up functionality
  const [notes, setNotes] = useState('');

  // Form validation
  const [errors, setErrors] = useState({});

  // Removed eventTypes and statusOptions arrays since they're now in the dropdown components

  // Check if cow was passed from QR scan or navigation
  useEffect(() => {
    if (route?.params?.cow) {
      setSelectedCow(route.params.cow);
    }
  }, [route?.params]);

  // Load all cows for dropdown selection
  useEffect(() => {
    const loadCows = async () => {
      setCowsLoading(true);
      try {
        const { data, error } = await cowService.getAllCows();
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

    if (!eventType.trim()) {
      newErrors.eventType = 'Event type is required';
    }
    
    if (!eventDate) {
      newErrors.eventDate = 'Event date is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Removed follow-up date validation since we're skipping that feature

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
      
      const showError = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
      };
      
      if (error || !cow) {
        handleApiError(error || new Error(`No cow found with ID: ${cowId}`), showError);
        return;
      }

      setSelectedCow(cow);
      setSnackbarMessage(`Cow selected: ${cow.tag_number} - ${cow.name}`);
      setSnackbarVisible(true);
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

  const handleSaveHealthRecord = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      // Get the actual user name from user profile
      let userDisplayName = 'Mobile App User'; // Fallback
      if (user?.id) {
        try {
          userDisplayName = await userService.getUserDisplayName(user.id);
        } catch (userError) {
          console.warn('Could not fetch user name, using fallback:', userError);
        }
      }

      const healthData = {
        cow_id: selectedCow.id,
        event_type: eventType.trim(),
        event_date: eventDate || new Date().toISOString().split('T')[0], // Use selected date or today
        status: status,
        description: description.trim(),
        medications: treatment.trim() ? [{ name: treatment.trim() }] : [], // Store treatment as medications JSONB array
        notes: notes.trim() || null,
        performed_by: performedBy.trim() || userDisplayName, // Use entered value or actual user name
        // Removed follow_up field since we're skipping that feature
      };

      const { data, error } = await healthService.createHealthRecord(healthData);

      const showError = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
      };

      if (error) {
        handleApiError(error, showError);
      } else {
        Alert.alert(
          'Success',
          'Health record saved successfully!',
          [
            {
              text: 'Record Another',
              onPress: () => {
                // Reset form but keep cow selected, reset date to today
                setEventType('');
                setEventDate(new Date().toISOString().split('T')[0]); // Reset to today
                setStatus('pending');
                setDescription('');
                setTreatment('');
                setPerformedBy('');
                // Removed followUpDate reset since we're skipping that feature
                setNotes('');
                setErrors({});
              }
            },
            {
              text: 'Go Home',
              onPress: () => navigation.navigate('Home'),
            }
          ]
        );
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

  // Removed date change handlers since dates are readonly

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
            <Title>Record Health Event</Title>
            
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
              ) : (                  <View style={styles.selectionContainer}>
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

            {/* Health Event Details */}
            <View style={styles.section}>
              <Paragraph style={styles.sectionTitle}>Event Details</Paragraph>
              
              {/* Event Type Dropdown */}
              <EventTypeDropdown
                selectedEventType={eventType}
                onSelect={(selectedEventType) => {
                  setEventType(selectedEventType);
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

              {/* Event Date */}
              <TextInput
                label="Event Date *"
                value={eventDate}
                mode="outlined"
                style={styles.input}
                editable={false}
                right={<TextInput.Icon icon="calendar" />}
              />
              <HelperText type="info" visible={true}>
                Today's date is automatically set
              </HelperText>

              {/* Status Dropdown */}
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
                multiline
                numberOfLines={3}
                style={styles.input}
                error={!!errors.description}
                disabled={saving}
              />
              {errors.description && (
                <HelperText type="error" visible={true}>
                  {errors.description}
                </HelperText>
              )}

              <TextInput
                label="Treatment/Medication (optional)"
                value={treatment}
                onChangeText={setTreatment}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={styles.input}
                disabled={saving}
                placeholder="Enter treatments or medications used"
              />

              <TextInput
                label="Performed By"
                value={performedBy}
                onChangeText={setPerformedBy}
                mode="outlined"
                style={styles.input}
                disabled={saving}
                placeholder="Enter name of person who performed the event"
              />

              <TextInput
                label="Additional Notes (optional)"
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
              onPress={handleSaveHealthRecord}
              style={styles.saveButton}
              disabled={saving || loading}
              loading={saving}
            >
              {saving ? 'Saving...' : 'Save Health Record'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
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

export default RecordHealthScreen;
