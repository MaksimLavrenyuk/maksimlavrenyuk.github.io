// Usage:
// var akPush = new AKPush()
// try {
//     akPush.initSubscription() // Show push subscribe browser popup
//     // ...
// } catch (e) {
//     // ...
// }

(function(window) {

    ['firebase-app.js', 'firebase-messaging.js'].map(function(f) {
        var s = document.createElement("script");
        s.async = false;
        s.defer = false;
        s.src = 'https://www.gstatic.com/firebasejs/5.2.0/' + f;
        document.head.appendChild(s);
    });

    var injectedConfig = {
        debug: "true" === "true",
        isTest: "false" === "true",
        resourceToken: "CoQT95Tow3q-453ae7a84c1ec8b4",
        apiServerHost: "pxl.maksim-lavrenyuk.dev.altkraft.com",
        swPath: "/service-worker.js",
        firebase: {
            apiKey: "AIzaSyAkRFMa_SfLoL_WKnyBIwoBLhE09WHGzVU",
            projectId: "maksim-push",
            messagingSenderId: "366281823968",
        },
        browsers: {
            "Chrome": {
                isFirebase: "true" === "true"
            },
            "Firefox": {
                isFirebase: "false" === "true"
            },
            "Opera": {
                isFirebase: "false" === "true"
            },
            "Yandex Browser": {
                isFirebase: "false" === "true"
            },
            "Samsung Internet for Android": {
                isFirebase: "false" === "true"
            },
            "Safari": {
                websitePushID: "",
                websitePushAPI: "https://pxl.maksim-lavrenyuk.dev.altkraft.com/ap",
            },
        },
        expirationSWChrome: "900"
    };

    /* detect.js */
    var detectBrowser = function(e) {
        var s = function(e, i) {
                var s = e.match(i),
                    o = "";
                return s && 1 < s.length && (o = s[1]), o
            },
            o = s(e, /version\/(\d+(\.\d+)?)/i),
            n = s(e, /edge\/(\d+(\.\d+)?)/i),
            r = s(e, /(ipod|iphone|ipad)/i).toLowerCase(),
            t = /sailfish/i.test(e),
            a = /tizen/i.test(e),
            d = /(web|hpw)os/i.test(e),
            m = !/like android/i.test(e) && /android/i.test(e),
            l = /silk/i.test(e),
            f = !r && !l && /macintosh/i.test(e),
            p = /xbox/i.test(e),
            v = /windows phone/i.test(e),
            c = (/SamsungBrowser/i.test(e), !v && /windows/i.test(e)),
            h = !m && !t && !a && !d && /linux/i.test(e),
            w = {};
        if (/opera/i.test(e)) w = { name: "Opera", opera: !0, version: o || s(e, /(?:opera|opr|opios)[\s\/](\d+(\.\d+)?)/i) };
        else if (/opr|opios/i.test(e)) w = { name: "Opera", opera: !0, version: s(e, /(?:opr|opios)[\s\/](\d+(\.\d+)?)/i) || o };
        else if (/SamsungBrowser/i.test(e)) w = { name: "Samsung Internet for Android", samsungBrowser: !0, version: o || s(e, /(?:SamsungBrowser)[\s\/](\d+(\.\d+)?)/i) };
        else if (/coast/i.test(e)) w = { name: "Opera Coast", coast: !0, version: o || s(e, /(?:coast)[\s\/](\d+(\.\d+)?)/i) };
        else if (/yabrowser/i.test(e)) w = { name: "Yandex Browser", yandexbrowser: !0, version: o || s(e, /(?:yabrowser)[\s\/](\d+(\.\d+)?)/i) };
        else if (/ucbrowser/i.test(e)) w = { name: "UC Browser", ucbrowser: !0, version: s(e, /(?:ucbrowser)[\s\/](\d+(?:\.\d+)+)/i) };
        else if (/mxios/i.test(e)) w = { name: "Maxthon", maxthon: !0, version: s(e, /(?:mxios)[\s\/](\d+(?:\.\d+)+)/i) };
        else if (/epiphany/i.test(e)) w = { name: "Epiphany", epiphany: !0, version: s(e, /(?:epiphany)[\s\/](\d+(?:\.\d+)+)/i) };
        else if (/puffin/i.test(e)) w = { name: "Puffin", puffin: !0, version: s(e, /(?:puffin)[\s\/](\d+(?:\.\d+)?)/i) };
        else if (/sleipnir/i.test(e)) w = { name: "Sleipnir", sleipnir: !0, version: s(e, /(?:sleipnir)[\s\/](\d+(?:\.\d+)+)/i) };
        else if (/k-meleon/i.test(e)) w = { name: "K-Meleon", kMeleon: !0, version: s(e, /(?:k-meleon)[\s\/](\d+(?:\.\d+)+)/i) };
        else if (/windows phone/i.test(e)) w = { name: "Windows Phone", windowsphone: !0 }, n ? (w.msedge = !0, w.version = n) : (w.msie = !0, w.version = s(e, /iemobile\/(\d+(\.\d+)?)/i));
        else if (/msie|trident/i.test(e)) w = { name: "Internet Explorer", msie: !0, version: s(e, /(?:msie |rv:)(\d+(\.\d+)?)/i) };
        else if (/CrOS/.test(e)) w = { name: "Chrome", chromeos: !0, chromeBook: !0, chrome: !0, version: s(e, /(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i) };
        else if (/chrome.+? edge/i.test(e)) w = { name: "Microsoft Edge", msedge: !0, version: b };
        else if (/vivaldi/i.test(e)) w = { name: "Vivaldi", vivaldi: !0, version: detectB_initSubscriptionrowserVersion(e, /vivaldi\/(\d+(\.\d+)?)/i) || o };
        else if (t) w = { name: "Sailfish", sailfish: !0, version: s(e, /sailfish\s?browser\/(\d+(\.\d+)?)/i) };
        else if (/seamonkey\//i.test(e)) w = { name: "SeaMonkey", seamonkey: !0, version: s(e, /seamonkey\/(\d+(\.\d+)?)/i) };
        else if (/firefox|iceweasel|fxios/i.test(e)) w = { name: "Firefox", firefox: !0, version: s(e, /(?:firefox|iceweasel|fxios)[ \/](\d+(\.\d+)?)/i) }, /\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(e) && (w.firefoxos = !0);
        else if (l) w = { name: "Amazon Silk", silk: !0, version: s(e, /silk\/(\d+(\.\d+)?)/i) };
        else if (/phantom/i.test(e)) w = { name: "PhantomJS", phantom: !0, version: s(e, /phantomjs\/(\d+(\.\d+)?)/i) };
        else if (/slimerjs/i.test(e)) w = { name: "SlimerJS", slimer: !0, version: s(e, /slimerjs\/(\d+(\.\d+)?)/i) };
        else if (/blackberry|\bbb\d+/i.test(e) || /rim\stablet/i.test(e)) w = { name: "BlackBerry", blackberry: !0, version: o || s(e, /blackberry[\d]+\/(\d+(\.\d+)?)/i) };
        else if (d) w = { name: "WebOS", webos: !0, version: o || s(e, /w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i) }, /touchpad\//i.test(e) && (w.touchpad = !0);
        else if (/bada/i.test(e)) w = { name: "Bada", bada: !0, version: s(e, /dolfin\/(\d+(\.\d+)?)/i) };
        else if (a) w = { name: "Tizen", tizen: !0, version: s(e, /(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || o };
        else if (/qupzilla/i.test(e)) w = { name: "QupZilla", qupzilla: !0, version: s(e, /(?:qupzilla)[\s\/](\d+(?:\.\d+)+)/i) || o };
        else if (/chromium/i.test(e)) w = { name: "Chromium", chromium: !0, version: s(e, /(?:chromium)[\s\/](\d+(?:\.\d+)?)/i) || o };
        else if (/chrome|crios|crmo/i.test(e)) w = { name: "Chrome", chrome: !0, version: s(e, /(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i) };
        else if (m) w = { name: "Android", version: o };
        else if (/safari|applewebkit/i.test(e)) w = { name: "Safari", safari: !0 }, o && (w.version = o);
        else if (r) w = { name: "iphone" == i ? "iPhone" : "ipad" == i ? "iPad" : "iPod" }, o && (w.version = o);
        else if (/googlebot/i.test(e)) w = { name: "Googlebot", googlebot: !0, version: s(e, /googlebot\/(\d+(\.\d+))/i) || o };
        else {
            var k = e.match(/^(.*)\/(.*) /),
                u = "";
            k && 1 < k.length && (u = k[2]), w = { name: s(e, /^(.*)\/(.*) /), version: u }
        }!w.msedge && /(apple)?webkit/i.test(e) ? (/(apple)?webkit\/537\.36/i.test(e) ? (w.name = w.name || "Blink", w.blink = !0) : (w.name = w.name || "Webkit", w.webkit = !0), !w.version && o && (w.version = o)) : !w.opera && /gecko\//i.test(e) && (w.name = w.name || "Gecko", w.gecko = !0, w.version = w.version || s(e, /gecko\/(\d+(\.\d+)?)/i)), w.msedge || !m && !w.silk ? r ? (w[r] = !0, w.ios = !0) : f ? w.mac = !0 : p ? w.xbox = !0 : c ? w.windows = !0 : h && (w.linux = !0) : w.android = !0;
        var g = "";
        return w.windowsphone ? g = s(e, /windows phone (?:os)?\s?(\d+(\.\d+)*)/i) : r ? g = (g = s(e, /os (\d+([_\s]\d+)*) like mac os x/i)).replace(/[_\s]/g, ".") : m ? g = s(e, /android[ \/-](\d+(\.\d+)*)/i) : w.webos ? g = s(e, /(?:web|hpw)os\/(\d+(\.\d+)*)/i) : w.blackberry ? g = s(e, /rim\stablet\sos\s(\d+(\.\d+)*)/i) : w.bada ? g = s(e, /bada\/(\d+(\.\d+)*)/i) : w.tizen && (g = s(e, /tizen[\/\s](\d+(\.\d+)*)/i)), g && (w.osversion = g), w
    };

    var _akpush = function(config) {
        var that = this;

        this.config = {
            randomPrefix: "Shahkoop2aeleiv8Ierief_",
            serverPrefix: "https://",
            serverSavePath: "/pixel?" + ["_push_pix", "/push/subscription/save"].join("="),
            serverDeletePath: "/pixel?" + ["_push_pix", "/push/subscription/delete"].join("="),
            serverCookiePath: "/pixel?" + ["_push_pix", "/set_cookie_only"].join("="),
            swPath: "/service-worker.js",
            isTest: false,
            cookieID: "",
            debug: false,
            browsers: {},
            firebase: {
                authSubdomain: "firebaseapp.com",
                bucketSubdomain: "appspot.com",
                dbSubdomain: "firebaseio.com",
            }
        }

        this.config = Object.assign({}, this.config, injectedConfig, config);

        this.debug = function() {
            if (this.config.debug) {
                console.error.apply(this, arguments);
            }
        }

        this.config.serverURL = this.config.serverURL || String(this.config.serverPrefix + this.config.apiServerHost).replace(/\/+$/, "");

        if (!this.config.browser && 'userAgent' in navigator) {
            var browser = detectBrowser(navigator.userAgent);
            if (browser && browser.name) {
                this.config.browser = browser.name;
            }
            if ('safari' in window && 'pushNotification' in window.safari) { //Safari detection patch
                this.config.browser = "Safari"
            }
        }

        if (!this.config.browser) {
            throw new Error("Can't detect browser");
        }

        this.debug("Detected browser: ", this.config.browser);

        this.sendSubscription = function(action, provider, subscription, match, update, customData) {
            var url;
            switch (action) {
                case "save":
                    url = this.config.serverURL + this.config.serverSavePath;
                    break;
                case "delete":
                    url = this.config.serverURL + this.config.serverDeletePath;
                    break;
                default:
                    throw new Error("Unknown " + action);
            }
            fetch(url, {
                method: 'post',
                credentials: 'include',
                body: JSON.stringify(Object.assign({}, customData || {}, {
                    'provider': provider,
                    'endpoint': subscription.endpoint,
                    'resource_token': this.config.resourceToken,
                    'match': JSON.stringify(match || {}),
                    'update': JSON.stringify(update || {}),
                })),
            }).catch(function(e) {
                console.error("Can't post", action, e)
            })
        }

        this.localToken = function(new_token) {
            if (typeof(new_token) === 'string') {
                localStorage.setItem(this.config.randomPrefix + "current_token", new_token);
            }
            return localStorage.getItem(this.config.randomPrefix + "current_token");
        }

        this.initialiseFirebasePush = function(match, update, customData) {
            firebase.messaging().requestPermission()
                .then(
                    function() {
                        return firebase.messaging().getToken();
                    }
                )
                .then(
                    function(token) {
                        that.debug("Permission granted, token: ", token)
                        if (that.localToken() != token) {
                            that.debug("New token detected: ", token)
                            let subscription = {
                                endpoint: token
                            };
                            that.sendSubscription("save", getNormalizedProvider(that.config.browser) + "Firebase", subscription, match, update, customData);
                        }
                        that.localToken(token);
                    }
                )
                .catch(
                    function(err) {
                        console.error("Error occurred: ", err);
                    }
                );
            firebase.messaging().onMessage(
                function(payload) {
                    that.debug("Message received:", payload)
                    var title = payload.notification.title;
                    var notificationOptions = {
                        body: payload.notification.body,
                        icon: payload.notification.icon,
                        image: payload.notification.image,
                        data: payload.notification.click_action
                    };
                    notificationOptions.actions = payload.notification.actions

                    // var openLink = JSON.parse(payload.data.hub_link).open
                    // var delivLink = JSON.parse(payload.data.hub_link).ack
                    // console.log("do open link")
                    // fetch(openLink, {
                    //     method: 'get',
                    //     mode: 'no-cors',
                    //     credentials: 'include'
                    // }).catch(function(e) {
                    //     console.error("Can't send open action ", e)
                    // })
                    // console.log("do ack link")
                    // fetch(delivLink, {
                    //     method: 'get',
                    //     mode: 'no-cors',
                    //     credentials: 'include'
                    // }).catch(function(e) {
                    //     console.error("Can't send deliv action ", e)
                    // })
                    showNotification(title, notificationOptions);
                    //new Notification(title, notificationOptions);
                }
            );

            function showNotification(title, options) {
                Notification.requestPermission(function(result) {
                    if (result === 'granted') {
                        navigator.serviceWorker.ready.then(function(registration) {
                            registration.showNotification(title, options);
                        });
                    }
                });
            }

        };

        this.initialiseSafariPush = function(permissionData, match, update, cookieId, customData, callback) {
            switch (permissionData.permission) {
                case 'default':
                    window.safari.pushNotification.requestPermission(
                        this.config.browsers.Safari.websitePushAPI,
                        this.config.browsers.Safari.websitePushID,
                        Object.assign({}, customData || {}, {
                            'resource_token': this.config.resourceToken,
                            'cookie_id': cookieId,
                            'match': JSON.stringify(match || {}),
                            'update': JSON.stringify(update || {}),
                            'is_test': JSON.stringify(this.config.isTest),
                        }),
                        function(permissionData) {
                            that.debug("New permissionData: ", permissionData)
                            that.initialiseSafariPush(permissionData, match, update, cookieId, customData, callback);
                        }
                    );
                    break;
                case 'denied':
                    // The user said no
                    that.debug("Denied subscription")
                    break;
                case 'granted':
                    // The web service URL is a valid push provider, and the user said yes.
                    // permissionData.deviceToken is now available to use.
                    that.debug("Approved subscription")
                    if (typeof callback === 'function') {
                        callback(permissionData.deviceToken);
                    }
                    break;
                default:
                    console.error("Unexpected: ", permissionData.permission)
            }
        };

        this.subscribeBasic = function(match, update, customData) {
            navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
                serviceWorkerRegistration.pushManager.subscribe({ userVisibleOnly: true }).then(function(subscription) {
                    that.sendSubscription("save", getNormalizedProvider(that.config.browser), subscription, match, update, customData);
                }).catch(function(err) {
                    if (Notification.permission === 'denied') {
                        console.log('User turned off notifications');
                    } else {
                        console.error('Unable to subscribe', err);
                    }
                });
            });
        };

        this.initialiseBasicPush = function(match, update, customData) {
            if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
                console.error('Notifications is not supported');
                return
            }
            if (Notification.permission !== 'denied') {
                if ('PushManager' in window) {
                    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
                        serviceWorkerRegistration.pushManager.getSubscription().then(function(subscription) {
                            if (!subscription) {
                                that.subscribeBasic(match, update, customData);
                                return;
                            }
                        }).catch(function(err) {
                            console.error('Error on getting subscription data', err);
                        });
                    });
                } else {
                    console.error('Push-notification is not supported by the browser');
                }
            } else {
                console.log('User denied notifications');
            }
        };

        this.isFirebaseLib = function() {
            return typeof(window.firebase) !== 'undefined'
        }

        this.isFirebase = function() {
            if (this.config.allFirebase) return true;
            let browserConfig = this.config.browsers[this.config.browser];
            if (browserConfig) {
                return browserConfig.isFirebase;
            } else {
                throw new Error("Invalid config")
            }
        }

        var getNormalizedProvider = function(provider) {
            return provider.split (" ") .join ("");
        }

        this.isSWorker = function() {
            return ('serviceWorker' in navigator)
        }

        this.getSWPath = function() {
            if (this.config.browser == "Chrome") {
                let expTime = (this.config.expirationSWChrome != "0") ? this.config.expirationSWChrome : "900"
                return this.config.swPath + "?browser=" + this.config.browser + "&expiration=" + Math.floor(Date.now() / (parseInt(expTime, 10) * 1000));
            } else {
                return this.config.swPath + "?browser=" + this.config.browser;
            }
        }

        this._initSubscription = function(match, update, customData) {
            switch (this.config.browser) {
                case "Chrome":
                case "Firefox":
                case "Yandex Browser":
                case "Samsung Internet for Android":
                case "Opera":
                    if (this.isSWorker()) {
                        if (this.isFirebase()) {
                            if (!this.isFirebaseLib()) {
                                console.error("Firebase library not found!");
                                return
                            }
                            firebase.initializeApp({
                                apiKey: this.config.firebase.apiKey,
                                projectId: this.config.firebase.projectId,
                                messagingSenderId: this.config.firebase.messagingSenderId,
                                storageBucket: [this.config.firebase.projectId, this.config.firebase.bucketSubdomain].join("."),
                                authDomain: [this.config.firebase.projectId, this.config.firebase.authSubdomain].join("."),
                                databaseURL: [this.config.firebase.projectId, this.config.firebase.dbSubdomain].join("."),
                            });
                            this.debug("Initialise subscription for: " + this.config.browser + " with Firebase")
                            navigator.serviceWorker.register(this.getSWPath()).then(function(serviceWorkerRegistration) {
                                serviceWorkerRegistration.update();
                                firebase.messaging().useServiceWorker(serviceWorkerRegistration);
                                that.initialiseFirebasePush(match, update, customData);
                            });
                        } else {
                            if (this.config.browser == "Opera" || this.config.browser == "Yandex Browser" || this.config.browser == "Samsung Internet for Android") {
                                console.error("Only firebase supported");
                                return
                            }
                            this.debug("Initialise subscription for: " + this.config.browser + " without Firebase")
                            navigator.serviceWorker.register(this.getSWPath()).then(function(serviceWorkerRegistration) {
                                serviceWorkerRegistration.update();
                                that.initialiseBasicPush(match, update, customData);
                            });
                        }
                    } else {
                        console.error("There is no serviceWorker");
                    }
                    break;
                case "Safari":
                    this.debug("Initialise subscription for: " + this.config.browser + " with Safari")
                    let permissionData = window.safari.pushNotification.permission(that.config.browsers.Safari.websitePushID);
                    that.debug("Permission data: ", permissionData)
                    that.initialiseSafariPush(permissionData, match, update, cookieID, customData);
                    break;
                default:
                    console.error("Browser is not supported: ", this.config.browser)
            }
        }

        this.initSubscription = function(match, update, customData) {
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                that._initSubscription(match, update, customData);
            } else {
                window.addEventListener('load', function() {
                    that._initSubscription(match, update, customData);
                });
            }
        };
    }

    if (typeof(window.AKPush) === 'undefined') {
        window.AKPush = _akpush;
    }

    setCookies();
    var cookieID;

    function setCookies() {
        if ('safari' in window && 'pushNotification' in window.safari) { //Safari detection patch

            let serverCookiePath = "/pixel?" + ["_push_pix", "/set_cookie_only"].join("=");
            let serverPrefix = "https://";
            let apiServerHost = injectedConfig.apiServerHost;
            let serverURL = String(serverPrefix + apiServerHost).replace(/\/+$/, "");
            let resourceToken = injectedConfig.resourceToken;

            fetch(serverURL + serverCookiePath, {
                method: 'post',
                credentials: 'include',
                body: JSON.stringify({ 'resource_token': resourceToken }),
            }).then(function(response) {
                return response.json();
            }).then(function(data) {
                if ('cookie_id' in data) {
                    cookieID = data['cookie_id']
                } else {
                    console.error('Invalid response for set cookie:', data);
                }
            }).catch(function(e) {
                console.error('Unable to set cookie', e);
            });
        }
    }

})(window);
