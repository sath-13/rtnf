import React, { useState, useEffect } from "react"
import { FaEllipsisH } from "react-icons/fa"
import { MdEdit, MdDelete } from "react-icons/md"
import { getUsersByTeamTitle } from "../../api/projectApi"
import { getUserRole } from "../../Utility/service"
import { updateTeam, deleteTeam } from "../../api/team-admin"
import { message } from "antd"
import { DeleteModal } from "./DeleteModal"
import { useParams } from "react-router-dom"
import { toastError, toastSuccess } from "../../Utility/toast"

export const PodCard = ({ team, onClick, onDelete }) => {
  const [activeMembers, setActiveMembers] = useState(0)
  const [inactiveMembers, setInactiveMembers] = useState(0)
  const [teamMembers, setTeamMembers] = useState([])
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(team.teamTitle)
  const [editedDescription, setEditedDescription] = useState(team.teamDescriptions || "")
  const [teamData, setTeamData] = useState(team)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [role, setRole] = useState("")
  const [validationErrors, setValidationErrors] = useState({})
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const roleFromLocalStorage = getUserRole();
    setRole(roleFromLocalStorage); // Get role from localStorage
  }, []);

  useEffect(() => {
  }, [role]);

  /*
    const handleFetchUserData = async () => {
      try {
        const { success, data, error } = await getUserData(userId, setRole)
        if (success) {
        } else {
          console.error("Error fetching user data:", error)
        }
      } catch (error) {
        console.error("Error in handleFetchUserData:", error)
      }
    }
  */

  /*
    useEffect(() => {
      //handleFetchUserData()
      const fetchTeamMembers = async () => {
        try {
          const members = await getUsersByTeamId(team._id)
          if (!Array.isArray(members)) {
            throw new Error("Fetched data is not an array")
          }
          const active = members.filter((member) => member.status === "active").length
          const inactive = members.length - active
          setActiveMembers(active)
          setInactiveMembers(inactive)
          setTeamMembers(members)
          setError(null)
        } catch (error) {
          console.error("Error fetching team members:", error)
          setError(error.message)
        }
      }
      fetchTeamMembers()
    }, [team._id])
  */

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
    const fetchTeamMembers = async () => {
      try {
        if (!team.teamTitle || team.teamTitle.length === 0) {
          console.error("No team title provided");
          return;
        }

        // Pass workspaceName along with teamTitle
        const members = await getUsersByTeamTitle(selectedWorkspace, team.teamTitle);

        if (!Array.isArray(members)) {
          throw new Error("Fetched data is not an array");
        }

        const active = members.filter((member) => member.status === "active").length;
        const inactive = members.length - active;

        setActiveMembers(active);
        setInactiveMembers(inactive);
        setTeamMembers(members);
        setError(null);
      } catch (error) {
        console.error("Error fetching team members:", error);
        setError(error.message);
      }
    };

    fetchTeamMembers();
  }, [team.teamTitle, selectedWorkspace]); // Added selectedWorkspace dependency

  const handleDeleteTeam = async () => {
    setIsDeleteModalOpen(false)
    try {
      const { success, message: responseMessage } = await deleteTeam(team._id)
      if (success) {
        // Remove this line to avoid duplicate messages
        // message.success(responseMessage);
        if (typeof onDelete === "function") {
          onDelete(team._id)
        } else {
          console.warn("onDelete is not a function or not provided")
        }
      } else {
        // message.error(responseMessage)
        toastError({ title: "Error", description: responseMessage })
      }
    } catch (error) {
      console.error("Error deleting team:", error)
      // message.error("Failed to delete team")
      toastError({ title: "Error", description: "Failed to delete team" })
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    setIsEditing(true)
    setValidationErrors({})
  }

  const validateForm = () => {
    const errors = {}
    if (!editedTitle.trim()) {
      errors.title = "Team title cannot be empty"
    }
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(editedDescription)) {
      errors.description = "Team description cannot contain numbers or special characters"
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async (e) => {
    e.stopPropagation()
    if (!validateForm()) {
      return
    }
    try {
      const updatedData = {
        teamTitle: editedTitle.trim(),
        teamDescriptions: editedDescription.trim(),
      }
      const result = await updateTeam(team._id, updatedData)
      if (result.success) {
        setTeamData({
          ...teamData,
          teamTitle: result.data.teamTitle,
          teamDescriptions: result.data.teamDescriptions,
        })
        setIsEditing(false)
        // message.success("Team updated successfully")
        toastSuccess({ title: "Success", description: "Team updated successfully" })
      } else {
        setError(result.message)
        // message.error(result.message)
        toastError({ title: "Error", description: result.message })
      }
    } catch (error) {
      console.error("Error updating team:", error)
      setError("Failed to update team")
      // message.error("Failed to update team")
      toastError({ title: "Error", description: "Failed to update team" })
    }
  }

  const handleCancel = (e) => {
    e.stopPropagation()
    setEditedTitle(teamData.teamTitle)
    setEditedDescription(teamData.teamDescriptions || "")
    setIsEditing(false)
    setValidationErrors({})
  }

  const handleCardClick = (e) => {
    if (!isEditing && onClick) {
      onClick()
    }
  }

  const toggleDropdown = (e) => {
    e.stopPropagation(); // Prevent card click event
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent card click event
    setIsDropdownOpen(false); // Close the dropdown
    setIsDeleteModalOpen(true);
  };

  if (error) {
    return <div className="podCard error">Error: {error}</div>
  }

  return (
    <>
      <div className={`podCard ${isEditing ? "editing" : ""}`} onClick={handleCardClick}>
        <div className="podHeader">
          <div className="podAvatar">{teamData.teamTitle[0]}</div>

          <div className="podInfo">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className={`editInput ${validationErrors.title ? "error" : ""}`}
                  onClick={(e) => e.stopPropagation()}
                />
                {validationErrors.title && <p className="errorMessage">{validationErrors.title}</p>}
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className={`editTextarea ${validationErrors.description ? "error" : ""}`}
                  onClick={(e) => e.stopPropagation()}
                />
                {validationErrors.description && <p className="errorMessage">{validationErrors.description}</p>}
              </>
            ) : (
              <>
                <h3 className="podName">
                  {teamData.teamTitle}
                  {/*(role === "superadmin" || role === "admin") && (
                    <button className="editButton" onClick={handleEdit}>
                      <MdEdit />
                    </button>
                  )*/}
                  {role && (role === "superadmin" || role === "admin") ? (
                    <button className="editButton" onClick={handleEdit}>
                      <MdEdit />
                    </button>
                  ) : null}
                </h3>
                <p className="podDescription">{teamData.teamDescriptions || "No description available"}</p>
              </>
            )}
          </div>
          {isEditing ? (
            <div className="editButtons">
              <button className="saveButton" onClick={handleSave}>
                Save
              </button>
              <button className="cancelButton" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="moreButton" onClick={toggleDropdown}>
              <FaEllipsisH />
            </button>
          )}
        </div>
        <div className="podStats">
          <div className="memberCount">
            <span className="statNumber">{activeMembers} Active</span>
            <span className="statDivider">•</span>
            <span className="statNumber">{inactiveMembers} Inactive</span>
          </div>
          <div className="memberAvatars">
            {teamMembers.slice(0, 3).map((member, index) => (
              <div key={index} className="smallAvatar">
                {member.fname ? member.fname[0] : "?"}
              </div>
            ))}
            {teamMembers.length > 3 && <div className="moreMembers">+{teamMembers.length - 3}</div>}
          </div>
        </div>
        <button className="viewDetails">View Details</button>

        {/* Ellipsis Button for Actions */}
        <div className="dropdownContainer">
          {isDropdownOpen && (
            <div className="dropdownMenu">
              {role && (role === "superadmin" || role === "admin") && (
                <>
                  <button className="dropdownItem" onClick={handleDeleteClick}>
                    <MdDelete /> Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteTeam}
        teamName={teamData.teamTitle}
      />
    </>
  )
}

