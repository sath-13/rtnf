import React, { useState } from "react";
import Table from "react-bootstrap/Table";

const Request = () => {
  // fake data
  const systemDetailList = [
    {
      id: 1,
      CPU: "Core i7",
      RAM: "1 TB",
      HDD: "2 TB SSD",
      OS: "Windows 11",
      MACAddress: "ab-cd-ef-12-34-56",
      IPAddress: "42.107.76.73",
      AntiVirusStatus: "Active",
      PurchaseDate: "20 12 2010",
      ModelNumber: "HP-25587XC",
      ProductKey: "W269N-WFGWX-YVC9B-4J6C9-T83GX",
    },
  ];

  const [systemDetails] = useState(systemDetailList);

  return (
    <div className="system-details container">
      <h1 className="py-3">John Details</h1>
      <div className="row">
        <div className="col-md-9">
          <h5 className="pb-2 fw-bold">System Name</h5>
          <Table>
            {systemDetails.map((systemDetails) => (
              <tbody className="fw-bold" key={systemDetails.id}>
                <tr>
                  <td>CPU</td>
                  <td>{systemDetails.CPU}</td>
                </tr>
                <tr>
                  <td>RAM</td>
                  <td>{systemDetails.RAM}</td>
                </tr>
                <tr>
                  <td>HDD</td>
                  <td>{systemDetails.HDD}</td>
                </tr>
                <tr>
                  <td>OS</td>
                  <td>{systemDetails.OS}</td>
                </tr>
                <tr>
                  <td>MAC Address</td>
                  <td>{systemDetails.MACAddress}</td>
                </tr>
                <tr>
                  <td>IP Address</td>
                  <td>{systemDetails.IPAddress}</td>
                </tr>
                <tr>
                  <td>Anti Virus Status</td>
                  <td>{systemDetails.AntiVirusStatus}</td>
                </tr>
                <tr>
                  <td>Purchase date</td>
                  <td>{systemDetails.PurchaseDate}</td>
                </tr>
                <tr>
                  <td>Model Number</td>
                  <td>{systemDetails.ModelNumber}</td>
                </tr>
                <tr>
                  <td>Product Key</td>
                  <td>{systemDetails.ProductKey}</td>
                </tr>
              </tbody>
            ))}
          </Table>
          <button type="button" className="btn btn-primary">
            Download Report
          </button>
        </div>
        <div className="col-md-3">
          <div className="row">
            <div className="addition-devices">
              <h6 className="pt-5 pb-3 fw-bold">Additional Devices</h6>
              <h6 className="pb-3 fw-bold">1 Mouse</h6>
              <h6 className="pb-3 fw-bold">1 Keyboard</h6>
            </div>
            <div className="repairs">
              <h6 className="pt-5 pb-3 fw-bold">Repairs</h6>
              <h6 className="pb-3 fw-bold">NA</h6>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Request;
