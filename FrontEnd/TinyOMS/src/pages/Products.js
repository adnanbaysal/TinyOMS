import React from 'react';
import { View } from 'react-native';
import { ListItem, Avatar, Text, Layout } from '@ui-kitten/components';
import i18n from "../i18n";
import { ListingComponent } from "../components/ListingComponent";
import { backendURL, productSortingOptions } from "../config";
import { renderListItemCheckBox, handleListItemSelect, renderListItemRadioButton, handleListItemRadioSelect } from "../components/Generics";

export const Products = ({
  asModal = false,
  navigation, 
  visible = null, 
  setVisible = null, 
  selectable = false,
  selectedItems = null, 
  setSelectedItems = null,
  showOnlySelected = false,
  selectSingle = false
}) => {
  const [sortingOptions, setSortingOptions] = React.useState(productSortingOptions);

  const renderAccessoryRight = (item) => () => {
    if (selectable && !showOnlySelected) {
      if (selectSingle) {
        return renderListItemRadioButton(selectedItems, setSelectedItems, item);
      } else {
        return renderListItemCheckBox(selectedItems, setSelectedItems, item);
      }
    } else {
      const amount = 1000;
      const unit = "mt";
      return (
        <View style={{flexDirection: 'column'}}>
          <Text category="c1" status={item.suppliers.length > 0 ? "success" : "danger"}>
            {`${item.suppliers.length} ${i18n.t("suppliers")}`}
          </Text>
          <Text category="c1" status={amount > 0 ? "success" : "danger"}>
            {`${amount} ${unit} ${i18n.t("in_stock")}`}
          </Text>
        </View>
      );
    }
  };

  const renderListItem = (item, index) => ( 
    <ListItem 
      title={item.name} 
      description={item.description}
      accessoryLeft={() => {
        let source = require("../../assets/default.png");
        if (item.images.length > 0) {
          source = {uri: item.images[0]};
        }
        return (
          <Layout style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text category='label' style={{width: 32}}>{index + 1}</Text>
            <Avatar source={source} size='large' shape='rounded'/>
          </Layout>
        );
      }}
      accessoryRight={renderAccessoryRight(item)}
      onPress={() => {
        if (selectable){
          if (selectSingle) {
            handleListItemRadioSelect(selectedItems, setSelectedItems, item);
          } else {
            handleListItemSelect(selectedItems, setSelectedItems, item);
          }
        } else if (!showOnlySelected) {
          navigation.navigate("ProductRead", {product: item});
        }
      }}
    />
  ); 

  return (
    <ListingComponent 
      navigation={navigation}
      asModal={asModal}
      sortingOptions={sortingOptions}
      baseurl={backendURL + 'api/products/?'}
      renderListItem={renderListItem}
      itemsName={`${i18n.t("products")}`}
      searchPlaceholder={`${i18n.t("search_products")}`}
      currentPage={i18n.t("Products")}
      addButtonParams={{route: "AddProduct", params: {}}}
      showListingModal={visible}
      setShowListingModal={setVisible}
      selectable={selectable}
      numberOfSelected={selectedItems?.size}
      selectedItems={selectedItems}
      showOnlySelected={showOnlySelected}
      selectSingle={selectSingle}
    />
  );
};
