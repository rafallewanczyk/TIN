import React from 'react';
import { Form, Select } from 'antd';
import { Control, Controller } from 'react-hook-form';


interface OwnProps {
  control: Control<Record<string, any>>;
  errorMessage?: string;
}

export const FormSelect: React.FC<OwnProps> = ({ control, errorMessage }) => {
  const status = errorMessage && 'error';

  return (
  );
};
