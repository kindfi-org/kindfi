import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface HeaderProps {
  logo: any;
  hamburgerIcon: any;
}

const Header: React.FC<HeaderProps> = ({ logo, hamburgerIcon }) => {
  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Image source={hamburgerIcon} style={styles.hamburgerIcon} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  logo: {
    width: 50,
    height: 50,
  },
  hamburgerIcon: {
    width: 30,
    height: 30,
  },
});

export default Header;