import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Button, ButtonGroup, Layout, Text, Input, Icon, MenuItem, OverflowMenu, Modal, Spinner } from '@ui-kitten/components';
import { Formik} from "formik";
import * as Yup from "yup";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from "../i18n";
import { CommonActions } from '@react-navigation/native';
import { LoginContext, backendURL } from "../config";
import { setLocaleByUiLanguage } from "../components/Generics";

export const Login = ({ navigation }) => {
  const [loginContext, setLoginContext] = React.useContext(LoginContext);
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);
  const [showCredentialError, setShowCredentialError] = React.useState(false);

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const renderEyeIcon = (props) => (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'}/>
    </TouchableWithoutFeedback>
  );

  React.useEffect(() => {
    const getLangOrDefault = async  () => {
      const lang = await AsyncStorage.getItem("tinyoms_language");
      i18n.locale = lang !== null ? lang : "en";
    };
    getLangOrDefault();
  }, []);
  
  const [selectedLangIndex, setSelectedLangIndex] = React.useState(null);
  const [langMenuVisible, setLangMenuVisible] = React.useState(false);
  
  const renderLangIcon = (props) => <Icon {...props} name="globe" />

  const onLangItemSelect = (lang) => ({index}) => {
    i18n.locale = lang;
    setSelectedLangIndex(index);
    setLangMenuVisible(false);
    async function setLang() {
      await AsyncStorage.setItem("tinyoms_language", lang);
    }
    setLang();
  };

  const renderLangButton = () => (
    <Button 
      onPress={() => setLangMenuVisible(true)} 
      appearance='ghost' 
      style={styles.changeLanguage}
      accessoryRight={renderLangIcon}
    >
      {i18n.t("language")}
    </Button>
  );

  const [showLoading, setShowLoading] = React.useState(false);

  const handleSubmitAction = (values, { setSubmitting, resetForm }) => {
    setShowCredentialError(false);
    setShowLoading(true);
    axios.post(backendURL + 'api/auth/login', {
      username: values.username,
      password: values.password
    })
    .then(async function (response) {
      await AsyncStorage.setItem('tinyoms_auth_token', response.data.token);
      await AsyncStorage.setItem('tinyoms_active_user', JSON.stringify(response.data.user));
      setLoginContext({token: response.data.token, user: response.data.user});
      setLocaleByUiLanguage(response.data.user.ui_language);
      resetForm();
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'Home' },
          ],
        })
      );
    })
    .catch(function (error) {
      setShowCredentialError(true);
    })
    .finally(() => {
      setShowLoading(false);
    });
    setSubmitting(false);
  }

  return (
    <View style={{ flex: 1 }}>
      <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Modal visible={showLoading} backdropStyle={styles.backdrop}>
          <Spinner size='giant'/>
        </Modal>
        <Text category='s1' style={styles.text}>
          {i18n.t('loginWelcome', { appName: i18n.t('appName')})}
        </Text>
        <Formik
          initialValues={{password: '', username: '' }}
          onSubmit={handleSubmitAction}
          validationSchema={Yup.object({
            username: Yup.string()
              .max(50, 'Username should be less than 50')
              .required('Required'),
            password: Yup.string()
              .min(1, "Password should be at least 1 characters")
              .required('Required'),
          })}
        >
          {({ isSubmitting, handleChange, handleBlur, handleSubmit, values, errors, touched, resetForm}) => (
            <View style={styles.formArea}>
              <Input
                onChangeText={(value) => {
                  setShowCredentialError(false);
                  handleChange('username')(value);
                }}
                onBlur={handleBlur('username')}
                value={values.username}
                label={i18n.t("username")}
                status={errors.username && touched.username ? 'danger': null}
                autoCapitalize='none'
              />
              <Input
                accessoryRight={renderEyeIcon}
                secureTextEntry={secureTextEntry}
                onChangeText={(value) => {
                  setShowCredentialError(false);
                  handleChange("password")(value);
                }}
                value={values.password}
                label={i18n.t("password")}
                onBlur={handleBlur("password")}
                status={errors.password && touched.password ? 'danger': null}
                autoCapitalize='none'
              />
              <Text status='danger' style={styles.credentialError}>
                {showCredentialError ? i18n.t("credential_error") : null}
              </Text>
              <Button onPress={handleSubmit} disabled={isSubmitting}>
                {i18n.t("login")}
              </Button>
              {/* <ButtonGroup style={styles.ghostGroup} appearance="ghost"> */}
              <Layout style={{flexDirection: 'row'}}>
                <Button 
                  onPress={() => {
                    setShowCredentialError(false);
                    resetForm();
                    navigation.navigate("ForgotPassword");
                  }} 
                  style={styles.forgetPassword}
                  appearance="ghost"
                >
                  {i18n.t("forgot_password")}
                </Button>
                <OverflowMenu
                  anchor={renderLangButton}
                  visible={langMenuVisible}
                  selectedIndex={selectedLangIndex}
                  onSelect={onLangItemSelect}
                  onBackdropPress={() => setLangMenuVisible(false)}>
                  <MenuItem title='Türkçe' onPress={onLangItemSelect("tr")}/>
                  <MenuItem title='English' onPress={onLangItemSelect("en")}/>
                </OverflowMenu>
              </Layout>
              {/* </ButtonGroup> */}
            </View>
          )}
        </Formik>
      </Layout>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    paddingBottom: 16,
    width: 320
  },
  formArea: {
    width: 320
  },
  credentialError: {
    height: 24
  },
  ghostGroup: {
    paddingTop: 16,
  },
  forgetPassword: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  changeLanguage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
