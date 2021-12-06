import React from 'react';
import { ProductForm } from "./ProductForm";

export const ProductRead = ({ route, navigation }) => {
  return <ProductForm route={route} navigation={navigation} readOnly={true}/>;
};
