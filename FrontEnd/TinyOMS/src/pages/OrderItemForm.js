import React from 'react';
import { View } from 'react-native';
import { Radio, RadioGroup, Text } from '@ui-kitten/components';
import i18n from "../i18n";
import { getSelectedSetFor, ModelSelector } from "../components/Generics";
import { ModelForm } from "../components/ModelForm";
import { Suppliers } from "./Suppliers";

export const OrderItemForm = ({ navigation, readOnly = false, showAsModal, setShowAsModal, orderItem, setOrderItem, handleSubmit, handleCancel, handleDelete, readInEditMode }) => {
  const [showSubmitResponse, setShowSubmitResponse] = React.useState(false);
  const [selectedTypeIndex, setSelectedTypeIndex] = React.useState(1);
  
  const [editable, setEditable] = React.useState(!readOnly);
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);

  const [supplier, setSupplier] = React.useState(getSelectedSetFor(orderItem?.supplier));
  const [showSupplierSelector, setShowSupllierSelector] = React.useState(false);

  const resetForms = async () => {
    setSelectedTabIndex(0);
  };

  const renderSourceSelector = () => (
    <>
      <Text>From:</Text>
      <RadioGroup
        style={{flexDirection: 'row'}}
        selectedIndex={selectedTypeIndex}
        onChange={index => setSelectedTypeIndex(index)}>
        <Radio>Supplier</Radio>
        <Radio>Stock</Radio>
      </RadioGroup>
    </>
  );

  const renderSupplierOrderItemFields = () => (
    <>
      { !readOnly ?
        <ModelSelector
          textMessage={`${i18n.t("Supplier")}: ${Array.from(supplier)[0]?.first_name || ""} ${Array.from(supplier)[0]?.last_name || ""}`}
          editable={editable}
          buttonLabel={i18n.t("select_supplier")}
          show={showSupplierSelector}
          setShow={setShowSupllierSelector}
          Model={Suppliers}
          selectedItems={supplier}
          setSelectedItems={setSupplier}
        /> 
        :
        <Text status={supplier.size > 0 ? 'success' : 'danger'} style={{paddingTop: 10}}>
          {`${i18n.t("Supplier")}: ${Array.from(supplier)[0]?.first_name || ""} ${Array.from(supplier)[0]?.last_name || ""}`}
        </Text>
      }
    </>
  );

  const renderStockOrderItemFields = () => (
    <>
      <Text>World</Text>
    </>
  );

  const renderBaseOrderItemFields = () => (
    <View key="base_order_item_fields">
      {renderSourceSelector()}
      {selectedTypeIndex === 0 ? renderSupplierOrderItemFields() : renderStockOrderItemFields()}
    </View>
  );

  return (
    <ModelForm 
      modalProps={{
        asModal: true,
        showAsModal: showAsModal,
        setShowAsModal: setShowAsModal,
        handleModalSubmit: handleSubmit,
        handleModalCancel: handleCancel,
        handleModalDelete: handleDelete,
        modalReadInEditMode: readInEditMode
      }}
      editable={editable}
      setEditable={setEditable}
      preventEdit={false}
      renderBottomTabs={null}
      selectedTabIndex={selectedTabIndex}
      tabs={[]}
      modelValue={orderItem}
      setModelValue={setOrderItem}
      navigation={navigation}
      modelName={selectedTypeIndex === 0 ? "supplierorderitem" : "inventoryorderitem"}
      modelRoute={
        {
          putRoute: `${selectedTypeIndex === 0 ? 'supplierorderitems' : 'stockorderitems'}/${orderItem?.id}/`,
          postRoute: `${selectedTypeIndex === 0 ? 'supplierorderitems' : 'stockorderitems'}/`
        }
      }
      modelBaseFieldStates={{}}
      resetBaseModelFields={resetForms}
      renderBaseModelFields={renderBaseOrderItemFields}
      currentPage={""}
      showSubmitResponse={showSubmitResponse}
      setShowSubmitResponse={setShowSubmitResponse}
      modelImageCallback={async (response) => {}}
    />
  );
};
