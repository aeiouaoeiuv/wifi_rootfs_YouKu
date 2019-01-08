module("luci.controller.api.devices", package.seeall)

function index()
	local page = node("api", "devices")
	page.target = firstchild()
	page.title = ("")
	page.order = 800
	page.sysauth = "admin"
	page.sysauth_authenticator = "jsonauth"
	page.index = true

	entry({"api", "devices"}, firstchild(), (""), 800)
	entry({"api", "devices", "getDeviceList"},call("getDeviceList"),(""),801)
	entry({"api", "devices", "forbidConnect"},call("forbidConnect"),(""),802)
	entry({"api", "devices", "allowConnect"},call("allowConnect"),(""),803)
	entry({"api", "devices", "allowAll"},call("allowAll"),(""),804)
end

local LuciHttp = require("luci.http")
local uci = require("luci.model.uci")
local LuciUci = uci.cursor()
local LuciOS = require("os")

function getDeviceList()
	local commonFunc = require("luci.common.commonFunc")
	local devices, device_count, down_rate, up_rate = commonFunc.getAllDeviceInfo()
	
	local result = {}
	result["devicelist"] = devices
	result["devicecount"] = device_count
	result["down_rate"] = down_rate
	result["up_rate"] = up_rate

	LuciHttp.write_json(result)
end

function forbidConnect()
	local mac = LuciHttp.formvalue("mac")
	local name = LuciHttp.formvalue("name")
	local options = {
		["name"] = name,
		["mac"] = mac
	}
	mac = string.lower(mac)
	local config_name = string.lower(string.gsub(mac,"[:-]",""))
	LuciUci:section("macfilter", "machine", config_name, options)
	LuciUci:commit("macfilter")
	LuciUci:save("macfilter")
	LuciOS.execute("iptables -I FORWARD -m mac --mac-source " .. mac .. " -j DROP")
end

function allowConnect()
	local mac = LuciHttp.formvalue("mac")
	mac = string.lower(mac)
	local config_name = string.lower(string.gsub(mac,"[:-]",""))
	LuciUci:delete("macfilter", config_name)
	LuciUci:commit("macfilter")
	LuciUci:save("macfilter")
	LuciOS.execute("iptables -I FORWARD -m mac --mac-source " .. mac .. " -j ACCEPT")
end

function allowAll()
	local all = LuciHttp.formvalue("all")
	local mac_table = string.split(all, "|||")
	if table.getn(mac_table) > 0 then
		for _i, mac in ipairs(mac_table) do
			local config_name = string.lower(string.gsub(mac,"[:-]",""))
			LuciUci:delete("macfilter", config_name)
			LuciOS.execute("iptables -I FORWARD -m mac --mac-source " .. mac .. " -j ACCEPT")
		end
	end
	LuciUci:commit("macfilter")
	LuciUci:save("macfilter")
end
