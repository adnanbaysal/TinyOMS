import React from 'react';
import { View } from 'react-native';
import { ListItem, Text } from '@ui-kitten/components';
import i18n from "../i18n";
import { ListingComponent } from "../components/ListingComponent";
import { LoginContext, backendURL, orderSortingOptions } from "../config";
import { renderListItemCheckBox, handleListItemSelect, renderListItemRadioButton, handleListItemRadioSelect } from "../components/Generics";

export const Orders = ({
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
  const [loginContext, setLoginContext] = React.useContext(LoginContext);
  const [sortingOptions, setSortingOptions] = React.useState(orderSortingOptions);

  const renderAccessoryRight = (item) => () => {
    if (selectable && !showOnlySelected) {
      if (selectSingle) {
        return renderListItemRadioButton(selectedItems, setSelectedItems, item);
      } else {
        return renderListItemCheckBox(selectedItems, setSelectedItems, item);
      }
    } else {
      return (
        <View style={{flexDirection: 'column'}}>
          <Text category="c1" status={item.items.length > 0 ? "success" : "danger"}>
            {`${item.items.length} ${i18n.t("products")}`}
          </Text>
          <Text category="c1" status={item.payments.length > item.installments.length ? "success" : "danger"}>
            {`${item.payments.length} / ${item.installments.length} ${i18n.t("payments")}`}
          </Text>
        </View>
      );
    }
  };

  const renderListItem = (item, index) => ( 
    <ListItem 
      title={`Seller: ${item.seller.first_name} ${item.seller.last_name}`}
      description={`Client: ${item.client.first_name} ${item.client.last_name}. ${i18n.t('Status')}: ${item.is_active ? i18n.t('active') : i18n.t('passive')}`}
      accessoryLeft={() => (
        <Text category='label' style={{width: 32}}>{index + 1}</Text>
      )}
      accessoryRight={renderAccessoryRight(item)}
      onPress={() => {
        if (selectable){
          if (selectSingle) {
            handleListItemRadioSelect(selectedItems, setSelectedItems, item);
          } else {
            handleListItemSelect(selectedItems, setSelectedItems, item);
          }
        } else if (!showOnlySelected) {
          navigation.navigate("OrderRead", {order: item});
        }
      }}
      // disabled={!item.is_active}
    />
  ); 

  return (
    <ListingComponent 
      navigation={navigation}
      asModal={asModal}
      sortingOptions={sortingOptions}
      baseurl={backendURL + 'api/orders/?'}
      renderListItem={renderListItem}
      itemsName={`${i18n.t("orders")}`}
      searchPlaceholder={`${i18n.t("search_orders")}`}
      currentPage={i18n.t("Orders")}
      addButtonParams={{route: "AddOrder", params: {seller: loginContext.user}}}
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
