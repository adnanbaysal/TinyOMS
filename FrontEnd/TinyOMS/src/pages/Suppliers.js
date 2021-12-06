import React from 'react';
import { View } from 'react-native';
import { Text } from '@ui-kitten/components';
import i18n from "../i18n";
import { Users } from "../components/Users";
import { renderListItemCheckBox, renderListItemRadioButton } from "../components/Generics";

export const Suppliers = ({ 
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
          <Text category="c1" status={item.products.length > 0 ? "success" : "danger"}>
            {`${item.products.length} ${i18n.t("products")}`}
          </Text>
          <Text category="c1" status={item.order_items.length > 0 ? "success" : "danger"}>
            {`${item.order_items.length} ${i18n.t("orders")}`}
          </Text>
        </View>
      );
    }
  };

  return (
    <Users
      navigation={navigation}
      userType={"supplier"}
      itemsName={i18n.t("suppliers")}
      userSearchName={i18n.t("search_suppliers")}
      currentPage={i18n.t("Suppliers")}
      renderAccessoryRight={renderAccessoryRight}
      asModal={asModal}
      visible={visible}
      setVisible={setVisible}
      selectable={selectable}
      selectedUsers={selectedItems}
      setSelectedUsers={setSelectedItems}
      showOnlySelected={showOnlySelected}
      selectSingle={selectSingle}
    />
  );
};
