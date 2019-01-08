module ("luci.common.secure", package.seeall)

require("luci.util")
require("luci.sys")
local bit = require("bit")
local nixio = require "nixio", require "nixio.util"
local fs = require "nixio.fs"

local commonConfig = require("luci.common.commonConfig")
local CommonFunc = require("luci.common.commonFunc")
local PWDKEY = "YoukuRouter"

-- returns a hex string
function sha1(message)
    local SHA1 = require("luci.common.sha1")
    return SHA1.sha1(message)
end

function getUConfig(key, defaultValue, config) 
    require "luci.model.uci"
    if not config then
        config = "default"
    end
    local cursor = luci.model.uci.cursor();
    local value = cursor:get(config, "common", key)
    return value or defaultValue;
end

function setUConfig(key, value, config)
    require "luci.model.uci"
    if not config then
        config = "default"
    end
    local cursor = luci.model.uci.cursor();
    if value == nil then
        value = ""
    end
   
    cursor:set(config, "common", key, value)
    cursor:save(config)
    return cursor:commit(config)
end

function checkAdminPwd(pwd)
    local password = getUConfig("admin", nil, "account")
    if not CommonFunc.isStrNil(pwd) then
        if sha1(PWDKEY..pwd) == password then
            return true
        end
    elseif not CommonFunc.isStrNil(pwd) then
         setAdminPwd(pwd)
         return true
    end
    return false
end

function checkSNPwd(pwd)
    local password = getUConfig("SN", nil, "account")
    if not CommonFunc.isStrNil(pwd) then
        local sncode = CommonFunc.getroutersn()
        if not CommonFunc.isStrNil(sncode) and string.len(sncode) > 6 then 
		        if pwd == string.sub(sncode,-6) then
		            return true
		        end
		    else
		        return true
        end
    end
    return false
end

function setAdminPwd(pwd)
   if not CommonFunc.isStrNil(pwd) then
   		setUConfig("admin", sha1(PWDKEY..pwd), "account")
   end
end

function setSNPwd(pwd)
   if not CommonFunc.isStrNil(pwd) then
   		setUConfig("SN", sha1(PWDKEY..pwd), "account")
   end
end

function checkid(id)
    return not not (id and #id == 40 and id:match("^[a-fA-F0-9]+$"))
end

-- check wifi password
function _charMode(char)
    if char >= 48 and char <= 57 then  -- 数字
        return 1
    elseif char >= 65 and char <= 90 then  -- 大写
        return 2
    elseif char >= 97 and char <= 122 then  -- 小写
        return 4
    else  -- 特殊字符
        return 8
    end
end

function _bitTotal(num)
    local modes = 0
    for i=1,4 do
        if bit.band(num, 1) == 1 then
            modes = modes + 1
        end
        num = bit.rshift(num, 1)
    end
    return modes
end

function checkStrong(pwd)
    if CommonFunc.isStrNil(pwd) or (pwd and string.len(pwd) < 8) then
        return 0
    end
    local modes = 0
    for i=1,string.len(pwd) do
        local sss = _charMode(string.byte(pwd,i))
        modes = bit.bor(modes, sss)
    end
    return _bitTotal(modes)
end

-- check url
KEY_WORDS = {
    "'",
    ";",
    "nvram",
    "dropbear",
    "bdata"
}
