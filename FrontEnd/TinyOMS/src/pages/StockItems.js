import React from 'react';
import { View } from 'react-native';
import { ListItem, Text } from '@ui-kitten/components';
import i18n from "../i18n";
import { ListingComponent } from "../components/ListingComponent";
import { backendURL, stockItemSortingOptions } from "../config";
import { renderListItemCheckBox, handleListItemSelect } from "../components/Generics";

export const StockItems = ({
  asModal = false,
  navigation, 
  route = null,
  visible = null, 
  setVisible = null, 
  selectable = false,
  selectedStockItems = null, 
  setSelectedStockItems = null,
  showOnlySelected = false 
}) => {
  const stock = route?.params?.stock;
  const [sortingOptions, setSortingOptions] = React.useState(stockItemSortingOptions);

  const renderAccessoryRight = (item) => () => {
    if (selectable && !showOnlySelected) {
      return renderListItemCheckBox(selectedStockItems, setSelectedStockItems, item);
    } else {
      return (
        <View style={{flexDirection: 'column'}}>
          <Text category="c1" status={item.amount > 0 ? "success" : "danger"}>
            {`${item.amount} ${item.unit_type}`}
          </Text>
          <Text category="c1">
            {`${item.cost_currency}${item.cost_per_unit}/${item.unit_type}`}
          </Text>
        </View>
      );
    }
  };

  const renderListItem = (item, index) => ( 
    <ListItem 
      title={`${item?.product?.name || ""}: ${item?.product?.description?.slice(0, 30) || ""} ${item?.product?.description?.length > 30 ? "..." : ""}`}
      description={`Stock: ${item?.inventory?.name || ""}. Supplier: ${item?.supplier?.first_name || ""} ${item.supplier?.last_name || ""}`}
      accessoryLeft={() => (
        <Text category='label' style={{width: 32}}>{index + 1}</Text>
      )}
      accessoryRight={renderAccessoryRight(item)}
      onPress={() => {
        if (selectable){
          handleListItemSelect(selectedStockItems, setSelectedStockItems, item);
        } else if (!showOnlySelected) {
          navigation.navigate("StockItemRead", {stock_item: item});
        }
      }}
    />
  ); 

  return (
    <ListingComponent 
      navigation={navigation}
      asModal={asModal}
      sortingOptions={sortingOptions}
      baseurl={backendURL + 'api/stockitems/?' + (stock ? `inventory_id=${stock.id}` : '')}
      renderListItem={renderListItem}
      itemsName={`${i18n.t("stockitems")}`}
      searchPlaceholder={`${i18n.t("search_stock_items")}`}
      currentPage={`${i18n.t("StockItems")}\n${stock ? i18n.t("for_stock") + ": " + stock.name : i18n.t("for_all_stocks")}`}
      addButtonParams={{route: "AddStockItem", params: {stock: stock}}}
      showListingModal={visible}
      setShowListingModal={setVisible}
      selectable={selectable}
      numberOfSelected={selectedStockItems?.size}
      selectedItems={selectedStockItems}
      showOnlySelected={showOnlySelected}
    />
  );
};
