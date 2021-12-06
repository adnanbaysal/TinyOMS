import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { AppNavigator } from "./src/AppNavigator";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default () => {
  let theme = null;
  const getTheme = async () => {
    theme = await AsyncStorage.getItem("tinyoms_theme");
  };

  React.useEffect(() => {
    getTheme();
  }, [])

  return (
    <>
      <IconRegistry icons={EvaIconsPack}/>
      <ApplicationProvider {...eva} theme={theme !== null ? eva[theme] : eva.dark}> 
        <AppNavigator />
      </ApplicationProvider>
    </>
  );
}
