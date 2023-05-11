///////////////////////////////////////////////////////////////////////////////
// Copyright (C) 2002-2021, Open Design Alliance (the "Alliance").
// All rights reserved.
//
// This software and its documentation and related materials are owned by
// the Alliance. The software may only be incorporated into application
// programs owned by members of the Alliance, subject to a signed
// Membership Agreement and Supplemental Software License Agreement with the
// Alliance. The structure and organization of this software are the valuable
// trade secrets of the Alliance and its suppliers. The software is also
// protected by copyright law and international treaty provisions. Application
// programs incorporating this software must include the following statement
// with their copyright notices:
//
//   This application incorporates Open Design Alliance software pursuant to a
//   license agreement with Open Design Alliance.
//   Open Design Alliance Copyright (C) 2002-2021 by Open Design Alliance.
//   All rights reserved.
//
// By use of this software, its documentation or related materials, you
// acknowledge and accept the above terms.
///////////////////////////////////////////////////////////////////////////////
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, Card, Empty, Spin, Tooltip } from "antd";

import { AppContext } from "../../AppContext";
import MemberAddModal from "../ProjectMembers/MemberAddModal";

function MemberList({ project }) {
  const { app } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [members, setMembers] = useState([]);
  const [refreshId, setRefreshId] = useState();
  const [memberAddModal, setMemberAddModal] = useState(false);
  const navigate = useNavigate();
  const canUpdateProject = project && project.authorization.project_actions.includes("update");

  useEffect(() => {
    setLoading(true);
    project
      .getMembers()
      .then((members) => {
        members.forEach((member) => {
          const fullName = `${member.user.name || ""} ${member.user.lastName || ""}`.trim();
          const initials = (fullName || member.user.userName || "").substring(0, 1).toUpperCase();
          member.data.user = { ...member.data.user, fullName, initials };
        });
        return members;
      })
      .then((members) => setMembers(members))
      .catch((e) => {
        console.error("Cannot get members.", e);
        app.addNotification("error", "Cannot get members");
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [project, app, refreshId]);

  const emptyText = error
    ? "Error loading members"
    : loading
    ? " "
    : `No members in the project. ${canUpdateProject ? " To add a member, click Add button." : ""}`;

  return (
    <React.Fragment>
      <Card
        title="Members"
        headStyle={{ border: "none" }}
        extra={
          canUpdateProject && (
            <Button
              type="primary"
              onClick={(event) => {
                event.stopPropagation();
                setMemberAddModal(true);
              }}
            >
              Add...
            </Button>
          )
        }
        hoverable
        onClick={() => navigate(`/projects/${project.id}/members`)}
      >
        <Spin spinning={loading}>
          {loading ? (
            <div style={{ minHeight: 53 }} />
          ) : members ? (
            <Avatar.Group
              maxCount={10}
              size="large"
              maxStyle={{
                color: "#f56a00",
                backgroundColor: "#fde3cf",
              }}
            >
              {members
                .map((member) => member.user)
                .map((user) => (
                  <Tooltip key={user.userId} title={user.fullName || user.userName}>
                    <Avatar size="large" src={user.avatarUrl}>
                      {user.initials}
                    </Avatar>
                  </Tooltip>
                ))}
            </Avatar.Group>
          ) : (
            <Empty description={emptyText} />
          )}
        </Spin>
      </Card>
      {canUpdateProject && (
        <MemberAddModal
          project={project}
          visible={memberAddModal}
          onCreate={() => {
            setMemberAddModal(false);
            setRefreshId(new Date());
          }}
          onClose={() => setMemberAddModal(false)}
        />
      )}
    </React.Fragment>
  );
}

export default MemberList;
