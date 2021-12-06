import React from 'react';
import { View } from 'react-native';
import { Text } from '@ui-kitten/components';
import i18n from "../i18n";
import { Users } from "../components/Users";
import { renderListItemCheckBox, renderListItemRadioButton } from "../components/Generics";

export const Employees = ({ 
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
          <Text category="c1" status={item.orders.length > 0 ? "success" : "danger"}>
            {`${item.orders.length} ${i18n.t("orders")}`}
          </Text>
          <Text category="c1" status={item.received_payments.length > 0 ? "success" : "danger"}>
            {`${item.received_payments.length} ${i18n.t("received_payments")}`}
          </Text>
        </View>
      );
    }
  };

  return (
    <Users
      navigation={navigation}
      userType={"employee"}
      itemsName={i18n.t("employees")}
      userSearchName={i18n.t("search_employees")}
      currentPage={i18n.t("Employees")}
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
