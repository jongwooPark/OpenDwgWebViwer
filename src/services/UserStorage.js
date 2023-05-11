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

const UserStorage = {
  getItem(key = "user") {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem(key));
      if (!user) user = JSON.parse(sessionStorage.getItem(key));
    } catch (e) {
      console.error("Unable to get user data from storage.", e);
    }
    return user;
  },

  setItem(user, key = "user") {
    if (!user) {
      this.removeItem();
    } else if (user.rememberMe) {
      sessionStorage.removeItem(key);
      localStorage.setItem(key, JSON.stringify(user));
    } else {
      localStorage.removeItem(key);
      sessionStorage.setItem(key, JSON.stringify(user));
    }
  },

  removeItem(key = "user") {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  },
};

export default UserStorage;
