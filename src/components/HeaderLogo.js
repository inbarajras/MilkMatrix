import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';

/**
 * Header logo component for MilkMatrix app
 * Can be used in navigation headers
 */
const HeaderLogo = ({ showTitle = true }) => {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/milkmatrix-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      {showTitle && (
        <Text style={styles.title}>MilkMatrix</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default HeaderLogo;
