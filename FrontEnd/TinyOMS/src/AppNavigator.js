import React, { useState } from 'react';
import { LoginContext, WidthContext } from "./config";
import { Platform, useWindowDimensions } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Home } from "./pages/Home";
import { Persons } from "./pages/Persons";
import { Products } from "./pages/Products";
import { ProductForm } from "./pages/ProductForm";
import { ProductRead } from "./pages/ProductRead";
import { Clients } from "./pages/Clients";
import { UserForm } from "./pages/UserForm";
import { UserRead } from "./pages/UserRead";
import { Suppliers } from "./pages/Suppliers";
import { Employees } from "./pages/Employees";
import { Stocks } from "./pages/Stocks";
import { StockForm } from "./pages/StockForm";
import { StockRead } from "./pages/StockRead";
import { StockItems } from "./pages/StockItems";
import { StockItemForm } from "./pages/StockItemForm";
import { StockItemRead } from "./pages/StockItemRead";
import { Orders } from "./pages/Orders";
import { OrderForm } from "./pages/OrderForm";
import { OrderRead } from "./pages/OrderRead";
import { FullScreenImage } from "./pages/FullScreenImage";

const { Navigator, Screen } = createStackNavigator();

const linking = {
  config: {
    Landing: "",
    Login: "login" ,
    ForgotPassword: "forgot-password",
    Home: "home",
    Persons: "persons",
    Products: "products",
    AddProduct: "add-product",
    ProductRead: "product-detail",
    Clients: "Clients",
    Suppliers: "suppliers",
    Employees: "employees",
    AddUser: "add-user",
    UserRead: "read-user",
    Stocks: "stocks",
    AddStock: "add-stock",
    StockRead: "stock-detail",
    StockItems: "stock-items",
    AddStockItem: "add-stock-item",
    StockItemRead: "stock-item-detail",
    Orders: "orders",
    AddOrder: "add-order",
    OrderRead: "read-order",
    Images: "images"
    // NotFound: "*",
  },
};

const HomeNavigator = () => (
  <Navigator headerMode='none'>
    <Screen name='Landing' component={Landing} key='Landing'/>
    <Screen name='Login' component={Login} key='Login'/>
    <Screen name='ForgotPassword' component={ForgotPassword} key='ForgotPassword'/>
    <Screen name='Home' component={Home} key='Home'/>
    <Screen name='Persons' component={Persons} key='Persons'/>
    <Screen name='Products' component={Products} key='Products'/>
    <Screen name='AddProduct' component={ProductForm} key='AddProduct'/>
    <Screen name='ProductRead' component={ProductRead} key='ProductRead'/>
    <Screen name='Clients' component={Clients} key='Clients'/>
    <Screen name='Suppliers' component={Suppliers} key='Suppliers'/>
    <Screen name='Employees' component={Employees} key='Employees'/>
    <Screen name='AddUser' component={UserForm} key='AddUser'/>
    <Screen name='UserRead' component={UserRead} key='UserRead'/>
    <Screen name='Stocks' component={Stocks} key='Stocks'/>
    <Screen name='AddStock' component={StockForm} key='AddStock'/>
    <Screen name='StockRead' component={StockRead} key='StockRead'/>
    <Screen name='StockItems' component={StockItems} key='StockItems'/>
    <Screen name='AddStockItem' component={StockItemForm} key='AddStockItem'/>
    <Screen name='StockItemRead' component={StockItemRead} key='StockItemRead'/>
    <Screen name='Orders' component={Orders} key='Orders'/>
    <Screen name='AddOrder' component={OrderForm} key='AddOrder'/>
    <Screen name='OrderRead' component={OrderRead} key='OrderRead'/>
    <Screen name='Images' component={FullScreenImage} key='Images'/>
  </Navigator>
);

export const AppNavigator = () => {
  const windowWidth = useWindowDimensions().width;
  const usefulWidth = Platform.OS !== 'web' ? windowWidth : Math.min(640, windowWidth);
  const [loginContext, setLoginContext] = useState({});
  const [widthContext, setWidthContext] = useState(usefulWidth);
  
  return (
    <LoginContext.Provider value={[loginContext, setLoginContext]}>
      <WidthContext.Provider value={[widthContext, setWidthContext]}>
        <NavigationContainer linking={linking}>
          <HomeNavigator/>
        </NavigationContainer>
      </WidthContext.Provider>
    </LoginContext.Provider>
  );
}
