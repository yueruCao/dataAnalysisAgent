'use client';
import { useState } from 'react';
import { Button, Form, Input, Popconfirm, Table, Typography } from 'antd';
import { nanoid } from 'nanoid';


const EditableCell = ({editing,dataIndex,title,record,index,children,...restProps}) => {
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          <Input />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default function InteractiveTable({data, setData, ...props}) {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const isEditing = record => record.key === editingKey;
  const edit = record => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };
  const cancel = () => {
    setEditingKey('');
  };
  const handleDelete = key => {
    fetch('/api/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'delete', key: key }),
    }).then(res => res.json()).then(_data => {
      console.log('Delete response:', _data);
      const newData = data.filter(item => item.key !== key);
      setData(newData);
    });
  };
  const handleAdd = () => {
    let newData = {};
    Object.keys(data[0]).map((key,index) => {
      if (key === 'key') {
        newData[key] = nanoid();
      } else {
        newData[key] = '';
      }
    });
    newData.__isNew = true;
    setData([...data, newData]);
    setEditingKey(newData.key);
    form.setFieldsValue(newData);
  };
  const save = async key => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex(item => key === item.key);
      const item = newData[index];
      const newItemData = {
        ...item,
        ...row,
      };
      delete newItemData.__isNew;
      if (!item.__isNew) {
        fetch('/api/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'update', key: key, itemData: newItemData }),
        }).then(res => res.json()).then(_data => {
          console.log('Update response:', _data);
          newData.splice(index, 1, newItemData);
          setData(newData);
          setEditingKey('');
        });
      } else {
        fetch('/api/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'add', key: key, itemData: newItemData }),
        }).then(res => res.json()).then(_data => {
          console.log('Add response:', _data);
          newData.splice(index, 1, newItemData);
          setData(newData);
          setEditingKey('');
        });
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };
  const isNumberString = (val) => {
    return typeof val === 'string' && /^[+-]?\d+(\.\d+)?$/.test(val);
  };
  const isValidDateString = (val) => {
    if (typeof val !== 'string') return false;
    const date = new Date(val);
    return !isNaN(date.getTime());
  };
  const smartCompare = (a, b) => {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;
    const aStr = String(a).trim();
    const bStr = String(b).trim();
    if (isNumberString(aStr) && isNumberString(bStr)) {
      return Number(aStr) - Number(bStr);
    }
    if (isValidDateString(aStr) && isValidDateString(bStr)) {
      return new Date(aStr) - new Date(bStr);
    }
    return aStr.localeCompare(bStr);
  };
  const columns = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'key').map((key,index) => ({
    title: key,
    dataIndex: key,
    editable: true,
    sorter: {
      compare: (a, b) => smartCompare(a[key], b[key]),
      multiple: index + 1,
    },
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="flex flex-col p-2">
        <Input
          placeholder="Search name"
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={confirm}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={confirm}
          size="small"
          className='w-52'
        >
          Search
        </Button>
      </div>
    ),
    onFilter: (value, record) => String(record[key]).toLowerCase().includes(String(value).toLowerCase()),
  })) : [];
  data.length > 0 &&columns.push({
    title: 'operation',
    dataIndex: 'operation',
    width: '120px',
    render: (_, record) => {
      const editable = isEditing(record);
      return editable ? (
        <span>
          <Typography.Link onClick={() => save(record.key)} style={{ marginInlineEnd: 8 }}>
            Save
          </Typography.Link>
          <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
            <a>Cancel</a>
          </Popconfirm>
        </span>
      ) : (
        <div className='flex flex-row gap-4'>
          <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
            Edit
          </Typography.Link>
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
            <Typography.Link disabled={editingKey !== ''}>
              delete
            </Typography.Link>
          </Popconfirm>
        </div>
      );
    },
  });
  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: record => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record) && col.title !== 'key',
      }),
    };
  });
  return (
    <Form form={form} component={false}>
      <div {...props}>
        <Button onClick={handleAdd} type="primary" disabled={data?.length <= 0} className='w-32'>Add a row</Button>
      </div>
      <Table
        components={{
          body: { cell: EditableCell },
        }}
        bordered
        rowKey="key"
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{ onChange: cancel }}
      />
    </Form>
  );
};