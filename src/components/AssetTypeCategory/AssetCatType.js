import React, { useEffect, useState } from "react";
import "./AssetTypeCategory.css";
import {
  fetchCategories,
  fetchTypes,
  addCategory,
  addType,
  updateType,
  deleteType,
} from "../../api/assetAPI.js";
import AssetCategories from "./AssetCategories";
import AssetTypes from "./AssetTypes";
import { Modal, message, Typography, Button } from "antd";
import { AssetMessages } from "../../constants/constants.js";
import { toastSuccess, toastError } from "../../Utility/toast.js";

const { Title } = Typography;

const AssetTypeCategory = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [types, setTypes] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newType, setNewType] = useState("");

  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Whenever selectedCategory changes, load types
  useEffect(() => {
    if (selectedCategory && selectedCategory._id) {
      loadTypes(selectedCategory._id);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    const res = await fetchCategories();
    setCategories(res.data);

    // only auto-select if none is selected
    if (!selectedCategory && res.data.length) {
      setSelectedCategory(res.data[0]);
    }
  };

  const loadTypes = async (categoryId) => {
    const res = await fetchTypes(categoryId);
    setTypes(res.data);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    await addCategory({
      name: newCategory,
      description: newCategoryDescription,
    });
    setNewCategory("");
    setNewCategoryDescription("");
    await loadCategories();
    // message.success('Asset Category added successfully!');
    toastSuccess({
      title: "Success",
      description: AssetMessages.CATEGORY_ADD_SUCC,
    });
  };

  const handleAddType = async ({ name, description }) => {
    if (!selectedCategory || !name.trim()) return;
    await addType({ name, description, categoryId: selectedCategory._id });
    loadTypes(selectedCategory._id);
    // message.success(AssetMessages.ASSET_TYPE_ADD_SUCC);
    toastSuccess({
      title: "Success",
      description: AssetMessages.ASSET_TYPE_ADD_SUCC,
    });
  };

  const handleEditType = async (updatedType) => {
    await updateType(updatedType._id, {
      name: updatedType.name,
      description: updatedType.description,
    });
    if (selectedCategory) loadTypes(selectedCategory._id);
    // message.success(AssetMessages.ASSET_TYPE_UPDATE_SUCC);
    toastSuccess({
      title: "Success",
      description: AssetMessages.ASSET_TYPE_UPDATE_SUCC,
    });
  };

  const handleDeleteType = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this type?",
      onOk: async () => {
        try {
          await deleteType(id);
          if (selectedCategory) loadTypes(selectedCategory._id);
          // message.success(AssetMessages.ASSET_TYPE_DEL_SUCC);
          toastSuccess({
            title: "Success",
            description: AssetMessages.ASSET_TYPE_DEL_SUCC,
          });
        } catch (error) {
          // message.error(AssetMessages.ASSET_TYPE_DEL_FAIL);
          toastError({
            title: "Error",
            description: AssetMessages.ASSET_TYPE_DEL_FAIL,
          });
        }
      },
    });
  };

  //  .content{
  //   display: flex;
  //   justify-content: space-between;
  //   align-items: center;
  //   flex: 1;
  // }

  return (
    <div
      className="typecategory-container w-full pb-[20px]"
    >
      <div className="title-bar">
        <div className="ghost-div hidden lg:block"></div>
        <div className="flex flex-col lg:flex-row justify-between items-center flex-1">
          <h1 className="!text-center !text-2xl lg:!text-[32px] text-primary-text font-rubik font-semibold !mt-[14px] !mb-4 lg:!mb-8 !w-auto">
            Asset Categories & Asset Types
          </h1>
          <Button
            type="primary"
            className="custom-button add-category-btn !w-full lg:!w-auto"
            onClick={() => setShowCategoryModal(true)}
          >
            + Add Asset Category
          </Button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row">
        <AssetCategories
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          fetchTypes={loadTypes}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          newCategoryDescription={newCategoryDescription}
          setNewCategoryDescription={setNewCategoryDescription}
          handleAddCategory={handleAddCategory}
          refreshCategories={loadCategories}
          isModalOpen={showCategoryModal}
          setIsModalOpen={setShowCategoryModal}
        />
        <AssetTypes
          selectedCategory={selectedCategory}
          types={types}
          newType={newType}
          setNewType={setNewType}
          handleAddType={handleAddType}
          handleEditType={handleEditType}
          handleDeleteType={handleDeleteType}
        />
      </div>
    </div>
  );
};

export default AssetTypeCategory;
