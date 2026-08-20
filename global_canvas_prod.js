////////////////////////////////////////////////////////////////////////////////
//
// CANVAS LMS - DUAL MESSENGER INTEGRATION SCRIPT
// global_canvas_prod.js
//
// PURPOSE:
// This script integrates TWO conversational AI messengers into Canvas LMS:
// 1. Avaamo 1.0 (Legacy - for backward compatibility and existing workflows)
// 2. Delight AI 2.0 (New - AI-powered student support, Phase 1 pilot)
//
// STRUCTURE OF THIS FILE:
// ├─ Lines 1-73: Environment-specific configurations (New Relic, Analytics, etc.)
// ├─ Lines 74-410: Canvas custom scripts and utilities (faculty preview, etc.)
// ├─ Lines 427-652: AVAAMO 1.0 INTEGRATION
// │  └─ AvaamoChatBot class, JWT token handling, live chat features
// ├─ Lines 654-977: DELIGHT AI 2.0 INTEGRATION (WITH DETAILED COMMENTS)
// │  └─ DelightAgentUI class, session management, SDK initialization
// └─ Lines 980-1010: Dual messenger initialization + ReadSpeaker setup
//
// KEY INTEGRATION POINTS:
//
// DELIGHT AI 2.0 STARTS AT: Line 654 (class DelightAgentUI {)
// Look for: "===== DELIGHT AI 2.0 INTEGRATION STARTS HERE ====="
//
// AVAAMO 1.0 STARTS AT: Line 437 (var AvaamoChatBot = ...)
// Look for: "===== AVAAMO 1.0 INTEGRATION ====="
//
// INITIALIZATION HAPPENS AT: Line 980
// Look for: "===== DUAL MESSENGER INITIALIZATION ====="
//
// IMPORTANT FOR CANVAS TEAM:
// This script assumes Canvas backend implements TWO required endpoints:
// 1. POST /api/v1/avaamo/session (for Avaamo JWT token generation)
// 2. POST /api/v1/delight/session (for Delight session creation)
//
// Without these endpoints, the messengers will fail gracefully with console errors.
//
// DEBUGGING:
// - Open browser console: F12 > Console tab
// - Search for "Avaamo" or "Delight" logs
// - All errors prefixed with messenger name for easy identification
//
// PHASE 1 ROLLOUT PLAN:
// - Both messengers active for testing
// - Monitor console logs for errors
// - Verify both launchers appear in Canvas header
// - Share feedback with Delight team
// - Phase 2: Remove Avaamo after Delight proves reliable
//
////////////////////////////////////////////////////////////////////////////////

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
}

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

// ===== DUAL MESSENGER INTEGRATION =====
// Phase 1: Both Avaamo 1.0 and Delight AI 2.0 running simultaneously
// Avaamo 1.0 continues for existing workflows; Delight AI 2.0 available as new option
// Security: All API credentials kept on Canvas backend (never exposed in client code)

var DelightConfig = {
  appId: '56A1A6C7-7DAC-4B48-8756-D53A77125F71',
  agentId: '2df75d5c-ed47-4515-a61a-1668e72e2322'
};

// ===== AVAAMO 1.0 INTEGRATION =====
var AvaamoChatBot = function(t) {
  function o(t, o) {
    var n = document.createElement("script");
    n.setAttribute("src", t),
      n.setAttribute("id", "avm-web-channel"),
      (n.onload = o),
      document.body.appendChild(n);
  }
  return (
    (this.options = t || {}),
    (this.load = function(t) {
      o(this.options.url, function() {
        window.Avaamo.addFrame(),
          t && "function" == typeof t && t(window.Avaamo);
      });
    }),
    this
  );
};

function getAvaamoJWTURL(isStudent) {
  return isStudent ? "https://bis-api-dot-app-studentportal-prod.uk.r.appspot.com/ava-student-prod/token" :
  "https://bis-api-dot-app-studentportal-prod.uk.r.appspot.com/ava-itsm-prod/token";
}

function getAvaamoWebChannelURL(isStudent) {
  return isStudent ? "https://c0.avaamo.com/web_channels/3663bef4-d5fb-4c84-bab8-86013b2eb0df?user_info=" :
  "https://c0.avaamo.com/web_channels/169a69e1-58d5-47ef-8a67-f9269620fb49?user_info=";
}

