import React from 'react';
import { View } from 'react-native';
import { Button, ListItem, Text } from '@ui-kitten/components';
import i18n from "../i18n";
import { ListingComponent } from "../components/ListingComponent";
import { backendURL, stockSortingOptions } from "../config";
import { renderListItemCheckBox, handleListItemSelect, renderListItemRadioButton, handleListItemRadioSelect } from "../components/Generics";

export const Stocks = ({
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
  const [sortingOptions, setSortingOptions] = React.useState(stockSortingOptions);

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
            {`${item.items.length} ${i18n.t("stock_items")}`}
          </Text>
        </View>
      );
    }
  };

  const renderListItem = (item, index) => ( 
    <ListItem 
      title={item.name} 
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
          navigation.navigate("StockRead", {stock: item});
        }
      }}
    />
  ); 

  return (
    <>
      <ListingComponent 
        navigation={navigation}
        asModal={asModal}
        sortingOptions={sortingOptions}
        baseurl={backendURL + 'api/stocks/?'}
        renderListItem={renderListItem}
        itemsName={`${i18n.t("stocks")}`}
        searchPlaceholder={`${i18n.t("search_stocks")}`}
        currentPage={i18n.t("Stocks")}
        addButtonParams={{route: "AddStock", params: {}}}
        showListingModal={visible}
        setShowListingModal={setVisible}
        selectable={selectable}
        numberOfSelected={selectedItems?.size}
        selectedItems={selectedItems}
        showOnlySelected={showOnlySelected}
        selectSingle={selectSingle}
      />
      { !asModal && !selectable ?
        <Button onPress={() => navigation.navigate("StockItems")}>{i18n.t("items_in_all_stocks")}</Button>
        : null
      }
    </>
  );
};
