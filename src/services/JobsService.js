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

import ClientFactory from "../ClientFactory";

const JobsService = {
  async getJobs(page, pageSize, status, sortByDesc = true, sortField = undefined) {
    const client = ClientFactory.get();

    const jobs = await client.getJobs(status, pageSize, (page - 1) * pageSize, sortByDesc, sortField);

    const fileIds = [];
    const assemblyIds = [];
    const nameMap = new Map();

    jobs.result.forEach((job) => {
      job.fileId ? fileIds.push(job.fileId) : assemblyIds.push(job.assemblyId);
    });

    const files = await client.getFiles(null, null, null, null, fileIds);
    files.result.forEach((file) => nameMap.set(file.id, file.name));

    const assemblies = await client.getAssemblies(null, null, null, assemblyIds);
    assemblies.result.forEach((assembly) => nameMap.set(assembly.id, assembly.name));

    jobs.result.forEach((job) => {
      job.name = job.fileId ? nameMap.get(job.fileId) : nameMap.get(job.assemblyId);
    });

    return jobs;
  },
};

export default JobsService;
