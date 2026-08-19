// Load Environment-specific JavaScript Files
var refDomain = window.location.hostname;
switch(refDomain) {
    case "chamberlain.test.instructure.com":
	// New Relic Browser
        $.getScript('https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/js/newrelic-browser_canvas-test.js', function() {
            console.log('Loaded New Relic Browser for Canvas Test.');
        });
        // DesignPLUS
        $.getScript('https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/js/designplus.js', function() {
            console.log('Loaded DesignPLUS for Canvas Test.');
        });
	break;
    case "chamberlain.beta.instructure.com":
	// New Relic Browser
        $.getScript('https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/js/newrelic-browser_canvas-beta.js', function() {
            console.log('Loaded New Relic Browser for Canvas Beta.');
        });
	// Google Analytics
        $.getScript('https://www.googletagmanager.com/gtag/js?id=G-Z25LN5DGGV', function() {
            console.log('Loaded Google Analytics 4 Tracking for Canvas Beta.');
        });
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-Z25LN5DGGV');
        // DesignPLUS
        $.getScript('https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/js/designplus.js', function() {
            console.log('Loaded DesignPLUS for Canvas Beta.');
        });
	break;
    case "chamberlain.instructure.com":
	// New Relic Browser
        $.getScript('https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/js/newrelic-browser_canvas-prod.js', function() {
            console.log('Loaded New Relic Browser for Canvas Prod.');
        });
	// Google Analytics
        $.getScript('https://www.googletagmanager.com/gtag/js?id=G-SVPSKPJ49X', function() {
            console.log('Loaded Google Analytics 4 Tracking for Canvas Prod.');
        });
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-SVPSKPJ49X');
        // DesignPLUS
        $.getScript('https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/js/designplus.js', function() {
            console.log('Loaded DesignPLUS for Canvas Prod.');
        });
	break;
}

////////////////////////////////////////////////////
// Start Hide Faculty Preview Publish Button	  //
////////////////////////////////////////////////////

// Get all elements with the attribute data-module-item-name
var elementsWithModuleName = document.querySelectorAll('[data-module-item-name]');

// Loop through the elements and hide them if their text contains "Faculty Preview"
elementsWithModuleName.forEach(function (element) {
  var moduleName = element.getAttribute('data-module-item-name');
  if (moduleName.includes('Faculty Preview')) {
    element.style.display = 'none';
  }
});

////////////////////////////////////////////////////
// End Hide Faculty Preview Publish Button	  //
////////////////////////////////////////////////////

////////////////////////////////////////////////////
// CU CUSTOM SCRIPTS                              //
////////////////////////////////////////////////////
const path = window.location.pathname;
const findTerm = (term) => {
  if (path.includes(term)){
    return path;
  }
};

