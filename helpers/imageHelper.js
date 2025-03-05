import os from "os";

export const getAvatarUrl = (imageName) => {
  if (!imageName) {
    return "";
  }
  if (imageName && !imageName.includes("http")) {
    const API_PREFIX = `http://${os.hostname()}:${
      process.env.PORT || 3000
    }/api`;
    return `${API_PREFIX}/images/${imageName}`;
  }
  return imageName;
};
