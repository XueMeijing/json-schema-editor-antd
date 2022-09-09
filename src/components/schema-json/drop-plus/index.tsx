import React, { ReactElement, useContext } from 'react';
import { Dropdown, Menu, Tooltip } from 'antd';
import { observer } from 'mobx-react';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { SchemaMobxContext } from '../../..';

interface DropPlusProp {
  prefix: string[];
  name: string;
}

const DropPlus = observer((props: DropPlusProp): ReactElement => {
  const { prefix, name } = props;
  const { t } = useTranslation();

  const context = useContext(SchemaMobxContext);

  const menu = (
    <Menu
      items={[
        {
          label: (
            <span
              onClick={() => {
                context.addField({ keys: prefix, name });
              }}
            >
              {t('SIBLING_NODE')}
            </span>
          ),
          key: 'sibling_node',
        },
        {
          label: (
            <span
              onClick={() => {
                context.setOpenValue({
                  key: prefix.concat(name, 'properties'),
                  value: true,
                });
                context.addChildField({ keys: prefix.concat(name, 'properties') });
              }}
            >
              {t('CHILD_NODE')}
            </span>
          ),
          key: 'child_node',
        },
      ]}
    />
  );

  return (
    <Tooltip placement="top" title={t('ADD_NODE')}>
      <Dropdown overlay={menu}>
        <PlusOutlined style={{ color: '#2395f1' }} />
      </Dropdown>
    </Tooltip>
  );
});

export default DropPlus;
