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

import React from "react";
import moment from "moment";
import { Card, Col, Image, Row, Statistic, Tooltip, Typography } from "antd";
// import { ShareAltOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;

function ProjectCard({ project, maxHeight = 230, ...rest }) {
  return (
    <Card
      {...rest}
      cover={
        <Image
          style={{ maxHeight, objectFit: "cover" }}
          src={project.previewUrl || ""}
          fallback={`data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>`}
          placeholder={true}
          preview={false}
        />
      }
    >
      <Card.Meta
        title={project.name}
        description={<Paragraph ellipsis={{ rows: 2 }}>{project.description}</Paragraph>}
      />
      <Row gutter={16}>
        <Col span={8}>
          <Statistic title="Models" value={project.modelCount} />
        </Col>
        <Col span={8}>
          <Statistic title="Members" value={project.memberCount} />
        </Col>
        <Col span={8}>
          <Statistic title="Issues" value={project.topicCount} />
        </Col>
      </Row>
      <Row wrap={false}>
        <Col flex="auto">
          <Tooltip title={moment(project.updatedAt).toString()}>
            <Text className="font-size-sm" type="secondary">
              Last update {moment(project.updatedAt).fromNow()}
            </Text>
          </Tooltip>
        </Col>
        {/* <Col flex="none">
          <Tooltip title="Share project">
            <Avatar className={project.public ? " bg-primary" : ""} shape="square" size={20}>
              <ShareAltOutlined />
            </Avatar>
          </Tooltip>
        </Col> */}
      </Row>
    </Card>
  );
}

export default ProjectCard;
