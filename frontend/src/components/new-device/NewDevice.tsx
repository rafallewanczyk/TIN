import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Button, Form, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { Rule } from 'antd/es/form';

export type NewDeviceProps = RouteComponentProps;

const { Option } = Select;

enum Fields {
  NAME = 'name',
  REGULATOR = 'regulator',
  PUBLIC_KEY = 'public-key',
}

const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: 'Please give device name' }],
  regulator: [{ required: true, message: 'Please choose regulator' }],
};

export const NewDevice: React.FC<NewDeviceProps> = (props) => {
  const [form] = Form.useForm();

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();

      console.log(values);
    } catch {}
  };

  return (
    <div>
      <Form
        form={form}
        labelCol={{ span: 10 }}
        layout="vertical"
        size="middle"
        wrapperCol={{ span: 10 }}
      >
        <Form.Item label="Name" name="name" rules={rules.name}>
          <Input autoComplete="off" name="name" />
        </Form.Item>
        <Form.Item label="Choose your regulator" name="regulator" rules={rules.regulator}>
          <Select onChange={(value) => console.log(value)}>
            <Option value="Regulator 1">Regulator 1</Option>
            <Option value="Regulator 2">Regulator 2</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Public key">
          <TextArea />
        </Form.Item>
        <Form.Item>
          <Button onClick={onSubmit}>Add device</Button>
        </Form.Item>
      </Form>
    </div>
  );
};
