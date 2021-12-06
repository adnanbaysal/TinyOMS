import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, Layout, MenuItem, OverflowMenu, TopNavigation, TopNavigationAction, Divider } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import i18n from "../i18n";
import Menus from "../Menus";
import { CommonActions } from '@react-navigation/native';
import { LoginContext } from "../config";

const BackIcon = (props) => (
  <Icon {...props} name='arrow-back'/>
);

const MenuIcon = (props) => (
  <Icon {...props} name='more-vertical'/>
);

export const TopNavigationBar = ({ navigation, currentPage, showBackButton = true }) => {
  const [loginContext, setLoginContext] = React.useContext(LoginContext);
  const [menuVisible, setMenuVisible] = React.useState(false);

  const renderMenuAction = () => (
    <TopNavigationAction icon={MenuIcon} onPress={() => {setMenuVisible(!menuVisible);}}/>
  );

  const navigateTo = page => () => {
    setMenuVisible(false);
    if (page !== "Login"){
      navigation.navigate(page);
    } else {
      AsyncStorage.multiRemove(['tinyoms_auth_token','tinyoms_active_user'])
      .finally(() => {
        setLoginContext({});
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              { name: 'Login' },
            ],
          })
        );
      });
    }
  };

  const renderRightActions = () => (
      <OverflowMenu
        style={{maxHeight: 1000}}
        anchor={renderMenuAction}
        visible={menuVisible}
        onSelect={() => {setMenuVisible(false);}}
        onBackdropPress={() => setMenuVisible(false)}
      >
        {Menus.filter(menu => ["Home", "Settings", "Help", "logout"].includes(menu.name)).map(menu => 
          <MenuItem
            key={menu.name} 
            accessoryLeft={menu.icon} 
            title={i18n.t(menu.name)} 
            onPress={navigateTo(menu.navigateTo)}
          />)}
      </OverflowMenu>
  );

  const renderBackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()}/>
  );

  return (
    <Layout style={styles.container}>
      <Divider style={styles.divider}/>
      <TopNavigation
        alignment='center'
        title={currentPage}
        accessoryLeft={showBackButton ? renderBackAction : null}
        accessoryRight={renderRightActions}
      />
      <Divider />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 40,
  },
  divider: {
    paddingTop: 32
  }
});

  // NOTE: Selecting index does not affect view in TopNavigation component

  // const [selectedMenuIndex, setSelectedMenuIndex] = React.useState(null);

  // const onMenuItemSelect = (index) => {
  //   setSelectedMenuIndex(index);
  //   setMenuVisible(false);
  // };

  // const menuMapping = {
  //   Home: {row: 0, section: null},
  //   Logout: {row: 1, section: null}
  // };

  // React.useEffect(() => {
  //   setSelectedMenuIndex(menuMapping[currentPage]);
  // }, []);

  // selectedIndex={selectedMenuIndex}