// Don't load custom scripts from the SpeedGrader, Submissions or OTP areas.
switch (path) {
  case findTerm('speed_grader'):
        console.log('In Speedgrader: Skipping Custom Scripts');
      break;
  case findTerm('submissions'):
        console.log('In Submissions: Skipping Custom Scripts');
      break;
  case findTerm('otp'):
        console.log('In OTP: Skipping Custom Scripts');
      break;
  default:
	$.getScript('https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/js/cbln_custom.js', function() {
	    console.log('Loaded cbln_custom.js.');
	});

var CanvasDetails = {};
(function () {

    CanvasDetails.location = getLocationDetails();
    $.get("/api/v1/users/self", function (data) {
        CanvasDetails.userInfo = data;
    });
    if (CanvasDetails.location.courses) {
        $.get("/api/v1/courses/" + CanvasDetails.location.courses, function (data) {
            CanvasDetails.courseInfo = data;
            // $("body").append("<div class='insructor-tools'></div>");
        });
    }
     if (CanvasDetails.location && CanvasDetails.location.search && CanvasDetails.location.search.noframe == "true") {
        onElementRendered("body", function () {
            var tag = "<style type='text/css'> #not_right_side {\
                    background: #eee none repeat scroll 0 0;\
                    bottom: 0;\
                    left: 0;\
                    overflow: auto;\
                    position: fixed;\
                    right: 0;\
                    top: 0;\
                    z-index: 10000;\
                }\
                header.ic-app-header {\
                    display: none;\
                }\
                html{\
                    overflow: hidden;\
                }</style>"
            $(tag).appendTo("head");
        });
    }

    onElementRendered(".intro-card", function (el) {
        $(el).each(function (idx, el) {
            el = $(el);
            // Set the href value of the link, replacing various pieces first
            el.attr('data-target-url', el.attr('data-target-url')
                    .replace('$CANVAS_COURSE_REFERENCE$', "courses/" + CanvasDetails.location.courses).replace('$CANVAS_COURSE_REFERENCE$', "").replace('$WIKI_REFERENCE$', ""));
        });
    });

    onElementRendered($("h2:contains(Add Account Admins)"), function () {
        $('<div><form><label>Search for User To Add</label><div class="ic-Input-group"><input type="text" class="ic-Input" id="dvu-search-query"><input type="submit" class="Button Button---primary" id="dvu-search-for-users" value="search"></div></form><ul class="admins_list user_list list admins" id="dos-user-results" style="max-height:200px;overflow:auto;"></ul></div>').insertAfter("#admin_role_id");
        $("#dvu-search-for-users").click(function (e) {
            e.preventDefault();
            $("#dos-user-results").empty();
            $.get("/api/v1/accounts/1/users?search_term=" + $("#dvu-search-query").val()).then(function (data) {
                $.each(data, function (i, v) {
                    $('<li id="dos-user-toadd">\
                        <span class="user_name name">' + v.name + '</span>\
                        <a title="Add to list" class="dos-add-user-to-list no-hover" data-user-login="' + v.login_id + '" style="float:right;" href="https://devryu.instructure.com/accounts/6/account_users/19"><i class="icon-add standalone-icon"></i></a>\
                        <span class="email">' + v.login_id + '</span>\
                    </li>').appendTo($("#dos-user-results"));
                });
            });
        })
        $("#dos-user-results").on("click", ".dos-add-user-to-list", function (e) {
            e.preventDefault();
            if ($("#user_list").val().indexOf($(this).attr("data-user-login")) < 0)
                $("#user_list").val($("#user_list").val() + " " + $(this).attr("data-user-login"));
        });
    });

    var toLoad = {
        scripts: [
            {src: "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/ccn/pagespecific.js", onLoad: function () {
                }},

            {src: "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/ccn/ccn_script.js", onLoad: function () {
                    loader({src: "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/sidebar_usergrabnewnew.js", onLoad: function () {

                        }});
                }},
            {src: "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/dynamic/script.js?load=cu", onLoad: function () {
                }},
            {src: "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/lib/jqueryui/jquery-ui.min.js", onLoad: function () {
                }},
            {src: "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/jquery.acornmediaplayer.js", onLoad: function () {
                }},
            {src: "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/audio_player.js", onLoad: function () {
                }},
            {src: "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/videoplaylist.js", onLoad: function () {
                }},
            {src: "https://cdnapisec.kaltura.com/p/1432812/sp/143281200/embedIframeJs/uiconf_id/27266491/partner_id/1432812", onLoad: function () {
                }},
            {src: "https://cdnapisec.kaltura.com/p/1432812/sp/143281200/embedIframeJs/uiconf_id/27266422/partner_id/1432812", onLoad: function () {
                }},
            {src: "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/kalturavideo.js", onLoad: function () {
                }},
            {src: "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/HShow.js", onLoad: function () {
                }},
            {src: "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/hideshow2.js", onLoad: function () {
                }},
            {src: "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/imagedesc.js", onLoad: function () {
                }},
            {src: "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/expertsays.js", onLoad: function () {
                }},
       //     {src: "https://f1-na.readspeaker.com/script/6598/webReader/ReadSpeaker.Canvas.js", onLoad: function () {
      //        }},
            {src: "https://use.fontawesome.com/90a4b89be9.js", onLoad: function () {
                }},
            {src: "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.js", onLoad: function () {
                    onElementRendered('.slick-carousel-item', function (item) {
                        item.each(function () {
                            var settings = {dots: true};
                            var insettings = $(this).attr("data-slick-settings");
                            if (insettings !== undefined) {
                                insettings = insettings.split(/;/);
                                $.each(insettings,
                                        function (i, item) {
                                            if (item.length > 1) {
                                                item = item.split(/:/);
                                                try {
                                                    settings[item[0]] = eval(item[1]);
                                                } catch (e) {
                                                    console.warn("could not load setting " + item[0], e);
                                                }
                                            }
                                        });
                            }
                            $(this).slick(settings);
                        });
                    });
                }
            }
        ],
        css: [
            "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/testing/ccn_style_july_31_2023.css",
            "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/styles/acornmediaplayer.base.css",
            "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/lib/jqueryui/jquery-ui.min.css",
            "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/styles/videoplaylist.css",
            "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/styles/kalturaplayerstyles.css",
            "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css",
            "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.css",
            "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/styles/slickfix.css",
            "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/styles/mediadevelopment.css",
            "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/styles/animate-custom.css",
        ]

    }

    if (CanvasDetails && CanvasDetails.location && CanvasDetails.location.hasOwnProperty('edit')) {

    } else {

        toLoad.scripts.push({src: "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML&delayStartupUntil=configured", onLoad: function () {
                loader({src: "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/consistent-eq-cnvs.js", onLoad: function () {
                        MathJax.Hub.Configured();
                    }});
            }});
    }
    if (CanvasDetails.location.pages) {
        onElementRendered("#wiki_page_show .page-title", function (element) {
            if ($("#wiki_page_show .section").length <= 0) {
                $("#wiki_page_show").addClass("enable-editing");
            }
        });
    }
    if (ENV && ENV.current_user_roles && ENV.current_user_roles.indexOf("admin") >= 0) {
        onElementRendered("#wiki_page_show", function (element) {
            $("#wiki_page_show").addClass("enable-editing");
        });
        onElementRendered("body", function (element) {
            $("body").addClass("is-admin");
        });
    } else {
        onElementRendered("#tab-details", function (element) {
            $("#tab-details").find("input").attr("disabled", "true");
            $("#tab-details").find("select").not("#course_home_page_announcement_limit").attr("disabled", "true");
            $("#course_home_page_announcement_limit").removeAttr("disabled");
            $("#tab-details").find(".ui-datepicker-trigger").attr("disabled", "true");
        });
    }

    onElementRendered(".prettyprint", function (element) {
        if (typeof PR !== "undefined" && PR.prettyprint) {
            PR.prettyPrint();
        } else {
            appendCSS("https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/lib/pretty/prettify.css");
            loader({src: "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/lib/pretty/prettify.js", onLoad: function () {
                    loader({src: "https://storage.googleapis.com/gcp-wu-prod-lms-metrics/cbln_canvas/scripts/lib/pretty/lang-vb.js", onLoad: function () {
                            console.log("loaded");
                            PR.prettyPrint();
                        }});
                }});
        }


    });




    loadCss(toLoad.css);
    var len = toLoad.scripts.length;
    loadScripts(toLoad.scripts, function () {
        onElementRendered("[data-mig-tag]", function (el) {
            $(el).each(function (i, element) {
                if ($(element).attr("data-mig-tag") === "script") {
                    if ($(element).attr("data-mig-src") !== undefined)
                        loader({src: $(element).attr("data-mig-src")});
                    else
                        loader({text: $(element).html()});
                } else if ($(element).attr("data-mig-tag") === "style") {
                    appendCSS($(element).attr("data-mig-src"));
                }
            })
        });
        console.log("loaded ", len)
    });


    function loader(scr, handler) {
        var script = document.createElement("script");
        if (scr.src) {
             //old code
            //script.src = scr.src;
            //After changes
            script.src = encodeURIComponent(scr.src);
            script.onload = script.onreadystatechange = function () {
                script.onreadystatechange = script.onload = null;
                if (scr.onLoad)
                    scr.onLoad();
                if (typeof handler === "function")
                    handler();
            }
            var head = document.getElementsByTagName("head")[0];
            (head || document.body).appendChild(script);
        } else if (scr.text) {
            addScriptBlock(scr.text, scr.onLoad);
        }
    }
    ;
    function loadScripts(array, callback) {

        (function run() {
            if (array.length != 0) {
                loader(array.shift(), run);
            } else {
                callback && callback();
            }
        })();
    }
    function addScriptBlock(text, callback) {
        var script = document.createElement("script");
        script.innerHTML = text
        var head = document.getElementsByTagName("head")[0];
        (head || document.body).appendChild(script);
        if (typeof callback === "function")
            callback();
    }

    function loadCss(array) {
        $.each(array, function (i, v) {
            appendCSS(v)
        });
    }

    function appendCSS(v) {
        var link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
         //Old code
        //link.setAttribute('href', v);
        // Assuming 'v' contains the URL that needs to be set as the href attribute
        link.setAttribute('href', encodeURIComponent(v));
        document.getElementsByTagName('head')[0].appendChild(link);
    }

    function getLocationDetails() {
        try {
            var details = {url: location.href, search: {}};
            var path = location.pathname;
            path = path.split("/");
            for (var i = 1; i < path.length; i += 2) {
                details[path[i]] = path[i + 1];
            }
            if (location.search.length > 0) {
                var search = location.search.replace(/^\?/, "")
                search = search.split(/\&/);
                for (var i = 0; i < search.length; i++) {
                    var d = search[i].split("=");
                    details.search[d[0]] = d[1];
                }
            }
        } catch (e) {
            console.log(e)
        }
        return details;
    }

})();


function onElementRendered(selector, cb, _attempts) {
    var el = $(selector);
    _attempts = ++_attempts || 1;
    if (el.length)
        return cb(el);
    if (_attempts == 60)
        return;
    setTimeout(function () {
        onElementRendered(selector, cb, _attempts);
    }, 250);
}

function onVarAvailable(variable, cb, _attempts) {

    _attempts = ++_attempts || 1;
    var value;
    try {
        if (typeof eval("window." + variable.join(".")) !== "undefined")
            value =  eval("window." + variable.join("."));
    } catch (e) {
    }
    if(value){
        return cb(value);
    }
    if (_attempts == 60){
        return;
    }

    setTimeout(function () {
        onVarAvailable(variable, cb, _attempts);
    }, 250);
}

// ===== DELIGHT AI INTEGRATION =====
// Replaces deprecated Avaamo 1.0 with Delight AI 2.0 conversational agent
// Security: All Delight API credentials are kept on Canvas backend (never exposed in client code)

var DelightConfig = {
  appId: '56A1A6C7-7DAC-4B48-8756-D53A77125F71',
  agentId: '2df75d5c-ed47-4515-a61a-1668e72e2322'
};

class DelightAgentUI {
  constructor() {
    this.options = {
      credentials: "same-origin",
      headers: {
        accept: "application/json"
      }
    };
    this.fetchProfile();
  }

  fetchProfile() {
    fetch("/api/v1/users/self/profile", this.options)
      .then(this.checkStatus)
      .then(this.parseJSON)
      .then(this.updateUser.bind(this))
      .then(this.createDelightSession.bind(this))
      .then(this.loadDelightSDK.bind(this))
      .then(this.initDelightSDK.bind(this))
      .then(this.buildDelightLauncher.bind(this))
      .catch(function(error) {
        console.error("Delight initialization error:", error);
      });
  }

  checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  }

  async parseJSON(response) {
    const regex = /"id":(.*),"name"/;
    const text = await response.text();
    let jsonObj = JSON.parse(text);
    const found = text.match(regex);
    if (found && found.length > 1) {
      jsonObj.id = found[1];
    }
    return jsonObj;
  }

  async updateUser(data) {
    let names = data.name.split(" ");
    let first_name = names[0] || "";
    let last_name = names[names.length - 1] || "";

    let student_id = data.login_id.replace(/\D/g, '') || data.id;

    let user = {
      canvas_id: data.id,
      login_id: data.login_id,
      student_id: student_id,
      name: data.name,
      primary_email: data.primary_email,
      avatar: data.avatar_url,
      first_name: first_name,
      last_name: last_name
    };

    console.log('Canvas user profile fetched for Delight initialization');
    return user;
  }

  async createDelightSession(user) {
    try {
      // Call Canvas backend endpoint (same pattern as Avaamo)
      // Canvas backend securely handles Delight API authentication with stored credentials
      var raw = JSON.stringify({
        canvas_id: user.canvas_id,
        login_id: user.login_id,
        student_id: user.student_id,
        first_name: user.first_name,
        last_name: user.last_name,
        primary_email: user.primary_email
      });

      var requestOptions = {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: "same-origin",
        body: raw
      };

      console.log('Creating Delight user session via Canvas backend');

      const response = await fetch("/api/v1/delight/session", requestOptions);
      const result = await response.json();

      if (result.success && result.session_token) {
        user.sessionToken = result.session_token;
        user.userId = result.user_id;
        console.log('Delight session created successfully');
        return user;
      } else {
        throw new Error(`Delight session creation failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating Delight session:", error);
      throw error;
    }
  }

  async loadDelightSDK(user) {
    return new Promise((resolve, reject) => {
      if (window.DelightAI) {
        resolve(user);
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://aiagent.delight.ai/orgs/default/index.js';
      script.async = true;

      script.onload = function() {
        console.log('Delight SDK script loaded');
        resolve(user);
      };

      script.onerror = function() {
        reject(new Error('Failed to load Delight SDK'));
      };

      document.head.appendChild(script);
    });
  }

  async initDelightSDK(user) {
    try {
      // Delight context object: Canvas-specific metadata sent to Delight backend for analytics and personalization
      const context = {
        student_id: user.student_id,
        canvas_id: user.canvas_id,
        login_id: user.login_id,
        first_name: user.first_name,
        last_name: user.last_name,
        primary_email: user.primary_email,
        platformId: 'canvas'
      };

      // Initialize Delight SDK with session token and context
      if (window.DelightAI && typeof window.DelightAI.init === 'function') {
        await window.DelightAI.init({
          appId: DelightConfig.appId,
          agentId: DelightConfig.agentId,
          userId: user.userId,
          sessionToken: user.sessionToken,
          context: context
        });

        console.log('Delight SDK initialized successfully');
      } else {
        console.warn('Delight SDK initialization API not available');
      }

      return user;
    } catch (error) {
      console.error("Error initializing Delight SDK:", error);
      throw error;
    }
  }

  buildDelightLauncher(user) {
    try {
      // Create launcher icon container
      let iconDiv = document.createElement("div");
      iconDiv.innerHTML =
        '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;"><circle cx="12" cy="12" r="10" fill="#667eea" stroke="currentColor" stroke-width="1"/><path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      iconDiv.setAttribute("class", "menu-item-icon-container");

      // Create launcher text
      let textDiv = document.createElement("div");
      textDiv.innerHTML = "AI Assistant";
      textDiv.setAttribute("class", "menu-item__text");

      // Create launcher link
      let g = document.createElement("a");
      g.setAttribute("id", "delightLauncher");
      g.setAttribute("href", "javascript:void(0)");
      g.setAttribute("class", "ic-app-header__menu-list-link");
      g.style.cssText = "background-color:rgba(0,0,0,0);outline:none;cursor:pointer;";
      g.appendChild(iconDiv);
      g.appendChild(textDiv);

      // Create launcher list item
      var newLi = document.createElement("li");
      newLi.setAttribute("class", "menu-item ic-app-header__menu-list-item");
      newLi.appendChild(g);

      // Insert launcher before help link (maintains original position)
      let parent = document.querySelector(".ic-app-header__menu-list");
      if (parent) {
        let helpLink = document.querySelector("#global_nav_help_link");
        if (helpLink && helpLink.parentElement) {
          parent.insertBefore(newLi, helpLink.parentElement);
        } else {
          parent.appendChild(newLi);
        }
      }

      // Add click handler to open Delight chat
      let launcher = document.querySelector("#delightLauncher");
      if (launcher) {
        launcher.addEventListener("click", function(e) {
          e.preventDefault();
          if (window.DelightAI && typeof window.DelightAI.openChat === 'function') {
            window.DelightAI.openChat();
          } else {
            console.warn('Delight chat API not available');
          }
        });

        console.log('Delight launcher created successfully');
      }
    } catch (error) {
      console.error("Error building Delight launcher:", error);
    }
  }
}

// Initialize Delight AI on page load (replaces deprecated Avaamo integration)
(function() {
  if (!document.querySelector("#delightLauncher")) {
    new DelightAgentUI();
  }
})();

window.rsConf = {docReader: {}};
(function() {
    jQuery.ajax({
        url: "//cdn-na.readspeaker.com/script/6598/webReaderForEducation/canvas/current/ReadSpeaker.Canvas.js",
        dataType: 'script',
        async: true,
        cache: true
    });
})();
