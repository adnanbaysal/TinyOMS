import React from 'react';
import { Alert, Platform } from 'react-native';
import { Text, Layout, Button, Icon, CheckBox, Radio, Divider } from '@ui-kitten/components';
import i18n from "../i18n";

export const SortIcon = (props) => (
  <Layout style={{transform: [{rotateZ: '90deg'}]}}>
    <Icon {...props} name='swap'/>
  </Layout>
);
export const AddIcon = (props) => (<Icon {...props} name='plus-circle'/>);
export const PlusIcon = (props) => (<Icon {...props} name='plus'/>);
export const DeleteIcon = (props) => (<Icon {...props} name='trash-2'/>);
export const EditIcon = (props) => (<Icon {...props} name='edit-2'/>);
export const CloseIcon = (props) => (<Icon {...props} name='close-circle'/>);
export const CrossIcon = (props) => (<Icon {...props} name='close'/>);

export const HomeIcon = (props) => (<Icon {...props} name='home'/>);
export const LogoutIcon = (props) => (<Icon {...props} name='log-out'/>);
export const PersonsIcon = (props) => (<Icon {...props} name='people'/>);
export const ProductsIcon = (props) => (<Icon {...props} name='gift'/>);
export const StocksIcon = (props) => (<Icon {...props} name='layers'/>);
export const OrdersIcon = (props) => (<Icon {...props} name='shopping-cart'/>);
export const PaymentsIcon = (props) => (<Icon {...props} name='file-text'/>);
export const FinancialsIcon = (props) => (<Icon {...props} name='trending-up'/>);
export const SettingsIcon = (props) => (<Icon {...props} name='settings'/>);
export const HelpIcon = (props) => (<Icon {...props} name='question-mark-circle'/>);

export const EmployeesIcon = (props) => (<Icon {...props} name='briefcase'/>);
export const SuppliersIcon = (props) => (<Icon {...props} name='car'/>);
export const ClientsIcon = (props) => (<Icon {...props} name='smiling-face'/>);

export const IconGhostButton = ({status, style, icon, onPress}) => (
  <Button 
    status={status}
    style={style} 
    justifyContent='center' 
    alignItems='center' 
    appearance='ghost'
    accessoryLeft={icon}
    onPress={() => onPress()}
  />
);

export const renderImageUploadError = () => {
  if (Platform.OS !== 'web') {
    Alert.alert(
      i18n.t("image_upload_error"),
      [{ text: i18n.t('OK'), onPress: () => {}, style: 'ok' }]
    );
  } else {
    alert(i18n.t("image_upload_error"));
  }
};

export const setLocaleByUiLanguage = ui_language => {
  let lang = "en"; // default language
  switch (ui_language) {
    case 'tr-tr': {
      lang = 'tr';
      break;
    }
    case 'en-us':
    default: break;
  }
  i18n.locale = lang;
}

export const renderImageDeleteButton = handlePress => (
  <Button 
    onPress={handlePress} 
    style={{alignSelf: 'flex-end'}}
    accessoryLeft={CloseIcon}
    appearance='ghost'
  />
);

export const handleListItemSelect = (selectedItemsSet, setSelectedItems, item) => {
  const selectedItemsCopy = new Set(selectedItemsSet);
  if (!selectedItemsSet.has(item.id)) {
    selectedItemsCopy.add(item.id);
  } else {
    selectedItemsCopy.delete(item.id);
  }
  setSelectedItems(selectedItemsCopy);
};

export const renderListItemCheckBox = (selectedItemsSet, setSelectedItems, item) => (
  <CheckBox 
    style={{paddingRight: 5}}
    checked={selectedItemsSet.has(item.id)}
    onChange={nextChecked => handleListItemSelect(selectedItemsSet, setSelectedItems, item)}
  />
);

export const handleListItemRadioSelect = (selectedItemsSet, setSelectedItems, item) => {
  const selectedItemsArray = Array.from(selectedItemsSet).map(element => element.id);
  if (selectedItemsArray.includes(item.id)) {
    setSelectedItems(new Set());
  } else {
    setSelectedItems(new Set([item]));
  }
};

export const renderListItemRadioButton = (selectedItemsSet, setSelectedItems, item) => (
  <Radio 
    style={{paddingRight: 5}}
    checked={Array.from(selectedItemsSet).map(element => element.id).includes(item.id)}
    onChange={nextChecked => handleListItemRadioSelect(selectedItemsSet, setSelectedItems, item)}
  />
);

export const getSelectedSetFor = item => item ? new Set([item]) : new Set();

export const ModelSelector = ({textMessage, editable, buttonLabel, show, setShow, Model, selectedItems, setSelectedItems}) => {
  return (
    <React.Fragment key={buttonLabel}>
      <Text status={selectedItems.size > 0 ? 'success' : 'danger'} style={{paddingTop: 10}}>
        {textMessage}
      </Text>
      {editable ? null : <Divider />}
      { 
        editable ? 
        <Button onPress={() => setShow(true)}>
          {buttonLabel}
        </Button>
        : null
      }
      <Model 
        asModal={true}
        navigation={null}
        visible={show} 
        setVisible={setShow}
        selectable={editable}
        showOnlySelected={!editable}
        selectSingle={true}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      /> 
    </React.Fragment>
  );
}
