import React, { useState, useEffect, useCallback } from "react";
import { Card, Avatar, Tag, message } from "antd";
import moment from "moment";
import { getPublicAssignedBadgesAPI } from "../../../api/Badgeapi";
import { useParams } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import "./OrganizationFeed.css";
import { getPostsByWorkspace } from "../../../api/postapi";
import PostForm from "../PostAnnoucement/PostAnnoucement";
import { FeedMessages } from "../../../constants/constants";
import Anniversary from "../Anniversery/Anniversary";
import { toastError } from "../../../Utility/toast";

const OrganizationFeed = () => {
  const [allBadges, setAllBadges] = useState([]);
  const [displayedBadges, setDisplayedBadges] = useState([]);
  const [posts, setPosts] = useState([]);
  // const [badgesToShow] = useState(5);

  const { workspacename } = useParams();

  const badgesToShow = 5;

  const fetchData = useCallback(async () => {
    try {
      const [badgeRes, postRes] = await Promise.all([
        getPublicAssignedBadgesAPI(workspacename),
        getPostsByWorkspace(workspacename),
      ]);
      setAllBadges(badgeRes);
      setDisplayedBadges(badgeRes.slice(0, badgesToShow));

      const filteredPosts = postRes.filter(
        (post) => post.target === "workspace" && !post.teamname
      );
      setPosts(filteredPosts);
    } catch (err) {
      console.error(FeedMessages.ORGANIZATION_FEED_ERR, err);
      // message.error(FeedMessages.ORGANIZATION_FEED_ERR_MSG);
      toastError({
        title: "Error",
        description: FeedMessages.ORGANIZATION_FEED_ERR_MSG,
      });
    }
  }, [
    workspacename,
    // , badgesToShow
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handlePostUpdate = () => {
      fetchData(); // refresh posts
    };

    window.addEventListener("post-updated", handlePostUpdate);
    return () => {
      window.removeEventListener("post-updated", handlePostUpdate);
    };
  }, [fetchData]);

  const loadMoreBadges = () => {
    const nextBatch = allBadges.slice(0, displayedBadges.length + 5);
    setDisplayedBadges(nextBatch);
  };

  const getBadgeIcon = (iconName) => {
    const IconComponent = FaIcons[iconName];
    return IconComponent ? (
      <IconComponent size={24} className="badge-icon" />
    ) : (
      <FaIcons.FaTrophy size={24} className="badge-icon" />
    );
  };

  return (
    <div className="organization-feed !py-5 hide-scrollbar">
      {/* ======= Post Form Section ======= */}
      <div className="">
        <PostForm workspacename={workspacename} onPostSuccess={fetchData} />
      </div>

      {/* <div className="feed-card">
        <Anniversary />
      </div> */}
      {/* ======= Announcements Section ======= */}
      {posts.length > 0 && (
        <div className="">
          <h2 className="announcement-heading !text-xl md:!text-2xl !font-semibold text-[#3A3A3A] font-rubik !py-5">
            📢 Announcements
          </h2>
          {posts.map((post, index) => (
            <div >
              <div className="mb-2 bg-white shadow-sm rounded-xl border border-gray-200 p-4 flex gap-4 items-start hover:shadow-md transition">
                <div className="w-10 h-10 rounded-full bg-primary-color flex items-center justify-center text-white font-semibold text-lg">
                  {post.createdBy?.fname?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row  justify-between">
                    <p className="text-sm text-primary-text font-inter font-semibold space-x-1">
                      <span className="font-bold"> {post.createdBy?.fname}</span>
                      <span className="font-normal text-gray-600">
                        created a post
                      </span>
                    </p>
                    <span className="text-xs text-secondary-text font-inter mt-1 md:mt-0">
                      {moment(post.createdAt).fromNow()}
                    </span>
                  </div>

                  <p className="text-primary-text font-inter mt-2">{post.content}</p>
                </div>
              </div>
            </div>

          ))}
        </div>
      )}

      {/* ======= Badge Feed Section ======= */}
      {displayedBadges.map((badge, index) => (
        <Card key={`badge-${index}`} className="feed-card">
          <div className="feed-header">
            {/* <Avatar size={45} className="feed-avatar">
              {badge.assignedBy.charAt(0).toUpperCase()}
            </Avatar>
            <div className="feed-info">
              <p>
                <strong>{badge.assignedBy}</strong> praised{" "}
                <strong className="receiver-name">{badge.assignedTo}</strong>
              </p>
              <span className="feed-time">{moment(badge.assigned_at).fromNow()}</span>
            </div> */}
            <Avatar
              size={45}
              src={badge.assignedBy?.userLogo}
              className="feed-avatar"
            >
              {!badge.assignedBy?.userLogo &&
                badge.assignedBy?.name?.charAt(0).toUpperCase()}
            </Avatar>

            <div className="feed-info">
              <p>
                <strong>{badge.assignedBy?.name}</strong> &nbsp;{" "}
                {badge.badge.type} &nbsp;
                <strong className="receiver-name">
                  {badge.assignedTo?.name}
                </strong>
              </p>
              <span className="feed-time">
                {moment(badge.assigned_at).fromNow()}
              </span>
            </div>
          </div>

          <div className="badge-container">
            {getBadgeIcon(badge.badge.icon)}
            <div>
              <h4 className="badge-title">{badge.badge.name}</h4>
            </div>
          </div>

          <p className="feed-description">{badge.description}</p>
        </Card>
      ))}

      {displayedBadges.length < allBadges.length && (
        <p className="load-more" onClick={loadMoreBadges}>
          Load More...
        </p>
      )}
    </div>
  );
};

export default OrganizationFeed;
