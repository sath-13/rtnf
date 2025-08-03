import React from 'react';
import '../../Pages/PortfolioManagement/PodInfo/PodInfo.scss'
import { InitialsAvatar } from '../../components/InitialsAvatar/InitialsAvatar'
import { Avatar } from 'antd';

export function TeamMemberCard({ member }) {

  return (
    <div className="card-container">
      <div className="imageContainer">
        <div className={`activeIndicator ${member.status === 'active' ? 'active' : ''}`} />
        {member.userAvatar ? (
          <Avatar
            size={90}
            src={member.userAvatar}
            alt={`${member.fname} ${member.lname}`}
            className="member-avatar"
          />
        ) : (
          <InitialsAvatar name={`${member.fname} ${member.lname}`} className="member-avatar" />
        )}
      </div>
      <div className="cardContent">
        <h2 className="name">{`${member.fname} ${member.lname}`}</h2>
        <h3 className="jobTitle">
          {member.designation > 0 ? (
              
                <span className="role-badge">
                  {member.designation}
                </span>
              
            
          ) : (
            <span className="role-badge no-role">Member</span>
          )}
        </h3>
        <p className="description">{member.email}</p>
      </div>
    </div>
  )
}
