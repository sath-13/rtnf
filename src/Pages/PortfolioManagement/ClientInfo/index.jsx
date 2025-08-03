import React, { useState, useEffect, useCallback } from "react"
import { FaCode, FaBullseye } from "react-icons/fa"
import { CardContent } from "../../../components/ClientInfo/Cards"
import { Avatar } from "../../../components/ClientInfo/Avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ClientInfo/Tabs"
import SearchBar from "../../../components/ClientInfo/SearchBar"
import ProjectCard from "../../../components/ProjectCard"
import {
  getClientInfo,
  getAllProjects,
  getTechStackById,
  updateClient,
  deleteClient,
  uploadClientPhoto,
  deleteClientPhoto,
} from "../../../api/projectApi"
import "./ClientInfo.scss"
import { useParams, useNavigate } from "react-router-dom"
import data from "../../../components/data/stats.json"
import { Button, Upload } from "antd"
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons"
import loader from "../../../assests/images/loader.svg"
import { getUserRole } from "../../../Utility/service"
import { MdEdit, MdDelete, MdUpload } from "react-icons/md"
import { toastError, toastSuccess } from "../../../Utility/toast"
import Spinner from "../../../components/Spinner/Spinner"

const ClientInfo = () => {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState("work")
  const [searchQuery, setSearchQuery] = useState("")
  const [clientInfo, setClientInfo] = useState(null)
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [techStack, setTechStack] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentProjectPage, setCurrentProjectPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(3)
  const [isEditing, setIsEditing] = useState(false)
  const [editedClient, setEditedClient] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [, setClientImage] = useState(null)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [, setSelectedFileName] = useState("")
  const [role, setRole] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1286) {
        setItemsPerPage(3)
      } else if (window.innerWidth >= 600) {
        setItemsPerPage(2)
      } else {
        setItemsPerPage(1)
      }
    }
    window.addEventListener("resize", handleResize)
    handleResize() // Call it initially
    return () => window.removeEventListener("resize", handleResize)
  }, [])



  useEffect(() => {
    const roleFromLocalStorage = getUserRole();
    setRole(roleFromLocalStorage); // Get role from localStorage
  }, []);

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

  /*
const handleFetchUserData = async () => {
try {
const { success, data, error } = await getUserData(userId, setRole)
if (success) {
// Handle success if needed
} else {
console.error("Error fetching user data:", error)
}
} finally {
// Any cleanup if needed
}
}
*/

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientData, allProjectsResponse] = await Promise.all([getClientInfo(id), getAllProjects()]);
      setClientInfo(clientData);
      setEditedClient(clientData.client);

      let allProjects = [];
      if (allProjectsResponse?.success && Array.isArray(allProjectsResponse.projects)) {
        allProjects = allProjectsResponse.projects;
      } else {
        throw new Error("Invalid projects data received");
      }

      const clientProjects = allProjects.filter(
        (project) => project?.client_id?._id === clientData.client._id
      );

      setProjects(clientProjects);
      setFilteredProjects(clientProjects);

      const allTechStackIds = clientProjects.flatMap((project) => project.techStack || []);
      const uniqueTechStackIds = Array.from(new Set(allTechStackIds));

      const techStackDetails = await Promise.all(uniqueTechStackIds.map(getTechStackById));
      const uniqueTechStackDetails = Array.from(new Map(techStackDetails.map((tech) => [tech._id, tech])).values());
      setTechStack(uniqueTechStackDetails);
    } catch (error) {
      console.error("Error during data fetch:", error);
    } finally {
      setLoading(false);
    }
  }, [id]); //  Depend on `id` only

  useEffect(() => {
    fetchData();
  }, [fetchData]); //  Now ESLint won't complain

  if (loading) {
    return <Spinner />
  }

  if (!clientInfo) {
    return <div>No client information found.</div>
  }

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return ""
    return name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const iconMap = {
    FaCode: FaCode,
    FaBullseye: FaBullseye,
  }

  const stats = data.statsData.map((stat) => ({
    ...stat,
    icon: iconMap[stat.icon],
    value: stat.title === "Projects" ? projects.length : stat.value,
  }))

  const projectPageCount = Math.ceil(filteredProjects.length / itemsPerPage)
  const currentProjects = filteredProjects.slice(
    (currentProjectPage - 1) * itemsPerPage,
    currentProjectPage * itemsPerPage,
  )

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!editedClient.name.trim()) {
      // toast.error("Client name cannot be empty")
      toastError({ title: "Error", description: "Client name cannot be empty" });
      return
    }

    try {
      setIsImageLoading(true)
      await updateClient(id, editedClient)

      setClientInfo((prevClientInfo) => ({
        ...prevClientInfo,
        client: {
          ...editedClient,
          image: prevClientInfo.client.image,
        },
      }))
      setIsEditing(false)

      // toast.success("Client details updated successfully!")
      toastSuccess({ title: "Success", description: "Client details updated successfully!" });
    } catch (error) {
      // toast.error("Failed to update client details.")
      toastError({ title: "Error", description: "Failed to update client details." });
      console.error("Error updating client:", error)
    } finally {
      setIsImageLoading(false)
    }
  }

  const handleCancel = () => {
    setEditedClient(clientInfo.client)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    try {
      await deleteClient(id)
      setIsDeleteDialogOpen(false)
      localStorage.setItem("activeSection", "Portfolio management"); // Ensure Portfolio Management opens
      if (role === "superadmin") {
        navigate(`/dashboard/workspacename/${selectedWorkspace}`);
      } else {
        navigate(`/${selectedWorkspace}/dashboard`);
      }
      //navigate("/platform-management-feature/portfolio")
    } catch (error) {
      console.error("Error deleting client:", error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedClient({ ...editedClient, [name]: value })
  }

  const handleImgUpload = async (file) => {
    if (!file || !id) return
    setIsImageLoading(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      const response = await uploadClientPhoto(id, formData)
      if (response?.status === 200) {
        // toast.success(response?.data?.message)
        toastSuccess({ title: "Success", description: response?.data?.message });
        setClientInfo((prevState) => ({
          ...prevState,
          client: {
            ...prevState.client,
            image: response?.data?.client?.image,
          },
        }))
        setClientImage(null)
        setSelectedFileName("")
      }
    } catch (error) {
      // toast.error("Client image upload unsuccessful")
      toastError({ title: "Error", description: "Client image upload unsuccessful" });
    } finally {
      setIsImageLoading(false)
    }
  }

  const deleteClientImage = async () => {
    if (!id) return
    try {
      setIsImageLoading(true)
      const response = await deleteClientPhoto(id)
      if (response?.status === 200) {
        // toast.success(response?.data?.message)
        toastSuccess({ title: "Success", description: response?.data?.message });
        setClientInfo((prevState) => ({
          ...prevState,
          client: {
            ...prevState.client,
            image: "",
          },
        }))
      }
    } catch (error) {
      // toast.error("Client image delete unsuccessful")
      toastError({ title: "Error", description: "Client image delete unsuccessful" });
    } finally {
      setIsImageLoading(false)
    }
  }

  return (
    <div className="portfolio-page">
      <div className="profile-section">
        <div>
          {clientInfo.client.image ? (
            <Avatar
              size={90}
              src={clientInfo.client.image}
              alt={getInitials(clientInfo.client.name)}
              className="profile-card__avatar text-white"
            />
          ) : (
            <div className="profile-avatar text-white">
              {getInitials(clientInfo.client.name)}
            </div>
          )}
          <div>
            <div className="image-upload-container text-center">
              {(
                //role === "superadmin" || role === "admin"
                role && (role === "superadmin" || role === "admin")
              ) && (
                  <>
                    {!clientInfo.client.image && (
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        customRequest={({ onSuccess }) => {
                          setTimeout(() => {
                            onSuccess && onSuccess("ok")
                          }, 0)
                        }}
                        beforeUpload={(file) => {
                          const isImage = file.type.startsWith("image/")
                          if (!isImage) {
                            // message.error(`${file.name} is not an image file`)
                            toastError({ title: "Error", description: `${file.name} is not an image file` });
                          } else {
                            setClientImage(file)
                            handleImgUpload(file)
                          }
                          return false // Prevent default upload behavior
                        }}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          className="!text-[12px] !bg-[#2952BF] !text-white !mt-6 !mb-2.5 !w-full"
                        >
                          <MdUpload />
                          {isImageLoading ? (
                            <img className="w-[22px]" src={loader || "/placeholder.svg"} alt="loader" />
                          ) : (
                            "Upload Image"
                          )}
                        </Button>
                      </Upload>
                    )}
                    {clientInfo.client.image && (
                      <Button
                        icon={<DeleteOutlined />}
                        className="!text-[12px] !mt-2.5 !mb-2.5"
                        onClick={deleteClientImage}
                      >
                        <MdDelete />
                        {isImageLoading ? (
                          <img className="w-[22px]" src={loader || "/placeholder.svg"} alt="loader" />
                        ) : (
                          "Delete Photo"
                        )}
                      </Button>
                    )}
                  </>
                )}
            </div>
          </div>
        </div>
        <div className="profile-info">
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                name="name"
                value={editedClient.name}
                onChange={handleInputChange}
                placeholder="Client Name (required)"
                className="edit-input"
                required
              />
              <input
                type="text"
                name="point_of_contact"
                value={editedClient.point_of_contact}
                onChange={handleInputChange}
                placeholder="Point of Contact"
                className="edit-input"
              />
              <input
                type="text"
                name="contact_info"
                value={editedClient.contact_info}
                onChange={handleInputChange}
                placeholder="Email"
                className="edit-input"
              />
              <textarea
                name="description"
                value={editedClient.description}
                onChange={handleInputChange}
                placeholder="Description"
                className="edit-input"
                rows="4"
              ></textarea>
              <div className="edit-actions">
                <Button onClick={handleSave}>Save</Button>
                <Button onClick={handleCancel}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="profile-header">
                <h1 className="profile-name">{clientInfo.client.name}</h1>
              </div>
              <p className="profile-title">Point of Contact: {clientInfo.client.point_of_contact}</p>
              <p className="profile-title">{clientInfo.client.description}</p>
              <p className="profile-location">{clientInfo.client.contact_info}</p>

              {(
                //role === "superadmin" || role === "admin"
                role && (role === "superadmin" || role === "admin")
              ) && (
                  <Button className="editButton !mr-2.5" onClick={handleEdit}>
                    <MdEdit />
                  </Button>
                )}

              {(
                role && (role === "superadmin" || role === "admin")
                //role === "superadmin" || role === "admin"
              ) && (
                  <Button className="deleteButton" onClick={() => setIsDeleteDialogOpen(true)}>
                    <MdDelete />
                  </Button>
                )}
            </>
          )}
        </div>
        <div className="tech-stack">
          <p className="tech-stack-title">Tech Stack:</p>
          <div className="tech-stack-icons">
            {techStack.map((tech, index) => (
              <span key={index} className="tech-item">
                {tech.name}
              </span>
            ))}
          </div>
        </div>
        <div className="profile-details">
          <div className="content-container">
            <div className="stats-grid">
              {stats.map(({ title, value, prefix, icon: Icon }) => (
                <div key={title} className="info-boxs">
                  <CardContent>
                    <div className="stat-header">
                      <Icon className="stat-icon" />
                      <p className="stat-title">{title}</p>
                    </div>
                    <p className="stat-value">
                      {prefix}
                      {value.toLocaleString()}
                    </p>
                  </CardContent>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Tabs>
        <TabsList>
          <TabsTrigger isActive={activeTab === "work"} onClick={() => setActiveTab("work")}>
            Projects
          </TabsTrigger>
        </TabsList>
        <TabsContent isActive={activeTab === "work"}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            projects={projects}
            setFilteredProjects={setFilteredProjects}
          />
          <div className="projects-container">
            {currentProjects.length > 0 ? (
              currentProjects.map((project) => (
                <div key={project._id} className="project-item">
                  <ProjectCard project={project} techStack={techStack} />
                </div>
              ))
            ) : (
              <div className="no-projects-message">
                <p>No projects found</p>
              </div>
            )}
          </div>
          <div className="pagination1">
            <button
              onClick={() => setCurrentProjectPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentProjectPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <span className="pagination-info">
              {currentProjectPage} of {projectPageCount}
            </span>
            <button
              onClick={() => setCurrentProjectPage((prev) => Math.min(prev + 1, projectPageCount))}
              disabled={currentProjectPage === projectPageCount}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </TabsContent>
      </Tabs>
      {isDeleteDialogOpen && (
        <div className="delete-dialog-overlay">
          <div className="delete-dialog-container">
            <h2 className="delete-dialog-title">Are you sure you want to delete this client?</h2>
            <p className="delete-dialog-message">
              This action cannot be undone. This will permanently delete the client and all associated data.
            </p>
            <div className="delete-dialog-actions">
              <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleDelete} className="danger">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientInfo

