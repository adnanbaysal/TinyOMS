import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Divider, Layout} from '@ui-kitten/components';
import i18n from "../i18n";
import { TopNavigationBar } from "../components/TopNavigationBar";
import Menus from "../Menus";
import { MenuItemButton } from "../components/MenuItemButton";

export const Home = ({ navigation }) => {
  return (
    <View style={{ flex: 1 }}>
      <TopNavigationBar navigation={navigation} currentPage={i18n.t('Home')} showBackButton={false}/>
      <Layout style={styles.layout}>
        {Menus.filter(menuItem => !(['logout', 'Home', 'Settings', 'Help'].includes(menuItem.name))).map(
          menuItem => (
            <React.Fragment key={menuItem.name}>
              <MenuItemButton menuItem={menuItem} navigation={navigation}/>
              <Divider style={styles.divider}/>
            </React.Fragment>
          )
        )}
      </Layout>
    </View>
  );
};

const styles = StyleSheet.create({
  layout: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  button: {
    justifyContent: 'flex-start',
    height: 48,
    width: 256,
    fontSize: 48
  },
  divider: {
    paddingTop: 10
  }
});
