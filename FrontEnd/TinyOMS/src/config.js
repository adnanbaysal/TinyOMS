import React from 'react';
import i18n from "./i18n";

export const LoginContext = React.createContext([{}, function(){}]);
export const WidthContext = React.createContext([{}, function(){}]);

export const backendURL = "http://192.168.1.38:8000/";

export const UILanguages = [
  {code: "en-us", name: "English (US)"}, 
  {code: "tr-tr", name: "Türkçe (TR)"}
];

export const Currencies = [
  {code: "USD", name: "USD"}, 
  {code: "EUR", name: "EUR"},
  {code: "CNY", name: "CNY"}, 
  {code: "TRY", name: "TRY"},
];

export const UnitTypes = [
  {code: "meter", name: "meter"}, 
  {code: "kg", name: "kg"},
];

export const productSortingOptions = [
  {description: `${i18n.t("product_name")} A-Z`, value: "name"},
  {description: `${i18n.t("product_name")} Z-A`, value: "-name"},
  {description: `${i18n.t("description")} A-Z`, value: "description"},
  {description: `${i18n.t("description")} Z-A`, value: "-description"},
];

export const userSortingOptions = [
  {description: `${i18n.t("username")} A-Z`, value: "username"},
  {description: `${i18n.t("username")} Z-A`, value: "-username"},
  {description: `${i18n.t("email")} A-Z`, value: "email"},
  {description: `${i18n.t("email")} Z-A`, value: "-email"},
  {description: `${i18n.t("first_name")} A-Z`, value: "first_name"},
  {description: `${i18n.t("first_name")} Z-A`, value: "-first_name"},
  {description: `${i18n.t("last_name")} A-Z`, value: "last_name"},
  {description: `${i18n.t("last_name")} Z-A`, value: "-last_name"},
];

export const stockSortingOptions = [
  {description: `${i18n.t("stock_name")} A-Z`, value: "name"},
  {description: `${i18n.t("stock_name")} Z-A`, value: "-name"},
];

export const stockItemSortingOptions = [
  // {description: `${i18n.t("stock_name")} A-Z`, value: "inventory__name"},
  // {description: `${i18n.t("stock_name")} Z-A`, value: "-inventory__name"},
  {description: `${i18n.t("product_name")} A-Z`, value: "product__name"},
  {description: `${i18n.t("product_name")} Z-A`, value: "-product__name"},
  {description: `${i18n.t("description")} A-Z`, value: "product__description"},
  {description: `${i18n.t("description")} Z-A`, value: "-product__description"},
  {description: `${i18n.t("supplier_username")} A-Z`, value: "supplier__username"},
  {description: `${i18n.t("supplier_username")} Z-A`, value: "-supplier__username"},
  // {description: `${i18n.t("unit_type")} A-Z`, value: "unit_type"},
  // {description: `${i18n.t("unit_type")} Z-A`, value: "-unit_type"},
  {description: `${i18n.t("amount_in_stock")} ${i18n.t("increasing")}`, value: "amount"},
  {description: `${i18n.t("amount_in_stock")} ${i18n.t("decreasing")}`, value: "-amount"},
  // {description: `${i18n.t("cost_currency")} ${i18n.t("increasing")}`, value: "cost_currency"},
  // {description: `${i18n.t("cost_currency")} ${i18n.t("decreasing")}`, value: "-cost_currency"},
  {description: `${i18n.t("cost_per_unit")} ${i18n.t("increasing")}`, value: "cost_per_unit"},
  {description: `${i18n.t("cost_per_unit")} ${i18n.t("decreasing")}`, value: "-cost_per_unit"},
];

export const orderSortingOptions = [
  {description: `${i18n.t("newest_created_at")}`, value: "-created_at"}, 
  {description: `${i18n.t("oldest_created_at")}`, value: "created_at"},
  {description: `${i18n.t("actives_first")}`, value: "-is_active"},
  {description: `${i18n.t("passives_first")}`, value: "is_active"},
  {description: `${i18n.t("client_username")} A-Z`, value: "client__username"},
  {description: `${i18n.t("client_username")} Z-A`, value: "-client__username"},
  {description: `${i18n.t("seller_username")} A-Z`, value: "seller__username"},
  {description: `${i18n.t("seller_username")} Z-A`, value: "-seller__username"},
];

export const orderItemSortingOptions = [
];
