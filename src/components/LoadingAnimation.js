import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import {
  ActivityIndicator,
  Text,
  Card,
} from 'react-native-paper';
import BackgroundImage from './BackgroundImage';

const { width, height } = Dimensions.get('window');

const LoadingAnimation = ({ 
  message = 'Signing you in...', 
  subMessage = 'Please wait while we authenticate your credentials',
  showLogo = true 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous spin animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();

    return () => {
      spinAnimation.stop();
    };
  }, [fadeAnim, scaleAnim, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <BackgroundImage
      gradientColors={['rgba(79, 195, 247, 0.6)', 'rgba(79, 195, 247, 0.9)']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {showLogo && (
          <Animated.View style={[styles.logoContainer, { transform: [{ rotate: spin }] }]}>
            <Image 
              source={require('../../assets/milkmatrix-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        )}

        <Card style={styles.loadingCard}>
          <Card.Content style={styles.cardContent}>
            <ActivityIndicator
              animating={true}
              size="large"
              color="#4FC3F7"
              style={styles.spinner}
            />
            
            <Text style={styles.message}>
              {message}
            </Text>
            
            {subMessage && (
              <Text style={styles.subMessage}>
                {subMessage}
              </Text>
            )}
          </Card.Content>
        </Card>
      </Animated.View>
    </BackgroundImage>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },
  loadingCard: {
    elevation: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 20,
    paddingHorizontal: 30,
    minWidth: 280,
    maxWidth: 350,
  },
  cardContent: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4FC3F7',
    textAlign: 'center',
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LoadingAnimation;
