import React from 'react';
import FormData from "form-data";
import axios from "axios";
import { Alert, View, StyleSheet, Platform } from 'react-native';
import { Card, Layout, Text, Spinner, Modal, Button, Divider } from '@ui-kitten/components';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import i18n from "../i18n";
import { backendURL, LoginContext, WidthContext } from "../config";
import { TopNavigationBar } from "./TopNavigationBar";
import { renderImageUploadError } from "./Generics";
import { ExtraFieldsForm } from "./ExtraFieldsForm";

export const ModelForm = ({
  navigation, 
  currentPage,
  modalProps = {},
  editable = true,
  setEditable = null,
  preventEdit = false,
  renderBottomTabs = null,
  selectedTabIndex = 0,
  tabs = [],
  modelValue = null,
  setModelValue = null,
  modelName, 
  modelRoute, 
  modelBaseFieldStates, 
  resetBaseModelFields, 
  renderBaseModelFields, 
  showSubmitResponse, 
  setShowSubmitResponse, 
  modelImageCallback
}) => {
  const {
    asModal = false,
    showAsModal = false,
    setShowAsModal = null,
    handleModalSubmit = null,
    handleModalCancel = null,
    handleModalDelete = null,
    modalReadInEditMode = false
  } = modalProps; 
  const [loginContext, setLoginContext] = React.useContext(LoginContext);
  const [usefulWidth, setUsefulWidth] = React.useContext(WidthContext);
  const formsPaddingRight = Platform.OS === 'web' ? 16 : 0;
  
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [showLoading, setShowLoading] = React.useState(false);
  const [submitResponseMessage, setSubmitResponseMessage] = React.useState("created");
  const [errorOnSubmit, setErrorOnSubmit] = React.useState(false);
  const [extraFields, setExtraFields] = React.useState([]);  
  const [extraFieldStates, setExtraFieldStates] = React.useState({});
  const [extraFieldErrors, setExtraFieldErrors] = React.useState({});
  const [editMode, setEditMode] = React.useState(false);

  const json_header = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${loginContext.token}`
    },
  };
  const form_header = {
    headers: {
      'Content-Type': 'multipart/form-data',
      "Authorization": `Token ${loginContext.token}`,
    }
  };

  const resetForms = async () => {
    resetBaseModelFields();
    await fetchModelExtraFieldsPromise();
  };

  const setExtraFieldStatesWith = (data) => {
    const newEFStates = {};
    data.forEach((item, index, array) => {
      let defaultValue = item.default;
      if (defaultValue !== null){
        switch (item.type_name) {
          case 'datetime': {
            defaultValue = new Date(defaultValue);
            break;
          }
          case 'bool': {
            defaultValue = defaultValue === 'true';
            break;
          }
          case 'image': {
            defaultValue = null;
            break;
          }
          default: break;
        }
      }
      newEFStates[item.field_name] = defaultValue;
    });
    setExtraFieldStates(newEFStates);
  };

  const fetchModelExtraFieldsPromise = async () => {
    setShowLoading(true);
    const url = backendURL + `api/extraattributes/?model_name=${modelName}`; 
    axios.get(url, json_header
    ).then(response => {
      const data = response.data;
      setExtraFields(data);
      if (editable){
        setExtraFieldStatesWith(data);
      } else {
        // get extra field image by id (genericimage)
        data.forEach((field, index, array) => {
          if (field.type_name === 'image' && !isNaN(parseInt(modelValue.extra_field_values[field.field_name]))) {
            // the second check above is for already fetched images
            axios.get(
              backendURL + `api/genericimage/${modelValue.extra_field_values[field.field_name]}/`,
              form_header
            ).then((imageResponse) => {
              const modelCopy = Object.assign({}, modelValue);
              modelCopy.extra_field_values[field.field_name] = {uri: imageResponse.data.image};
              setModelValue(modelCopy);
            }).catch(error => console.log(modelName, " MODEL PAGE ERROR:", error));
          }
        });
        setExtraFieldStates(modelValue.extra_field_values);
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      setShowLoading(false);
    });
  };

  // Initial fetching
  React.useEffect(() => {
    async function fetchModelExtraFields() {
      await fetchModelExtraFieldsPromise();
    }
    fetchModelExtraFields();
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert(i18n.t("roll_permission_sorry"));
        }
      }
    })();
  }, []);

  // fetching when modelName changes (to be used in orderItems: supplierorderitem or inventoryorderitem)
  React.useEffect(() => {
    async function fetchModelExtraFields() {
      await fetchModelExtraFieldsPromise();
    }
    fetchModelExtraFields();
  }, [modelName]);

  const filterImageFieldHelper = is_image => {
    return Object.keys(extraFieldStates)
    .filter(key => {
      const index = extraFields.findIndex(element => element.field_name === key);
      return is_image === (extraFields[index].type_name === 'image');
    })
    .reduce((obj, key) => {
      obj[key] = extraFieldStates[key];
      return obj;
    }, {});
  };

  const setErrorForExtraField = (field, error) => {
    const EFErrorsCopy = Object.assign({}, extraFieldErrors);
    EFErrorsCopy[field.field_name] = error;
    setExtraFieldErrors(EFErrorsCopy);
  }

  const handleSubmit = () => {
    setShowSubmitResponse(false);
    setShowLoading(true);
    setSubmitting(true);

    const nonImageFields = filterImageFieldHelper(false);
    const imageFields = filterImageFieldHelper(true);

    for (let key of Object.keys(imageFields)){
      nonImageFields[key] = null;
    }    
    
    // Numeric values do not shown in Input field in mobile, 
    // so they are converted to string to manipulate as state
    // below code converts them bact to numeric value
    extraFields.forEach(field => {
      if (field.type_name === 'int' || field.type_name === 'float') {
        nonImageFields[field.field_name] = Number(nonImageFields[field.field_name]);
      }
    }); 
    const method = editMode ? axios.patch : axios.post;
    const route = "api/" + (editMode ? modelRoute.putRoute : modelRoute.postRoute);

    method(backendURL + route, 
      { 
        ...modelBaseFieldStates, 
        extra_field_values: nonImageFields
      },
      json_header
    )
    .then(async function (response) {
      await modelImageCallback(response);

      for (let field_name of Object.keys(imageFields)) {
        // TODO: make this work on web
        const uri = imageFields[field_name]?.uri;
        if (!uri) continue;
        const data = new FormData();
        data.append('model_name', modelName);
        data.append('field_name', field_name);
        data.append('obj_id', response.data.id);
        data.append('image', {uri: imageFields[field_name].uri, name: 'image.jpg', type: 'image/jpeg'});
        
        axios.post(backendURL + 'api/genericimage/', data, form_header
        ).catch(err => {
          renderImageUploadError();
        });
      }
      
      setErrorOnSubmit(false);
      setSubmitResponseMessage(editMode ? "updated" : "created");
      setTimeout(() => setShowSubmitResponse(false), 3000);
      if (editMode) {
        axios.get(backendURL + route, json_header
        ).then(response => {
          setModelValue(response.data);
        });
        setEditMode(false);
        setEditable(false);
      } else {
        setExtraFieldStatesWith(extraFields);
        await resetForms();
      }
    })
    .catch(function (error) {
      console.log(modelName, "SUBMIT ERROR:", error);
      setErrorOnSubmit(true);
      if (error.response) {
        if (error.response.data.detail === "Invalid token.") {
          setSubmitResponseMessage("token_invalid");
        } else {
          setSubmitResponseMessage("model_submit_error");
          if (error.response.data.extra_field_values) {
            const erroneus_field_names = error.response.data.extra_field_values[0];
            extraFields.forEach((field, index, array) => {
              if (erroneus_field_names.includes(field.field_name)) {
                setErrorForExtraField(field, true);
              }
            });
          }
        }
      }
    })
    .finally(() => {
      setSubmitting(false);
      setShowLoading(false);
      setShowSubmitResponse(true);
    });
  };

  const handleDelete = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        i18n.t(`delete_${modelName}`),
        i18n.t(`delete_${modelName}_warning`),
        [
          { text: i18n.t('Cancel'), onPress: () => {}, style: 'cancel' },
          { text: 'OK', onPress: () => deleteModelRequest() }
        ],
        { cancelable: false }
      );
    } else {
      const answer = confirm(
        i18n.t(`delete_${modelName}`) + 
        " " + i18n.t(`delete_${modelName}_warning`)
      );
      if (answer) {
        deleteModelRequest();
      }
    }
  };

  const deleteModelRequest = async () => {
    axios.delete(backendURL + "api/" + modelRoute + `${modelValue.id}/`, json_header
    ).then(response => {
      // route to the listing page 
      // remove 2 items from navigation stack and update product list
      // works only for the case: reaching from listing page -> read list item details -> edit
      navigation.pop(1);
    }).catch(error => {
      // if protected, show appropriate message
      console.log(modelName, " DELETE ERROR:", error);
      if (error.response.status === 403) {
        setSubmitResponseMessage("protected_error");
        setShowSubmitResponse(true);
        setTimeout(() => setShowSubmitResponse(false), 3000);
      }
    });
  };

  const editDeleteProps = {
    style: styles.button,
    appearance: 'outline',
  }

  const renderForms = () => (
    <>
      {renderBaseModelFields()}
      <ExtraFieldsForm
        navigation={navigation}
        editable={editable}
        extraFields={extraFields}
        setExtraFields={setExtraFields}
        extraFieldStates={extraFieldStates}
        setExtraFieldStates={setExtraFieldStates}
        setExtraFieldStatesWith={setExtraFieldStatesWith}
        extraFieldErrors={extraFieldErrors}
        setErrorForExtraField={setErrorForExtraField}
        setShowSubmitResponse={setShowSubmitResponse}
        setShowLoading={setShowLoading}
        modelName={modelName}
      />
    </>
  );

  const renderModelDetails = () => (
    <KeyboardAwareScrollView>
      <View style={{width: usefulWidth - 32,  paddingRight: formsPaddingRight}}>
        {renderForms()}
        <Text status={errorOnSubmit ? 'danger' : 'success'} style={styles.submitResponse}>
          {showSubmitResponse ? i18n.t(submitResponseMessage) : null}
        </Text>
        { !preventEdit ? 
          (editable ? 
            <Button onPress={handleSubmit} disabled={isSubmitting}>
              {i18n.t("create")} / {i18n.t("update")}
            </Button>
            :
            <Layout style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Button
                {...editDeleteProps} 
                onPress={() => {
                  setEditable(true);
                  setEditMode(true);
                }} 
                status='warning' 
              >
                {i18n.t("edit")}
              </Button>
              <Button 
                {...editDeleteProps} 
                onPress={handleDelete} 
                status='danger' 
              >
                {i18n.t("delete")}
              </Button>
            </Layout>)
          : null
        }
      </View>
    </KeyboardAwareScrollView>
  );

  const tabRenderers = [renderModelDetails, ...tabs];

  if (asModal) {
    return (
      <Modal 
        visible={showAsModal} 
        backdropStyle={styles.backdrop} 
        style={{maxWidth: usefulWidth, maxHeight: 600, justifyContent: 'flex-start', alignItems: 'center', flex: 0}} 
        onBackdropPress={() => {
          setShowAsModal(false);
          handleModalCancel();
        }}
      >
        <Card disabled={false} style={Platform.OS === 'web' ? {width: usefulWidth + 48, height: 600} : null}>
          {renderForms()}
          <Divider />
          { modalReadInEditMode ? 
            <Layout style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Button
                {...editDeleteProps} 
                onPress={() => {
                  setShowAsModal(false);
                  handleModalCancel();
                }} 
              >
                {i18n.t("Close")}
              </Button>
              <Button 
                {...editDeleteProps} 
                onPress={() => {
                  setShowAsModal(false);
                  handleModalDelete();
                }} 
                status='danger' 
              >
                {i18n.t("delete")}
              </Button>
            </Layout>
            :
            <Button 
            onPress={() => {
              setShowAsModal(false);
              if (editable) {
                handleModalSubmit();
              }
            }}
          >
            {editable ? i18n.t("Submit") : i18n.t("ok")}
          </Button>
          }
        </Card>
      </Modal>
    );
  } else {
    // TODO: When rendering ModelPage tabs other than detail, 
    // render with renderBottomTabs = null to prevent 
    // multiple buttom tabs  
    return (
      <View style={{flex: 1}}>
        <TopNavigationBar navigation={navigation} currentPage={currentPage}/> 
        <Layout style={styles.layout}>
          <Modal visible={showLoading} backdropStyle={styles.backdrop}>
            <Spinner size='giant'/>
          </Modal>  
          {tabRenderers[selectedTabIndex]()}
          <Divider />
          {!editable && renderBottomTabs !== null ? renderBottomTabs() : null}
        </Layout>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  layout: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  submitResponse: {
    height: 48
  },
  button: {
    width: 180,
    flex: 0,
    flexBasis: 180,
    flexShrink: 0
  }
});
