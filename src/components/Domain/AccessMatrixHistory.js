import React, { useState, useEffect } from 'react';
import { Table, Typography, Modal, Button } from 'antd';
import { getAccessMatrixHistory } from '../../api/domainapi';
import { toastError } from '../../Utility/toast';
import dayjs from 'dayjs';

const { Title } = Typography;

const AccessMatrixHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const user = JSON.parse(localStorage.getItem("user"));
    const companyId = user?.companyId;

    useEffect(() => {
        if (!companyId) {
            toastError({ title: "Error", description: "Company ID not found." });
            setLoading(false);
            return;
        }

        const fetchHistory = async () => {
            setLoading(true);
            try {
                const response = await getAccessMatrixHistory(companyId);
                if (response.success) {
                    setHistory(response.data);
                } else {
                    toastError({ title: "Error", description: "Failed to load modification history." });
                    setHistory([]);
                }
            } catch (error) {
                console.error("Error fetching history:", error);
                toastError({ title: "Error", description: "Something went wrong while fetching history." });
                setHistory([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [companyId]);

    const renderChangeDiff = (record) => {
        if (!record.previousMatrix || !record.newMatrix) return <div>No diff available.</div>;
        // Build a readable diff for each role
        const diffs = [];
        const prev = record.previousMatrix || [];
        const next = record.newMatrix || [];
        next.forEach((roleNew, idx) => {
            const rolePrev = prev[idx] || {};
            const roleName = roleNew.roleName || `Role ${idx+1}`;
            const changes = [];
            Object.keys(roleNew).forEach((key) => {
                if (key === 'roleName' || key === 'key') return;
                const oldVal = rolePrev[key];
                const newVal = roleNew[key];
                if (oldVal !== newVal) {
                    // Format 0/1 as false (0)/true (1)
                    const formatVal = (val) => val === 1 ? 'true' : val === 0 ? 'false' : val;
                    changes.push(
                        <div key={key}>
                            <b>{key}:</b> {formatVal(oldVal)} → {formatVal(newVal)}
                        </div>
                    );
                }
            });
            if (changes.length > 0) {
                diffs.push(
                    <div key={roleName} style={{ marginBottom: 8 }}>
                        <b>Role:</b> {roleName}
                        <div style={{ marginLeft: 16 }}>{changes}</div>
                    </div>
                );
            }
        });
        return diffs.length > 0 ? diffs : <div>No changes detected.</div>;
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: 'Modified By',
            dataIndex: 'modifiedBy',
            key: 'modifiedBy',
            render: (user) => user ? `${user.fname} ${user.lname} (${user.username})` : 'N/A',
        },
        {
            title: 'Email',
            dataIndex: 'modifiedBy',
            key: 'email',
            render: (user) => user?.email || 'N/A',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: () => 'Updated Role Access Matrix',
        },
        {
            title: 'Changes',
            key: 'changes',
            render: (_, record) => (
                <Button onClick={() => { setSelectedRecord(record); setModalVisible(true); }}>
                    View
                </Button>
            ),
        },
    ];

    return (
        <div className="history-container" style={{ padding: '20px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>Access Matrix Modification History</Title>
            <Table
                columns={columns}
                dataSource={history}
                loading={loading}
                rowKey={(record) => record._id || record.createdAt}
                bordered
            />
            <Modal
                title="Matrix Changes"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                {selectedRecord && renderChangeDiff(selectedRecord)}
            </Modal>
        </div>
    );
};

export default AccessMatrixHistory;