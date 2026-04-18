import { rm } from "fs/promises";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import User from "../models/userModel.js";

async function getDirectoryContentsRecursive(id) {
  let files = await File.find({ parentDirId: id })
    .select("_id extension size deleted")
    .lean();
  let directories = await Directory.find({ parentDirId: id })
    .select("_id deleted")
    .lean();

  for (const { _id } of directories) {
    const { files: childFiles, directories: childDirectories } =
      await getDirectoryContentsRecursive(_id);

    files = [...files, ...childFiles];
    directories = [...directories, ...childDirectories];
  }

  return { files, directories };
}

export const getDirectory = async (req, res) => {
  const user = req.user;
  const _id = req.params.id || user.rootDirId.toString();
  const directoryData = await Directory.findOne({ _id, deleted: false }).lean();
  if (!directoryData) {
    return res
      .status(404)
      .json({ error: "Directory not found or you do not have access to it!" });
  }

  const files = await File.find({ parentDirId: directoryData._id, deleted: false }).lean();
  const directories = await Directory.find({ parentDirId: _id, deleted: false }).lean();
  return res.status(200).json({
    ...directoryData,
    files: files.map((dir) => ({ ...dir, id: dir._id })),
    directories: directories.map((dir) => ({ ...dir, id: dir._id })),
  });
};

export const createDirectory = async (req, res, next) => {
  const user = req.user;

  const parentDirId = req.params.parentDirId || user.rootDirId.toString();
  const dirname = req.headers.dirname || "New Folder";
  try {
    const parentDir = await Directory.findOne({
      _id: parentDirId,
    }).lean();

    if (!parentDir)
      return res
        .status(404)
        .json({ message: "Parent Directory Does not exist!" });

    await Directory.insertOne({
      name: dirname,
      parentDirId,
      userId: user._id,
    });

    return res.status(201).json({ message: "Directory Created!" });
  } catch (err) {
    if (err.code === 121) {
      res
        .status(400)
        .json({ error: "Invalid input, please enter valid details" });
    } else {
      next(err);
    }
  }
};

export const renameDirectory = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const { newDirName } = req.body;
  try {
    await Directory.findOneAndUpdate(
      {
        _id: id,
        userId: user._id,
      },
      { name: newDirName }
    );
    res.status(200).json({ message: "Directory Renamed!" });
  } catch (err) {
    next(err);
  }
};

export const deleteDirectory = async (req, res, next) => {
  const { id } = req.params;

  try {
    const directoryData = await Directory.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!directoryData) {
      return res.status(404).json({ error: "Directory not found!" });
    }

    if (directoryData.deleted) {
      return res.status(200).json({ message: "Directory already in trash" });
    }

    const user = await User.findById(req.user._id);
    const { files, directories } = await getDirectoryContentsRecursive(id);

    const usedBytesToRelease = files
      .filter((file) => !file.deleted)
      .reduce((sum, file) => sum + (file.size || 0), 0);

    const directoryIds = [directoryData._id, ...directories.map((dir) => dir._id)];

    await Directory.updateMany(
      {
        _id: { $in: directoryIds },
      },
      {
        $set: { deleted: true },
      }
    );

    await File.updateMany(
      {
        _id: { $in: files.map((file) => file._id) },
      },
      {
        $set: { deleted: true },
      }
    );

    user.storageUsed = Math.max(0, user.storageUsed - usedBytesToRelease);
    await user.save();

    return res.json({ message: "Directory Deleted Successfully" });
  } catch (err) {
    next(err);
  }
};

export const restoreDirectory = async (req, res, next) => {
  const { id } = req.params;

  try {
    const directoryData = await Directory.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!directoryData) {
      return res.status(404).json({ error: "Directory not found!" });
    }

    const user = await User.findById(req.user._id);
    const { files, directories } = await getDirectoryContentsRecursive(id);

    const bytesToRestore = files
      .filter((file) => file.deleted)
      .reduce((sum, file) => sum + (file.size || 0), 0);

    if (user.storageUsed + bytesToRestore > user.storageLimit) {
      return res.status(413).json({
        error: "Storage limit exceeded",
        message: "Cannot restore directory because your current storage is full.",
      });
    }

    const directoryIds = [directoryData._id, ...directories.map((dir) => dir._id)];

    await Directory.updateMany(
      {
        _id: { $in: directoryIds },
      },
      {
        $set: { deleted: false },
      }
    );

    await File.updateMany(
      {
        _id: { $in: files.map((file) => file._id) },
      },
      {
        $set: { deleted: false },
      }
    );

    user.storageUsed += bytesToRestore;
    await user.save();

    return res.json({ message: "Directory Restored Successfully" });
  } catch (err) {
    next(err);
  }
};

export const permanentDeleteDirectory = async (req, res, next) => {
  const { id } = req.params;

  try {
    const directoryData = await Directory.findOne({
      _id: id,
      userId: req.user._id,
    })
      .select("_id")
      .lean();

    if (!directoryData) {
      return res.status(404).json({ error: "Directory not found!" });
    }

    const user = await User.findById(req.user._id);
    const { files, directories } = await getDirectoryContentsRecursive(id);

    const activeBytesToRelease = files
      .filter((file) => !file.deleted)
      .reduce((sum, file) => sum + (file.size || 0), 0);

    user.storageUsed = Math.max(0, user.storageUsed - activeBytesToRelease);
    await user.save();

    for (const { _id, extension } of files) {
      try {
        await rm(`./storage/${_id.toString()}${extension}`);
      } catch (err) {
        if (err.code !== "ENOENT") {
          throw err;
        }
      }
    }

    await File.deleteMany({
      _id: { $in: files.map(({ _id }) => _id) },
    });

    await Directory.deleteMany({
      _id: { $in: [...directories.map(({ _id }) => _id), id] },
    });

    return res.json({ message: "Directory permanently deleted" });
  } catch (err) {
    next(err);
  }
};

export const getTrash = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const deletedFiles = await File.find({
      userId,
      deleted: true,
    }).lean();
    
    const deletedDirectories = await Directory.find({
      userId,
      deleted: true,
    }).lean();

    return res.status(200).json({
      files: deletedFiles.map((file) => ({ ...file, id: file._id })),
      directories: deletedDirectories.map((dir) => ({ ...dir, id: dir._id })),
    });
  } catch (err) {
    next(err);
  }
};

export const toggleStarDirectory = async (req, res, next) => {
  const { id } = req.params;
  
  try {
    const directory = await Directory.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!directory) {
      return res.status(404).json({ error: "Directory not found!" });
    }

    directory.starred = !directory.starred;
    await directory.save();
    return res.status(200).json({ message: "Star status updated", starred: directory.starred });
  } catch (err) {
    next(err);
  }
};
