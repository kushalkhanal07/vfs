import AdminService from "../services/adminService.js";

function parseQueryFlag(value) {
  if (value === undefined) return undefined;
  return value === "true" || value === true;
}

export const getDashboard = async (req, res, next) => {
  try {
    const data = await AdminService.getDashboardOverview();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const data = await AdminService.getUsers({
      search: req.query.search,
      status: req.query.status,
      role: req.query.role,
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const data = await AdminService.getUserById(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const status = req.body.status || req.body.action;
    const normalizedStatus = status === "block" ? "Suspended" : status === "unblock" ? "Active" : status;

    if (!["Active", "Suspended"].includes(normalizedStatus)) {
      return res.status(400).json({ error: "Invalid user status" });
    }

    const user = await AdminService.updateUserStatus(req.params.id, normalizedStatus, req.user._id, req);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User status updated", user });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const role = req.body.role;
    const normalizedRole = role === "Admin" ? "Super Admin" : role;
    const allowedRoles = ["Super Admin", "Manager", "User"];

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ error: "Invalid user role" });
    }

    const user = await AdminService.updateUserRole(req.params.id, normalizedRole, req.user._id, req);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User role updated", user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await AdminService.deleteUser(req.params.id, req.user._id, req);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getLearningAnalytics = async (req, res, next) => {
  try {
    const data = await AdminService.getLearningAnalytics();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getRevisionAnalytics = async (req, res, next) => {
  try {
    const data = await AdminService.getRevisionAnalytics();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getFiles = async (req, res, next) => {
  try {
    const data = await AdminService.getFiles({
      search: req.query.search,
      type: req.query.type,
      page: req.query.page,
      limit: req.query.limit,
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const file = await AdminService.deleteFile(req.params.id, req.user._id, req);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getStorageAnalytics = async (req, res, next) => {
  try {
    const data = await AdminService.getStorageAnalytics();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getSearchAnalytics = async (req, res, next) => {
  try {
    const data = await AdminService.getSearchAnalytics();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getSpamAnalytics = async (req, res, next) => {
  try {
    const data = await AdminService.getSpamAnalytics({
      page: req.query.page,
      limit: req.query.limit,
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getSpamIncident = async (req, res, next) => {
  try {
    const data = await AdminService.getSpamIncident(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "Spam incident not found" });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const reviewSpamIncident = async (req, res, next) => {
  try {
    const data = await AdminService.reviewSpamIncident(req.params.id, req.body, req.user._id, req);

    if (!data) {
      return res.status(404).json({ error: "Spam incident not found" });
    }

    res.json({ message: "Spam incident updated", incident: data });
  } catch (error) {
    next(error);
  }
};

export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await AdminService.getSubjects();
    res.json({ subjects });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    if (!req.body.name || String(req.body.name).trim().length < 2) {
      return res.status(400).json({ error: "Subject name is required" });
    }

    const subject = await AdminService.createSubject(req.body, req.user._id, req);
    res.status(201).json({ message: "Subject created", subject });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const subject = await AdminService.updateSubject(req.params.id, req.body, req.user._id, req);

    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res.json({ message: "Subject updated", subject });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await AdminService.deleteSubject(req.params.id, req.user._id, req);

    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res.json({ message: "Subject deleted" });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await AdminService.getNotifications();
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
};

export const createNotifications = async (req, res, next) => {
  try {
    if (!req.body.title || !req.body.message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    const result = await AdminService.createNotifications(req.body, req.user._id, req);
    res.status(201).json({ message: "Notifications sent", ...result });
  } catch (error) {
    next(error);
  }
};

export const getFeedback = async (req, res, next) => {
  try {
    const feedback = await AdminService.getFeedback();
    res.json({ feedback });
  } catch (error) {
    next(error);
  }
};

export const updateFeedback = async (req, res, next) => {
  try {
    const feedback = await AdminService.updateFeedback(req.params.id, req.body, req.user._id, req);

    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.json({ message: "Feedback updated", feedback });
  } catch (error) {
    next(error);
  }
};

export const getSystemLogs = async (req, res, next) => {
  try {
    const logs = await AdminService.getSystemLogs();
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

export const getAdminSettings = async (req, res, next) => {
  try {
    const settings = await AdminService.getAdminSettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

export const updateAdminSettings = async (req, res, next) => {
  try {
    const settings = await AdminService.updateAdminSettings(req.body, req.user._id, req);
    res.json({ message: "Settings updated", settings });
  } catch (error) {
    next(error);
  }
};
