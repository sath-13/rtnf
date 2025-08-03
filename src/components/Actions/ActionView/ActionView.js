import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import ActionDash from "../ActionDash/ActionDash";
import { getActionDetails } from "../../../api/actionapi";
import "./ActionView.css";
import { ActionMessages } from "../../../constants/constants";
import { toastError, toastWarning } from "../../../Utility/toast";

const ActionView = () => {
  const { actionId } = useParams();
  const navigate = useNavigate();
  const loggedUser = JSON.parse(localStorage.getItem("user"))?.id || JSON.parse(localStorage.getItem("user"))?._id || null;
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedUser) {
      // message.warning(ActionMessages.LOGIN_TO_VIEW);
      toastWarning({ title: "Warning", description: ActionMessages.LOGIN_TO_VIEW });
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/");
      return;
    }

    const fetchAction = async () => {
      try {
        const response = await getActionDetails(actionId);
        if (response?.data) {
          setAction(response.data);
        } else {
          // message.error(ActionMessages.ACTION_NOT_FOUND);
          toastError({ title: "Error", description: ActionMessages.ACTION_NOT_FOUND });
          navigate("/");
        }
      } catch (error) {
        // message.error(ActionMessages.ACTION_FETCH_ERR);
        toastError({ title: "Error", description: ActionMessages.ACTION_FETCH_ERR });
        console.error("Fetch action error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAction();
  }, [actionId, loggedUser, navigate]);

  const handleClose = () => {
    navigate(-1); // Navigate back when clicking outside
  };

  if (loading) return <Spin />;

  return (
    <div className="overlay" onClick={handleClose}>
      <div className="content-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="heading">Action Details</h2>
        {action ? (
          <ActionDash
            selectedActionId={action._id}
            CreatedBy={action.CreatedBy}
            userAssigned={action.userAssigned}
            subAssigned={action.subAssigned || []}
            loggedInUser={loggedUser}
            isFromList={true}
            isViewing={true}
          />
        ) : (
          <Spin />
        )}
      </div>
    </div>
  );
};

export default ActionView;
