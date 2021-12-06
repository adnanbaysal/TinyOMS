import React from 'react';
import { OrderForm } from "./OrderForm";

export const OrderRead = ({ route, navigation }) => {
  return <OrderForm route={route} navigation={navigation} readOnly={true}/>;
};
