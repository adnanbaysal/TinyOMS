import React from 'react';
import { StockForm } from "./StockForm";

export const StockRead = ({ route, navigation }) => {
  return <StockForm route={route} navigation={navigation} readOnly={true}/>;
};