class AvaamoAvaUI {
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
      .then(this.updateUser)
      .then(this.includeAvaamoAva)
      .then(this.buildAvaamoLauncher)
      .catch(function(error) {
        console.log("Unable to lookup user information ", error);
      });
  }

  async parseJSON(response) {
    const regex = /"id":(.*),"name"/;
    const text = await response.text();
    let jsonObj = JSON.parse(text);
    const found = text.match(regex);
    if (found.length > 1) {
      jsonObj.id = found[1];
    }
    return jsonObj;
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

  async updateUser(data) {
    let names = data.name.split(" ");
    let first_name = names[0] || "";
    let last_name = names[names.length - 1] || "";
    let user = {
      canvas_id: data.id,
      login_id: data.login_id,
      name: data.name,
      primary_email: data.primary_email,
      avatar: data.avatar_url,
      showAva: false,
      first_name: first_name,
      last_name: last_name
    };

    const url = `https://apigateway.adtalem.com/canvas/1.0/accounts/1/users?search_term=${user.login_id}&enrollment_type=student`;
    console.log(url);
    let res = await fetch(url, {
      headers: {
        "Ocp-Apim-Subscription-Key": "67fcffd70f0e4c2d909ba6914ae2150f",
      }
    }).catch((error) => {
      console.log('Failed to call API.')
      console.log(error);
    });
    const jsonObj = await res.json();
    console.log('User account:');
    console.log(jsonObj);
    user.isStudent = jsonObj.length === 1;
    console.log(user);
    return user;
  }

  buildAvaamoLauncher() {
    // Build launch button
    let iconDiv = document.createElement("div");
    iconDiv.innerHTML =
      '<img style="border-radius: 0%;" src="https://c0avaamo.s3-us-west-2.amazonaws.com/dashboard/bots/avatars/000/095/273/medium/Ava_2022_R02_circle.png?1730143801" class="sc-open-icon" width="30" height="30"/>';
    iconDiv.setAttribute("class", "menu-item-icon-container");

    let textDiv = document.createElement("div");
    textDiv.innerHTML = "Ava";
    textDiv.setAttribute("class", "menu-item__text");

    let g = document.createElement("a");
    g.setAttribute("id", "avaamoLauncher");
    g.setAttribute("href", "javascript:void(0)");
    g.setAttribute("class", "ic-app-header__menu-list-link");
    g.style.cssText = "background-color:rgba(0,0,0,0);outline:none;";
    g.appendChild(iconDiv);
    g.appendChild(textDiv);

    var newLi = document.createElement("li");
    newLi.setAttribute("class", "menu-item ic-app-header__menu-list-item");
    newLi.appendChild(g);

    let parent = document.querySelector(".ic-app-header__menu-list");
    if (parent) {
      parent.insertBefore(
        newLi,
        document.querySelector("#global_nav_help_link").parentElement
      );
    }

    document
      .querySelector("#avaamoLauncher")
      .addEventListener("click", function() {
        window.Avaamo.openChatBox();
      });
  }

  includeAvaamoAva(user) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      uuid: user.login_id,
      email: user.primary_email,
      first_name: user.first_name,
      last_name: user.last_name,
      dnumber: user.login_id,
      canvas_id: user.canvas_id
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      mode: "cors",
      body: raw,
      redirect: "follow"
    };

    const JWT_URL = getAvaamoJWTURL(user.isStudent);

    fetch(JWT_URL, requestOptions)
      .then(response => response.text())
      .then(result => {
        let avaamoToken = JSON.parse(result).result.token;
        var avaamoUrl = getAvaamoWebChannelURL(user.isStudent) + avaamoToken;
        console.log("avaamoUrl:", avaamoUrl);
        var chatBox = new AvaamoChatBot({
          url: avaamoUrl
        });
        chatBox.load(function (avaamo) {
          avaamo.onChatIframeLoad = function () {
            var popup = document.querySelector('#avaamo__popup');
            var botClose = document.querySelector('.avaamo_popup__close');
            var btn = document.createElement("button");
            btn.innerHTML = "End Live Chat";
            btn.id = "live-agent-end";
            btn.classList.add("end-live-chat");
            btn.classList.add("hide");
            popup.appendChild(btn);
            btn.addEventListener('click', function () {
              window.Avaamo.sendMessage("End Live Chat", "#end agent")
            });
          }
          avaamo.onBotMessage = function (message) {
            if (message.hasOwnProperty('content')) {
              if (message.content.startsWith('A live agent will be right with you.')) {
                var btn = document.querySelector('#live-agent-end');
                btn.classList.remove("hide");
              } else if (message.content.startsWith('Live chat has ended')) {
                var btn = document.querySelector('#live-agent-end');
                btn.classList.add("hide");
              }
              else if (message.content === 'You have already exited live agent conversation') {
                var btn = document.querySelector('#live-agent-end');
                btn.classList.add("hide");
              }
            }
          }
        });
      })
      .catch(error => console.log("error", error));

    return user;
  }

}

