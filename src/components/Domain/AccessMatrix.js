import React, { useState, useEffect } from "react";
import { Table, Typography, Button, Switch } from "antd";
import {
  fetchMatrixByCompanyId,
  fetchRolesByCompanyId,
  updateAccessMatrix,
  logAccessMatrixChange,
  getAllRoles,
} from "../../api/domainapi";
import "./AccessMatrix.css";
import { toastError, toastSuccess } from "../../Utility/toast";

const { Title } = Typography;
const AccessMatrix = () => {
  const [roles, setRoles] = useState([]);
  const [matrixData, setMatrixData] = useState([]);
  const [previousMatrix, setPreviousMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.companyId;

  const modules = [
    "Home",
    "My Organization",
    "System & Accessories",
    "Actions ",
    "Domain Setup",
    "Portfolio",
    "Project Calendar",
    "Events",
    "Hiring",
    "Inbox"
  ];

  useEffect(() => {
    if (!companyId) {
      toastError({ title: "Error", description: "Company ID not found." });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch roles from RoleAccess table instead of users
        const rolesResponse = await getAllRoles(companyId);
        const roles = rolesResponse.success ? rolesResponse.roles : [];
        const matrixResponse = await fetchMatrixByCompanyId(companyId);

        if (matrixResponse.success) {
          const matrix = matrixResponse.data;
          setRoles(roles);
          initializeMatrixFromDB(roles, matrix);
          setPreviousMatrix(
            roles.map((role, index) => {
              const row = {
                key: index,
                roleName: role,
              };
              modules.forEach((module) => {
                const entry = matrix.find(
                  (item) => item.roleName === role && item.moduleName === module
                );
                row[module] = entry ? entry.access : 0;
              });
              return row;
            })
          );
        } else {
          toastError({
            title: "Error",
            description: "Failed to load access matrix.",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toastError({
          title: "Error",
          description: "Something went wrong while fetching data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId, refreshKey]);

  const initializeMatrixFromDB = (roles, accessData) => {
    const initialData = roles.map((roleName, index) => {
      const row = {
        key: index,
        roleName,
      };
      modules.forEach((module) => {
        const entry = accessData.find(
          (item) => item.roleName === roleName && item.moduleName === module
        );
        row[module] = entry ? entry.access : 0;
      });
      return row;
    });

    setMatrixData(initialData);
  };

  const handleCellChange = (checked, rowIndex, moduleName) => {
    const updated = [...matrixData];
    updated[rowIndex][moduleName] = checked ? 1 : 0;
    setMatrixData(updated);
  };

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const companyId = user?.companyId;

    if (!companyId) {
      toastError({
        title: "Error",
        description: "Company ID not found. Cannot save matrix.",
      });
      return;
    }

    const payload = [];

    matrixData.forEach((row) => {
      modules.forEach((module) => {
        payload.push({
          companyId,
          roleName: row.roleName,
          moduleName: module,
          access: row[module],
        });
      });
    });

    try {
      const res = await updateAccessMatrix(payload);
      if (res.success) {
        toastSuccess({
          title: "Success",
          description: "Matrix saved successfully!",
        });
        const { fname, lname, username, email } = user;
        const changes = matrixData;
        const logData = {
          companyId,
          changedBy: user?._id || user?.id,
          userInfo: { fname, lname, email, username },
          changes,
          previousMatrix, // Use tracked previous matrix
          newMatrix: matrixData
        };
        await logAccessMatrixChange(logData);
        setPreviousMatrix(matrixData.map(row => ({ ...row }))); // Update previousMatrix after save
      } else {
        toastError({ title: "Error", description: "Failed to save matrix." });
      }
    } catch (error) {
      console.error("Error saving matrix:", error);
      toastError({
        title: "Error",
        description: "Error occurred while saving.",
      });
    }
  };

  const columnsConfig = [
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      width: 150,
      align: "center",
    },
    ...modules.map((module) => ({
      title: module,
      dataIndex: module,
      key: module,
      align: "center",
      render: (text, record, index) => (
        <Switch
          checked={text === 1}
          onChange={(checked) => handleCellChange(checked, index, module)}
        />
      ),
    })),
  ];

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toastSuccess({ title: "Refreshed", description: "Role matrix refreshed successfully!" });
  };

  return (
    <div className="matrix-container">
      <div className="flex justify-between items-center mb-4">
        <h1 className="!text-center text-2xl lg:!text-[32px] text-primary-text font-rubik font-semibold !p-0 !mt-[10px] lg:!mt-4 !mb-5 lg:!mb-8">
          Company Role Matrix
        </h1>
        <Button 
          onClick={handleRefresh}
          loading={loading}
          className="custom-button"
        >
          Refresh
        </Button>
      </div>

      {loading ? (
        <div>Loading roles...</div>
      ) : (
        <Table
          scroll={{ x: "max-content" }}
          className="border border-border-color rounded-lg"
          columns={columnsConfig}
          dataSource={matrixData}
          pagination={false}
          bordered
          rowKey="key"
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell colSpan={columnsConfig.length}>
                <div className="flex justify-end">
                  <Button
                    size="large"
                    className="custom-button save-matrix-button !font-inter !w-auto"
                    type="primary"
                    onClick={handleSave}
                  >
                    Save Matrix
                  </Button>
                </div>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      )}
    </div>
  );
};

export default AccessMatrix;
