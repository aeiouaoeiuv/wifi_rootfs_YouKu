module("luci.controller.api.system", package.seeall)

function index()
    local page   = node("api","system")
    page.target  = firstchild()
    page.title   = ("")
    page.order   = 200
    page.sysauth = "admin"
    page.sysauth_authenticator = "jsonauth"
    page.index = true
    -----------------------------------systemstatus----------------------------------------------
    entry({"api", "system"}, firstchild(), (""), 400)
    entry({"api", "system", "getsysbaseInfo"}, call("getsysbaseInfo"), (""), 401)
    entry({"api", "system", "getwifibaseInfo"}, call("getwifibaseInfo"), (""), 402)

    -----------------------------------setpassword----------------------------------------------
    entry({"api", "system", "setpassword"}, call("setpassword"), (""), 410)
    
    -----------------------------------bindyoukuuser--------------------------------------------
    entry({"api", "system", "bindyoukuuser"}, call("bindyoukuuser"), (""), 420, "true")
    entry({"api", "system", "bindyoukuuserForguide"}, call("bindyoukuuserforguide"), (""), 422, "true")
    entry({"api", "system", "unbindyoukuuser"}, call("unbindyoukuuser"), (""), 421, "true")
	entry({"api", "system", "setuserbindinfo"}, call("setuserbindinfo"), (""), 423, "true")

    -----------------------------------upgrade--------------------------------------------------
    entry({"api", "system", "doupgrade"}, call("doupgrade"), (""), 430)
    entry({"api", "system", "upgradesetting"}, call("upgradesetting"), (""), 431)
    entry({"api", "system", "chkupgrade"}, call("chkupgrade"), (""), 432)
    entry({"api", "system", "getupgradestatus"}, call("getupgradestatus"), (""), 433)
    entry({"api", "system", "uploadrom"}, call("uploadrom"), (""), 434)
    entry({"api", "system", "flashrom"}, call("flashrom"), (""), 435)
    entry({"api", "system", "deleteimage"}, call("deleteimage"), (""), 436)
	entry({"api", "system", "nextupgrade"}, call("nextupgrade"), (""), 437)
    -----------------------------------restart&reset--------------------------------------------
    entry({"api", "system", "restart"}, call("restart"), (""), 440)
    entry({"api", "system", "sysreset"}, call("sysreset"), (""), 441)
end

local LuciHttp = require("luci.http")

local uci = require("luci.model.uci")
local LuciUci = uci.cursor()
local LuciOS = require("os")
local wifisetting = require("luci.common.wifiSetting")
local commonConf = require("luci.common.commonConfig")
local commonFunc = require("luci.common.commonFunc")
-----------------------------------systemstatus----------------------------------------------

function getsysbaseInfo()
  local result = {}
  result["runtime"] = commonFunc.getruntime()
  result["sysversion"] = commonFunc.getyoukuvertion()
  result["localIP"], result["localMac"] = wifisetting.getWanIPMac()
  local waninfo = wifisetting.getWanIPGateway() 
  result["WanIP"] = waninfo["ip"]
  result["WanGateway"] = waninfo["gateway"]
  local laninfo = wifisetting.getLanIPGateway() 
  result["LanIP"] = laninfo["ip"]
  result["LanGateway"] = laninfo["gateway"]
  LuciHttp.write_json(result) 
end

function getwifibaseInfo()
  local result = wifisetting.getWifiBasicInfo(1)
  LuciHttp.write_json(result)
end

-----------------------------------setpassword----------------------------------------------
function setpassword()
    local oldpassword = LuciHttp.formvalue("oldpwd")
    local newpwd1 = LuciHttp.formvalue("newpwd1")
    local newpwd2 = LuciHttp.formvalue("newpwd2")
    local YKsecure = require "luci.common.secure"
    local result = {}
    --check oldpassword
    if not YKsecure.checkAdminPwd(oldpassword) then
        if not YKsecure.checkSNPwd(oldpassword) then
            result["code"] = "-1" --old password is invalid 
			result["errmsg"] = "原密码输入错误，请重新输入。"
			LuciHttp.write_json(result)
            return
        end
    end
    
    if newpwd1 ~= newpwd2 then
        result["code"] = "-2" --2 new passwords are not same 
		result["errmsg"] = "两次输入的新密码不相同，请重新输入。"
		LuciHttp.write_json(result)
        return
    end    

    YKsecure.setAdminPwd(newpwd1)
    result["code"] = "0"
    LuciHttp.write_json(result)
end

