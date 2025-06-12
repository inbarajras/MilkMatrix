import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import QRScanner from '../components/QRScanner';
import { cowService } from '../services/cowService';
import { handleApiError } from '../utils/errorHandler';
import { extractCowIdFromQR } from '../utils/qrCodeUtils';
import BackgroundImage from '../components/BackgroundImage';

const QRScanScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [scannedCow, setScannedCow] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleQRScan = async (scannedData) => {
    setLoading(true);

    try {
      // QR codes should contain either the cow's UUID directly or a JSON object with the cow ID
      console.log('QR Scanned Data (raw):', scannedData);
      
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
        Alert.alert(
          'Cow Not Found',
          `No cow found with ID: ${cowId}`,
          [
            { text: 'Scan Again', onPress: () => setLoading(false) },
            { text: 'Cancel', onPress: () => navigation.goBack() }
          ]
        );
        return;
      }

      setScannedCow(cow);
      
      // Show options for what to do with the scanned cow
      Alert.alert(
        'Cow Found',
        `${cow.tag_number} - ${cow.name}`,
        [
          {
            text: 'Record Milk',
            onPress: () => navigation.navigate('MainTabs', { 
              screen: 'RecordMilk',
              params: { cow } 
            })
          },
          {
            text: 'Health Event',
            onPress: () => navigation.navigate('MainTabs', { 
              screen: 'RecordHealth',
              params: { cow } 
            })
          },
          {
            text: 'View Details',
            onPress: () => showCowDetails(cow)
          },
          {
            text: 'Scan Another',
            onPress: () => {
              setScannedCow(null);
              setLoading(false);
            }
          }
        ]
      );
    } catch (error) {
      const showError = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
      };
      handleApiError(error, showError);
      Alert.alert(
        'Error',
        'Failed to find cow information',
        [
          { text: 'Try Again', onPress: () => setLoading(false) },
          { text: 'Cancel', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const showCowDetails = (cow) => {
    Alert.alert(
      'Cow Details',
      `Tag: ${cow.tag_number}\nName: ${cow.name}${cow.breed ? `\nBreed: ${cow.breed}` : ''}${cow.birth_date ? `\nBirth Date: ${new Date(cow.birth_date).toLocaleDateString()}` : ''}`,
      [
        {
          text: 'Record Milk',
          onPress: () => navigation.navigate('MainTabs', { 
            screen: 'RecordMilk',
            params: { cow } 
          })
        },
        {
          text: 'Health Event',
          onPress: () => navigation.navigate('MainTabs', { 
            screen: 'RecordHealth',
            params: { cow } 
          })
        },
        {
          text: 'Close',
          style: 'cancel'
        }
      ]
    );
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleSnackbarDismiss = () => {
    setSnackbarVisible(false);
  };

  // Render main scanner screen
  return (
    <BackgroundImage>
      <View style={styles.container}>
        {!scannedCow && !loading && (
          <QRScanner
            onScan={handleQRScan}
            onClose={() => navigation.goBack()}
            title="Scan Cow QR Code"
          />
        )}
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Paragraph style={styles.loadingText}>Loading cow information...</Paragraph>
          </View>
        )}
        
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={4000}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </BackgroundImage>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default QRScanScreen;
