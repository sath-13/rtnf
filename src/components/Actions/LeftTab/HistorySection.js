import React, { useEffect, useState } from "react";
import { Timeline, Spin, notification, Pagination } from "antd";
import { getActionHistory } from "../../../api/historyapi";
import moment from "moment";
import { HistoryMessages } from "../../../constants/constants";
import { toastError } from "../../../Utility/toast";

const HistorySection = ({ actionId, logHistory }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 5; // Number of items per page

  useEffect(() => {
    const fetchHistory = async (page) => {
      try {
        if (!actionId) return;
        setLoading(true);
        const response = await getActionHistory(actionId, page, pageSize);
        setHistory(response.data); // API returns { data: [], total: number }
        setTotalItems(response.total);
      } catch (error) {
        // notification.error({ message: HistoryMessages.HISTORY_FETCH_ERR, description: error.message });
        toastError({
          title: HistoryMessages.HISTORY_FETCH_ERR,
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory(currentPage);
  }, [actionId, logHistory, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      {loading ? (
        <Spin />
      ) : (
        <>
          <Timeline>
            {history.map((entry) => (
              <Timeline.Item key={entry._id}>
                <strong>{entry.modifiedByName}</strong> modified:
                <ul>
                  {entry.changes.map((change, index) => (
                    <li key={index}>
                      <strong>{change.field}</strong>
                    </li>
                  ))}
                </ul>
                <small>{moment(entry.createdAt).format("LLL")}</small>
              </Timeline.Item>
            ))}
          </Timeline>
          {/* Pagination Component */}
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalItems}
            onChange={handlePageChange}
            className="!mt-4 !text-center"
          />
        </>
      )}
    </div>
  );
};

export default HistorySection;
