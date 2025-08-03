import React, { useState, useEffect } from "react";
import { Input, Button, Select, message, Tooltip } from "antd";
import { createPostAPI } from "../../../api/postapi";
import { EditOutlined, ToolFilled } from "@ant-design/icons";
import "./PostForm.css";
import { FeedMessages } from "../../../constants/constants";
import { toastError, toastSuccess, toastWarning } from "../../../Utility/toast";

const { TextArea } = Input;
const { Option } = Select;

const PostForm = ({ workspacename, onPostSuccess }) => {
  const [content, setContent] = useState("");
  const [target, setTarget] = useState("workspace");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teams, setTeams] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.teamTitle && Array.isArray(user.teamTitle)) {
      setTeams(user.teamTitle);
      setRole(user.role);
      if (user.teamTitle.length === 1) {
        setSelectedTeam(user.teamTitle[0]);
      }
    }
  }, []);

  const handlePost = async () => {
    if (!content.trim()) {
      return toastWarning({ title: "Warning", description: FeedMessages.POST_FEED_CONTENT_WARN }); //message.warning(FeedMessages.POST_FEED_CONTENT_WARN);
    }

    const teamNameToSend = target === "team" ? selectedTeam : null;

    if (target === "team" && !teamNameToSend) {
      return toastWarning({ title: "Warning", description: FeedMessages.POST_SELECT_TEAM_WARN }); //message.warning(FeedMessages.POST_SELECT_TEAM_WARN);
    }

    setLoading(true);
    try {
      await createPostAPI({
        content,
        target,
        workspacename,
        teamname: teamNameToSend,
      });
      // message.success(FeedMessages.POST_CREATE_SUCC);
      toastSuccess({ title: "Success", description: FeedMessages.POST_CREATE_SUCC });
      setContent("");
      setTarget("workspace");
      setSelectedTeam("");

      window.dispatchEvent(new Event("post-updated"));

      onPostSuccess();
    } catch (err) {
      // message.error(FeedMessages.POST_CREATE_FAIL);
      toastError({ title: "Error", description: FeedMessages.POST_CREATE_FAIL });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-form">
      <div className="post-tabs">
        <div className="post-tab active">
          <EditOutlined className="icon" /> <span>Post</span>
        </div>
      </div>

      <Tooltip title="Write your post here">
        <TextArea
          placeholder="Write your post here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoSize={{ minRows: 4, maxRows: 6 }}
          className="textarea-style"
        />
      </Tooltip>
      <strong className="text-sm font-inter"> Posting to: </strong>
      <Select
        value={target}
        onChange={setTarget}
        className="select-post-target font-inter"
      >
        <Option value="workspace">Organization</Option>
        <Option value="team">Team</Option>
      </Select>

      {target === "team" && (
        <Select
          placeholder="Select Team"
          value={selectedTeam}
          onChange={setSelectedTeam}
          className="!mt-[10px] !w-full max-w-[220px]"
        >
          {teams.map((team, idx) => (
            <Option key={idx} value={team}>
              {team}
            </Option>
          ))}
        </Select>
      )}

      <div className="post-footer">
        <div></div>
        <div className="right-actions">
          <Button className="button-cancel !font-inter !hover:border-primary-color !hover:text-primary-color" onClick={() => setContent("")}>
            Cancel
          </Button>
          <Button
            className="button-post !font-inter"
            loading={loading}
            onClick={handlePost}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostForm;
