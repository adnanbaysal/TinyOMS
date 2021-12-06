import React from 'react';
import { View } from 'react-native';
import { Text } from '@ui-kitten/components';
import i18n from "../i18n";
import { Users } from "../components/Users";
import { renderListItemCheckBox, renderListItemRadioButton } from "../components/Generics";

export const Clients = ({ 
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
    const lateInstallments = item.installments.reduce((acc, inst) => {
      if (inst.paid_at) return acc;
      const payBefore = inst.pay_before ? new Date(inst.pay_before) : null;
      const now = new Date();
      if (now < payBefore) return acc;
      return acc + 1;
    }, 0);

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
          <Text category="c1" status={lateInstallments > 0 ? "danger" : "success"}>
            {`${lateInstallments} ${i18n.t("late_payments")}`}
          </Text>
        </View>
      );
    }
  };

  return (
    <Users
      navigation={navigation}
      userType={"client"}
      itemsName={i18n.t("clients")}
      userSearchName={i18n.t("search_clients")}
      currentPage={i18n.t("Clients")}
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
