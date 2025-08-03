import React, { useState, useEffect } from "react";
import { getAllProductByWorkspacename } from "../../api/productapi";
import "./DashboardSystemAccessories.css";
import { useParams } from "react-router-dom";
import { Typography } from "antd";

const { Title } = Typography

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState([]);
  const { workspacename } = useParams();

  useEffect(() => {
    (async () => {
      try {
        const response = await getAllProductByWorkspacename(workspacename);

        if (response?.products) {
          const { products } = response;

          const assignedCount = products.filter(
            (product) => product.tag === "assigned"
          ).length;

          const availableCount = products.filter(
            (product) => product.tag === "notassigned"
          ).length;

          const totalCount = products.length;

          setDashboardStats([
            {
              category: "Total Assets",
              count: totalCount,
              assigned: assignedCount,
              available: availableCount,
            },
            {
              category: "Assigned Assets",
              count: assignedCount,
              assigned: assignedCount,
              available: 0,
            },
            {
              category: "Available Assets",
              count: availableCount,
              assigned: 0,
              available: availableCount,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    })();
  }, [workspacename]);

  return (
    <div className="sm:mb-0 md:mb-16 lg:mb-0">
      <h1 className="text-center text-2xl lg:text-[32px] text-primary-text font-rubik font-semibold mt-3 mb-[20px]">Assets Summary</h1>
      <div className="stock-main-body container border border-gray-300 rounded-lg">
        <div className="row">
          {dashboardStats.map((item, index) => (
            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12" key={index}>
              <div
                className={`flex flex-col justify-center items-center text-inter text-primary-text summary-card ${item.category === "Total Assets" ? "summary-card-total" : ""
                  }`}
              >
                <div className="text-base text-primary-text font-bold !mb-0 lg:!mb-3 uppercase">{item.category}</div>
                <div className="text-3xl text-primary-text font-bold !mb-0 lg:!mb-4">{item.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

  );
};

export default Dashboard;
