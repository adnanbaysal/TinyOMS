import React from 'react';
import { StockItemForm } from "./StockItemForm";

export const StockItemRead = ({ route, navigation }) => {
  return <StockItemForm route={route} navigation={navigation} readOnly={true}/>;
};
