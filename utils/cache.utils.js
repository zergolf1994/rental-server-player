const path = require("path");
const fs = require("fs-extra");

class Cacheder {
  m3u8 = {
    get: (name) => {
      try {
        const _dir = path.join(global.dir, ".cached", "m3u8"),
          _file = path.join(_dir, name);

        if (!fs.existsSync(_dir)) {
          fs.mkdirSync(_dir, { recursive: true });
        }

        if (!fs.existsSync(_file)) throw new Error("not found");
        const stats = fs.statSync(_file);
        // ดึงเวลาที่ไฟล์ถูกสร้างมา
        const createdTime = new Date(stats.birthtime);

        // คำนวณเวลาที่ผ่านมา
        const now = new Date();
        const minutesSinceCreation = Math.floor(
          (now - createdTime) / (1000 * 60)
        );
        //อัพเดตไฟลืแคชทุกๆ 5 นาที
        if (minutesSinceCreation >= 5) {
          fs.unlinkSync(_file);
          throw new Error("update cache");
        }

        const read = fs.readFileSync(_file, "utf8");
        return JSON.parse(read);
      } catch (error) {
        return { error: true, msg: error?.message };
      }
    },
    save: (name, data) => {
      try {
        const _dir = path.join(global.dir, ".cached", "m3u8"),
          _file = path.join(_dir, name);

        if (!fs.existsSync(_dir)) {
          fs.mkdirSync(_dir, { recursive: true });
        }
        fs.writeFileSync(_file, JSON.stringify(data), "utf8");

        return data;
      } catch (error) {
        return { error: true, msg: error?.message };
      }
    },
  };
  stream = {
    get: (name) => {
      try {
        const _dir = path.join(global.dir, ".cached", "stream"),
          _file = path.join(_dir, name);

        if (!fs.existsSync(_dir)) {
          fs.mkdirSync(_dir, { recursive: true });
        }

        if (!fs.existsSync(_file)) throw new Error("not found");
        const stats = fs.statSync(_file);
        // ดึงเวลาที่ไฟล์ถูกสร้างมา
        const createdTime = new Date(stats.birthtime);

        // คำนวณเวลาที่ผ่านมา
        const now = new Date();
        const minutesSinceCreation = Math.floor(
          (now - createdTime) / (1000 * 60)
        );
        //อัพเดตไฟลืแคชทุกๆ 5 นาที
        if (minutesSinceCreation >= 30) {
          fs.unlinkSync(_file);
          throw new Error("update cache");
        }

        const read = fs.readFileSync(_file, "utf8");
        return JSON.parse(read);
      } catch (error) {
        return { error: true, msg: error?.message };
      }
    },
    save: (name, data) => {
      try {
        const _dir = path.join(global.dir, ".cached", "stream"),
          _file = path.join(_dir, name);

        if (!fs.existsSync(_dir)) {
          fs.mkdirSync(_dir, { recursive: true });
        }
        fs.writeFileSync(_file, JSON.stringify(data), "utf8");

        return data;
      } catch (error) {
        return { error: true, msg: error?.message };
      }
    },
  };
  poster = {
    save: (name, data) => {
      try {
        const _dir = path.join(global.dirPublic, "thumb"),
          _file = path.join(_dir, name);

        if (!fs.existsSync(_dir)) {
          fs.mkdirSync(_dir, { recursive: true });
        }
        fs.writeFileSync(_file, data, "utf8");
      } catch (error) {
        return { error: true, msg: error?.message };
      }
    },
  };
  domain = {
    get: (name) => {
      try {
        const _dir = path.join(global.dir, ".cached", "domain"),
          _file = path.join(_dir, name);

        if (!fs.existsSync(_dir)) {
          fs.mkdirSync(_dir, { recursive: true });
        }

        if (!fs.existsSync(_file)) throw new Error("not found");
        const stats = fs.statSync(_file);
        // ดึงเวลาที่ไฟล์ถูกสร้างมา
        const createdTime = new Date(stats.birthtime);

        // คำนวณเวลาที่ผ่านมา
        const now = new Date();
        const minutesSinceCreation = Math.floor(
          (now - createdTime) / (1000 * 60)
        );
        //อัพเดตไฟลืแคชทุกๆ 5 นาที
        if (minutesSinceCreation >= 5) {
          fs.unlinkSync(_file);
          throw new Error("update cache");
        }

        const read = fs.readFileSync(_file, "utf8");
        return JSON.parse(read);
      } catch (error) {
        return { error: true, msg: error?.message };
      }
    },
    save: (name, data) => {
      try {
        const _dir = path.join(global.dir, ".cached", "domain"),
          _file = path.join(_dir, name);

        if (!fs.existsSync(_dir)) {
          fs.mkdirSync(_dir, { recursive: true });
        }
        fs.writeFileSync(_file, JSON.stringify(data), "utf8");

        return data;
      } catch (error) {
        return { error: true, msg: error?.message };
      }
    },
  };
}
exports.Cached = new Cacheder();
