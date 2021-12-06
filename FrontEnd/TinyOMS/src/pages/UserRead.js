import React from 'react';
import { UserForm } from "./UserForm";

export const UserRead = ({ route, navigation }) => {
  return <UserForm route={route} navigation={navigation} readOnly={true}/>;
};
