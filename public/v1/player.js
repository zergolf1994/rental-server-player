class vdohide {
  async init(id, data, options = {}) {
    await waitForGlobalObject("p2pml", "core");
    this.id = id;
    this.data = data;
    this.option = options;
    // Opera 8.0+
    var isOpera =
      (!!window.opr && !!opr.addons) ||
      !!window.opera ||
      navigator.userAgent.indexOf(" OPR/") >= 0;
    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== "undefined";
    // Safari 3.0+ "[object HTMLElementConstructor]"
    var isSafari =
      /constructor/i.test(window.HTMLElement) ||
      (function (p) {
        return p.toString() === "[object SafariRemoteNotification]";
      })(
        !window["safari"] ||
          (typeof safari !== "undefined" && window["safari"].pushNotification)
      );
    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/ false || !!document.documentMode;
    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;
    // Chrome 1 - 79
    var isChrome =
      !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

    this.p2pactive = true;
    var debugenable = false;
    var consumeOnly = false;
    this.maxsend = 100;

    if (
      md.os() == "AndroidOS" ||
      md.is("iPad") ||
      isOpera ||
      isFirefox ||
      isIE ||
      isEdge ||
      isChrome ||
      isSafari
    )
      p2pactive = true;

    this.p2pdisable = false;
    if (md.tablet()) this.p2pactive = true;

    if (
      navigator.userAgent.search(
        /(lg|LG|sony|samsung|SONY|TV|SmartTV|SMART-TV|Tizen(.*TV))/i
      ) >= 0
    ) {
      this.p2pactive = false;
      this.p2pdisable = true;
    }

    this.isP2PSupported = p2pml.core.HybridLoader.isSupported();

    this.Restart_Player();
  }
  async Restart_Player() {
    if (this.p2pdisable != true) {
      await loadScript("/v1/hlsv1.js?v=1.2");
      await loadScript("/v1/p2p-media-loader-hlsjs_v1.js?v=1");
      const config = {
        segments: {
          swarmId: "test",
        },
        loader: {
          httpFailedSegmentTimeout: 10000,
          consumeOnly: false,
          httpDownloadMaxPriority: 8,
          cachedSegmentsCount: 300,
          requiredSegmentsPriority: 6,
          simultaneousP2PDownloads: 5,
          simultaneousHttpDownloads: 2,
          httpDownloadProbabilitySkipIfNoPeers: false,
          httpDownloadProbabilityInterval: 1000,
          httpDownloadInitialTimeout: 1,
          rtcConfig: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:global.stun.twilio.com:3478" },
            ],
          },
          trackerAnnounce: [
            "ws://tracker.vdohide.com",
            "wss://tracker.vdohide.com",
          ],
        },
      };

      this.engine = this.isP2PSupported
        ? new p2pml.hlsjs.Engine(config)
        : undefined;

      this.initJwPlayer();
    } else {
      this.initJwPlayer();
    }
  }
  async initJwPlayer() {
    if (!md.is("iPad") && md.mobile()) {
      await loadScript("https://content.jwplatform.com/libraries/foHt6P0J.js");
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@hola.org/jwplayer-hlsjs@latest/dist/jwplayer.hlsjs.min.js"
      );
    } else if (!md.is("iPad")) {
      await loadScript("https://content.jwplatform.com/libraries/foHt6P0J.js");
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@hola.org/jwplayer-hlsjs@latest/dist/jwplayer.hlsjs.min.js"
      );
    } else {
      await loadScript("https://content.jwplatform.com/libraries/foHt6P0J.js");
    }

    var player = jwplayer("player_box");
    var json = {
      ...this.data,
    };
    player.setup(json);

    if (this.p2pdisable != true) {
      jwplayer_hls_provider.attach();
    }

    if (this.isP2PSupported && this.p2pactive == true) {
      p2pml.hlsjs.initJwPlayer(player, {
        liveSyncDurationCount: 7,
        loader: this.engine.createLoaderClass(),
      });
    }

    if (this.option.video_continue) {
      this.jw_resume(player);
    }
    this.jw_displays(player);
  }
  jw_resume(player) {
    const resumeData = "vdohide-" + this.id;
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
  jw_displays(player) {
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
          //forwardDisplayButton.style.transform = "scaleX(-1)";
          forwardDisplayButton.ariaLabel = "Forward 10 Seconds";
          forwardDisplayButton.innerHTML = iconForward;
          const nextContainer = document.querySelector(".jw-display-icon-next");
          console.log(forwardDisplayButton);
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
          //forwardControlBarButton.style.transform = "scaleX(-1)";
          forwardControlBarButton.ariaLabel = "Forward 10 Seconds";
          forwardControlBarButton.innerHTML = iconForward;
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
                  window.location.href = "https://vdohide.com/";
                }
              } catch (e) {
                window.location.href = "https://vdohide.com/";
              }
            },
            "vdohide-logo"
          );
        },
      };

    player.on("ready", function (evt) {
      clientSide.removeBtn();
      clientSide.forwardBtn();
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

    player.once("play", function (e) {
      const levels = player.getQualityLevels();
      const current = player.getCurrentQuality();
      if (levels?.length > 1) {
        if (current != levels?.length - 1) {
          player.setCurrentQuality(levels?.length - 1);
        }
      }
    });
    /*player.on("bufferChange", (e) => {
      console.log(e);
    });*/
  }
}