-----------------------------------bindyoukuuser---------------------------------------------
function bindyoukuuser()   
    local username = LuciHttp.formvalue("username")
	local password = LuciHttp.formvalue("password")
    
    local result = commonFunc.bindyoukuuser(username, password)
    if result["code"] == "0" then
        commonFunc.setuserAccount(username)
    end
    LuciHttp.write_json(result)
end

function bindyoukuuserforguide()
    local init = commonFunc.getrouterinit()
	if init ~= "" then
	    local result = {}
		result["code"] = "-1"
		LuciHttp.write_json(result)
		return 
	end
    bindyoukuuser()
end

function unbindyoukuuser()
    local username = LuciHttp.formvalue("username")
	local password = LuciHttp.formvalue("password")

    local result = commonFunc.unbindyoukuuser(username, password)
    if result["code"] == "0" then
        commonFunc.setuserAccount("")
    end
    LuciHttp.write_json(result)
end

function setuserbindinfo()
    local userid = LuciHttp.formvalue("userid")
    local username = LuciHttp.formvalue("username")
	local result = {}
	result["code"] = commonFunc.setyoukurouteinfo(userid, username)
	LuciHttp.write_json(result)
end

-----------------------------------upgrade--------------------------------------------------
function doupgrade()
    local ret = LuciOS.execute(commonConf.DO_UPGRADE)
    local result = {}
    
    if ret == 0 then
        result["code"] = "true"
    else
        result["code"] = "false"
    end
	commonFunc.upprogressinit()
    LuciHttp.write_json(result)
end

function upgradesetting()
    local autoupgrade = LuciHttp.formvalue("autoupgrade")
    local result = {}
    result["code"] = commonFunc.setAutoUpgradeMode(autoupgrade)
    LuciHttp.write_json(result)
end

function chkupgrade()
    local result = commonFunc.checkUpgrade()
    LuciHttp.write_json(result)
end

function getupgradestatus()
    local result = {}
    result["persent"] = commonFunc.getupgradestatus()
    LuciHttp.write_json(result)
end

function _check_canupload()
    local canupload = false
    local bin_file = ""
    local fileSize = tonumber(LuciHttp.getenv("CONTENT_LENGTH"))
    local tmp_available = commonFunc.checkTmpDiskSpace(fileSize)
    if tmp_available then
        canupload = true
    else
        local disk_available = commonFunc.checkDiskSpace(fileSize)
        if disk_available then
            local link = commonFunc.exec(CommonConf.LINK_ROM_BIN_FILE)
            if link then
                canupload = true
            end
        end
    end

    return canupload
end

function uploadrom()
    local LuciSys = require("luci.sys")
    local LuciFs = require("luci.fs")

    local fp = nil
    local code = 0
    local tmpfile = commonConf.ROM_BIN_FILE
    local canupload = _check_canupload()
    local nixio = require("nixio")

    if canupload then
        LuciHttp.setfilehandler(
        function(meta, chunk, eof)
            if not fp then
                if meta and meta.name == "image" then
                    fp = nixio.open(tmpfile, "w+")
                end
            end
            if chunk then
                fp:write(chunk)
            end
            if eof then
                fp:close()
            end
        end)
    else
        code = -1
    end

    if LuciHttp.formvalue("image") and fp then
        code = 0
    else
        code = -2
    end
    local result = {}
    result["code"] = code
    LuciHttp.write_json(result)
end

function flashrom()
    local LuciUtil = require("luci.util")
    local LuciFs = require("luci.fs")
    local code = 0
    local result = {}
    local binfile = commonConf.ROM_BIN_FILE
    local check = LuciUtil.exec(commonConf.VERIFY_IMAGE)
    if check ~= "" then
        code = -1
    elseif not LuciFs.access(binfile) then
        code = -2
    end
    result["code"] = code
    LuciHttp.write_json(result)
    if code == 0 then
        LuciUtil.exec(commonConf.FLASH_IMAGE)
    end
    LuciFs.unlink(commonConf.ROM_BIN_FILE)
end

function deleteimage()
    local LuciUtil = require("luci.util")
    local result = {}
    local check = LuciUtil.exec(commonConf.DELETE_IMAGE)
    result["code"] = 0
    LuciHttp.write_json(result)
end

function nextupgrade()
    commonFunc.setUpdatetime()
    result["code"] = 0
    LuciHttp.write_json(result)
end
-----------------------------------restart&reset---------------------------------------------
function restart()
	commonFunc.forkReboot()
    local result = {}
    result["code"] = 0
    LuciHttp.write_json(result)
end

function sysreset()
    commonFunc.forkResetAll()
    local result = {}
    result["code"] = 0
    LuciHttp.write_json(result)
end
