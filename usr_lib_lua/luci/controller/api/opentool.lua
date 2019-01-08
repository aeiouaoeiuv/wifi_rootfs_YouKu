module("luci.controller.api.opentool", package.seeall)

function index()
    local page   = node("api","opentool")
    page.target  = firstchild()
    page.title   = ("")
    page.order   = 500
    page.sysauth = "admin"
    page.sysauth_authenticator = "jsonauth"
    page.index = true
    
    entry({"api", "opentool"}, firstchild(), (""), 500)
    entry({"api", "opentool", "ps"}, call("ps"), (""), 501, "true")
	entry({"api", "opentool", "ifconfig"}, call("ifconfig"), (""), 502, "true")
	entry({"api", "opentool", "uptime"}, call("uptime"), (""), 503, "true")
	entry({"api", "opentool", "getdate"}, call("getdate"), (""), 504, "true")
	entry({"api", "opentool", "getlucilog"}, call("getlucilog"), (""), 505, "true")
	entry({"api", "opentool", "df"}, call("df"), (""), 506, "true")

	entry({"api", "opentool", "networkrestart"}, call("networkrestart"), (""), 510, "true")
	entry({"api", "opentool", "dnsrestart"}, call("dnsrestart"), (""), 511, "true")
	entry({"api", "opentool", "ifdownup"}, call("ifdownup"), (""), 512, "true")
	entry({"api", "opentool", "wifidownup"}, call("wifidownup"), (""), 513, "true")

	entry({"api", "opentool", "deleteinit"}, call("deleteinit"), (""), 520, "true")
	entry({"api", "opentool", "viewconfig"}, call("viewconfig"), (""), 521, "true")
end

local LuciHttp = require("luci.http")
local LuciJson = require("luci.json")
local commonFunc = require("luci.common.commonFunc")
local LuciUtil = require("luci.util")

function ps()
    luci.http.prepare_content("text/plain")
    LuciHttp.write(LuciUtil.exec("ps"))
end

function df()
    luci.http.prepare_content("text/plain")
    LuciHttp.write(LuciUtil.exec("df"))
end

function ifconfig()
    luci.http.prepare_content("text/plain")
    LuciHttp.write(LuciUtil.exec("ifconfig"))
end

function uptime()
    luci.http.prepare_content("text/plain")
    LuciHttp.write(LuciUtil.exec("uptime"))
end

function getdate()
    luci.http.prepare_content("text/plain")
    LuciHttp.write(LuciUtil.exec("date"))
end

function getlucilog()
    luci.http.prepare_content("text/plain")
    LuciHttp.write(LuciUtil.exec("tail -n 100 /tmp/youku/tmp/luci.log"))
end


function networkrestart()
    luci.http.prepare_content("text/plain")
    LuciHttp.write(LuciUtil.exec("/etc/init.d/network restart"))
end

function dnsrestart()
    luci.http.prepare_content("text/plain")
    LuciHttp.write(LuciUtil.exec("/etc/init.d/dnsmasq restart"))
end

function wifidownup()
    luci.http.prepare_content("text/plain")
    LuciHttp.write(LuciUtil.exec("wifi downup"))
end

function ifdownup()
    local ifname = LuciHttp.formvalue("ifname") or ""
	
	if ifname == "" then
	    ifname = "wan"
	end
	luci.http.prepare_content("text/plain")
	LuciHttp.write(LuciUtil.exec("ifdown "..ifname))
    LuciHttp.write(LuciUtil.exec("ifup "..ifname))
end

function deleteinit()
    commonFunc.setrouterinit("")
	luci.http.prepare_content("text/plain")
	LuciHttp.write(LuciUtil.exec("cat /etc/config/account"))
end

function viewconfig()
  local config = LuciHttp.formvalue("config") or ""
  if config == "" then
	 config = "network"
  end
  luci.http.prepare_content("text/plain")
  LuciHttp.write(LuciUtil.exec("cat /etc/config/"..config))
end
