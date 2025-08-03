import React, { useState, useEffect } from "react";
import { Tabs, Card, Avatar, Button } from "antd";
import * as FaIcons from "react-icons/fa";
import moment from "moment";
import "./PraiseTab.css";

const PraiseTab = ({ praiseBadges }) => {
  const [displayedBadges, setDisplayedBadges] = useState([]);

  useEffect(() => {
    if (praiseBadges && praiseBadges.length) {
      setDisplayedBadges(praiseBadges.slice(0, 5));
    }
  }, [praiseBadges]);

  const loadMoreBadges = () => {
    const nextBatch = praiseBadges.slice(0, displayedBadges.length + 5);
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
    <div className="badge-feed-section">
      {displayedBadges.length === 0 ? (
        <p>No praise badges yet.</p>
      ) : (
        displayedBadges.map((badge, index) => {
          const fullName = `${badge.assigned_by_fname || ""} ${badge.assigned_by_lname || ""}`.trim();
          const initials = (badge.assigned_by_fname?.charAt(0) || "U").toUpperCase();

          return (
            <Card key={`praise-badge-${index}`} className="feed-card">
              <div className="feed-header">
                <Avatar
                  size={45}
                  src={badge.assigned_by_userLogo}
                  className="feed-avatar !bg-[#7265e6] !align-middle"
                >
                  {!badge.assigned_by_userLogo && initials}
                </Avatar>

                <div className="feed-info">
                  <p>
                    <strong>{fullName || "Someone"}</strong> praised you with{" "}
                    <strong className="receiver-name">{badge.name}</strong>
                  </p>
                  {/* {badge.assigned_by_email && (
                    <span className="assigned-email">{badge.assigned_by_email}</span>
                  )} */}
                  <span className="feed-time">
                    {moment(badge.assigned_at).fromNow()}
                  </span>
                </div>
              </div>

              <div className="badge-container">
                <div className="badge-icon">{getBadgeIcon(badge.icon)}</div>
                <div>
                  <h4 className="badge-title">{badge.name}</h4>
                  <p className="badge-type">{badge.type}</p>
                </div>
              </div>

              <p className="feed-description">{badge.description}</p>
            </Card>
          );
        })
      )}

      {displayedBadges.length < praiseBadges.length && (
        <div className="text-center mt-4">
          <Button onClick={loadMoreBadges}>Load More</Button>
        </div>
      )}
    </div>
  );
};

export default PraiseTab;
