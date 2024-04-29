class vdohide {
  async init() {
    await waitForGlobalObject("p2pml", "core");
    this.videoContainer = document.getElementById("video_container");
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
      await loadScript("v1/hlsv1.js?v=1.2");
      await loadScript("v1/p2p-media-loader-hlsjs_v1.js?v=1");
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
    var video = document.createElement("div");
    video.id = "video";
    video.volume = 0;
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    this.videoContainer.appendChild(video);
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

    var player = jwplayer("video");
    var json = {
      sources: [
        {
          type: "hls",
          file: "https://cdn.vdohide.com/master/VSMO5JMZvMIi",
        },
      ],
      playbackRateControls: true,
      mute: false,
      autostart: "false",
      preload: "none",
      cast: { appid: "00000000" },
      base: ".",
      volume: 100,
      key: "ITWMv7t88JGzI0xPwW8I0+LveiXX9SWbfdmt0ArUSyc=",
      androidhls: true,
      width: "100%",
      height: "100%",
    };
    player.setup(json);

    if (this.p2pdisable != true) {
      jwplayer_hls_provider.attach();
    }

    player.on("play", function (e) {
      player.setCurrentQuality(1);
    });

    if (this.isP2PSupported && this.p2pactive == true) {
      p2pml.hlsjs.initJwPlayer(player, {
        liveSyncDurationCount: 7,
        loader: this.engine.createLoaderClass(),
      });
    }
  }
}
