import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * A consistent background component using the MilkMatrix logo with gradient overlay
 * for uniform appearance across screens
 */
const BackgroundImage = ({ children, style = {}, gradientColors = ['rgba(79, 195, 247, 0.6)', 'rgba(79, 195, 247, 0.8)'] }) => {
  return (
    <ImageBackground
      source={require('../../assets/milkmatrix-logo.png')}
      style={[styles.background, style]}
      imageStyle={styles.backgroundImage}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
      >
        {children}
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    opacity: 0.15, // Subtle background that doesn't interfere with content
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default BackgroundImage;
