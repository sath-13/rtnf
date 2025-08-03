import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useMemo,
  useCallback,
} from "react";
import moment from "moment";
import {
  Table,
  Modal,
  Button,
  Menu,
  Input,
  Pagination,
  Spin,
  Select,
  Form,
  Tooltip,
  Typography,
} from "antd";
import { useParams } from "react-router-dom";
import useAxios from "../../../Hooks/useAxios";
import { StockContext } from "../../../contexts/StockContext";
import "./AssetStockList.css";
import {
  deleteProduct,
  getAllProductByUser,
  updateProduct,
  getSingleProduct,
} from "../../../api/productapi";
import { createAssignedProduct } from "../../../api/assignedProductapi";
import { getUsersInWorkspace } from "../../../api/usersapi";
import AddDeviceButton from "../Add/AddDeviceButton/AddDeviceButton";
import ProductEditForm from "../Edit/EditModalForm";
import { getColumns } from "../ColumnsConfig";
import ColumnSettings from "../ColumnSettingsStock";
import { DeviceFormMessages } from "../../../constants/constants";
import { fetchCategories, fetchTypes } from "../../../api/assetAPI";
import { getAllBranches } from "../../../api/companyapi";
import ImportProductButton from "./ImportButton";
import { toastError, toastSuccess } from "../../../Utility/toast";

const { Title } = Typography;

