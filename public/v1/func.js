function waitForGlobalObject(objectName, objectNextName) {
  return new Promise((resolve) => {
    function check() {
      if (
        window[objectName] !== undefined &&
        (objectNextName === undefined ||
          window[objectName][objectNextName] !== undefined)
      ) {
        resolve();
      } else {
        setTimeout(check, 200);
      }
    }

    check();
  });
}

function waitForModule(moduleName) {
  return new Promise((resolve) => {
    function check() {
      try {
        resolve(require(moduleName));
      } catch (e) {
        setTimeout(check, 200);
      }
    }

    check();
  });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      console.log("Failed to load script", src);
      reject();
    };
    script.src = src;
    document.head.appendChild(script);
  });
}

function loadStyle(src) {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.onload = () => {
      resolve();
    };
    link.onerror = () => {
      console.log("Failed to load CSS", src);
      reject();
    };
    link.href = src;
    document.head.appendChild(link);
  });
}
