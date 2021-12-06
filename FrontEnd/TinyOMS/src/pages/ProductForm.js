import React from 'react';
import FormData from "form-data";
import axios from "axios";
import { View, TouchableOpacity, Platform, ImageBackground } from 'react-native';
import { BottomNavigation, BottomNavigationTab, Layout, Text, Input, Button, Divider } from '@ui-kitten/components';
import * as ImagePicker from 'expo-image-picker';
import { backendURL, LoginContext, WidthContext } from "../config";
import i18n from "../i18n";
import { renderImageUploadError, renderImageDeleteButton } from "../components/Generics";
import { ModelForm } from "../components/ModelForm";

export const ProductForm = ({ route, navigation, readOnly = false }) => {
  const [loginContext, setLoginContext] = React.useContext(LoginContext);
  const [usefulWidth, setUsefulWidth] = React.useContext(WidthContext);
  const formsPaddingRight = Platform.OS === 'web' ? 16 : 0;
  const imageWidth = (usefulWidth - 32 - formsPaddingRight) / 2;

  const [product, setProduct] = React.useState(route.params.product);

  const [productName, setProductName] = React.useState("");
  const [productDescription, setProductDescription] = React.useState("");
  const [photos, setPhotos] = React.useState([null, null, null, null]);
  const [numberOfPhotos, setNumberOfPhotos] = React.useState(0);
  const [showSubmitResponse, setShowSubmitResponse] = React.useState(false);

  const [editable, setEditable] = React.useState(!readOnly);
  const [imageSelected, setImageSelected] = React.useState(false);

  React.useEffect(() => {
    if (readOnly) {
      const photosCopy = Array.from(photos);
      for (let i=0; i<4 && i<product.images.length; i++) {
        photosCopy[i] = {uri: product.images[i]};
        setNumberOfPhotos(numberOfPhotos + 1);
      }
      setPhotos(photosCopy);
      setProductName(product.name);
      setProductDescription(product.description);
    }
  }, []);

  const resetForms = async () => {
    setProductName("");
    setProductDescription("");
    setPhotos([null, null, null, null]);
  };

  const pickImage = (index) => async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.75
    });
    if (!result.cancelled) {
      setImageSelected(true);
      const photosCopy = Array.from(photos)
      photosCopy[index] = result;
      setPhotos(photosCopy);
      const numPhotos = photosCopy.reduce((acc, cv) => acc + (cv !== null ? 1 : 0), 0);
      setNumberOfPhotos(numPhotos);
    }
  };

  const productImageCallback = async (response) => {
    const axios_header = {
      headers: {
        'Content-Type': 'multipart/form-data',
        "Authorization": `Token ${loginContext.token}`,
      }
    };
    if (imageSelected) {
      axios.delete(
        backendURL + `api/productimages/0/?product=${response.data.id}`,
        axios_header
      ).catch(error => console.log(error));
      
      photos.forEach((photo, index) => {
        // TODO: make this work on web
        if (photo !== null){
          const data = new FormData();
          data.append('image', {uri: photo.uri, name: 'image.jpg', type: 'image/jpeg'});
          axios.post(
            backendURL + `api/productimages/?product=${response.data.id}`, 
            data, axios_header
          ).then((response) => {
            // no need to send the received genericimage id since backend already handles this
          }).catch(error => {
            renderImageUploadError();
          });
        }
      });
    }
  };

  const renderImageAtIndex = (index, styleProps) => (
    <TouchableOpacity 
      onPress={editable ? 
        pickImage(index) : 
        () => {
          if (numberOfPhotos === 0) return;
          navigation.navigate(
            "Images", 
            {
              images: photos.filter(photo => photo !== null).map(photo => ({image: photo.uri})),
              title: `${product.name} ${i18n.t("images")}`
            }
          );
        }
      } 
      key={`img${index}`} 
      disabled={!editable && photos[index] === null}
    >
      <ImageBackground
        source={photos[index] !== null && photos[index]?.uri ? { uri: photos[index].uri } : require("../../assets/default.png")}
        style={{width: imageWidth, height: imageWidth }}
        imageStyle={{...styleProps, alignSelf: 'center' }}
      >  
        { editable && photos[index] !== null ? 
          renderImageDeleteButton(() => {
            const photosCopy = Array.from(photos);
            photosCopy[index] = null;
            setPhotos(photosCopy);
          }) 
          : null
        }
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderFourImagesForm = () => ( 
    <>
      <Text category='label'>{i18n.t("product_images")}</Text>
      <Layout style={{flexDirection: 'row'}} key="layout1">
        {renderImageAtIndex(0, {borderTopLeftRadius: 8, borderRightWidth:1, borderBottomWidth:1})}
        {renderImageAtIndex(1, {borderTopRightRadius: 8, borderBottomWidth:1})}
      </Layout>
      <Layout style={{flexDirection: 'row'}} key="layout2">
        {renderImageAtIndex(2, {borderBottomLeftRadius: 8, borderRightWidth:1})}
        {renderImageAtIndex(3, {borderBottomRightRadius: 8})}
      </Layout>
    </>
  );

  const renderBaseProductFields = () => (
    <View key="base_product_fields">
      <Input
        onChangeText={(text) => {
          setShowSubmitResponse(false);
          setProductName(text);
        }}
        value={productName}
        label={i18n.t("product_name")}
        key="nameField"
        disabled={!editable}
        // onBlur={handleBlur('name')}
        // status={errors.name && touched.name ? 'danger': null}
      />
      <Input
        onChangeText={(text) => {
          setShowSubmitResponse(false);
          setProductDescription(text);
        }}
        value={productDescription}
        label={i18n.t("description")}
        numberOfLines={2}
        key="descriptionField"
        multiline={true}
        disabled={!editable}
        // onBlur={handleBlur("description")}
        // status={errors.description && touched.description ? 'danger': null}
      />
      {renderFourImagesForm()}
      <Divider key="imageButtonDiv"/>
        { editable ?
          <Button 
            style={{paddingBottom: 5}} 
            onPress={() => {
              let index = 0;
              while (photos[index] !== null && index < 4) index++;
              if (index < 4) pickImage(index)();
            }} 
            disabled={numberOfPhotos < 4 ? false : true}
            key="imageButton"
          >
            {i18n.t("add_photo")} ({4 - numberOfPhotos})
          </Button> 
          : null
        }
    </View>
  );

  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);

  const renderBottomTabs = () => (
    <BottomNavigation
      selectedIndex={selectedTabIndex}
      onSelect={index => {
        setSelectedTabIndex(index);
      }}
      style={{borderTopWidth: 1}}
    >
      <BottomNavigationTab title='DETAILS'/>
      <BottomNavigationTab title='ORDERS'/>
      <BottomNavigationTab title='PAYMENTS'/>
      <BottomNavigationTab title='SUPPLIERS'/>
    </BottomNavigation>
  );

  return (
    <ModelForm 
      editable={editable}
      setEditable={setEditable}
      renderBottomTabs={renderBottomTabs}
      selectedTabIndex={selectedTabIndex}
      tabs={[]}
      modelValue={product}
      setModelValue={setProduct}
      navigation={navigation}
      modelName={"product"}
      modelRoute={
        {
          putRoute: `products/${product?.id}/`,
          postRoute: "products/"
        }
      }
      modelBaseFieldStates={{name: productName, description: productDescription}}
      resetBaseModelFields={resetForms}
      renderBaseModelFields={renderBaseProductFields}
      currentPage={i18n.t(editable ? "AddProduct" : "ProductRead")}
      showSubmitResponse={showSubmitResponse}
      setShowSubmitResponse={setShowSubmitResponse}
      modelImageCallback={productImageCallback}
    />
  );
};
