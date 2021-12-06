import React from 'react';
import { StyleSheet } from 'react-native';
import axios from "axios";
import { Button, Card, Input, Modal, Text, SelectItem, Select, IndexPath, Toggle, Layout, Datepicker, Spinner} from '@ui-kitten/components';
import { backendURL, LoginContext, WidthContext } from "../config";
import i18n from '../i18n';
import { IconGhostButton, AddIcon, DeleteIcon } from "./Generics";

export const AddFieldModal = ({modelName, visible, setVisible, extraFields, setExtraFields, setExtraFieldStatesWith}) => {
  const [loginContext, setLoginContext] = React.useContext(LoginContext);
  const [usefulWidth, setUsefulWidth] = React.useContext(WidthContext);
  const modalWidth = Math.round(usefulWidth * 0.9);
  
  const [description, setDescription] = React.useState("");
  const [selectedType, setSelectedType] = React.useState("bool");
  const [defaultValue, setDefaultValue] = React.useState(null);
  const fieldTypes = ["bool", "int", "float", "str", "choices", "datetime", "image"];
  const [choices, setChoices] = React.useState([]);
  const [newChoice, setNewChoice] = React.useState("");
  const [today, setToday] = React.useState(new Date());
  const [showLoading, setShowLoading] = React.useState(false);
  const [errorVisible, setErrorVisible] = React.useState(false);

  const resetForm = () => {
    setDescription("");
    setSelectedType("bool");
    setDefaultValue(null);
    setChoices([]);
    setNewChoice("");
    setErrorVisible(false);
    setShowLoading(false);
    setVisible(false);
  }; 

  const processDefault = (type) => {
    const replaceNull = (value) => {
      return defaultValue === null ? value : defaultValue;
    }
    switch (type) {
      case 'bool': return replaceNull("false");
      case 'int':
      case 'float': return replaceNull("0");
      case 'str': 
      case 'choices': 
      case 'image': return defaultValue;
      case 'datetime': return replaceNull(new Date());
      default: return null;
    }
  };

  const handleSubmitPromise = async () => {
    setShowLoading(true);
    const dflt = processDefault(selectedType);
    const url = backendURL + 'api/extraattributes/'; 
    axios.post(url, 
      {
        model_name: modelName,
        description: description,
        type_name: selectedType,
        "default": dflt,
        show_in_summary: false,
        choices: choices
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${loginContext.token}`
        },
      }
    ).then(response => {
      const data = response.data;
      setExtraFields([...extraFields, data]);
      setExtraFieldStatesWith([...extraFields, data]);
      resetForm();
      setVisible(false);
    })
    .catch(error => {
      setErrorVisible(true);
      console.log("ERROR:", error);
    })
    .finally(() => {
      setShowLoading(false);
    });
  };

  const handleSubmit = () => {
    async function callHandleSubmitPromise() {
      await handleSubmitPromise();
    }
    callHandleSubmitPromise();
  }

  const renderBool = () => (
    <Layout style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 5}}>
      <Text category='label' style={{paddingRight: 5}}>{i18n.t("default_value")}:</Text>
      <Toggle 
        checked={defaultValue === "true"} 
        onChange={isChecked => {
          setDefaultValue(isChecked ? "true" : "false");
          setErrorVisible(false);
        }}
      >
        {defaultValue === "true" ? i18n.t("yes") : i18n.t("no")}
      </Toggle>
    </Layout>
  );

  const renderDatetime = () => (
    <Datepicker 
      label={i18n.t("default_value")}
      date={defaultValue === null ? today : defaultValue}
      onSelect={(newDate) => {
        setDefaultValue(newDate);
        setErrorVisible(false);
      }}
    /> 
  );

  const renderString = () => (
    <Input
      onChangeText={(value) => {
        setDefaultValue(value);
        setErrorVisible(false);
      }}
      value={defaultValue}
      label={i18n.t("default_value")}
    />
  );

  const renderNumber = (typeName) => (
    <Input
      label={i18n.t("default_value")}
      onChangeText={(text) => {
        let newValue = text;
        if (typeName === 'int') {
          newValue = +(newValue.replace(/\D/g,''));
        } else {
          newValue = +(newValue.replace(/[^\d.-]/g, ''));
        }
        setDefaultValue(newValue);
        setErrorVisible(false);
        // TODO: fix text input field value error: 17...1224 aynen kalıyor mesela 
      }}
      value={defaultValue}
      keyboardType='number-pad'
    />
  );

  const handleAddNewChoice = () => {
    if (newChoice === '') return;
    if (choices.includes(newChoice)) {
      setNewChoice("");
      return;
    }
    const newChoices = Array.from(choices);
    newChoices.push(newChoice);
    setChoices(newChoices);
    setDefaultValue(newChoice);
    setNewChoice("");
  };

  const handleDeleteChoice = choice => () => {
    const index = choices.indexOf(choice);
    if (index > -1) {
      const newChoices = Array.from(choices);
      newChoices.splice(index, 1);
      if (choice === defaultValue && newChoices.length > 0){
        setDefaultValue(newChoices[newChoices.length-1]);
      }
      setChoices(newChoices);
    } 
  };

  const renderDeleteChoice = choice => () => (
    <IconGhostButton style={styles.button} icon={DeleteIcon} onPress={handleDeleteChoice(choice)}/>
  );

  const renderChoices = () => (
    <Layout>
      <Layout style={{flex:1, flexDirection: 'row', paddingTop: 5}}>
        <Input 
          style={{flex: 1}}
          placeholder={i18n.t("add_choice")}
          value={newChoice}
          onChangeText={value => {
            setNewChoice(value);
            setErrorVisible(false);
          }}
          onSubmitEditing={handleAddNewChoice}
        />
        <IconGhostButton style={styles.button} icon={AddIcon} onPress={handleAddNewChoice}/>
      </Layout>
      {choices.length > 0 ?     
        <Select
          label={i18n.t("default_value")}
          selectedIndex={new IndexPath(choices.findIndex(element => element === defaultValue))}
          onSelect={index => {
            setDefaultValue(choices[index.row]);
            setErrorVisible(false);
          }}
          value={defaultValue}
        >
          {choices.map(choice => (
            <SelectItem 
              title={choice}
              accessoryRight={renderDeleteChoice(choice)} 
              key={choice}
            />
          ))}
        </Select>
        : null
      }
    </Layout>
  );

  const renderDefaultForm = () => {
    switch (selectedType) {
      case 'bool': return renderBool();
      case 'int': 
      case 'float': return renderNumber();
      case 'str': return renderString();
      case 'choices': return renderChoices();
      case 'datetime': return renderDatetime();
      case 'image': 
      default: return null;
    }
  }

  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => setVisible(false)}
      style={{width: modalWidth}}
    >  
      <Card disabled={true}>
        <Modal visible={showLoading} backdropStyle={styles.backdrop}>
          <Spinner size='giant'/>
        </Modal> 
        <Input 
          label={i18n.t("description")}
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            setErrorVisible(false);
          }}
        />
        <Select
          label={i18n.t("data_type")}
          selectedIndex={new IndexPath(fieldTypes.findIndex(element => element === selectedType))}
          onSelect={index => {
            // setDefaultValue(null);
            setSelectedType(fieldTypes[index.row]);
            setDefaultValue(processDefault(fieldTypes[index.row]));
            setErrorVisible(false);
          }}
          value={i18n.t(selectedType)}
        >
          {fieldTypes.map(type => (
            <SelectItem title={i18n.t(type)} key={`select_${type}`}/>
          ))}
        </Select>
        {renderDefaultForm()}
        <Text status='danger'>
          {errorVisible ? i18n.t("server_error") : null}
        </Text>
        <Button
          status="warning"
          appearance="outline"
          onPress={handleSubmit}
          disabled={
            description === null || description === "" || 
            (selectedType === 'choices' && (choices === null || choices === [] || choices.length === 0))
          }
        >
          {`${i18n.t('add_field')}`}
        </Button>
      </Card>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  button: {
    height: 24,
    flex: 0,
    flexBasis: 24,
    flexShrink: 0
  },
});