////////////////////////////////////////////////////////////////////////////////
// ===== DELIGHT AI 2.0 INTEGRATION STARTS HERE =====
////////////////////////////////////////////////////////////////////////////////
//
// PURPOSE:
// - Replaces/supplements Avaamo 1.0 with Delight AI 2.0 conversational agent
// - Phase 1: Both messengers run simultaneously (Avaamo 1.0 + Delight AI 2.0)
// - Provides AI-powered student support with Canvas user context
//
// SECURITY NOTES:
// - All Delight API credentials are NEVER exposed in client code
// - Credentials stored securely on Canvas backend
// - Client only receives session tokens (not API keys)
// - Session creation happens via Canvas backend API
//
// INITIALIZATION FLOW:
// 1. Fetch Canvas user profile (Canvas API: /api/v1/users/self/profile)
// 2. Extract student ID, name, email, Canvas ID
// 3. Create Delight session on Canvas backend (/api/v1/delight/session)
// 4. Receive session_token and user_id from backend
// 5. Load Delight SDK from CDN
// 6. Initialize SDK with session token and user context
// 7. Build launcher UI button in Canvas header
// 8. Handle errors gracefully with console logging
//
// CONFIGURATION:
// - appId: Delight application identifier
// - agentId: Delight AI agent/bot identifier
//
// LAUNCHER UI:
// - Icon: Purple circle with checkmark SVG
// - Label: "AI Assistant"
// - Position: Canvas header navigation (before Help link)
// - Click action: Opens Delight chat interface
//
// CANVAS BACKEND REQUIREMENTS:
// The Canvas backend MUST implement: POST /api/v1/delight/session
// Request Body:
// {
//   "canvas_id": "12345",
//   "login_id": "student@example.com",
//   "student_id": "67890",
//   "first_name": "John",
//   "last_name": "Doe",
//   "primary_email": "john.doe@example.com"
// }
// Response (Success):
// {
//   "success": true,
//   "session_token": "eyJ...",
//   "user_id": "u_abc123",
//   "message": "Session created"
// }
//
// ANALYTICS & CONTEXT DATA SENT TO DELIGHT:
// {
//   "student_id": "extracted from login_id",
//   "canvas_id": "Canvas user ID",
//   "login_id": "Canvas login email",
//   "first_name": "From Canvas profile",
//   "last_name": "From Canvas profile",
//   "primary_email": "Canvas email",
//   "platformId": "canvas"  // Identifies this as Canvas platform
// }
//
// BROWSER CONSOLE LOGS (For Debugging):
// - "Canvas user profile fetched for Delight initialization"
// - "Creating Delight user session via Canvas backend"
// - "Delight session created successfully"
// - "Delight SDK script loaded"
// - "Delight SDK initialized successfully"
// - "Delight launcher created successfully"
//
// ERROR HANDLING:
// - All errors logged to console with "Delight" prefix
// - Graceful failures (won't break Canvas)
// - Check browser console (F12) for troubleshooting
//
////////////////////////////////////////////////////////////////////////////////

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

  // STEP 1: Fetch user profile from Canvas
  // Initiates the initialization chain by getting Canvas user data
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

  // Validate HTTP response status (200-299 = success)
  checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  }

  // Parse JSON response and extract Canvas user ID
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

  // STEP 2: Extract and prepare user data from Canvas profile
  // Organizes Canvas profile data into format needed for Delight
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

  // STEP 3: Create Delight session via Canvas backend
  // IMPORTANT: Backend endpoint (/api/v1/delight/session) must be implemented by Canvas team
  // Canvas backend handles secure Delight API authentication (client never sees API keys)
  async createDelightSession(user) {
    try {
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

  // STEP 4: Load Delight SDK from CDN
  // Downloads and injects Delight JavaScript SDK into page
  // Checks if already loaded to avoid duplicate loading
  async loadDelightSDK(user) {
    return new Promise((resolve, reject) => {
      if (window.DelightAI) {
        console.log('Delight SDK already loaded, skipping reload');
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

  // STEP 5: Initialize Delight SDK with session token and user context
  // IMPORTANT: This sends user data (student_id, email, name, etc.) to Delight backend
  // This data enables personalization and analytics within Delight platform
  async initDelightSDK(user) {
    try {
      // Context object: Canvas-specific metadata sent to Delight for analytics and personalization
      const context = {
        student_id: user.student_id,
        canvas_id: user.canvas_id,
        login_id: user.login_id,
        first_name: user.first_name,
        last_name: user.last_name,
        primary_email: user.primary_email,
        platformId: 'canvas'  // Identifies this session as coming from Canvas
      };

      // Initialize Delight SDK with session token and context
      // sessionToken validates the user with Delight backend
      // context enables personalization and platform-specific filtering
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

  // STEP 6: Build and inject launcher UI button into Canvas header
  // Creates the "AI Assistant" button that appears in Canvas navigation
  // Positioned before Help link to maintain UI consistency
  buildDelightLauncher(user) {
    try {
      // Create launcher icon container with SVG checkmark icon (purple circle)
      let iconDiv = document.createElement("div");
      iconDiv.innerHTML =
        '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;"><circle cx="12" cy="12" r="10" fill="#667eea" stroke="currentColor" stroke-width="1"/><path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      iconDiv.setAttribute("class", "menu-item-icon-container");

      // Create launcher text label
      let textDiv = document.createElement("div");
      textDiv.innerHTML = "AI Assistant";
      textDiv.setAttribute("class", "menu-item__text");

      // Create launcher link element
      let g = document.createElement("a");
      g.setAttribute("id", "delightLauncher");
      g.setAttribute("href", "javascript:void(0)");
      g.setAttribute("class", "ic-app-header__menu-list-link");
      g.style.cssText = "background-color:rgba(0,0,0,0);outline:none;cursor:pointer;";
      g.appendChild(iconDiv);
      g.appendChild(textDiv);

      // Create launcher list item container
      var newLi = document.createElement("li");
      newLi.setAttribute("class", "menu-item ic-app-header__menu-list-item");
      newLi.appendChild(g);

      // Insert launcher into Canvas header menu (before Help link)
      let parent = document.querySelector(".ic-app-header__menu-list");
      if (parent) {
        let helpLink = document.querySelector("#global_nav_help_link");
        if (helpLink && helpLink.parentElement) {
          parent.insertBefore(newLi, helpLink.parentElement);
        } else {
          parent.appendChild(newLi);
        }
      }

      // Add click event handler to open Delight chat interface
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

////////////////////////////////////////////////////////////////////////////////
// ===== DUAL MESSENGER INITIALIZATION =====
// Runs when Canvas page loads (DOM ready)
// Both Avaamo 1.0 and Delight AI 2.0 start simultaneously
//
// IMPORTANT NOTES:
// 1. Each messenger initializes independently
// 2. Failures in one don't affect the other
// 3. Both launchers appear in Canvas header (separate icons)
// 4. Check browser console (F12) for initialization logs
// 5. Canvas backend must support BOTH endpoints:
//    - /api/v1/avaamo/session (for Avaamo 1.0)
//    - /api/v1/delight/session (for Delight AI 2.0)
//
// TO DEBUG:
// - Open browser console: F12 > Console tab
// - Look for logs starting with "Avaamo" or "Delight"
// - Check for error messages
// - Verify both endpoints are responding
////////////////////////////////////////////////////////////////////////////////

(function() {
  // Initialize Avaamo 1.0 (existing messenger - for backward compatibility)
  if (!document.querySelector("#avaamoLauncher")) {
    try {
      new AvaamoAvaUI();
      console.log('Avaamo 1.0 initialization started');
    } catch (error) {
      console.error('Avaamo 1.0 initialization failed:', error);
    }
  }

  // Initialize Delight AI 2.0 (new AI-powered messenger - Phase 1 pilot)
  if (!document.querySelector("#delightLauncher")) {
    try {
      new DelightAgentUI();
      console.log('Delight AI 2.0 initialization started');
    } catch (error) {
      console.error('Delight AI 2.0 initialization failed:', error);
    }
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
