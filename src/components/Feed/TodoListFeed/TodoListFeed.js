import React, { useEffect, useMemo, useState } from "react";
import {
  Input,
  Button,
  List,
  Checkbox,
  Modal,
  Progress,
  Space,
  Typography,
  Card,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  RetweetOutlined,
} from "@ant-design/icons";
import {
  getTasksByUser,
  saveTasks,
  deleteTaskById,
} from "../../../api/todoApi";
import { jwtDecode } from "jwt-decode";
import "./TodoListFeed.css";

const { Title } = Typography;

const TodoListFeed = () => {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [currentUserId, setCurrentUserId] = useState();
  const [loadedFromLocalStorage, setLoadedFromLocalStorage] = useState(false);

  const LOCAL_STORAGE_TASKS_KEY = useMemo(() => {
    return `tasks_draft_${currentUserId || "guest"}`;
  }, [currentUserId]);

  // Get current user ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded?.id || decoded?.userId);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const saved = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
          setLoadedFromLocalStorage(true);
          return;
        }
      } catch {
        console.warn("Failed to parse tasks from localStorage");
      }
    }

    loadTasks(); // This should only run if no valid local storage
  }, [currentUserId, LOCAL_STORAGE_TASKS_KEY]);

  const loadTasks = async () => {
    try {
      const data = await getTasksByUser();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading tasks:", err);
      setTasks([]);
    }
  };

  // Sync localStorage on tasks change
  useEffect(() => {
    if (!currentUserId) return;
    localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks));
  }, [tasks, currentUserId, LOCAL_STORAGE_TASKS_KEY]);

  const addTask = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      ...prev,
      { text: trimmed, completed: false, recurring: false },
    ]);
    setInput("");
  };

  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  const toggleRecurring = (index) => {
    const updated = [...tasks];
    updated[index].recurring = !updated[index].recurring;
    setTasks(updated);
  };

  const deleteTask = (taskId, index) => {
    Modal.confirm({
      title: "Delete this task?",
      okButtonProps: { className: "custom-button" },
      cancelButtonProps: { className: "custom-cancel-button" },
      onOk: async () => {
        try {
          if (taskId) {
            await deleteTaskById(taskId); // only call API if taskId is valid
          }
          const updated = tasks.filter((_, i) => i !== index);
          setTasks(updated);
        } catch (err) {
          console.error("Delete error:", err);
        }
      },
    });
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditValue(tasks[index].text);
  };

  const saveEdit = (index) => {
    const updated = [...tasks];
    updated[index].text = editValue.trim();
    setTasks(updated);
    setEditIndex(null);
    setEditValue("");
  };

  const handleSubmitTasks = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      await saveTasks(currentUserId, tasks, today);

      const remainingTasks = tasks
        .filter((task) => task.recurring)
        .map((task) => ({ ...task, completed: false }));

      setTasks(remainingTasks);
      localStorage.removeItem(LOCAL_STORAGE_TASKS_KEY);
    } catch (err) {
      console.error("Error submitting tasks:", err);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const completionRate = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  return (
    <div className="!py-5">
      <div className="!px-2 md:!px-5 !py-5 border border-border-color bg-[#fff] mx-auto rounded-xl">
        <h1 className="!text-center !text-xl md:!text-2xl !text-primary-text font-rubik !mb-5">
          📝 Daily Head Start
        </h1>
        <div className="border border-border-color rounded-lg px-2 md:px-5 py-5">
          <div className="w-full flex flex-col md:flex-row gap-2 mb-3">
            <Input
              className="!h-[35px] !rounded-l-[6px]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={addTask}
              placeholder="Add a task (e.g. DHS, plan, etc)"
            />
            <Button
              type="default"
              className="add-button custom-button !rounded-lg"
              icon={<PlusOutlined />}
              onClick={addTask}
            >
              Add
            </Button>
          </div>

          <Progress
            percent={completionRate}
            status="active"
            strokeColor="var(--btn-primary)"
          />
        </div>

        <List
          dataSource={tasks}
          className="custom-task-list"
          locale={{ emptyText: "No tasks yet — add one above!" }}
          renderItem={(task, index) => (
            <List.Item
              actions={[
                <Button
                  className="re-button"
                  icon={<RetweetOutlined />}
                  type={task.recurring ? "primary" : "default"}
                  onClick={() => toggleRecurring(index)}
                />,
                editIndex === index ? (
                  <Button
                    icon={<SaveOutlined />}
                    onClick={() => saveEdit(index)}
                  />
                ) : (
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => startEdit(index)}
                  />
                ),
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => deleteTask(task.id, index)}
                />,
              ]}
            >
              <div className="flex items-center justify-between w-full mb-2 lg:mb-0 border-b border-border-color lg:border-0 pb-2 lg:pb-0">
                <Checkbox
                  checked={task.completed}
                  onChange={() => toggleTask(index)}
                  className="mr-2"
                />
                {editIndex === index ? (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onPressEnter={() => saveEdit(index)}
                    autoFocus
                  />
                ) : (
                  <span
                    className={`text-sm font-inter font-semibold text-primary-text${task.completed ? " line-through" : ""
                      } ml-2`}
                  >
                    {task.text}
                  </span>
                )}
              </div>
            </List.Item>
          )}
        />
        <Button
          className="custom-button"
          onClick={handleSubmitTasks}
          type="primary"
        >
          Submit Tasks
        </Button>
      </div>
    </div>
  );
};

export default TodoListFeed;
