import React, { useEffect, useState } from "react";
import { getInternalNodesByUser } from "../../../../api/feedbackapi";
import { Card, Spin, Empty } from "antd";




const InternalNodeList = ({ userId }) => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInternalNodes = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const data = await getInternalNodesByUser(userId);
        setNodes(data);
      } catch (error) {
        console.error("Failed to fetch internal nodes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInternalNodes();
  }, [userId]);

  return (
    <div className="p-5">
      {loading ? (
        <Spin />
      ) : nodes.length === 0 ? (
        <Empty description="No Internal Notes Found" />
      ) : (
        nodes.map((node) => (
          <Card
            key={node._id}
            title={`Workspace: ${node.workspacename}`}
            className="!mb-4 !rounded-[10px]"
          >
            <p><strong>Given By:</strong> {node.givenByName}</p>
            <p><strong>Description:</strong> <span dangerouslySetInnerHTML={{ __html: node.description }} /></p>
            <p><small>Created At: {new Date(node.createdAt).toLocaleString()}</small></p>
          </Card>
        ))
      )}
    </div>
  );
};


export default InternalNodeList;
