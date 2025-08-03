import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, Avatar, Tag, message } from "antd";
import moment from "moment";
import { useParams } from "react-router-dom";
import { getBadgesForUserTeam } from "../../api/Badgeapi";
import { getPostsByTeam } from "../../api/postapi";
import * as FaIcons from "react-icons/fa";
import "./OrganizationFeed/OrganizationFeed.css";
import PostForm from "./PostAnnoucement/PostAnnoucement";
import { FeedMessages } from "../../constants/constants";
import { toastError } from "../../Utility/toast";

const TeamFeed = () => {
  const [allBadges, setAllBadges] = useState([]);
  const [displayedBadges, setDisplayedBadges] = useState([]);
  const [posts, setPosts] = useState([]);
  const badgesToShow = 5;

  const { workspacename } = useParams();

  const userTeams = useMemo(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    return Array.isArray(userData?.teamTitle) ? userData.teamTitle : [];
  }, []);

  const fetchData = useCallback(async () => {
    try {
      if (userTeams.length === 0) {
        console.warn(FeedMessages.TEAM_FEED_FETCH_TEAMS_WARN);
        setAllBadges([]);
        setDisplayedBadges([]);
        setPosts([]);
        return;
      }

      // Fetch badges for all teams
      const badgePromises = userTeams.map(team => getBadgesForUserTeam(team));
      const badgeResults = await Promise.all(badgePromises);
      const allBadgeList = badgeResults.flat();
      setAllBadges(allBadgeList);
      setDisplayedBadges(allBadgeList.slice(0, badgesToShow));

      // Fetch posts for all teams
      const postPromises = userTeams.map(team => getPostsByTeam(team));
      const postResults = await Promise.all(postPromises);
      const allPosts = postResults.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(allPosts);

    } catch (err) {
      console.error(FeedMessages.TEAM_FEED_ERR, err);
      // message.error(FeedMessages.TEAM_FEED_ERR_MSG);
      toastError({ title: "Error", description: FeedMessages.TEAM_FEED_ERR_MSG });
    }
  }, [
    // badgesToShow,
    userTeams]);

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
      {/* ========= Post Form ========== */}
      <div className="">
        <PostForm workspacename={workspacename} teamname={userTeams} onPostSuccess={fetchData} target="team" />
      </div>


      {/* ========= Announcements ========== */}
      {posts.length > 0 && (
        <div className="announcement-section">
          <h2 className="announcement-heading">📢 Team Announcements</h2>
          {posts.map((post, index) => (
            <Card key={`post-${index}`} className="announcement-card">
              <div className="feed-header">
                <Avatar
                  size={45}
                  src={post.createdBy?.userLogo}
                  className="feed-avatar"
                >
                  {post.createdBy?.fname?.charAt(0).toUpperCase()}
                </Avatar>
                <div className="feed-info">
                  <p>
                    <strong>{post.createdBy?.fname} {post.createdBy?.lname}</strong> created a post
                  </p>
                  <span className="feed-time">{moment(post.createdAt).fromNow()}</span>
                </div>
              </div>
              <p className="announcement-content">{post.content}</p>
            </Card>
          ))}
        </div>
      )}

      {/* ========= Badge Feed ========== */}
      {displayedBadges.length === 0 ? (
        <p className="no-badges text-secondary-text text-base lg:text-lg text-center mt-2 font-inter ">No badges assigned.</p>
      ) : (
        displayedBadges.map((badge, index) => (
          <Card key={index} className="feed-card">
            <div className="feed-header">
              <Avatar
                size={45}
                src={badge.assignedBy?.userLogo}
                className="feed-avatar"
              >
                {!badge.assignedBy?.userLogo && badge.assignedBy?.name?.charAt(0).toUpperCase()}
              </Avatar>

              <div className="feed-info">
                <p>
                  <strong>{badge.assignedBy?.name}</strong> &nbsp; {badge.badge.type} &nbsp;
                  <strong className="receiver-name">{badge.assignedTo?.name}</strong>
                </p>
                <span className="feed-time">{moment(badge.assigned_at).fromNow()}</span>
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
        ))
      )}

      {displayedBadges.length < allBadges.length && (
        <p className="load-more" onClick={loadMoreBadges}>
          Load More...
        </p>
      )}
    </div>
  );
};

export default TeamFeed;
