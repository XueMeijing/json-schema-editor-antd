import React, { createContext, ReactElement, useContext, useState, useEffect } from 'react';
import { createSchema } from 'genson-js/dist';
import { Button, Checkbox, Col, Input, message, Modal, Row, Select, Tabs, Tooltip } from 'antd';
import {
  CaretDownOutlined,
  CaretRightOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { SCHEMA_TYPE } from '../../constants';
import { SchemaMobxContext } from '../../index';
import { handleSchema } from '../../utils/SchemaUtils';
import QuietEditor from '../quiet-editor';
import SchemaOther from '../schema-other';
import MockSelect from '../mock-select';
import SchemaJson from '../schema-json';
import Schema, { Language, SchemaTypeItem } from '../../types/Schema';
import i18n from '../../i18n';

interface EditorContextProp {
  changeCustomValue: (newValue: Schema) => void;
  mock: boolean;
  description: boolean;
  schemaType: Array<SchemaTypeItem>;
  disabled: boolean;
}

export const EditorContext = createContext<EditorContextProp>({
  changeCustomValue: () => {},
  mock: false,
  description: true,
  schemaType: SCHEMA_TYPE,
  disabled: false,
});

interface EditorProp {
  jsonEditor?: boolean;
  mock?: boolean;
  language?: Language;
  description?: boolean;
  schemaType?: Array<SchemaTypeItem>;
  disabled?: boolean;
  rootDisabled?: boolean;
}

const Editor = observer((props: EditorProp): ReactElement => {
  const schemaMobx = useContext(SchemaMobxContext);
  const { t } = useTranslation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stateVal, setStateVal] = useState<Record<string, any>>({
    visible: false,
    show: true,
    editVisible: false,
    description: '',
    descriptionKey: null,
    advVisible: false,
    itemKey: [],
    curItemCustomValue: null,
    checked: false,
    editorModalName: '', // 弹窗名称 description | mock
    mock: '',
  });

  const [jsonSchemaData, setJsonSchemaData] = useState<string>();
  const [jsonData, setJsonData] = useState<string | undefined>();
  const [importJsonType, setImportJsonType] = useState<string | null>(null);

  useEffect(() => {
    if (props.language) {
      i18n.changeLanguage(props.language);
    }
  }, []);

  // json 导入弹窗
  const showModal = () => {
    setStateVal((prevState) => {
      return { ...prevState, visible: true };
    });
  };

  const handleOk = () => {
    if (importJsonType !== 'schema') {
      if (!jsonData) {
        return;
      }
      let jsonObject = null;
      try {
        jsonObject = JSON.parse(jsonData);
      } catch (ex) {
        message.error('json 数据格式有误').then();
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jsonDataVal: any = { ...createSchema(jsonObject) };
      schemaMobx.changeSchema(jsonDataVal);
    } else {
      if (!jsonSchemaData) {
        return;
      }
      let jsonObject = null;
      try {
        jsonObject = JSON.parse(jsonSchemaData);
      } catch (ex) {
        message.error('json 数据格式有误').then();
        return;
      }
      schemaMobx.changeSchema(jsonObject);
    }
    setStateVal((prevState) => {
      return { ...prevState, visible: false };
    });
  };

  const handleCancel = () => {
    setStateVal((prevState) => {
      return { ...prevState, visible: false };
    });
  };

  // EditorComponent 中的数据
  const handleParams = (value: string | undefined) => {
    if (!value) return;
    let parseData = JSON.parse(value);
    parseData = handleSchema(parseData);
    schemaMobx.changeSchema(parseData);
  };

  // 修改数据类型
  const handleChangeType = (key: string, value: string) => {
    schemaMobx.changeType({ keys: [key], value });
  };

  const handleImportJson = (value: string | undefined) => {
    if (!value) {
      setJsonData(undefined);
    } else {
      setJsonData(value);
    }
  };

  const handleImportJsonSchema = (value: string | undefined) => {
    if (!value) {
      setJsonSchemaData(undefined);
    } else {
      setJsonSchemaData(value);
    }
  };

  // 增加子节点
  const handleAddChildField = (key: string) => {
    schemaMobx.addChildField({ keys: [key] });
    setStateVal((prevState) => {
      return { ...prevState, show: true };
    });
  };

  const clickIcon = () => {
    setStateVal((prevState) => {
      return { ...prevState, show: !prevState.show };
    });
  };

  // 修改备注信息
  const handleChangeValue = (key: string[], value: string) => {
    let changeValue: string | boolean | { mock: string } = value;
    if (key[0] === 'mock' && value) {
      changeValue = { mock: value };
    }
    schemaMobx.changeValue({ keys: key, value: changeValue });
  };

  // 备注/mock弹窗 点击ok 时
  const handleEditOk = (name: string) => {
    setStateVal((prevState) => {
      return { ...prevState, editVisible: false };
    });
    let value = stateVal[name];
    if (name === 'mock') {
      value = value ? { mock: value } : '';
    }
    schemaMobx.changeValue({ keys: stateVal.descriptionKey, value });
  };

  const handleEditCancel = () => {
    setStateVal((prevState) => {
      return { ...prevState, editVisible: false };
    });
  };

  /**
   * 展示弹窗modal
   * prefix: 节点前缀信息
   * name: 弹窗的名称 ['description', 'mock']
   * value: 输入值
   * type: 如果当前字段是object || array showEdit 不可用
   */
  const showEdit = (
    prefix: string[],
    name: string,
    value: string | { mock: string },
    type?: string
  ) => {
    if (type === 'object' || type === 'array') {
      return;
    }
    const descriptionKey = [].concat(prefix, name);
    if (typeof value !== 'string') {
      value = name === 'mock' ? (value ? value.mock : '') : value;
    }
    setStateVal((prevState) => {
      return {
        ...prevState,
        editVisible: true,
        [name]: value,
        descriptionKey,
        editorModalName: name,
      };
    });
  };

  // 修改备注/mock参数信息
  const changeDesc = (value: string, name: string) => {
    setStateVal((prevState) => {
      return { ...prevState, [name]: value };
    });
  };

  // 高级设置
  const handleAdvOk = () => {
    if (stateVal.itemKey.length === 0) {
      schemaMobx.changeSchema(stateVal.curItemCustomValue);
    } else {
      schemaMobx.changeValue({
        keys: stateVal.itemKey,
        value: stateVal.curItemCustomValue,
      });
    }
    setStateVal((prevState) => {
      return { ...prevState, advVisible: false };
    });
  };

  const handleAdvCancel = () => {
    setStateVal((prevState) => {
      return { ...prevState, advVisible: false };
    });
  };

  const showAdv = (key: string[], value: Schema) => {
    setStateVal((prevState) => {
      return {
        ...prevState,
        advVisible: true,
        itemKey: key,
        curItemCustomValue: value, // 当前节点的数据信息
      };
    });
  };

  //  修改弹窗中的json-schema 值
  const changeCustomValue = (newValue: Schema) => {
    setStateVal((prevState) => {
      return { ...prevState, curItemCustomValue: newValue };
    });
  };

  const changeCheckBox = (value: boolean) => {
    setStateVal((prevState) => {
      return { ...prevState, checked: value };
    });
    schemaMobx.requireAll({ required: value });
  };

  const { visible, editVisible, advVisible, checked, editorModalName } = stateVal;

  function handleMockSelectShowEdit() {
    showEdit([], 'mock', schemaMobx.schema.mock, schemaMobx.schema.type);
  }

  return (
    <EditorContext.Provider
      value={{
        changeCustomValue,
        mock: props.mock,
        description: props.description,
        schemaType: props.schemaType,
        disabled: props.disabled,
      }}
    >
      <div className="json-schema-react-editor">
        {!props.disabled && (
          <Button type="primary" onClick={showModal}>
            {t('IMPORT_JSON')}
          </Button>
        )}
        <Modal
          width={750}
          maskClosable={false}
          visible={visible}
          title={t('IMPORT_JSON')}
          onOk={handleOk}
          onCancel={handleCancel}
          className="json-schema-react-editor-import-modal"
          okText={t('OK')}
          cancelText={t('CANCEL')}
          footer={[
            <Button key="back" onClick={handleCancel}>
              {t('CANCEL')}
            </Button>,
            <Button key="submit" type="primary" onClick={handleOk}>
              {t('OK')}
            </Button>,
          ]}
        >
          <Tabs
            defaultValue="json"
            onChange={(key) => {
              setImportJsonType(key);
            }}
          >
            <Tabs.TabPane tab="JSON" key="json">
              <QuietEditor height="300px" width="700px" onChange={handleImportJson} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="JSON-SCHEMA" key="schema">
              <QuietEditor height="300px" width="700px" onChange={handleImportJsonSchema} />
            </Tabs.TabPane>
          </Tabs>
        </Modal>

        <Modal
          title={
            <div>
              {editorModalName}
              &nbsp;
              {editorModalName === 'mock' && (
                <Tooltip title="mockLink">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/YMFE/json-schema-editor-visual/issues/38"
                  >
                    <QuestionCircleOutlined />
                  </a>
                </Tooltip>
              )}
            </div>
          }
          width={750}
          maskClosable={false}
          visible={editVisible}
          onOk={() => handleEditOk(editorModalName)}
          onCancel={handleEditCancel}
          okText={t('OK')}
          cancelText={t('CANCEL')}
        >
          <Input.TextArea
            value={stateVal[editorModalName]}
            placeholder={editorModalName}
            onChange={(event) => changeDesc(event.target.value, editorModalName)}
            autoSize={{ minRows: 6, maxRows: 10 }}
          />
        </Modal>

        {advVisible && (
          <Modal
            title={t('ADV_SETTING')}
            width={750}
            maskClosable={false}
            visible={advVisible}
            onOk={handleAdvOk}
            onCancel={handleAdvCancel}
            okText={t('OK')}
            cancelText={t('CANCEL')}
            className="json-schema-react-editor-adv-modal"
          >
            <SchemaOther data={JSON.stringify(stateVal.curItemCustomValue, null, 2)} />
          </Modal>
        )}

        <Row style={{ marginTop: 10 }}>
          {props.jsonEditor && (
            <Col span={8}>
              <QuietEditor
                height="500px"
                width="700px"
                value={JSON.stringify(schemaMobx.schema, null, 2)}
                onChange={handleParams}
              />
            </Col>
          )}
          <Col span={props.jsonEditor ? 16 : 24} className="wrapper">
            <Row align="middle" gutter={11}>
              <Col flex="auto">
                <Row align="middle" gutter={11}>
                  <Col span={8}>
                    <Row justify="space-around" align="middle" className="field-name">
                      <Col flex="20px">
                        {schemaMobx.schema.type === 'object' ? (
                          <span className="show-hide-children" onClick={clickIcon}>
                            {stateVal.show ? <CaretDownOutlined /> : <CaretRightOutlined />}
                          </span>
                        ) : null}
                      </Col>
                      <Col flex="auto">
                        <Input
                          disabled
                          value="root"
                          addonAfter={
                            <Tooltip placement="top" title={t('CHECKED_ALL')}>
                              <Checkbox
                                style={{ paddingRight: 0 }}
                                checked={checked}
                                disabled={
                                  !(
                                    schemaMobx.schema.type === 'object' ||
                                    schemaMobx.schema.type === 'array'
                                  ) || props.disabled
                                }
                                onChange={(event) => changeCheckBox(event.target.checked)}
                              />
                            </Tooltip>
                          }
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col span={props.mock ? (props.description ? 3 : 5) : props.description ? 4 : 7}>
                    <Select
                      style={{ width: '100%' }}
                      onChange={(value) => handleChangeType(`type`, value)}
                      value={schemaMobx.schema.type || 'object'}
                      disabled={props.disabled || props.rootDisabled}
                    >
                      {(props.schemaType || SCHEMA_TYPE).map((item, index) => {
                        return (
                          <Select.Option value={item} key={index}>
                            {item}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </Col>
                  {props.mock && (
                    <Col span={3}>
                      <MockSelect
                        schema={schemaMobx.schema}
                        showEdit={handleMockSelectShowEdit}
                        onChange={(value) => handleChangeValue(['mock'], value)}
                      />
                    </Col>
                  )}
                  <Col span={props.mock ? (props.description ? 5 : 8) : props.description ? 6 : 9}>
                    <Input
                      placeholder={t('TITLE')}
                      value={schemaMobx.schema.title}
                      onChange={(ele) => handleChangeValue(['title'], ele.target.value)}
                      addonAfter={
                        <EditOutlined
                          className="input_icon_editor"
                          onClick={() => {
                            !props.disabled && showEdit([], 'title', schemaMobx.schema.title);
                          }}
                        />
                      }
                      disabled={props.disabled}
                    />
                  </Col>
                  {props.description && (
                    <Col span={props.mock ? 5 : 6}>
                      <Input
                        addonAfter={
                          <EditOutlined
                            onClick={() => {
                              !props.disabled &&
                                showEdit([], 'description', schemaMobx.schema.description);
                            }}
                          />
                        }
                        placeholder={t('DESCRIPTION')}
                        value={schemaMobx.schema.description}
                        onChange={(ele) => handleChangeValue(['description'], ele.target.value)}
                        disabled={props.disabled}
                      />
                    </Col>
                  )}
                </Row>
              </Col>
              {!props.disabled && (
                <Col flex="66px">
                  <Row gutter={8}>
                    <Col span={8}>
                      <span className="adv-set" onClick={() => showAdv([], schemaMobx.schema)}>
                        <Tooltip placement="top" title={t('ADV_SETTING')}>
                          <SettingOutlined />
                        </Tooltip>
                      </span>
                    </Col>
                    <Col span={8}>
                      {schemaMobx.schema.type === 'object' ? (
                        <span className="plus" onClick={() => handleAddChildField('properties')}>
                          <Tooltip placement="top" title={t('ADD_CHILD_NODE')}>
                            <PlusOutlined />
                          </Tooltip>
                        </span>
                      ) : null}
                    </Col>
                  </Row>
                </Col>
              )}
            </Row>
            {stateVal.show && <SchemaJson showEdit={showEdit} showAdv={showAdv} />}
          </Col>
        </Row>
      </div>
    </EditorContext.Provider>
  );
});

export default Editor;
