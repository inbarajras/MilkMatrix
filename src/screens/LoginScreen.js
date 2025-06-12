import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { handleApiError } from '../utils/errorHandler';
import BackgroundImage from '../components/BackgroundImage';
import LoadingAnimation from '../components/LoadingAnimation';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const { signIn, loading, error: authError } = useAuth();

  // Show auth errors from context via snackbar
  useEffect(() => {
    if (authError) {
      setSnackbarMessage(`Login failed: ${authError}`);
      setSnackbarVisible(true);
    }
  }, [authError]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setSnackbarMessage('Please enter both email and password');
      setSnackbarVisible(true);
      return;
    }

    try {
      setIsAuthenticating(true);
      const { error: loginError } = await signIn(email.trim(), password);
      
      if (loginError) {
        console.log('Login error detected:', loginError);
        const showError = (message) => {
          setSnackbarMessage(`Login failed: ${message}`);
          setSnackbarVisible(true);
        };
        handleApiError(loginError, showError);
        setIsAuthenticating(false);
      }
      // Don't set isAuthenticating to false on success - let the AuthContext handle the transition
    } catch (error) {
      console.log('Caught error during login:', error);
      const showError = (message) => {
        setSnackbarMessage(`Login failed: ${message}`);
        setSnackbarVisible(true);
      };
      handleApiError(error, showError);
      setIsAuthenticating(false);
    }
  };

  // Show loading animation during authentication
  if (isAuthenticating || loading) {
    return (
      <LoadingAnimation 
        message="Signing you in..."
        subMessage="Please wait while we authenticate your credentials"
      />
    );
  }

  return (
    <BackgroundImage
      gradientColors={['rgba(79, 195, 247, 0.5)', 'rgba(79, 195, 247, 0.8)']}
      style={styles.container}
    >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Image 
              source={require('../../assets/milkmatrix-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Card style={styles.loginCard}>
              <Card.Content style={styles.cardContent}>
                <Title style={styles.title}>MilkMatrix</Title>
                <Paragraph style={styles.subtitle}>
                  Dairy Farm Management ERP
                </Paragraph>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                disabled={loading}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                disabled={loading}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.loginButton}
                disabled={loading}
                loading={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              {loading && (
                <ActivityIndicator
                  animating={true}
                  size="large"
                  style={styles.loader}
                />
              )}
            </Card.Content>
          </Card>
          </ScrollView>

          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={6000}
            style={styles.snackbar}
            action={{
              label: 'Dismiss',
              onPress: () => setSnackbarVisible(false),
            }}
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
    width: '100%',
    height: '100%',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 20,
  },
  loginCard: {
    elevation: 8,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  cardContent: {
    padding: 30,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4FC3F7',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loginButton: {
    marginTop: 20,
    paddingVertical: 8,
    backgroundColor: '#4FC3F7',
    borderRadius: 16,
  },
  loader: {
    marginTop: 20,
  },
  snackbar: {
    bottom: 20,
    zIndex: 1000,
  },
});

export default LoginScreen;
