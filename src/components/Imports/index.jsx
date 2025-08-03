import React, { useState, useEffect } from 'react';
import './styles.css';
import { useNavigate, useParams } from "react-router-dom";
import { importProjects } from '../../api/projectApi'; // Adjust the import path as needed
import { getUserRole } from '../../Utility/service';


const PopupAlert = ({ message, type }) => (
  <div className={`popupAlertss ${type === 'error' ? 'errorAlertss' : 'successAlertss'}`}>
    {message}
  </div>
);

export default function ImportForm() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessages, setSuccessMessages] = useState([]);
  const [importComplete, setImportComplete] = useState(false);
  

  // useEffect(() => {
  //   const fetchImportData = async () => {
  //     try {
  //       const data = await importProjects();
  //     } catch (err) {
  //       console.error('Error fetching import data:', err);
  //     }
  //   };
  
  //   fetchImportData();
  // }, []);
    const [role, setRole] = useState("");

    useEffect(() => {
      setRole(getUserRole()); // Get role from localStorage
    }, []);
  
    useEffect(() => {
    }, [role]);

  const { workspacename: paramWorkspace } = useParams(); // Get workspace name from URL  
        const [selectedWorkspace, setSelectedWorkspace] = useState(
          localStorage.getItem("selectedWorkspace") || paramWorkspace || ""
        );
      
        useEffect(() => {
          if (paramWorkspace) {
            setSelectedWorkspace(paramWorkspace);
            localStorage.setItem("selectedWorkspace", paramWorkspace);
          }
        }, [paramWorkspace]);
  

  useEffect(() => {
    if (successMessages.length > 0) {
      const timer = setTimeout(() => {
        setSuccessMessages([]);
        if (importComplete) {
          localStorage.setItem("activeSection", "Portfolio management"); // Ensure Portfolio Management opens
        if (role === "superadmin") {
          navigate(`/dashboard/workspacename/${selectedWorkspace}`);
        } else {
          navigate(`/${selectedWorkspace}/dashboard`);
        }
          //navigate('/platform-management-feature/portfolio');
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessages, importComplete, navigate, role, selectedWorkspace]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setImporting(true);
    setError(null);
    setSuccessMessages([]);
    setImportComplete(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await importProjects(formData);
      const results = Array.isArray(data.results) ? data.results : [data.results];
      setSuccessMessages(results);
      setImportComplete(true);
    } catch (err) {
      setError(err.message || 'An unknown error occurred');
      setImportComplete(false);
    } finally {
      setImporting(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setError(null);
    setSuccessMessages([]);
    setImportComplete(false);
  };

  return (
    <div className="containersss">
      <div className="cardsss">
        <h2>Upload</h2>
        <form onSubmit={handleSubmit} className="formss">
          <div className="dropzoness">
            <div className="uploadIconss">📄</div>
            <div>
              <label htmlFor="file-upload" className="upload-label">
                Click to upload
              </label>
              <span> or drag and drop your file here</span>
            </div>
            <div className='inputs'>
            <input
              id="file-upload"
              type="file"
              className="fileInputss"
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              
            />
            </div>
  
                 
            {file && (
              <div className="fileNamess">
                Selected: {file.name}
              </div>
            )}
            <a href="/data/sample_projects.xlsx" download="sample_projects.xlsx"><p className='download-text'>Download Sample File</p></a>
          </div>
          <div className='alert_message'>
          {error && <PopupAlert message={error} type="error" />}
          {successMessages.map((message, index) => (
            <PopupAlert key={index} message={message} type="success" />
              ))}
          </div>


          <div className="buttonContainerss">
            <button type="button" className="buttonss cancelButtonss" onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className={`buttonss submitButtonss ${
                importing || !file ? 'disabledButtonss' : ''
              }`}
              disabled={importing || !file}
            >
              {importing ? 'Importing...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

