import React from 'react';
import { Layout } from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { LoginContext } from "../config";
import i18n from "../i18n";
import { setLocaleByUiLanguage } from "../components/Generics";

export const Landing = ({ navigation }) => {
  const [loginContext, setLoginContext] = React.useContext(LoginContext);

  React.useEffect(() => {
    const getCookieValues = async  () => {
      const lang = await AsyncStorage.getItem("tinyoms_language");
      i18n.locale = lang !== null ? lang : "en";
      const token = await AsyncStorage.getItem("tinyoms_auth_token");
      const user = await AsyncStorage.getItem("tinyoms_active_user");
      let route = "Login";
      if (token && user) {
        setLoginContext({token: token, user: JSON.parse(user)});
        setLocaleByUiLanguage(user.ui_language); 
        route = "Home"; 
      }
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: route },
          ],
        })
      );
    };
    getCookieValues();
  }, []);

  return (
    <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}/>
  );
};
