import React from 'react';
import { View } from 'react-native';
import { Button, Select, SelectItem, IndexPath, Text, BottomNavigation, BottomNavigationTab, Input, Divider } from '@ui-kitten/components';
import i18n from "../i18n";
import { getSelectedSetFor, ModelSelector } from "../components/Generics";
import { Currencies, UnitTypes } from "../config";
import { ModelForm } from "../components/ModelForm";
import { Stocks } from "./Stocks";
import { Products } from "./Products";
import { Suppliers } from "./Suppliers";

export const StockItemForm = ({ route, navigation, readOnly = false }) => {
  const [stockItem, setStockItem] = React.useState(route.params.stock_item);

  const [stock, setStock] = React.useState(getSelectedSetFor(route.params?.stock_item?.inventory || route.params?.stock));
  const [product, setProduct] = React.useState(getSelectedSetFor(route.params?.stock_item?.product));
  const [supplier, setSupplier] = React.useState(getSelectedSetFor(route.params?.stock_item?.supplier));
  const [unitType, setUnitType] = React.useState(UnitTypes[0]);
  const [amount, setAmount] = React.useState("0");
  const [costCurrency, setCostCurrency] = React.useState(Currencies[0]);
  const [costPerUnit, setCostPerUnit] = React.useState("0");
  
  const [showSubmitResponse, setShowSubmitResponse] = React.useState(false);
  
  const [showStockSelector, setShowStockSelector] = React.useState(false);
  const [showProductSelector, setShowProductSelector] = React.useState(false);
  const [showSupplierSelector, setShowSupplierSelector] = React.useState(false);
  
  const [editable, setEditable] = React.useState(!readOnly);
  
  React.useEffect(() => {
    if (readOnly) {
      setUnitType(UnitTypes.find(item => item.code === stockItem.unit_type));
      setAmount(String(stockItem.amount));
      setCostCurrency(Currencies.find(item => item.code === stockItem.cost_currency));
      setCostPerUnit(String(stockItem.cost_per_unit));
    }
  }, []);

  const resetForms = async () => {
    setProduct(new Set());
    setStock(new Set());
    setSupplier(new Set());
    setUnitType(UnitTypes[0]);
    setAmount("0");
    setCostCurrency(Currencies[0]);
    setCostPerUnit("0");
  };

  const renderNumericInput = (label, value, setValue, props = null) => (
    <Input
      label={i18n.t(label)}
      value={value}
      onChangeText={(text) => {
        setShowSubmitResponse(false);
        setValue(text);
      }}
      key={label}
      disabled={!editable}
      keyboardType='number-pad'
      {...props}
    />
  );

  const renderSelector = (label, selectionList, value, setValue) => (
    <Select
      label={label}
      selectedIndex={new IndexPath(selectionList.findIndex(element => element === value))}
      onSelect={index => setValue(selectionList[index.row])}
      value={value?.name}
      disabled={!editable}
    >
      {selectionList.map(selection => <SelectItem title={selection.name} key={selection.name}/>)}
    </Select>
  );

  const renderBaseStockItemFields = () => (
    <View key="base_stock_item_fields">
      <ModelSelector
        textMessage={`${i18n.t("stock_name")}: ${Array.from(stock)[0]?.name || ""}`}
        editable={editable}
        buttonLabel={i18n.t("select_stock")}
        show={showStockSelector}
        setShow={setShowStockSelector}
        Model={Stocks}
        selectedItems={stock}
        setSelectedItems={setStock}
      />
      <ModelSelector
        textMessage={`${i18n.t("Product")}: ${Array.from(product)[0]?.name || ""}`}
        editable={editable}
        buttonLabel={i18n.t("select_product")}
        show={showProductSelector}
        setShow={setShowProductSelector}
        Model={Products}
        selectedItems={product}
        setSelectedItems={setProduct}
      />
      <ModelSelector
        textMessage={`${i18n.t("Supplier")}: ${Array.from(supplier)[0]?.first_name || ""} ${Array.from(supplier)[0]?.last_name || ""}`}
        editable={editable}
        buttonLabel={i18n.t("select_supplier")}
        show={showSupplierSelector}
        setShow={setShowSupplierSelector}
        Model={Suppliers}
        selectedItems={supplier}
        setSelectedItems={setSupplier}
      />
      {renderSelector(i18n.t("unit_type"), UnitTypes, unitType, setUnitType)}
      {renderNumericInput("amount_in_stock", amount, setAmount)}
      {renderSelector(i18n.t("currency"), Currencies, costCurrency, setCostCurrency)}
      {renderNumericInput("cost_per_unit", costPerUnit, setCostPerUnit)}
    </View>
  );

  const modelBaseFieldStates = {
    inventory_id: Array.from(stock)[0]?.id, 
    product_id: Array.from(product)[0]?.id,
    supplier_id: Array.from(supplier)[0]?.id, 
    unit_type: unitType?.code,
    amount: +amount,
    cost_currency: costCurrency?.code,
    cost_per_unit: +costPerUnit
  };


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
      <BottomNavigationTab title='ITEMS'/>
    </BottomNavigation>
  );

  return (
    <ModelForm 
      editable={editable}
      setEditable={setEditable}
      renderBottomTabs={renderBottomTabs}
      selectedTabIndex={selectedTabIndex}
      tabs={[]}
      modelValue={stockItem}
      setModelValue={setStockItem}
      navigation={navigation}
      modelName={"inventoryitem"}
      modelRoute={
        {
          putRoute: `stockitems/${stockItem?.id}/`,
          postRoute: "stockitems/"
        }
      }
      modelBaseFieldStates={modelBaseFieldStates}
      resetBaseModelFields={resetForms}
      renderBaseModelFields={renderBaseStockItemFields}
      currentPage={i18n.t(editable ? "AddStockItem" : "StockItemRead")}
      showSubmitResponse={showSubmitResponse}
      setShowSubmitResponse={setShowSubmitResponse}
      modelImageCallback={async (response) => {}}
    />
  );
};
