import React from "react";
import { StyleSheet, ImageBackground, TouchableOpacity, View, Alert, Platform } from 'react-native';
import axios from "axios";
import { Button, Layout, Text, Input, Divider, Toggle, Datepicker, Select, SelectItem, IndexPath } from '@ui-kitten/components';
import * as ImagePicker from 'expo-image-picker';
import { backendURL, LoginContext } from "../config";
import i18n from "../i18n";
import { AddFieldModal } from "../components/AddFieldModal";
import { PlusIcon, DeleteIcon, CrossIcon, IconGhostButton, renderImageDeleteButton, CloseIcon } from "./Generics";

export const ExtraFieldsForm = ({
  navigation,
  editable,
  extraFields, 
  setExtraFields, 
  extraFieldStates, 
  setExtraFieldStates, 
  setExtraFieldStatesWith,
  extraFieldErrors, 
  setErrorForExtraField,
  setShowSubmitResponse, 
  modelName, 
  setShowLoading
}) => {
  const [loginContext, setLoginContext] = React.useContext(LoginContext);
  const [addFieldModalVisible, setAddFieldModalVisible] = React.useState(false);
  const [deleteButtonsVisible, setDeleteButtonsVisible] = React.useState(false);

  const renderExtraFieldContainer = (renderChild, field) => (
    <Layout style={{flex:1, flexDirection: 'row', alignItems: 'center'}} key={field.field_name}>
      {renderChild(field)()}
      { editable && deleteButtonsVisible ? 
        <IconGhostButton 
          status='danger' 
          style={styles.button} 
          icon={CrossIcon} 
          onPress={() => deleteFieldAlert(field)}
        /> 
        : null
      }
    </Layout>
  );
  
  const deleteFieldAlert = async (field) => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        i18n.t("delete_field"),
        i18n.t("delete_field_warning", {modelName: i18n.t(modelName)}),
        [
          { text: i18n.t('Cancel'), onPress: () => {}, style: 'cancel' },
          { text: 'OK', onPress: () => deleteFieldRequest(field) }
        ],
        { cancelable: false }
      );
    } else {
      const answer = confirm(i18n.t("delete_field") + " " + i18n.t("delete_field_warning", {modelName: i18n.t(modelName)}));
      if (answer) {
        deleteFieldRequest(field);
      }
    }
  };

  const deleteFieldRequest = async (field) => {
    setShowLoading(true)
    axios.delete(backendURL + `api/extraattributes/${field.id}/`, 
      {headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${loginContext.token}`
      },
    })
    .then(response => {
      const deletedData = response.data;
      let newExtraFields = Array.from(extraFields);
      newExtraFields = newExtraFields.filter((item, index) => item.field_name !== deletedData.field_name);
      setExtraFields(newExtraFields);
      setExtraFieldStatesWith(newExtraFields);
    })
    .catch(error => console.log(error))
    .finally(() => setShowLoading(false));
  };

  const pickExtraImage = (field_name) => async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.75,
    });
    if (!result.cancelled) {
      setShowSubmitResponse(false);
      const newEFStates = Object.assign({}, extraFieldStates);
      newEFStates[field_name] = result;
      setExtraFieldStates(newEFStates);
    }
  };

  const renderDatetime = (field) => () => {
    return (
      <Datepicker 
        style={{flex: 1}}
        label={field.description}
        date={
          typeof extraFieldStates[field.field_name] === 'string' ? 
          new Date(extraFieldStates[field.field_name]) : 
          extraFieldStates[field.field_name]
        }
        onSelect={(newDate) => {
          if (!editable) return;
          setShowSubmitResponse(false);
          setErrorForExtraField(field, false);
          const newEFStates = Object.assign({}, extraFieldStates);
          newEFStates[field.field_name] = newDate;
          setExtraFieldStates(newEFStates);
        }}
        key={field.id}
        disabled={!editable}
        status={extraFieldErrors[field.field_name] ? 'danger' : null}
      /> 
    );
  }

  const renderString = (field) => () => (
    <Input
      style={{flex: 1}}
      onChangeText={(value) => {
        setShowSubmitResponse(false);
        setErrorForExtraField(field, false);
        const newEFStates = Object.assign({}, extraFieldStates);
        newEFStates[field.field_name] = value;
        setExtraFieldStates(newEFStates);
      }}
      value={extraFieldStates[field.field_name]}
      label={field.description}
      key={field.id}
      disabled={!editable}
      status={extraFieldErrors[field.field_name] ? 'danger' : null}
    />
  );

  const renderBool = (field) => () => (
    <Layout style={{flex:1, flexDirection: 'row', alignItems: 'center', padding: 5, justifyContent: 'space-between'}}>
      <Text category='label' style={{paddingRight: 5, justifyContent: 'flex-start'}}>{field.description}:</Text>
      <Layout style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={{justifyContent: 'flex-end', paddingRight: 5}}>
          {extraFieldStates[field.field_name] ? i18n.t("yes") : i18n.t("no")}
        </Text>
        <Toggle 
          style={{justifyContent: 'flex-end'}}
          label={field.description}
          checked={extraFieldStates[field.field_name]} 
          onChange={isChecked => {
            setShowSubmitResponse(false);
            const newEFStates = Object.assign({}, extraFieldStates);
            newEFStates[field.field_name] = isChecked;
            setExtraFieldStates(newEFStates);
          }}
          disabled={!editable}
        />
      </Layout>
    </Layout>
  );

  const renderNumber = (field) => () => (
    <Input
      style={{flex: 1}}
      label={field.description}
      value={String(extraFieldStates[field.field_name])}
      disabled={!editable}
      onChangeText={(text) => {
        setShowSubmitResponse(false);
        setErrorForExtraField(field, false);
        let newValue = text;
        if (field.type_name === 'int') {
          newValue = newValue.replace(/\D/g,'');
        } else {
          newValue = newValue.replace(/[^\d.-]/g, '');
        }
        const newEFStates = Object.assign({}, extraFieldStates);
        newEFStates[field.field_name] = newValue;
        setExtraFieldStates(newEFStates);
        // TODO: fix text input field value error: 17...1224 aynen kalıyor mesela 
      }}
      keyboardType='number-pad'
      key={field.id}
      status={extraFieldErrors[field.field_name] ? 'danger' : null}
    />
  );

  const renderChoices = (field) => () => (
    <Select
      style={{flex: 1}}
      label={field.description}
      selectedIndex={new IndexPath(field.choices.findIndex(element => element === extraFieldStates[field.field_name]))}
      onSelect={index => {
        setShowSubmitResponse(false);
        const newEFStates = Object.assign({}, extraFieldStates);
        newEFStates[field.field_name] = field.choices[index.row];
        setExtraFieldStates(newEFStates);
      }}
      value={extraFieldStates[field.field_name]}
      disabled={!editable}
    >
      {field.choices.map(choice => (
        <SelectItem title={choice} key={choice}/>
      ))}
    </Select>
  );

  const renderImage = (field) => () => (
    <Layout 
      style={{flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 5}} 
      key={field.id}
    >
      <Text category='label' style={{paddingRight: 5, justifyContent: 'flex-start'}}>{field.description}:</Text>
      <TouchableOpacity 
        onPress={editable ? 
          pickExtraImage(field.field_name) : 
          () => {
            navigation.navigate(
              "Images", 
              {
                images: [{image: extraFieldStates[field.field_name].uri}],
                title: `${modelName} ${i18n.t("extra_image")}`
              }
            );
          }
        }
        disabled={!editable && extraFieldStates[field.field_name] === null}
      >
        <ImageBackground 
          source={extraFieldStates[field.field_name] !== null && extraFieldStates[field.field_name]?.uri ? 
            { uri: extraFieldStates[field.field_name].uri } 
            : require("../../assets/default.png")
          }
          style={{ width: 160, height: 160 }} 
          imageStyle={{ alignSelf: 'center', borderRadius: 8 }}
        >
          { editable && extraFieldStates[field.field_name] !== null ?
            renderImageDeleteButton(() => {
              const extraFieldStatesCopy = Object.assign({}, extraFieldStates);
              extraFieldStatesCopy[field.field_name] = null;
              setExtraFieldStates(extraFieldStatesCopy);
            }) : null
          }
        </ImageBackground>
      </TouchableOpacity>
    </Layout>
  );

  const addRemoveProps = {
    style: styles.deleteButton, 
    justifyContent: 'center', 
    alignItems: 'center', 
    appearance: 'outline',
    visible: editable
  };

  const renderAddRemoveField = () => (
    <>
      { editable && loginContext?.user?.is_superuser ?
        <Layout style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Button 
            {...addRemoveProps}
            accessoryRight={PlusIcon}
            onPress={() => setAddFieldModalVisible(true)}
            status='warning'
          >
            {i18n.t("add_field")}
          </Button>
          <Button 
            {...addRemoveProps}
            accessoryRight={deleteButtonsVisible ? CloseIcon : DeleteIcon}
            onPress={() => setDeleteButtonsVisible(!deleteButtonsVisible)}
            status={deleteButtonsVisible ? 'success' : 'danger'}
          >
            {deleteButtonsVisible ? i18n.t("close_remove_view") : i18n.t("remove_field")}
          </Button>
        </Layout>
        : null
      }
    </>
  );

  return (
    <>
      <AddFieldModal 
        modelName={modelName} 
        visible={addFieldModalVisible}
        setVisible={setAddFieldModalVisible}
        extraFields={extraFields}
        setExtraFields={setExtraFields}
        setExtraFieldStatesWith={setExtraFieldStatesWith}
      />
      <View key="extra_fields_form">
        <Divider />
        <Text category='s2' status='warning'>{i18n.t("user_defined_fields")}</Text>
        {extraFields.map((field, index) => {
          switch (field.type_name) {
            case 'datetime': return renderExtraFieldContainer(renderDatetime, field);
            case 'str': return renderExtraFieldContainer(renderString, field);
            case 'bool': return renderExtraFieldContainer(renderBool, field);
            case 'int': 
            case 'float': return renderExtraFieldContainer(renderNumber, field);
            case 'choices': return renderExtraFieldContainer(renderChoices, field);
            case 'image': return renderExtraFieldContainer(renderImage, field);
            default: return null;
          }
        })}
        <Divider />
        {renderAddRemoveField()}
        <Divider />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 24,
    flex: 0,
    flexBasis: 24,
    flexShrink: 0
  },
  deleteButton: {
    width: 180,
    flex: 0,
    flexBasis: 180,
    flexShrink: 0
  },
});
