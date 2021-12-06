import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from '@ui-kitten/components';
import i18n from "../i18n";


export const MenuItemButton = ({menuItem, navigation}) => {
  return (
    <>
      <Button style={styles.button}
        accessoryLeft={menuItem.icon}
        onPress={() => {navigation.navigate(menuItem.navigateTo);}}
        size='giant'
      >
        {i18n.t(menuItem.name)}
      </Button>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'flex-start',
    height: 48,
    width: 256,
    fontSize: 48
  }
});
