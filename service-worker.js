(function(self) {
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
        }
    };

    var config = {
        serverPrefix: "https://",
        serverPushContentPath: "/pixel?" + ["_push_pix", "/push/content/get"].join("="),
        debug: false,
        browsers: {},
        firebase: {
            authSubdomain: "firebaseapp.com",
            bucketSubdomain: "appspot.com",
            dbSubdomain: "firebaseio.com",
        }
    }

    config = Object.assign({}, config, injectedConfig);

    var debug = function() {
        if (config.debug) {
            console.log.apply(this, arguments);
        }
    }

    config.serverURL = config.serverURL || String(config.serverPrefix + config.apiServerHost).replace(/\/+$/, "");

    var los = location.search.substring(1).split("&");
    if (los && los.length) {
        los.map(function(one) {
            var os = one.split("=");
            if (os[0] === "browser" && os[1]) {
                config.browser = decodeURI(os[1]);
            }
        })
    }

    if (!config.browser) {
        throw new Error("No browser submitted")
    }

    var isFirebase = function() {
        if (config.allFirebase) return true;
        let browserConfig = config.browsers[config.browser];
        if (browserConfig) {
            return browserConfig.isFirebase;
        } else {
            throw new Error("Invalid config")
        }
    }

    var getNormalizedProvider = function() {
        return config.browser.split (" ") .join ("");
    }

    if (isFirebase()) {
        importScripts('https://www.gstatic.com/firebasejs/5.2.0/firebase-app.js');
        importScripts('https://www.gstatic.com/firebasejs/5.2.0/firebase-messaging.js');
        self.addEventListener('push', function(event) {
            var openLink = JSON.parse(event.data.json().data.hub_link).open
            var delivLink = JSON.parse(event.data.json().data.hub_link).ack
            fetch(openLink, {
                method: 'get',
                mode: 'no-cors',
                credentials: 'include'
            }).catch(function(e) {
                debug("Can't send open action ", e)
            })
            fetch(delivLink, {
                method: 'get',
                mode: 'no-cors',
                credentials: 'include'
            }).catch(function(e) {
                debug("Can't send deliv action ", e)
            })
        });

        firebase.initializeApp({
            apiKey: config.firebase.apiKey,
            projectId: config.firebase.projectId,
            messagingSenderId: config.firebase.messagingSenderId,
            storageBucket: [config.firebase.projectId, config.firebase.bucketSubdomain].join("."),
            authDomain: [config.firebase.projectId, config.firebase.authSubdomain].join("."),
            databaseURL: [config.firebase.projectId, config.firebase.dbSubdomain].join("."),
        });
        const messaging = firebase.messaging();
        messaging.setBackgroundMessageHandler(function(payload) {
            debug("SW Received push: ", payload);
            var title = payload.data.title;
            var notificationOptions = {
                body: payload.data.message,
                icon: payload.data.icon,
                image: payload.data.image,
                click_action: payload.data.action
            };
            notificationOptions.actions = payload.data.actions

            return self.registration.showNotification(title, notificationOptions);
        });
    }

    self.addEventListener('install', function(event) {
        debug("SW Installed: ", event);
    });

    self.addEventListener('fetch', function(event) {
        debug("SW Fetched: ", event);
    });

    if (!isFirebase()) {
        self.addEventListener('push', function(event) {
            debug("SW Received push: ", event);
            event.waitUntil(
                self.registration.pushManager.getSubscription().then(function(subscription) {
                    return fetch(config.serverURL + config.serverPushContentPath, {
                        method: 'post',
                        credentials: 'include',
                        body: JSON.stringify({
                            'provider': getNormalizedProvider(),
                            'endpoint': subscription.endpoint,
                            'resource_token': config.resourceToken,
                        })
                    }).then(function(response) {
                        if (response.status !== 200) {
                            throw new Error("Error on getting push content: " + response.status);
                        }

                        return response.json().then(function(data) {
                            if (data.error) {
                                throw new Error("The server returns an error: ", data.error);
                            }

                            var title = data.data.title;
                            var body = data.data.body;
                            var icon = data.data.icon;
                            var tag = data.data.tag;
                            var data = data.data.data;

                            return self.registration.showNotification(title, {
                                body: body,
                                icon: icon,
                                tag: tag,
                                data: data
                            });
                        });
                    }).catch(function(err) {
                        console.error("Unable to receive data from server", err);
                    })
                })
            );
        });
    }

    self.addEventListener('notificationclick', function(event) {
        debug("SW Click: ", event)
        if (event.notification.tag === 'user_visible_auto_notification' || (!event.notification.data && event.action === "")) {
            return;
        }
        event.notification.close();
        event.waitUntil(
            clients.matchAll({
                type: 'window'
            }).then(function(clientList) {
                var url = event.notification.data;
                if (event.action !== '' && typeof event.action === "string") {
                    url = event.action;
                }
                if (url.indexOf("?provider=") === -1) {
                    if (isFirebase()) {
                        url = url + "?provider=" + getNormalizedProvider() + "Firebase";
                    } else {
                        url = url + "?provider=" + getNormalizedProvider();
                    }
                }

                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
        );
    });

})(self)
