import React from 'react';
import { 
  HomeIcon, LogoutIcon, PersonsIcon, ProductsIcon, StocksIcon, 
  OrdersIcon, PaymentsIcon, FinancialsIcon, SettingsIcon, 
  HelpIcon, EmployeesIcon, SuppliersIcon, ClientsIcon } from "./components/Generics";

const Menus = [
  {name: "Home", icon: HomeIcon, navigateTo: "Home"},
  {name: "Persons", icon: PersonsIcon, navigateTo: "Persons"},
  {name: "Products", icon: ProductsIcon, navigateTo: "Products"},
  {name: "Stocks", icon: StocksIcon, navigateTo: "Stocks"},
  // {name: "StockItems", icon: StocksIcon, navigateTo: "StockItems"}, // /////////////
  {name: "Orders", icon: OrdersIcon, navigateTo: "Orders"},
  {name: "Payments", icon: PaymentsIcon, navigateTo: "Payments"},
  {name: "Financials", icon: FinancialsIcon, navigateTo: "Financials"},
  {name: "Settings", icon: SettingsIcon, navigateTo: "Settings"},
  {name: "Help", icon: HelpIcon, navigateTo: "Help"},
  {name: "logout", icon: LogoutIcon, navigateTo: "Login"}
];

export default Menus;

export const PersonsMenus = [
  {name: "Employees", icon: EmployeesIcon, navigateTo: "Employees"},
  {name: "Suppliers", icon: SuppliersIcon, navigateTo: "Suppliers"},
  {name: "Clients", icon: ClientsIcon, navigateTo: "Clients"},
];
