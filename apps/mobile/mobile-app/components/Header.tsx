import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
interface HeaderProps {
  logo: any;
}

const Header: React.FC<HeaderProps> = ({ logo }) => {


return (
    <View style={styles.container}>
        <Image source={logo} style={styles.logo} />
        <Ionicons name="menu" size={30} color="black" />
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