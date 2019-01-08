module("luci.controller.api.dashboard", package.seeall)

local logger = require("luci.logger")

function index()
    local page   = node("api","dashboard")
    page.target  = firstchild()
    page.title   = ("")
    page.order   = 100
    page.sysauth = "admin"
    page.sysauth_authenticator = "jsonauth"
    page.index = true
    
    entry({"api", "dashboard"}, firstchild(), (""), 100)
    entry({"api", "dashboard", "getDashboardInfo"}, call("getDashboardInfo"), (""), 101)
    entry({"api", "dashboard", "setWifiStatus"}, call("setWifiStatus"), (""), 102)
    entry({"api", "dashboard", "setGuestMode"}, call("setGuestMode"), (""), 103)
    entry({"api", "dashboard", "setLEDMode"}, call("setLEDMode"), (""), 104)
    entry({"api", "dashboard", "getFooterInfoForguide"}, call("getFooterInfo"), (""), 115, "true")
    entry({"api", "dashboard", "getFooterInfo"}, call("getFooterInfo"), (""), 105)
    entry({"api", "dashboard", "getUserInfo"}, call("getUserInfo"), (""), 105)
    entry({"api", "dashboard", "getyoukuinfo"}, call("getyoukuinfo"), (""), 106)
    entry({"api", "dashboard", "getcreditsinfo"}, call("getcreditsinfo"), (""), 107)
	entry({"api", "dashboard", "getaccmode"}, call("getaccmode"), (""), 110)
    entry({"api", "dashboard", "setaccuploadmode"}, call("setaccmode"), (""), 108)
	entry({"api", "dashboard", "getdevrate"}, call("getdevrate"), (""), 109)
end

local LuciHttp = require("luci.http")
local LuciJson = require("luci.json")

function getDashboardInfo()
    local wifisetting = require("luci.common.wifiSetting")
    local commonFunc = require("luci.common.commonFunc")

    local result = {}
    local wifistatus = wifisetting.getWifiStatus(1)
    if wifistatus == "true" then
        result["wifiSignal"] = "1"
    else
        result["wifiSignal"] = "0"
    end
    result["signalIntensity"] = wifisetting.getTxpwrMode()
    result["guessMode"] =  wifisetting.getGuestMode()

    result["lightMode"], result["lightTime"] = commonFunc.getLEDMode()
	result["publicnetwork"] = commonFunc.isExistNetworkPublic()
    result["runTime"] = commonFunc.getruntime()
	result["deviceCount"] = commonFunc.getDevSampleCount()
    LuciHttp.write_json(result)
end

function getdevrate()
    local cache = LuciHttp.formvalue("cache")
    local commonFunc = require("luci.common.commonFunc")
    
    local result = {}
    local  device_count, down_rate, up_rate, to_web = commonFunc.getDeviceSumInfo()
    result["deviceCount"] = device_count
    result["uspeed"] = string.format("%.0f", tonumber(up_rate/1000))
    result["dspeed"] = string.format("%.0f", tonumber(down_rate/1000))
	result["runTime"] = commonFunc.getruntime()
    result["toWeb"] = tostring(to_web)
    LuciHttp.write_json(result)
end

function setWifiStatus()
    local wifistatus = LuciHttp.formvalue("wifistatus")
    local txpstatus = LuciHttp.formvalue("txpstatus")
    local result = {}
    local commonFunc = require("luci.common.commonFunc")
    
    if  commonFunc.isStrNil(wifistatus) or commonFunc.isStrNil(txpstatus) then
         result["status"] = "false"
         return LuciHttp.write_json(result)
    end
    
    local wifisetting = require("luci.common.wifiSetting")
    if txpstatus ~= "none" then
        wifisetting.setTxpwrMode(txpstatus)
    end 
    
    if wifistatus == "0" then
         wifisetting.turnWifiOff(1)
    end
    
    if wifistatus == "1" then
          wifisetting.turnWifiOn(1)
    end
    result["status"] =  "true"
	local wifistatus = wifisetting.getWifiStatus(1)
    if wifistatus == "true" then
        result["wifiSignal"] = "1"
    else
        result["wifiSignal"] = "0"
    end
	result["signalIntensity"] = wifisetting.getTxpwrMode()
    LuciHttp.write_json(result)
end

function setGuestMode()
    local mode =  LuciHttp.formvalue("guessMode")
    local wifisetting = require("luci.common.wifiSetting")
    local CommonFunc = require("luci.common.commonFunc")
    if mode == "1" then
       wifisetting.setGuestModeOn()
    else
       wifisetting.setGuestModeOff()
    end
	CommonFunc.forkRestartWifi()
    
    local result = {}
    result["status"] = true
    LuciHttp.write_json(result)
end

function setLEDMode()
    local ledmode =LuciHttp.formvalue("lightMode")
	local ledtime =LuciHttp.formvalue("lightTime")
    local commonFunc = require("luci.common.commonFunc")
    local result = {}
    result["status"] = commonFunc.setLEDMode(ledmode,ledtime)
    LuciHttp.write_json(result)
end

function getFooterInfo()
    local commonFunc = require("luci.common.commonFunc")
    local result = commonFunc.getFooterInfo()
    LuciHttp.write_json(result)
end

function getUserInfo()
    local commonFunc = require("luci.common.commonFunc")
    local result = commonFunc.getUserInfo()
    LuciHttp.write_json(result)
end

function getyoukuinfo()
    local commonFunc = require("luci.common.commonFunc")
    local result = commonFunc.getyoukurouteinfo()
    result["userAccount"] = commonFunc.getuserAccount()
    LuciHttp.write_json(result)
end

function getcreditsinfo()
    local accuploadmode = getaccuploadmode()
	local cache = LuciHttp.formvalue("cache")
	local commonFunc = require("luci.common.commonFunc")
    
    local result = commonFunc.getcreditsinfomation()
    result["uploadmode"] = accuploadmode
    LuciHttp.write_json(result)
end

function getaccmode()
    local commonFunc = require("luci.common.commonFunc")
    local accmode = commonFunc.getaccmode()

	local result = {}
    result["uploadmode"] = accmode
    LuciHttp.write_json(result)
end

function setaccmode()
    local accmode =LuciHttp.formvalue("uploadmode")
    local commonFunc = require("luci.common.commonFunc")

    local result = {}
    result["code"] = commonFunc.setaccmode(accmode)
    LuciHttp.write_json(result)
end

