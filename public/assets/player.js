class AppPlayer {
  init(id, data) {
    this.id = id;
    this.data = data;

    this.isP2PSupported = Hls.isSupported() && p2pml.hlsjs.Engine.isSupported();
    if (this.isP2PSupported) {
      this.downloadStats = [];
      this.downloadTotals = { http: 0, p2p: 0 };
      this.uploadStats = [];
      this.uploadTotal = 0;
    }
    this.jw_setup();
  }
  jw_setup() {
    this.player = jwplayer("jwplayer");
    const objSetup = {
      ...this.data,
      /*advertising: {
        tag: "",
        client: "vast",
      },*/
    };
    const segments_in_queue = 50;
    let engine_config = {
      debug: !1,
      segments: {
        forwardSegmentCount: 50,
      },
      loader: {
        cachedSegmentExpiration: 864e5,
        cachedSegmentsCount: 1e3,
        requiredSegmentsPriority: segments_in_queue,
        httpDownloadMaxPriority: 9,
        httpDownloadProbability: 0.06,
        httpDownloadProbabilityInterval: 1e3,
        httpDownloadProbabilitySkipIfNoPeers: !0,
        p2pDownloadMaxPriority: 50,
        httpFailedSegmentTimeout: 500,
        simultaneousP2PDownloads: 20,
        simultaneousHttpDownloads: 2,
        // httpDownloadInitialTimeout: 12e4,
        // httpDownloadInitialTimeoutPerSegment: 17e3,
        httpDownloadInitialTimeout: 0,
        httpDownloadInitialTimeoutPerSegment: 17e3,
        httpUseRanges: !0,
        maxBufferLength: 300,
        // useP2P: false,
        trackerAnnounce: [
          "ws://tracker.vdohide.com",
          "wss://tracker.vdohide.com",
          //"ws://tracker.openwebtorrent.com"
        ],
        rtcConfig: {
          iceServers: [
            {
              urls: "stun:stun2.l.google.com:19302",
            },
            {
              urls: "stun:stun3.l.google.com:19302",
            },
            {
              urls: "stun:stun4.l.google.com:19302",
            },
          ],
        },
      },
    };

    if (this.isP2PSupported) {
      this.engine = new p2pml.hlsjs.Engine(engine_config);
      this.player.setup(objSetup);
      this.engine.on(
        p2pml.core.Events.PieceBytesDownloaded,
        this.onBytesDownloaded.bind(this)
      );
      this.engine.on(
        p2pml.core.Events.PieceBytesUploaded,
        this.onBytesUploaded.bind(this)
      );
      jwplayer_hls_provider.attach();
      p2pml.hlsjs.initJwPlayer(this.player, {
        liveSyncDurationCount: segments_in_queue, // To have at least 7 segments in queue
        maxBufferLength: 300,
        loader: this.engine.createLoaderClass(),
      });
    } else {
      this.player.setup(objSetup);
    }

    //this.jw_resume();

    this.jw_displays();
  }

  jw_resume() {
    const resumeData = "VdoHide-" + this.id;
    const player = this.player;
    player.on("ready", function () {
      if (typeof Storage !== "undefined") {
        if (
          localStorage[resumeData] == "" ||
          localStorage[resumeData] == "undefined"
        ) {
          console.log("No cookie for position found");
          var currentPosition = 0;
        } else {
          if (localStorage[resumeData] == "null") {
            localStorage[resumeData] = 0;
          } else {
            var currentPosition = localStorage[resumeData];
          }
        }
        player.once("play", function () {
          if (
            currentPosition > 180 &&
            Math.abs(player.getDuration() - currentPosition) > 5
          ) {
            player.seek(currentPosition);
          }
        });
        window.onunload = function () {
          localStorage[resumeData] = player.getPosition();
        };
      } else {
        console.log("Your browser is too old!");
      }
    });

    player.on("complete", function () {
      if (typeof Storage !== "undefined") {
        localStorage.removeItem(resumeData);
      } else {
        console.log("Your browser is too old!");
      }
    });
  }
  jw_displays() {
    const player = this.player;
    const isP2PSupported = this.isP2PSupported;

    let levelQ,
      clientSide = {
        qualitySwitch: function (b) {
          let item = levelQ[b];
          if (this.svgLabel(item?.label) == undefined) {
            player.removeButton("qSwitch");
          } else {
            player.addButton(
              this.svgLabel(item?.label),
              item?.label,
              function () {
                /*document
                  .querySelector(".jw-controls")
                  .classList.add("jw-settings-open");
                document
                  .querySelector(".jw-settings-menu")
                  .setAttribute("aria-expanded", false);
                document
                  .querySelector(".jw-settings-submenu:last-child")
                  .classList.add("jw-settings-submenu-active");
                document
                  .querySelector(".jw-settings-submenu:last-child")
                  .setAttribute("aria-expanded", true);
                document
                  .querySelector(".jw-settings-quality")
                  .setAttribute("aria-checked", true);*/
              },
              "qSwitch"
            );
          }
        },
        removeBtn: function () {
          player.removeButton("share");
        },
        forwardBtn: function () {
          // display icon
          let iconForward = `<svg xmlns="http://www.w3.org/2000/svg" class="jw-svg-icon jw-svg-icon-rewind" viewBox="0 0 240 240" focusable="false"> <path d="M185,135.6c-3.7-6.3-10.4-10.3-17.7-10.6c-7.3,0.3-14,4.3-17.7,10.6c-8.6,14.2-8.6,32.1,0,46.3c3.7,6.3,10.4,10.3,17.7,10.6 c7.3-0.3,14-4.3,17.7-10.6C193.6,167.6,193.6,149.8,185,135.6z M167.3,182.8c-7.8,0-14.4-11-14.4-24.1s6.6-24.1,14.4-24.1 s14.4,11,14.4,24.1S175.2,182.8,167.3,182.8z M123.9,192.5v-51l-4.8,4.8l-6.8-6.8l13-13c1.9-1.9,4.9-1.9,6.8,0 c0.9,0.9,1.4,2.1,1.4,3.4v62.7L123.9,192.5z M22.7,57.4h130.1V38.1c0-5.3,3.6-7.2,8-4.3l41.8,27.9c1.2,0.6,2.1,1.5,2.7,2.7 c1.4,3,0.2,6.5-2.7,8l-41.8,27.9c-4.4,2.9-8,1-8-4.3V76.7H37.1v96.4h48.2v19.3H22.6c-2.6,0-4.8-2.2-4.8-4.8V62.3 C17.8,59.6,20,57.4,22.7,57.4z"> </path> </svg>`;
          const rewindContainer = document.querySelector(
            ".jw-display-icon-rewind"
          );
          const forwardContainer = rewindContainer.cloneNode(true);
          const forwardDisplayButton =
            forwardContainer.querySelector(".jw-icon-rewind");
          forwardDisplayButton.style.transform = "scaleX(-1)";
          forwardDisplayButton.ariaLabel = "Forward 10 Seconds";
          const nextContainer = document.querySelector(".jw-display-icon-next");
          nextContainer.parentNode.insertBefore(
            forwardContainer,
            nextContainer
          );

          // control bar icon
          document.querySelector(".jw-display-icon-next").style.display =
            "none"; // hide next button
          const buttonContainer = document.querySelector(
            ".jw-button-container"
          );
          const rewindControlBarButton =
            buttonContainer.querySelector(".jw-icon-rewind");
          const forwardControlBarButton =
            rewindControlBarButton.cloneNode(true);
          forwardControlBarButton.style.transform = "scaleX(-1)";
          forwardControlBarButton.ariaLabel = "Forward 10 Seconds";
          rewindControlBarButton.parentNode.insertBefore(
            forwardControlBarButton,
            rewindControlBarButton.nextElementSibling
          );
          // add onclick handlers
          [forwardDisplayButton, forwardControlBarButton].forEach((button) => {
            button.onclick = () => {
              player.seek(player.getPosition() + 10);
            };
          });
        },
        svgLabel: function (a) {
          let data = {
            "360p": `<svg class="jw-svg-icon jw-svg-icon-qswitch" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 24"><path d="M7 15v-1.5A1.5 1.5 0 0 0 5.5 12 1.5 1.5 0 0 0 7 10.5V9a2 2 0 0 0-2-2H1v2h4v2H3v2h2v2H1v2h4a2 2 0 0 0 2-2M10 7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2V9h4V7h-4m0 6h2v2h-2v-2zM17 7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m0 2h2v6h-2V9zM28 7v10h2v-4h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4m2 2h2v2h-2V9m-6-6h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H24a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>`,
            "480p": `<svg class="jw-svg-icon jw-svg-icon-qswitch" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 24"><path d="M1 7v6h4v4h2V7H5v4H3V7H1zM10 13h2v2h-2m0-6h2v2h-2m0 6h2a2 2 0 0 0 2-2v-1.5a1.5 1.5 0 0 0-1.5-1.5 1.5 1.5 0 0 0 1.5-1.5V9a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v1.5A1.5 1.5 0 0 0 9.5 12 1.5 1.5 0 0 0 8 13.5V15a2 2 0 0 0 2 2M17 7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m0 2h2v6h-2V9zM28 7v10h2v-4h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4m2 2h2v2h-2V9m-6-6h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H24a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>`,
            "720p": `<svg class="jw-svg-icon jw-svg-icon-qswitch" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 24"><path d="M3 17l4-8V7H1v2h4l-4 8M8 7v2h4v2h-2a2 2 0 0 0-2 2v4h6v-2h-4v-2h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H8zM17 7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m0 2h2v6h-2V9zM28 7v10h2v-4h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4m2 2h2v2h-2V9m-6-6h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H24a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>`,
            "1080p": `<svg class="jw-svg-icon jw-svg-icon-qswitch" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 24"><path d="M2 7v2h2v8h2V7H2zM10 7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m0 2h2v6h-2V9zM17 13h2v2h-2m0-6h2v2h-2m0 6h2a2 2 0 0 0 2-2v-1.5a1.5 1.5 0 0 0-1.5-1.5 1.5 1.5 0 0 0 1.5-1.5V9a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v1.5a1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0-1.5 1.5V15a2 2 0 0 0 2 2M24 7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m0 2h2v6h-2V9zM36 7v10h2v-4h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4m2 2h2v2h-2V9m-6-6h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H32a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>`,
          };
          return data[a];
        },
        addLogo: function (a, b) {
          player.addButton(
            "../favicon.ico",
            "vdohide",
            function () {
              try {
                var tab = window.open("https://vdohide.com/", "_blank");
                if (tab) {
                  tab.focus();
                } else {
                  window.location.href = "https://dohide.com/";
                }
              } catch (e) {
                window.location.href = "https://dohide.com/";
              }
            },
            "vdohide-logo"
          );
        },
      };

    player.on("ready", function (evt) {
      clientSide.removeBtn();
      clientSide.forwardBtn();
      /*if (isP2PSupported) {
        clientSide.addLogo();
      }*/
    });

    player.on("levels", function (e) {
      levelQ = e?.levels;
      clientSide.qualitySwitch(e.currentQuality);
    });
    player.on("levelsChanged", function (e) {
      clientSide.qualitySwitch(e.currentQuality);
    });
    player.on("visualQuality", function (e) {
      clientSide.qualitySwitch(e.level.index);
    });

    /*player.on("bufferChange", (e) => {
      console.log(e);
    });*/
  }

  onBytesDownloaded(method, size) {
    this.downloadStats.push({
      method: method,
      size: size,
      timestamp: performance.now(),
    });
    this.downloadTotals[method] += size;

    this.updateLegendTotals();
  }
  onBytesUploaded(method, size) {
    this.uploadStats.push({ size: size, timestamp: performance.now() });
    this.uploadTotal += size;
  }
  getDownloadSpeed() {
    var startingPoint = performance.now() - this.loadSpeedTimespan * 1000;
    var httpSize = 0;
    var p2pSize = 0;
    var i = this.downloadStats.length;
    while (i--) {
      var stat = this.downloadStats[i];
      if (stat.timestamp < startingPoint) {
        break;
      }

      if (stat.method === "p2p") {
        p2pSize += stat.size;
      } else if (stat.method === "http") {
        httpSize += stat.size;
      }
    }

    this.downloadStats.splice(0, i + 1);
    //console.log({p2p: p2pSize / this.loadSpeedTimespan, http: httpSize / this.loadSpeedTimespan});
    return {
      p2p: p2pSize / this.loadSpeedTimespan,
      http: httpSize / this.loadSpeedTimespan,
    };
  }
  updateLegendTotals() {
    var httpMb = this.downloadTotals.http / 1048576;
    var p2pMb = this.downloadTotals.p2p / 1048576;
    var totalMb = httpMb + p2pMb;
    var uploadMb = this.uploadTotal / 1048576;
    if (totalMb != 0) {
      var http_load = Number((httpMb * 100) / totalMb).toFixed(0);
      var p2p_load = Number((p2pMb * 100) / totalMb).toFixed(0);
      //console.log("p2p_load",p2p_load)
      /*$("#p2p-load").removeClass("p2p-none");
      if (p2p_load > 0) {
        $("#p2p-load").html("P2P " + p2p_load + " %");
      } else {
        $("#p2p-load").html("HTTP " + http_load + " %");
      }*/
    }
  }
}

function formatSeconds(seconds) {
  var date = new Date(1970, 0, 1);
  date.setSeconds(seconds);
  return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}