const ListStock = () => {
  const [, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  // const [showToaster, setShowToaster] = useState(false);
  const [userList, setUserList] = useState([]);
  const [description, setDescription] = useState("");
  const { deviceCategory, refreshstock } = useContext(StockContext);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [devicesDetails, setDevicesDetails] = useState([]);
  const [response, error, loading] = useAxios();
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [showRemoveDeviceModal, setShowRemoveDeviceModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState([]);
  const [selectedStockId, setSelectedStockId] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const { workspacename } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const removeDeviceIdRef = useRef(null);

  const [assetCondition, setAssetCondition] = useState(null);
  const [assetStatus, setAssetStatus] = useState(null);
  const [branch, setBranch] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);

  const [form] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [branches, setBranches] = useState([]);
  const { Title } = Typography;

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const response = await getAllBranches();
        if (response?.branches) {
          setBranches(response.branches);
        } else {
          console.error("No branches found in the response");
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    loadBranches();
  }, []);

  // Edit Modal: fetch product details and prefill form
  const openEditModal = useCallback(
    async (productId) => {
      try {
        const productData = await getSingleProduct(productId);
        // Destructure the nested product object
        const { product } = productData;
        setEditingProduct(product);
        // Reset form before setting new values
        form.resetFields();
        // Prefill the form using the nested product object
        form.setFieldsValue({
          systemBrand: product.systemBrand || "",
          systemModel: product.systemModel || "",
          accessoriesName: product.accessoriesName || "",
          assetCondition: product.assetCondition || "",
          assetStatus: product.assetStatus || "",
          assetDescription: product.assetDescription || "",
          os: product.os || "",
          cpu: product.cpu || "",
          ram: product.ram || "",
          storageType: product.storageType || "",
          storageCapacity: product.storageCapacity || "",
          macAddress: product.macAddress || "",
          productKey: product.productKey || "",
          serialNumber: product.serialNumber || "",
          // Convert dateOfPurchase to moment if available
          dateOfPurchase: product.dateOfPurchase
            ? moment(product.dateOfPurchase)
            : null,
          warrantyPeriod: product.warrantyPeriod || "",
          productTypeName: product.productTypeName,
          productCategoryName: product.productCategoryName,
          branch: product.branch,
        });
        setEditModalVisible(true);
      } catch (error) {
        // message.error(DeviceFormMessages.FAILED_FETCH_PRODUCT);
        toastError({
          title: "Error",
          description: DeviceFormMessages.FAILED_FETCH_PRODUCT,
        });
      }
    },
    [form]
  );

  // Update product function
  const handleUpdateProduct = async () => {
    try {
      const values = await form.validateFields();

      const formData = new FormData();
      formData.append("accessoriesName", values.accessoriesName);
      formData.append("serialNumber", values.serialNumber);
      formData.append("warrantyPeriod", values.warrantyPeriod);
      formData.append("assetCondition", values.assetCondition);
      formData.append("assetStatus", values.assetStatus);

      if (values.assetDescription) {
        formData.append("assetDescription", values.assetDescription);
      }

      if (values.dateOfPurchase) {
        formData.append(
          "dateOfPurchase",
          moment(values.dateOfPurchase).format("YYYY-MM-DD")
        );
      }

      // File fields
      if (values.assetImage instanceof File) {
        formData.append("assetImage", values.assetImage);
      }

      if (values.assetDocument instanceof File) {
        formData.append("assetDocument", values.assetDocument);
      }

      // Conditional system details
      if (values.showSystemDetails) {
        formData.append("systemBrand", values.systemBrand);
        formData.append("systemModel", values.systemModel);
        formData.append("operatingSystem", values.operatingSystem);
        formData.append("ram", values.ram);
        formData.append("storage", values.storage);
        formData.append("macAddress", values.macAddress);
        formData.append("ipAddress", values.ipAddress);
      }

      // Send to backend using your wrapped API function
      await updateProduct(editingProduct._id, formData);

      // message.success(DeviceFormMessages.PRODUCT_UPDATE_SUCC);
      toastSuccess({
        title: "Success",
        description: DeviceFormMessages.PRODUCT_UPDATE_SUCC,
      });
      setEditModalVisible(false);
      setRefresh(!refresh);
    } catch (error) {
      console.error("Update failed:", error);
      // message.error(DeviceFormMessages.FAILED_UPDATE_PRODUCT);
      toastError({
        title: "Error",
        description: DeviceFormMessages.FAILED_UPDATE_PRODUCT,
      });
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      setVisibleCount((prev) => prev + 5); // Load 5 more
    }
  };
  // Modal togglers
  const handleAssignmentModal = useCallback(() => {
    setShowAssignmentModal((prev) => !prev);
  }, []);

  const handleRemoveDeviceModal = () => {
    setShowRemoveDeviceModal(!showRemoveDeviceModal);
    setCurrentPage(1);
  };
  // Delete product
  const handleRemoveDevice = () => {
    setShowLoader(true);
    (async () => {
      const res = await deleteProduct(removeDeviceIdRef.current);
      if (res) {
        setShowLoader(false);
        handleRemoveDeviceModal();
        setRefresh(!refresh);
        // setShowToaster(true);
      }
    })();
  };

  //fetchProducts
  const getAllStockDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllProductByUser();
      if (res?.products) {
        const filteredProducts = res.products.filter(
          (product) =>
            selectedCategory
              ? product.productCategory === selectedCategory
              : true // Filter by category ID
        );
        setDevicesDetails(filteredProducts);
      } else {
        setDevicesDetails([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        if (response?.data) {
          setCategories(response.data); // Set categories to the state
        } else {
          console.error("No categories found in the response");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    loadCategories();
  }, []);

  // Fetch all users in the workspace
  const fetchUsers = useCallback(async () => {
    try {
      const users = await getUsersInWorkspace(workspacename);
      setUserList(
        Object.values(users).filter((usr) => usr.status === "active")
      );
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [workspacename]);

  useEffect(() => {
    getAllStockDetails();
    fetchUsers();
  }, [
    refreshstock,
    selectedCategory,
    deviceCategory,
    refresh,
    fetchUsers,
    getAllStockDetails,
  ]);

  useEffect(() => {
    if (response?.products?.length > 0) {
      const filteredResponse = response.products.filter(
        (product) =>
          product.tag === "notassigned" &&
          product.productCategory === deviceCategory
      );
      setDevicesDetails(filteredResponse);
    }
  }, [response, deviceCategory]);

  // Filter products based on search query
  const filtered = useMemo(() => {
    let filteredResult = devicesDetails;

    if (search) {
      filteredResult = filteredResult.filter((result) => {
        const searchString = search.toLowerCase();
        return (
          result.systemName?.toLowerCase().includes(searchString) ||
          result.accessoriesName?.toLowerCase().includes(searchString)
        );
      });
    }

    if (assetCondition) {
      filteredResult = filteredResult.filter(
        (result) => result.assetCondition === assetCondition
      );
    }

    if (assetStatus) {
      filteredResult = filteredResult.filter(
        (result) => result.assetStatus === assetStatus
      );
    }

    if (branch) {
      filteredResult = filteredResult.filter(
        (result) => result.branchId === branch
      );
    }

    return filteredResult;
  }, [
    search,
    devicesDetails,
    deviceCategory,
    assetCondition,
    assetStatus,
    branch,
  ]);

  const loadTypes = async () => {
    try {
      const types = await fetchTypes();
    } catch (err) {
      console.error("Error loading types", err);
    }
  };

  // For assignment modal
  const handleUserSelection = useCallback((stockId) => {
    if (!stockId) {
      console.error("Invalid Stock ID received:", stockId);
      return;
    }
    setSelectedUserEmail([]);
    setSelectedStockId(stockId);
  }, []);

  useEffect(() => {
    if (selectedStockId !== null) {
      handleAssignmentModal();
    }
  }, [selectedStockId, handleAssignmentModal]);

  const handleUserStockAssignment = async () => {
    try {
      const selectedUser = userList.find(
        (user) => user.email === selectedUserEmail[0]
      );
      if (!selectedUser) {
        // message.error(DeviceFormMessages.SELECT_VALID_USER);
        toastError({
          title: "Error",
          description: DeviceFormMessages.SELECT_VALID_USER,
        });
        return;
      }
      setShowLoader(true);
      await createAssignedProduct({
        user: selectedUser._id,
        product: selectedStockId,
        workspacename: workspacename,
        description: description,
      });

      // message.success(DeviceFormMessages.ASSIGN_SUCC);
      toastSuccess({
        title: "Success",
        description: DeviceFormMessages.ASSIGN_SUCC,
      });
      setShowLoader(false);
      setShowAssignmentModal(false);
    } catch (error) {
      console.error("User Stock Assignment Error:", error);
      setShowLoader(false);
    }
  };

  const columns = useMemo(() => {
    return getColumns(
      setShowRemoveDeviceModal,
      removeDeviceIdRef,
      handleUserSelection,
      openEditModal
    ).filter((col) => visibleColumns.includes(col.title));
  }, [
    visibleColumns,
    setShowRemoveDeviceModal,
    openEditModal,
    removeDeviceIdRef,
    handleUserSelection,
  ]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-3">
      {/* Left Sidebar for Categories */}
      <div
        className="w-full lg:w-1/5 min-h-0 lg:min-h-screen border-r-0 lg:border-r border-border-color pt-3 flex-shrink-0"
        onScroll={handleScroll}
      >
        <h4 className="mb-[20px] lg:mb-[35px]">Categories</h4>
        <Menu
          className="!bg-neutrals-color !shadow-none mr-2"
          mode="vertical"
          selectedKeys={[selectedCategory]}
          onClick={({ key }) => setSelectedCategory(key)}
        >
          {categories.slice(0, visibleCount).map((category) => (
            <Menu.Item className="!shadow-lg !border !border-border-color" key={category._id}>{category.name}</Menu.Item>
          ))}
        </Menu>
      </div>

      {/* Right Main Content */}
      <div className="sm:pb-0 md:pb-16 lg:pb-0 w-full lg:w-4/5">
        <div className="flex justify-between items-center">
          <div></div>
          {/* Title on top */}
          <h1 className="text-center text-2xl lg:text-[32px] text-primary-text font-rubik font-semibold mt-3 mb-[20px]">
            Stock Listing
          </h1>
          <div>
            <ColumnSettings
              visibleColumns={visibleColumns}
              setVisibleColumns={setVisibleColumns}
              deviceCategory={deviceCategory}
            />
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          open={showRemoveDeviceModal}
          onCancel={() => setShowRemoveDeviceModal(false)}
          footer={[
            <Button
              key="cancel"
              onClick={() => setShowRemoveDeviceModal(false)}
            >
              Cancel
            </Button>,
            <Button
              key="delete"
              type="primary"
              danger
              onClick={handleRemoveDevice}
            >
              Delete
            </Button>,
          ]}
        >
          <p>
            Are you sure you want to delete this record? This action cannot be
            undone.
          </p>
        </Modal>
        {/* Assign User Modal */}
        <Modal
          open={showAssignmentModal}
          // onCancel={() => setShowAssignmentModal(false)}
          onCancel={() => {
            setShowAssignmentModal(false);
            setSelectedStockId(null); // Reset stock ID
          }}
          footer={[
            <Button key="cancel" onClick={() => setShowAssignmentModal(false)}>
              Cancel
            </Button>,
            <Button
              key="assign"
              type="primary"
              onClick={handleUserStockAssignment}
              disabled={showLoader}
            >
              {showLoader ? "Assigning..." : "Assign"}
            </Button>,
          ]}
        >
          <p>Select a user:</p>
          <Select
            showSearch
            className="!w-full"
            placeholder="Search and select user email..."
            onChange={(value) => setSelectedUserEmail([value])}
            value={selectedUserEmail}
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            options={userList.map((user) => ({
              label: user.email,
              value: user.email,
            }))}
          />
          <p>Enter a description:</p>
          <Input.TextArea
            placeholder="Enter assignment details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Modal>

        {/* Header */}
        <div className="stock-header">
          {/* Controls on next line */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 items-center">
            {/* Asset Condition Dropdown */}
            <Select
              placeholder="Asset Condition"
              className="filter-bar"
              value={assetCondition}
              onChange={setAssetCondition}
              allowClear={true}
            >
              <Select.Option value="Excellent">Excellent</Select.Option>
              <Select.Option value="Good">Good</Select.Option>
              <Select.Option value="Fair">Fair</Select.Option>
              <Select.Option value="Poor">Poor</Select.Option>
            </Select>

            {/* Asset Status Dropdown */}
            <Select
              placeholder="Asset Status"
              className="filter-bar"
              value={assetStatus}
              onChange={setAssetStatus}
              allowClear={true}
            >
              <Select.Option value="Available">Available</Select.Option>
              <Select.Option value="Assigned">Assigned</Select.Option>
              <Select.Option value="Not Available">Not Available</Select.Option>
            </Select>

            {/* Branch Dropdown */}
            <Select
              placeholder="Branch"
              className="filter-bar"
              value={branch}
              onChange={setBranch}
              allowClear={true}
            >
              {branches.map((branchName, index) => (
                <Select.Option key={index} value={branchName}>
                  {branchName}
                </Select.Option>
              ))}
            </Select>

            <Tooltip title="Search by AssetName">
              <Input.Search
                placeholder="Search"
                onChange={(e) => setSearch(e.target.value)}
                className="filter-bar !w-full"
                allowClear
              />
            </Tooltip>
            <div className="inline-block mt-4">
              <AddDeviceButton
                deviceCategory="Device"
                selectedCategory={deviceCategory}
                loadTypes={loadTypes}
              />
            </div>
            <ImportProductButton refreshProducts={getAllStockDetails} />
          </div>
        </div>

        {/* Edit Product Modal */}
        <Modal
          title="Edit Product"
          visible={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setEditModalVisible(false)}>
              Cancel
            </Button>,
            <Button key="update" type="primary" onClick={handleUpdateProduct}>
              Update
            </Button>,
          ]}
          centered
          width={700}
        >
          {/* <ProductEditForm form={form} /> */}
          <ProductEditForm form={form} deviceCategory={deviceCategory} />
        </Modal>

        {/* Table */}
        <Table
          className="!border !border-border-color !rounded-lg"
          scroll={{ x: "max-content" }}
          columns={columns}
          dataSource={filtered || []}
          rowKey="_id"
          pagination={false}
          loading={loading}
          locale={{
            emptyText: "No devices found for this category or search term.",
          }}
        />
        {/* Pagination */}
        <div className="d-flex justify-content-end mt-3">
          <Pagination
            total={filtered.length}
            pageSize={10}
            current={currentPage}
            onChange={setCurrentPage}
          />
        </div>
        {/* Loading Indicator */}
        {loading && (
          <div className="d-flex justify-content-center">
            <Spin size="large" />
          </div>
        )}
        {/* Error Message */}
        {!loading && error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
};
export default ListStock;
