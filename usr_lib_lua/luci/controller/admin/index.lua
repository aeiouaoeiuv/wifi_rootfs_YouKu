
module("luci.controller.admin.index", package.seeall)

function index()
    local root = node()
    if not root.target then
        root.target = alias("admin")
        root.index = true
    end

    local page   = node("admin")
    page.target  = firstchild()
    page.title   = _("Administration")
    page.order   = 10
    page.sysauth = "admin"
    page.sysauth_authenticator = "htmlauth"
    page.ucidata = true
    page.index = true

    -- Empty services menu to be populated by addons
    entry({"admin", "index"}, template("index"), _("Services"), 11).index = true
    
    entry({"admin", "outernetset"}, template("extranetSet"), _("outernetset"), 12)
    entry({"admin", "innernetset"}, template("innerNetSet"), _("innernetset"), 13)
    entry({"admin", "wifiset"}, template("wifiSetNew"), _("wifiset"), 14)
    entry({"admin", "seniorset"}, template("seniorSet"), _("seniorSet"), 15)
    entry({"admin", "configguid"}, template("configGuid"), _("configGuid"), 16)
    entry({"admin", "devmanage"}, template("dev_manage"), _("devmanage"), 17)
    entry({"admin", "systemstate"}, template("checkUpate"), _("checkUpate"), 18)
    entry({"admin", "managepassword"}, template("managePassword"), _("managePassword"), 19)

    entry({"admin", "bindaccount"}, call("bindaccount"), _("bindAccount"), 20)
    entry({"admin", "dobindaccount"}, template("bindAccount"), _("bindAccount"), 21)
    entry({"admin", "removebindaccount"}, template("removeBindAccount"), _("removeBindAccount"), 22)   
    entry({"admin", "checkupdate"}, template("checkUpate"), _("checkUpdate"), 23)
    entry({"admin", "restartrouter"}, template("restartRouter"), _("restartRouter"), 24)
    entry({"admin", "resetfactory"}, template("resetFactory"), _("resetFactory"), 25)    
    entry({"admin", "guideagree"}, template("guideAgree"), _("guideAgree"), 26, "true")
    entry({"admin", "guidestep"}, template("guideStep"), _("guideStep"), 27, "true") 
	entry({"admin", "doguideagree"}, call("doguideagree"), _("guideAgree"), 28)
    entry({"admin", "logout"}, call("action_logout"), _("Logout"), 90)
	--entry({"admin", "error403"}, template("error403"), _("error403"), 91, "true")
	--entry({"admin", "error404"}, template("error404"), _("error404"), 92, "true")
	--entry({"admin", "error500"}, template("error500"), _("error500"), 93, "true")
end

function main()
    luci.http.redirect(luci.dispatcher.build_url("admin/index"))
end

function doguideagree()
    --local commonFunc = require("luci.common.commonFunc")
	--commonFunc.setrouterinit("")
	luci.http.redirect(luci.dispatcher.build_url("admin", "guideagree"))
end
function bindaccount()
    local commonFunc = require("luci.common.commonFunc")
    local result = commonFunc.checkbind()
    if result and result['code'] == "0" then
        luci.http.redirect(luci.dispatcher.build_url("admin", "removebindaccount"))
    else
        luci.http.redirect(luci.dispatcher.build_url("admin", "dobindaccount"))
    end
end

function action_logout()
    local dsp = require "luci.dispatcher"
    local sauth = require "luci.sauth"
    if dsp.context.authsession then
        sauth.kill(dsp.context.authsession)
        dsp.context.urltoken.stok = nil
    end

    luci.http.header("Set-Cookie", "sysauth=; path=" .. dsp.build_url())
    luci.http.redirect(luci.dispatcher.build_url())
end
