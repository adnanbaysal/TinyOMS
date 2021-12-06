import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Layout, Text, Input, Modal, Spinner } from '@ui-kitten/components';
import { Formik} from "formik";
import * as Yup from "yup";
import axios from "axios";
import i18n from "../i18n";
import { backendURL } from "../config";

export const ForgotPassword = ({ navigation }) => {
  const [showResponse, setShowResponse] = React.useState(false);
  const [userFound, setUserFound] = React.useState(false);
  const [showLoading, setShowLoading] = React.useState(false);

  const handleSubmitAction = (values, { setSubmitting }) => {
    setShowResponse(false);
    setShowLoading(true);
    axios.get(backendURL + `api/auth/reset-password-request/${values.email}/`)
    .then(async function (response) {
      setUserFound(true);
    })
    .catch(function (error) {
      setUserFound(false);
    })
    .finally(() => {
      setShowResponse(true);
      setShowLoading(false);
    });
    setSubmitting(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Modal visible={showLoading} backdropStyle={styles.backdrop}>
          <Spinner size='giant'/>
        </Modal>
        <Text category='s1' style={styles.text}>
          {i18n.t('forgot_password')}
        </Text>
        <Formik
          initialValues={{ email: '' }}
          onSubmit={handleSubmitAction}
          validationSchema={Yup.object({
            email: Yup.string()
              .email('Invalid email address')
              .required('Required')
          })}
        >
          {({ isSubmitting, handleChange, handleBlur, handleSubmit, values, errors, touched, resetForm}) => (
            <View style={styles.formArea}>
              <Text status={userFound ? 'success' : 'danger'} style={styles.responseMessage}>
                {showResponse ? 
                  (userFound ? 
                    i18n.t("link_sent") : 
                    i18n.t("user_not_found")) : 
                  null
                }
              </Text>
              <Input
                onChangeText={(value) => {
                  setShowResponse(false);
                  handleChange('email')(value);
                }}
                onBlur={handleBlur('email')}
                value={values.email}
                label={i18n.t("email")}
                status={errors.email && touched.email ? 'danger': null}
              />
              <Button onPress={handleSubmit} disabled={isSubmitting}>
                {i18n.t("reset_password")}
              </Button>
              <Button 
                appearance='ghost' 
                onPress={() => {
                  setShowResponse(false);
                  resetForm();
                  navigation.navigate("Login");
                }} 
                style={styles.backToLogin}
              >
                {i18n.t("back_to_login")}
              </Button>
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
  responseMessage: {
    height: 24
  },
  backToLogin: {
    justifyContent: 'flex-start',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
