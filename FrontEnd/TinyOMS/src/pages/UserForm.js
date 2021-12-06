import React from 'react';
import FormData from "form-data";
import axios from "axios";
import { View, ImageBackground, TouchableOpacity, Platform } from 'react-native';
import { BottomNavigation, BottomNavigationTab, Text, Input, Button, Divider, Select, SelectItem, IndexPath, Layout, Toggle } from '@ui-kitten/components';
import * as ImagePicker from 'expo-image-picker';
import { UILanguages, backendURL, LoginContext, WidthContext } from "../config";
import i18n from "../i18n";
import { renderImageUploadError, renderImageDeleteButton } from "../components/Generics";
import { ModelForm } from "../components/ModelForm";
import { Products } from "./Products";

export const UserForm = ({ route, navigation, readOnly = false }) => {
  const [loginContext, setLoginContext] = React.useContext(LoginContext);
  const [usefulWidth, setUsefulWidth] = React.useContext(WidthContext);
  const formsPaddingRight = Platform.OS === 'web' ? 16 : 0;
  const imageWidth = usefulWidth - 32 - formsPaddingRight;

  const { usertype } = route.params;
  const [user, setUser] = React.useState(route.params.user);

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [userName, setUserName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [uiLanguage, setUiLanguage] = React.useState(UILanguages[0]);
  const [notifyUser, setNotifyUser] = React.useState(true);
  const [profileImage, setProfileImage] = React.useState(null);
  const [showSubmitResponse, setShowSubmitResponse] = React.useState(false);
  const [showProductSelector, setShowProductSelector] = React.useState(false);
  // the following is for only supplier user type
  const [selectedProducts, setSelectedProducts] = React.useState(new Set());

  const [editable, setEditable] = React.useState(!readOnly);
  const [imageSelected, setImageSelected] = React.useState(false);

  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);

  const tabTitles = ['DETAILS', 'ORDERS', 'PAYMENTS'];

  const renderBottomTabs = () => (
    <BottomNavigation
      selectedIndex={selectedTabIndex}
      onSelect={index => {
        setSelectedTabIndex(index);
      }}
      style={{borderTopWidth: 1}}
    >
      {tabTitles.map(item => <BottomNavigationTab title={item} key={item}/>)}
    </BottomNavigation>
  );

  React.useEffect(() => {
    if (readOnly) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setUserName(user.username);
      setEmail(user.email);
      setUiLanguage(UILanguages.find(item => item.code === user.ui_language));
      setProfileImage({uri: user.profile_image});
      if (usertype === 'supplier') {
        setSelectedProducts(new Set(user.products.map(item => item.id)));
      }
    }
  }, []);

  const resetForms = async () => {
    setFirstName("");
    setLastName("");
    setUserName("");
    setEmail("");
    setPassword("");
    setUiLanguage(UILanguages[0]);
    setProfileImage(null);
    setNotifyUser(true); 
    setSelectedProducts(new Set());
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.75
    });
    if (!result.cancelled) {
      setImageSelected(true);
      setProfileImage(result);
    }
  };

  const userImageCallback = async (response) => {
    if (profileImage !== null && imageSelected){
      const data = new FormData();
      data.append('profile_image', {uri: profileImage.uri, name: 'image.jpg', type: 'image/jpeg'});
      
      axios.patch(backendURL + `api/users/${response.data.id}/?usertype=${usertype}`, data,
        { headers: {
            'Content-Type': 'multipart/form-data',
            "Authorization": `Token ${loginContext.token}`,
          }
        }
      ).then((response) => {
        // no need to send the received genericimage id since backend already handles this
      }).catch(error => {
        renderImageUploadError();
      });
    }
    if (usertype === 'supplier') {
      axios.patch(backendURL + 'api/supplierproducts',
        {
          supplier_id: response.data.id,
          product_ids: Array.from(selectedProducts)
        },
        {
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Token ${loginContext.token}`,
          }
        }
      ).then((response) => {
        // no need to send the received genericimage id since backend already handles this
      }).catch(error => {
      });
    }
  };

  // TODO: Add "Delete" button
  const renderProfileImageForm = () => ( 
    <>
      <Text category='label'>{i18n.t("profile_image")}</Text>
      <TouchableOpacity 
        onPress={
          editable ? 
          pickImage : 
          () => {
            navigation.navigate(
              "Images", 
              {
                images: [{image: profileImage["uri"]}],
                title: `${user.username} ${i18n.t("profile_image")}`
              }
            );
          }
        } 
        key="img1"
        disabled={profileImage === null}
      >
        <ImageBackground 
          source={profileImage !== null && profileImage?.uri ? { uri: profileImage.uri } : require("../../assets/default.png")}
          style={{ width: imageWidth, height: imageWidth }}
          imageStyle={{ alignSelf: 'center', borderRadius: 8 }}
        >
          { editable && profileImage !== null ?
            renderImageDeleteButton(() => setProfileImage(null)) : null
          }
        </ImageBackground>
      </TouchableOpacity>
    </>
  );

  const renderTextInput = (label, value, setValue, props = null) => (
    <Input
      label={i18n.t(label)}
      value={value}
      onChangeText={(text) => {
        setShowSubmitResponse(false);
        setValue(text);
      }}
      key={label}
      disabled={!editable}
      {...props}
    />
  );

  const renderUiLanguageSelector = () => (
    <Select
      label={i18n.t("ui_language")}
      selectedIndex={new IndexPath(UILanguages.findIndex(element => element === uiLanguage))}
      onSelect={index => setUiLanguage(UILanguages[index.row])}
      value={uiLanguage.name}
      disabled={!editable}
    >
      {UILanguages.map(language => <SelectItem title={language.name} key={language.name}/>)}
    </Select>
  );

  const renderNotifyToggle = () => (
    <Layout style={{flexDirection: 'row', alignItems: 'center', paddingTop: 5, paddingBottom: 5, justifyContent: 'space-between'}}>
      <Text category='label' style={{paddingRight: 5}}>{i18n.t("notify_user")}:</Text>
      <Layout style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={{justifyContent: 'flex-end', paddingRight: 5}}>
          {notifyUser ? i18n.t("yes") : i18n.t("no")}
        </Text>
        <Toggle 
          style={{justifyContent: 'flex-end'}}
          checked={notifyUser} 
          onChange={isChecked => setNotifyUser(isChecked)}
        />
      </Layout>
    </Layout>
  );

  const renderBaseUserFields = () => (
    <View key="base_client_fields">
      {renderTextInput("first_name", firstName, setFirstName)}
      {renderTextInput("last_name", lastName, setLastName)}
      {renderProfileImageForm()}
      <Divider key="imageButtonDiv"/>
      { editable ? 
        <Button 
          style={{paddingBottom: 5}} 
          onPress={() => pickImage()} 
          key="imageButton"
          visible={editable}
        >
          {i18n.t("add_photo")}
        </Button>
        : null
      }
      {renderTextInput("username", userName, setUserName, {autoCapitalize: 'none'})}
      {renderTextInput("email", email, setEmail, 
        {
          textContentType: 'emailAddress',
          keyboardType: 'email-address',
          autoCapitalize: 'none',
          autoCorrect: false,
          autoCompleteType: 'email'
        })
      }
      {readOnly ? null : renderTextInput("password", password, setPassword, {autoCapitalize: 'none'})}
      {renderUiLanguageSelector()}
      {readOnly ? null : renderNotifyToggle()}
      {usertype === 'supplier' ? 
        <>
          <Text status={selectedProducts.size > 0 ? 'success' : 'danger'}>
            {selectedProducts.size} {i18n.t("products")}
          </Text>
          {editable ? 
            <Button onPress={() => setShowProductSelector(true)}>
              {i18n.t("select_products")}
            </Button>
            : 
            <Button onPress={() => setShowProductSelector(true)}>
              {i18n.t("show_selected_products")}
            </Button>
          }
        </> : null
      }
      <Products 
        asModal={true}
        navigation={null}
        visible={showProductSelector} 
        setVisible={setShowProductSelector}
        selectable={editable}
        selectedItems={selectedProducts}
        setSelectedItems={setSelectedProducts}
        showOnlySelected={!editable}
      />
    </View>
  );

  const modelBaseFieldStates = {
    first_name: firstName, 
    last_name: lastName,
    username: userName,
    email: email,
    ui_language: uiLanguage.code
  };

  if (!readOnly) {
    modelBaseFieldStates["password"] = password;
    modelBaseFieldStates["is_staff"] = usertype === 'employee' ? true : false;
  }

  return (
    <ModelForm 
      editable={editable}
      setEditable={setEditable}
      renderBottomTabs={renderBottomTabs}
      selectedTabIndex={selectedTabIndex}
      tabs={[]}
      modelValue={user}
      setModelValue={setUser}
      navigation={navigation}
      modelName={usertype}
      modelRoute={
        {
          putRoute: `users/${user?.id}/?usertype=${usertype}`,
          postRoute: `users/?usertype=${usertype}&notify=${notifyUser ? "true" : "false"}` 
        }
      }
      modelBaseFieldStates={modelBaseFieldStates}
      resetBaseModelFields={resetForms}
      renderBaseModelFields={renderBaseUserFields}
      currentPage={i18n.t((editable ? "Add" : "Edit") + usertype)}
      showSubmitResponse={showSubmitResponse}
      setShowSubmitResponse={setShowSubmitResponse}
      modelImageCallback={userImageCallback}
    />
  );
};
