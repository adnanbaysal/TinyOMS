import React from 'react';
import { Button, View } from 'react-native';
import { BottomNavigation, BottomNavigationTab, Divider, Input, Text } from '@ui-kitten/components';
import i18n from "../i18n";
import { ModelForm } from "../components/ModelForm";

export const StockForm = ({ route, navigation, readOnly = false }) => {
  const [stock, setStock] = React.useState(route.params.stock);

  const [stockName, setStockName] = React.useState("");
  const [showSubmitResponse, setShowSubmitResponse] = React.useState(false);

  const [editable, setEditable] = React.useState(!readOnly);
  
  React.useEffect(() => {
    if (readOnly) {
      setStockName(stock.name);
    }
  }, []);

  const resetForms = async () => {
    setStockName("");
  };

  const stockImageCallback = async (response) => {
    return;
  };

  const renderBaseStockFields = () => (
    <View key="base_stock_fields">
      <Input
        onChangeText={(text) => {
          setShowSubmitResponse(false);
          setStockName(text);
        }}
        value={stockName}
        label={i18n.t("stock_name")}
        key="nameField"
        disabled={!editable}
      />
    </View>
  );

  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);

  // const renderBottomTabs = () => (
  //   <BottomNavigation
  //     selectedIndex={selectedTabIndex}
  //     onSelect={index => {
  //       setSelectedTabIndex(index);
  //     }}
  //     style={{borderTopWidth: 1}}
  //   >
  //     <BottomNavigationTab title='DETAILS'/>
  //     <BottomNavigationTab title='ITEMS'/>
  //   </BottomNavigation>
  // );

  return (
    <>
      <ModelForm 
        editable={editable}
        setEditable={setEditable}
        renderBottomTabs={null}
        selectedTabIndex={selectedTabIndex}
        tabs={[]}
        modelValue={stock}
        setModelValue={setStock}
        navigation={navigation}
        modelName={"inventory"}
        modelRoute={
          {
            putRoute: `stocks/${stock?.id}/`,
            postRoute: "stocks/"
          }
        }
        modelBaseFieldStates={{name: stockName}}
        resetBaseModelFields={resetForms}
        renderBaseModelFields={renderBaseStockFields}
        currentPage={i18n.t(editable ? "AddStock" : "StockRead")}
        showSubmitResponse={showSubmitResponse}
        setShowSubmitResponse={setShowSubmitResponse}
        modelImageCallback={stockImageCallback}
      />
      <Divider />
      {/* <Text status={stock?.items.length > 0 ? 'success': 'danger'}>{`${stock?.items.length} ${i18n.t("stock_items")}`}</Text> */}
      <Button 
        onPress={() => navigation.navigate("StockItems", {stock: stock})}
        title={i18n.t("items_in_stock")}
      />
    </>
  );
  // TODO: Fix button view above
};
