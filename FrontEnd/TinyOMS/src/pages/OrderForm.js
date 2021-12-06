import React from 'react';
import { View } from 'react-native';
import { BottomNavigation, BottomNavigationTab, List, ListItem, Input, Button, Divider, Text, Layout, Avatar } from '@ui-kitten/components';
import { LoginContext } from "../config";
import i18n from "../i18n";
import { AddIcon } from "../components/Generics";
import { getSelectedSetFor, ModelSelector } from "../components/Generics";
import { ModelForm } from "../components/ModelForm";
import { Employees } from "./Employees";
import { Clients } from "./Clients";
import { OrderItemForm } from "./OrderItemForm";

export const OrderForm = ({ route, navigation, readOnly = false }) => {
  let lastId = 0;

  const [loginContext, setLoginContext] = React.useContext(LoginContext);

  const [order, setOrder] = React.useState(route?.params?.order);
  // seller and client is a set to make it compatible with model selector which requires a set
  const [seller, setSeller] = React.useState(getSelectedSetFor(route?.params?.order?.seller || route?.params?.seller));
  const [client, setClient] = React.useState(getSelectedSetFor(route?.params?.order?.client));
  const [orderItems, setOrderItems] = React.useState(route?.params?.order?.items || []);
  const [selectedOrderItem, setSelectedOrderItem] = React.useState({});

  const [showSubmitResponse, setShowSubmitResponse] = React.useState(false);

  const [showSellerSelector, setShowSellerSelector] = React.useState(false);
  const [showClientSelector, setShowClientSelector] = React.useState(false);
  const [showOrderItemForm, setShowOrderItemForm] = React.useState(false);
  const [readInEditMode, setReadInEditMode] = React.useState(false);
  
  const [editable, setEditable] = React.useState(!readOnly);

  const currentUserIsSuperUser = () => loginContext?.user?.is_superuser ? true : false;
  const currentUserIsTheSeller = () => loginContext?.user?.username === route?.params?.order?.seller?.username ? true : false;

  const resetForms = async () => {
    setSeller(new Set());
    setClient(new Set());
    setOrderItems([]);
  };

  const addSelectedOrderItem = () => {
    setOrderItems([...orderItems, selectedOrderItem]);
    setSelectedOrderItem({id: ++lastId}); // TODO: read form and add from there
  };

  const deleteSelectedOrderItem = () => {
    setReadInEditMode(false);
    setOrderItems(orderItems.filter(value => value.id !== selectedOrderItem.id));
    setSelectedOrderItem({});
  };

  const handleCancelWhileReadInEditMode = () => {
    // When a order list item is pressed, details modal will open. 
    // This cancel handler resets the readInEditMode state so that 
    // buttons in the modal will show correctly when add product button pressed 
    setReadInEditMode(false);
    setSelectedOrderItem({});
  }

  const renderAccessoryRight = (item, isFromSupplier) => () => {
    const unit_type = isFromSupplier ? item?.unit_type : item?.inventory_item?.unit_type;
    return (
      <View style={{flexDirection: 'column'}}>
        <Text category="c1" status={item?.amount > 0 ? "success" : "danger"}>
          {`Amount: ${item?.amount} ${unit_type}`}
        </Text>
        <Text category="c1" status={item?.selling_price_per_unit > 0 ? "success" : "danger"}>
          {`Price: ${item?.selling_price_currency}${item?.selling_price_per_unit * item?.amount}`}
        </Text>
      </View>
    );
  };

  const renderListItem = (item, index) => {
    const itm = item.item;
    const isFromSupplier = itm?.inventory_item ? false : true;
    const title = "From " + (
      isFromSupplier ? 
      `supplier: ${itm.supplier?.first_name} ${itm.supplier?.last_name}` : 
      `${i18n.t("stock")}: ${itm?.inventory_item?.inventory.name}`
    );
    const description = "Product: " + (
      isFromSupplier ? `${itm?.product?.name}`: `${itm?.inventory_item?.product?.name}`
    );
    const productImage = isFromSupplier ? itm?.product?.images[0] : itm?.inventory_item?.product?.images[0];

    return ( 
      <ListItem 
        title={title} 
        description={description}
        accessoryLeft={() => {
          let source = require("../../assets/default.png");
          if (productImage !== null) {
            source = {uri: productImage};
          }
          return (
            <Layout style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text category='label' style={{width: 32}}>{item.index + 1}</Text>
              <Avatar source={source} size='large' shape='rounded'/>
            </Layout>
          );
        }}
        accessoryRight={renderAccessoryRight(itm, isFromSupplier)}
        onPress={() => {
          setSelectedOrderItem(item);
          setReadInEditMode(true);
          setShowOrderItemForm(true);
        }}
      />
    ); 
  };

  const renderBaseOrderFields = () => (
    <View key="base_order_fields">
      { currentUserIsSuperUser() ?
        <ModelSelector
          textMessage={`${i18n.t("Seller")}: ${Array.from(seller)[0]?.first_name || ""} ${Array.from(seller)[0]?.last_name || ""}`}
          editable={editable}
          buttonLabel={i18n.t("select_seller")}
          show={showSellerSelector}
          setShow={setShowSellerSelector}
          Model={Employees}
          selectedItems={seller}
          setSelectedItems={setSeller}
        />
        : 
        <Text status={seller.size > 0 ? 'success' : 'danger'} style={{paddingTop: 10}}>
          {`${i18n.t("Seller")}: ${Array.from(seller)[0]?.first_name || ""} ${Array.from(seller)[0]?.last_name || ""}`}
        </Text>
      }
      { !readOnly ?
        <ModelSelector
          textMessage={`${i18n.t("Client")}: ${Array.from(client)[0]?.first_name || ""} ${Array.from(client)[0]?.last_name || ""}`}
          editable={editable}
          buttonLabel={i18n.t("select_client")}
          show={showClientSelector}
          setShow={setShowClientSelector}
          Model={Clients}
          selectedItems={client}
          setSelectedItems={setClient}
        /> 
        :
        <Text status={client.size > 0 ? 'success' : 'danger'} style={{paddingTop: 10}}>
          {`${i18n.t("Client")}: ${Array.from(client)[0]?.first_name || ""} ${Array.from(client)[0]?.last_name || ""}`}
        </Text>
      }
      <List 
        data={orderItems}
        renderItem={renderListItem}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        ItemSeparatorComponent={Divider}
        ListHeaderComponent={<Text status={orderItems?.length > 0 ? 'success' : 'danger'}>{`${orderItems.length} Products in Order`}</Text>}
        ListFooterComponent={ editable && (currentUserIsSuperUser() || currentUserIsTheSeller()) ?
          <Button
            onPress={() => setShowOrderItemForm(true)}
            accessoryLeft={AddIcon}
          >
            {`Add Product`}
          </Button>
          :
          null
        }
      />
      <OrderItemForm 
        navigation={navigation}
        readOnly={readOnly}
        showAsModal={showOrderItemForm}
        setShowAsModal={setShowOrderItemForm}
        orderItem={selectedOrderItem}
        setOrderItem={setSelectedOrderItem}
        handleSubmit={addSelectedOrderItem}
        handleCancel={handleCancelWhileReadInEditMode}
        handleDelete={deleteSelectedOrderItem}
        readInEditMode={readInEditMode}
      />
    </View>
  );

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
      <BottomNavigationTab title='INSTALLMENTS'/>
      <BottomNavigationTab title='PAYMENTS'/>
    </BottomNavigation>
  );

  return (
    <ModelForm 
      editable={editable}
      setEditable={setEditable}
      preventEdit={
        !(currentUserIsSuperUser() || currentUserIsTheSeller() || (route?.params?.order === undefined))
      }
      renderBottomTabs={renderBottomTabs}
      selectedTabIndex={selectedTabIndex}
      tabs={[]}
      modelValue={order}
      setModelValue={setOrder}
      navigation={navigation}
      modelName={"order"}
      modelRoute={
        {
          putRoute: `orders/${order?.id}/`,
          postRoute: "orders/"
        }
      }
      modelBaseFieldStates={{client_id: Array.from(client)[0]?.id}}
      resetBaseModelFields={resetForms}
      renderBaseModelFields={renderBaseOrderFields}
      currentPage={i18n.t(editable ? "AddOrder" : "OrderRead")}
      showSubmitResponse={showSubmitResponse}
      setShowSubmitResponse={setShowSubmitResponse}
      modelImageCallback={async (response) => {}}
    />
  );
};
