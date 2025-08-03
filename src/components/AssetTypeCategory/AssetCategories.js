import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Typography,
  Button,
  Modal,
  Input,
  List,
  Badge,
  Form,
  message,
  Dropdown,
  Menu,
  Space,
} from 'antd';
import { EditOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons';
import { updateCategory, deleteCategory } from '../../api/assetAPI';
import { AssetMessages } from '../../constants/constants';
import { toastError, toastSuccess } from '../../Utility/toast';

const { Title, Text } = Typography;

const AssetCategories = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  fetchTypes,
  newCategory,
  setNewCategory,
  handleAddCategory,
  newCategoryDescription,
  setNewCategoryDescription,
  refreshCategories,
  isModalOpen,
  setIsModalOpen
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(5);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const loadMoreRef = useRef();

  // Infinite scroll with IntersectionObserver
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        setVisibleCount((prev) => prev + 5);
      }
    },
    [setVisibleCount]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 1.0,
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [handleObserver]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleCategories = filteredCategories.slice(0, visibleCount);

  const handleEditCategory = (category) => {
    setEditCategory(category);
    setEditName(category.name);
    setEditDescription(category.description || '');
    setIsEditModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this category?',
      onOk: async () => {
        try {
          await deleteCategory(id);
          // message.success(AssetMessages.CATEGORY_DEL_SUCC);
          toastSuccess({ title: "Success", description: AssetMessages.CATEGORY_DEL_SUCC });
          refreshCategories(); // Update category list
        } catch (error) {
          // message.error(AssetMessages.CATEGORY_DEL_FAIL);
          toastError({ title: "Error", description: AssetMessages.CATEGORY_DEL_FAIL });
        }
      },
    });
  };

  const handleEditSubmit = async () => {
    if (!editName.trim()) {
      // message.error(AssetMessages.CATEGORY_NAME_REQ);
      toastError({ title: "Error", description: AssetMessages.CATEGORY_NAME_REQ });
      return;
    }

    try {
      await updateCategory(editCategory._id, {
        name: editName.trim(),
        description: editDescription.trim(),
      });
      // message.success(AssetMessages.CATEGORY_UPDATE_SUCC);
      toastSuccess({ title: "Success", description: AssetMessages.CATEGORY_UPDATE_SUCC });
      refreshCategories();
      setIsEditModalOpen(false);
      setEditCategory(null);
    } catch (error) {
      // message.error(AssetMessages.CATEGORY_UPDATE_FAIL);
      toastError({ title: "Error", description: AssetMessages.CATEGORY_UPDATE_FAIL });
    }
  };

  const categoryMenu = (category) => (
    <Menu>
      <Menu.Item key="edit" onClick={() => handleEditCategory(category)}>
        <EditOutlined /> Edit
      </Menu.Item>
      <Menu.Item key="delete" onClick={() => handleDeleteCategory(category._id)}>
        <DeleteOutlined /> Delete
      </Menu.Item>
    </Menu>
  );

  const handleSubmit = () => {
    if (!newCategory.trim()) return;
    handleAddCategory();
    setIsModalOpen(false);
    setNewCategory('');
    setNewCategoryDescription('');
    // message.success(AssetMessages.CATEGORY_ADD_SUCC);
    toastSuccess({ title: "Success", description: AssetMessages.CATEGORY_ADD_SUCC });
    fetchTypes(); // Refresh categories after adding
  };

  return (
    <aside className='w-full lg:w-1/5 !p-4 border-r border-border-color'>
      <Input.Search
        placeholder="Search Category"
        value={searchTerm}
        onChange={handleSearch}
        className="!mb-4"
      />

      <List
        bordered
        dataSource={visibleCategories}
        renderItem={(cat) => (
          <List.Item
            className={`cursor-pointer flex justify-between items-center ${selectedCategory?._id === cat._id ? 'bg-[#e6f7ff]' : 'bg-white'}`}
            onClick={() => {
              setSelectedCategory(cat);
              fetchTypes(cat._id);
            }}
          >
            <Space>
              <Text strong>{cat.name}</Text>
              <Badge count={cat.count} />
            </Space>
            <Dropdown overlay={categoryMenu(cat)} trigger={['click']}>
              <EllipsisOutlined className="!text-lg cursor-pointer" />
            </Dropdown>
          </List.Item>
        )}
      />

      <div ref={loadMoreRef} className="h-5" />

      {/* Add Category Modal */}
      <Modal
        title="Add New Asset Category"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText="Add"
        okButtonProps={{ className: 'custom-button' }}
      >
        <Form layout="vertical">
          <Form.Item label="Category Name" required>
            <Input
              placeholder="Enter category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Description (optional)">
            <Input.TextArea
              placeholder="Enter category description"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        title="Edit Asset Category"
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Save"
        okButtonProps={{ className: 'custom-button' }}
      >
        <Form layout="vertical">
          <Form.Item label="Category Name" required>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter category name"
            />
          </Form.Item>
          <Form.Item label="Description (optional)">
            <Input.TextArea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Enter category description"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </aside>
  );
};

export default AssetCategories;
