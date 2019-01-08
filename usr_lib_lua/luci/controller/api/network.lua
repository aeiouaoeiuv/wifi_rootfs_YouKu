module("luci.controller.api.network", package.seeall)

function index()
    local page   = node("api","network")
    page.target  = firstchild()
    page.title   = ("")
    page.order   = 200
    page.sysauth = "admin"
    page.sysauth_authenticator = "jsonauth"
    page.index = true
    -----------------------------------wifi----------------------------------------------
    entry({"api", "network"}, firstchild(), (""), 200)
    entry({"api", "network", "getWifiInfo"}, call("getWifiInfo"), (""), 201)
    entry({"api", "network", "setWifi"}, call("setWifi"), (""), 202)
    entry({"api", "network", "setGuestMode"}, call("setGuestMode"), (""), 203)
	entry({"api", "network", "getWifiSSID"}, call("getWifiSSID"), (""), 204, "true")
	entry({"api", "network", "changeChannal"}, call("changeChannal"), (""), 205)
    -----------------------------------wan set-------------------------------------------
    entry({"api", "network", "getWanInfo"}, call("getWanInfo"), (""), 210)
    entry({"api", "network", "setWan"}, call("setWan"), (""), 211)
	--add by zhangtao 2014 11 19
	entry({"api", "network", "actionStatus"}, call("actionStatus"), (""), 227)

    entry({"api", "network", "getDNSInfo"}, call("getDNSInfo"), (""), 212)
    entry({"api", "network", "setDNS"}, call("setDNS"), (""), 213)
    entry({"api", "network", "getMTUInfo"}, call("getMTUInfo"), (""), 214)
    entry({"api", "network", "setMTU"}, call("setMTU"), (""), 215)
    entry({"api", "network", "getCloneMAC"}, call("getCloneMAC"), (""), 216)
    entry({"api", "network", "setCloneMAC"}, call("setCloneMAC"), (""), 217)
    
    entry({"api", "network", "pppoeStart"}, call("pppoeStart"), (""), 218, "true")
    entry({"api", "network", "pppoeStop"}, call("pppoeStop"), (""), 219, "true")
    entry({"api", "network", "getPPPoEStatus"}, call("getPPPoEStatus"), (""), 220, "true")
    entry({"api", "network", "checkProto"}, call("checkAvailableProto"), (""), 225)
    entry({"api", "network", "appCallMe"}, call("appCallMe"), (""), 226, "true")

    entry({"api", "network", "pppoeDebug"}, call("pppoeDebug"), (""), 227, "true")
    entry({"api", "network", "pppoeDebugFile"}, call("pppoeDebugFile"), (""), 228, "true")
    
    -----------------------------------lan set--------------------------------------------
    entry({"api", "network", "getLanInfo"}, call("getLanInfo"), (""), 230)
    entry({"api", "network", "setLan"}, call("setLan"), (""), 231)
    entry({"api", "network", "getLanDHCP"}, call("getLanDHCP"), (""), 232)
    entry({"api", "network", "setLanDHCP"}, call("setLanDHCP"), (""), 233)
    -----------------------------------Devices Info---------------------------------------
    entry({"api", "network", "getAllDeviceInfo"}, call("getAllDeviceInfo"), (""), 240)
    entry({"api", "network", "getBindDeviceInfo"}, call("getBindDeviceInfo"), (""), 241)
    entry({"api", "network", "bindDevices"}, call("bindDevices"), (""), 242)
    entry({"api", "network", "unbindDevices"}, call("unbindDevices"), (""), 243)
    entry({"api", "network", "unbindAll"}, call("unbindAll"), (""), 244)
    -----------------------------------LED Mode-------------------------------------------
    entry({"api", "network", "getLEDMode"}, call("getLEDMode"), (""), 250)
    entry({"api", "network", "setLEDMode"}, call("setLEDMode"), (""), 251)
    
    -----------------------------------Domain Filter-----------------------------------------
    entry({"api", "network", "getDomainFilterInfo"}, call("getDomainFilterInfo"), (""), 260)
    entry({"api", "network", "addDomainFilter"}, call("addDomainFilter"), (""), 261)
    entry({"api", "network", "delDomainFilter"}, call("delDomainFilter"), (""), 262)
    
    -----------------------------------UPNP Info-----------------------------------------
    entry({"api", "network", "getUPNPInfo"}, call("getUPNPInfo"), (""), 270)
    entry({"api", "network", "setUPNPInfo"}, call("setUPNPInfo"), (""), 271)
    
    -----------------------------------guide info--------------------------------------------
    entry({"api", "network", "setWifiAndAdmin"}, call("setWifiAndAdmin"), (""), 280)  --都要确认初始化flag
	entry({"api", "network", "setWifiAndAdminforguide"}, call("setWifiAndAdminforguide"), (""), 281, "true")
    entry({"api", "network", "setWanForguide"}, call("setWanforguide"), (""), 282, "true")
	entry({"api", "network", "actionStatusForguide"}, call("actionStatusForguide"), (""), 283, "true")
    
end

--////////////////////////////////////////////////////////////////////////////////////////////////////////////////////--
--                                                 Function                                                           --
--////////////////////////////////////////////////////////////////////////////////////////////////////////////////////--

local LuciHttp = require("luci.http")

local uci = require("luci.model.uci")
local LuciUci = uci.cursor()
local LuciOS = require("os")
local wifisetting = require("luci.common.wifiSetting")
local LuciUtil = require("luci.util")

function appCallMe()
	local Configs = require("luci.common.commonConfig")
	local CommonFunc = require("luci.common.commonFunc")
	local http = require("luci.common.http")
	
	local LuciNetwork = require("luci.model.network").init()
	local wanNetwork =  LuciNetwork:get_network("wan")
	local WanEth = wanNetwork:get_option_value("ifname")
	local ifconfig = LuciUtil.exec("ifconfig "..WanEth)
	local wanIp = nil
	if not ifconfig ~=nil then
	        wanIp = ifconfig:match('inet addr:(%S+)')
	end
	local lanIp = LuciUci:get("network","lan","ipaddr")
	
	local pppoeIp = nil
	pppoeNetwork =  LuciNetwork:get_network("pppoe-wan")
	if pppoeNetwork ~= nil then
		local pppoeEth = pppoeNetwork:get_option_value("ifname")
		if pppoeEth ~= nil then
			ifconfig = LuciUtil.exec("ifconfig "..pppoeEth)
			
			if not ifconfig ~=nil then
			        pppoeIp = ifconfig:match('inet addr:(%S+)')
			end
		end
	end
	
	if lanIp == nil then lanIp = "empty" end
	if wanIp == nil then wanIp = "empty" end
	if pppoeIp == nil then pppoeIp = "empty" end
	
	local code, datainfo = http.req_get(Configs.ROUTER_FRAMWORK_IDINFO)
	
	local initflag = CommonFunc.getrouterinit()
	
	local init_flag_str = "setted"
	if initflag == nil or initflag == "" then
		init_flag_str = "unset"
	end
	
	local res_str = "ku:yk-router:"
	res_str = res_str .. datainfo["sn"] .. ":"
	local wifiinfo = wifisetting.getWifiSimpleInfo(1)
	
	if wifiinfo["name"] == "" then
	    wifiinfo["name"] = "优酷土豆路由宝"
	end
	res_str = res_str .. wifiinfo["name"] .. ":" .. lanIp .. ":" .. wanIp .. ":" .. pppoeIp .. ":" .. init_flag_str .. ":port:reserve"
	
	luci.http.write(res_str)
end

--////////////////////////////////////////////////-----wifi--------///////////////////////////////////////////////////--
function getWifiInfo()
    local result = wifisetting.getWifiBasicInfo(1)
	local CommonFunc = require("luci.common.commonFunc")
	result["publicnetwork"] = CommonFunc.isExistNetworkPublic()
    LuciHttp.write_json(result)
end

function setGuestMode()
    local guestmode = LuciHttp.formvalue("guestMode") 
    local txpower = LuciHttp.formvalue("strengMode") 
    
	local oldtxpower = wifisetting.getTxpwrMode()
	if txpower ~= nil and tonumber(txpower) ~= tonumber(oldtxpower) then
        wifisetting.setTxpwrMode(txpower)
    end
	
	local oldguestmode = wifisetting.getGuestMode()
	local CommonFunc = require("luci.common.commonFunc")
	if guestmode ~= nil and guestmode ~= oldguestmode then
        if guestmode == "true" then
            wifisetting.setGuestModeOn()	
        else
            wifisetting.setGuestModeOff()
        end
		CommonFunc.forkRestartWifi()
	end
    
    local result = {}
	result["guestSSID"] = ""
	if guestmode == "true" then
		result["guestSSID"] = wifisetting.getGuestSSID()
	end
    result["status"] = "true"
    LuciHttp.write_json(result)
end

function setWifi()
    local enable =  LuciHttp.formvalue("status")  
    local ssid =  LuciHttp.formvalue("name")  
    local pwd =  LuciHttp.formvalue("pwd")  
    local channal =  LuciHttp.formvalue("signalpath")  
    local hiddenflag =  LuciHttp.formvalue("hidden")  
    local encryption = "psk2"
    
	local oldsetting = wifisetting.getWifiSimpleInfo(1)
    local result = {}
	
	if oldsetting["name"] == ssid and
	   oldsetting["pwd"] == pwd and
	   oldsetting["signalpath"] == channal and
	   oldsetting["hidden"] == hiddenflag and
	   oldsetting["status"] == enable then
	   
	   result["status"] = "true"
	else
	   
        result["status"] = wifisetting.setWifiBasicInfo(1, ssid, pwd, 
                       encryption, channal, nil, hiddenflag, enable)
        local CommonFunc = require("luci.common.commonFunc")
        CommonFunc.forkRestartWifi()
	end
    LuciHttp.write_json(result)
end

function getWifiSSID()
    local result = wifisetting.getWifiSimpleInfo(1)
	local gateway = wifisetting.getWanIPGateway()
	local configproto = LuciUci:get("network","wan","proto")
	if gateway["gateway"] ~= "0.0.0.0" and configproto == "dhcp" then
	    result["proto"] = "dhcp"
	else
	    result["proto"] = "pppoe"
	end
    LuciHttp.write_json(result)
end

function changeChannal()
    local channal =  LuciHttp.formvalue("channal")  
    local result = {}
	result["code"] = "-1"
	
    if channal and tonumber(channal) >= 1 and tonumber(channal) <= 13 then
        local commonConfig = require("luci.common.commonConfig")
	    LuciOS.execute(commonConfig.SET_CHANNAL..tostring(tonumber(channal)))
	    result["code"] = "0"
	end
    LuciHttp.write_json(result)
end
--/////////////////////////////////////////////////----wan set-------/////////////////////////////////////////////////--

function checkAvailableProto()
	local result = {}
	LuciUci:set("network","wan","proto","dhcp")
	LuciUci:delete("network","wan","ipaddr")
	LuciUci:delete("network","wan","netmask")
	LuciUci:delete("network","wan","gateway")
	LuciUci:delete("network","wan","peerdns")
	local posix = require("posix_c")
	
	LuciUci:save("network")
	LuciUci:commit("network")
	LuciOS.execute("ifdown wan")
	LuciOS.execute("ifup wan")

	posix.sleep(3)
	
	local LuciNetwork = require("luci.model.network").init()
	local wanNetwork =  LuciNetwork:get_network("wan")
	local WanEth = wanNetwork:get_option_value("ifname")
	--print(WanEth)
	local ifconfig = LuciUtil.exec("ifconfig "..WanEth)
	--print(ifconfig)
	local wanIp = nil
	if not ifconfig ~=nil then
		wanIp = ifconfig:match('inet addr:(%S+)')
		--print(wanIp)
	end
	
	if wanIp == nil then
		result["proto"] = "pppoe"
	else
		result["proto"] = "dhcp"
	end

	return result

end

function getWanMac()
    local wifisetting = require("luci.common.wifiSetting")
    local ip, mac = wifisetting.getWanIPMac()
    return mac
end

function getRemoteMac()
	local remote_addr = LuciHttp.getenv("REMOTE_ADDR")
	local remote_mac = string.upper(luci.sys.net.ip4mac(remote_addr)) 
	return remote_mac
end

function getWanInfo()
  local result = {}
  
  result["proto"] = LuciUci:get("network","wan","proto")
  
  if result["proto"] ~= "static" and result["proto"] ~= "pppoe"then
    result["proto"] = "dhcp"
  end
    
	result["ipaddr"] = LuciUci:get("network","wan","ipaddr") or ""
    result["netmask"] = LuciUci:get("network","wan","netmask") or ""
    result["gateway"] = LuciUci:get("network","wan","gateway") or ""
	result["dns"] = LuciUci:get("network","wan","dns") or ""
	result["username"] = LuciUci:get("network","wan","username") or ""
    result["password"] = "youku********"
	result["mtu"] = LuciUci:get("network","wan","mtu")
	result["localmac"] = getWanMac()
	result["remotemac"] = getRemoteMac()
	
	local LuciNetwork = require("luci.model.network").init()
	local wanNetwork =  LuciNetwork:get_network("wan")
	local WanEth = wanNetwork:get_option_value("ifname")
	local ifconfig = LuciUtil.exec("ifconfig "..WanEth)
	if not ifconfig ~=nil then
	        result["mtu"] = ifconfig:match('MTU:(%S+)')
	        result["netmask"] = ifconfig:match('Mask:(%S+)')
	end

  LuciHttp.write_json(result)
end

function actionStatusForguide()
	local CommonFunc = require("luci.common.commonFunc")
    local init = CommonFunc.getrouterinit()
	if init ~= "" then
	    local result = {}
		result["code"] = "-1"
		LuciHttp.write_json(result)
		return 
	end
    actionStatus()
end

function actionStatus()
  local commonFunc = require("luci.common.commonFunc")
  commonFunc.action_status()
end

function setWanforguide()
    local CommonFunc = require("luci.common.commonFunc")
    local init = CommonFunc.getrouterinit()
	if init ~= "" then
	    local result = {}
		result["code"] = "-1"
		LuciHttp.write_json(result)
		return 
	end
    setWan()
end

function setWan()
  local commonFunc = require("luci.common.commonFunc")
  local proto =  LuciHttp.formvalue("proto")
  local ipaddr =  LuciHttp.formvalue("ipaddr")
  local netmask =  LuciHttp.formvalue("netmask")
  local gateway =  LuciHttp.formvalue("gateway")
  local dns =  LuciHttp.formvalue("dns")
  local username =  LuciHttp.formvalue("username")
  local password =  LuciHttp.formvalue("password")
  local old_proto = LuciUci:get("network","wan","proto")
  
  local wanmac = LuciHttp.formvalue("mac")
  local macchange = 0
  if wanmac and wanmac ~= "" and wanmac ~= "default" and wanmac ~= "notclone" then
      local local_mac = LuciUci:get("network","wan","macaddr")
	  if local_mac ~= wanmac then 
	    macchange = 1
	    LuciUci:set("network","wan","macaddr",wanmac)                                             
        LuciUci:save("network")                                                              
        LuciUci:commit("network")
	  end
  elseif wanmac == "default" then
        macchange = 1
        LuciUci:delete("network","wan","macaddr") 
		LuciUci:save("network")                                                              
        LuciUci:commit("network")
  end
  
  if macchange == 0 and proto == "dhcp" and old_proto == "dhcp" then
      return
  end
  
  if dns == "" or dns == nil then
  	dns = gateway
  end
  
  if proto == "static" then
    LuciUci:set("network","wan","proto","static")
    LuciUci:set("network","wan","ipaddr",ipaddr) 
    LuciUci:set("network","wan","netmask",netmask)
    LuciUci:set("network","wan","gateway",gateway)
    LuciUci:set("network","wan","dns",dns)
  elseif proto == "dhcp" then
    LuciUci:set("network","wan","proto","dhcp")
  elseif proto == "pppoe" then
    LuciUci:set("network","wan","proto","pppoe")
    
    LuciUci:set("network","wan","timeout","10")
    
    local old_username = LuciUci:get("network","wan","username")
    local old_password = LuciUci:get("network","wan","password")
    
    if username == old_username and password == "youku********" then
    	LuciUci:set("network","wan","username",old_username)
    	LuciUci:set("network","wan","password",old_password)
    else
    	LuciUci:set("network","wan","username",username)
    	LuciUci:set("network","wan","password",password)
    end

  end
  LuciUci:save("network")
  LuciUci:commit("network")
  LuciOS.execute("rm -rf "..commonFunc.getpppoelogpath())
  LuciOS.execute("ifup wan")
  commonFunc.action_restart(proto, "firewall")
end

function getDNSInfo()
	local result = {}
	result["dns"] = LuciUci:get("network","wan","dns")
	local dns_info = LuciUtil.exec("cat /tmp/resolv.conf.auto")
	if result["dns"] == nil or result["dns"] == "" then
	      result["dns"] = dns_info:match('nameserver (%S+)')
	end
	local dnsflag = LuciUci:get("network","wan","peerdns")
	if dnsflag == nil or dnsflag == 1 then
		result["switch"] = 0
	else
		result["switch"] = 1
	end
	--LuciUci:delete("network","wan","peerdns")
	LuciHttp.write_json(result)
end  

function setDNS()
  local dns =  LuciHttp.formvalue("dns")
  local dns_switch =  LuciHttp.formvalue("switch")
  if dns_switch == "1" then
  	LuciUci:set("network","wan","peerdns",0)
	LuciUci:set("network","wan","dns",dns)
  else
  	LuciUci:delete("network","wan","peerdns")
	LuciUci:delete("network","wan","dns")
  end
  LuciUci:save("network")
  LuciUci:commit("network")
  LuciOS.execute("ifdown wan")
  LuciOS.execute("ifup wan")
  LuciOS.execute("/etc/init.d/dnsmasq restart")
end

function getMTUInfo()
  local result = {}
  result["mtu"] = LuciUci:get("network","wan","mtu")
  LuciHttp.write_json(result)
end

function setMTU()
  local mtu =  LuciHttp.formvalue("mtu")
  LuciUci:set("network","wan","mtu",mtu)
  LuciUci:commit("network")
  LuciOS.execute("ifdown wan")
  LuciOS.execute("ifup wan")
end

function getCloneMAC()
  local result = {}
  local remote_addr = LuciHttp.getenv("REMOTE_ADDR")
  local remote_mac = string.upper(luci.sys.net.ip4mac(remote_addr)) 
  local local_mac = LuciUci:get("network","wan","macaddr")
  result["remote_mac"] = remote_mac
  result["local_mac"] = local_mac
  LuciHttp.write_json(result)
end

function setCloneMAC()                                                            
  local mac =  LuciHttp.formvalue("mac")                                          
  if mac == "default" then                                                        
    LuciUci:delete("network","wan","macaddr")                                 
  else  
    local local_mac = LuciUci:get("network","wan","macaddr")
	if local_mac == mac then 
        return
    end	
    LuciUci:set("network","wan","macaddr",mac)                                
  end               
  LuciUci:save("network")                                                              
  LuciUci:commit("network")
  LuciOS.execute("/etc/init.d/network restart &")
end

--/////////////////////////////////////////////////----Lan set-------/////////////////////////////////////////////////--

function getLanInfo()                                                      
	local result = {}
	result["ipaddr"] = LuciUci:get("network","lan","ipaddr")                      
	result["netmask"] = LuciUci:get("network","lan","netmask")  

	local ignore = LuciUci:get("dhcp","lan","ignore")
	if ignore ~= "1" then
		ignore = "0"
	end
	result["dhcp_switch"] = ignore

	local list = string.split(result["ipaddr"],".")                                
	local pre_ip = ""                                                                   
	local i = 0                                                                         
	for k,v in ipairs(list) do                                                          
		  pre_ip = pre_ip .. v                                                        
		  pre_ip = pre_ip .. "."                                                      
		  if i == 2 then                                                              
				  break                                                               
		  end                                                                         
	  i = i + 1                                                                       
	end                                                                                 
																					  
	local dhcp_start = LuciUci:get("dhcp","lan","start")                                
	local dhcp_limit = LuciUci:get("dhcp","lan","limit")                                
	result["dhcp_pre_ip"] =  pre_ip                                                     
	result["dhcp_start_ip"] = dhcp_start                                                
	local tmp_int = tonumber(dhcp_start)                                                
	tmp_int = tmp_int + tonumber(dhcp_limit) - 1                                        
	result["dhcp_stop_ip"] = tostring(tmp_int)
	LuciHttp.write_json(result)
end

function setLan()                                                                                     
	local ip =  LuciHttp.formvalue("ipaddr")
	local netmask =  LuciHttp.formvalue("netmask")
	LuciUci:set("network","lan","ipaddr",ip)
	LuciUci:set("network","lan","netmask",netmask)
	LuciUci:save("network")
	LuciUci:commit("network")
	--LuciOS.execute("/etc/init.d/network restart")
	--LuciOS.execute("/etc/init.d/dnsmasq restart")
	--LuciOS.execute("ifdown lan")
	--LuciOS.execute("ifup lan")
	local CommonFunc = require("luci.common.commonFunc")
	CommonFunc.changeRouterDomain(ip)
	CommonFunc.forkReboot()
	--LuciOS.execute("env -i /sbin/reboot & >/dev/null 2>/dev/null")
end

function getLanDHCP()
   
end

function setLanDHCP()                                                                                 
	local dhcp_switch =  LuciHttp.formvalue("sw")                                             
	if dhcp_switch == "select-close" then                                                         
			dhcp_switch = "1"                                                                     
	else                                                                                          
			dhcp_switch = "0"                                                                     
	end                                                                                           
																								  
	local dhcp_pre_ip =  LuciHttp.formvalue("pre_ip")                                             
	local dhcp_start_ip =  LuciHttp.formvalue("start_ip")                                         
	local dhcp_stop_ip =  LuciHttp.formvalue("stop_ip")                                           
	local dhcp_limit = tonumber(dhcp_stop_ip) - tonumber(dhcp_start_ip) + 1                       
																								  
	LuciUci:set("dhcp","lan","ignore",dhcp_switch)                                                
	LuciUci:set("dhcp","lan","start",dhcp_start_ip)                                               
	LuciUci:set("dhcp","lan","limit",dhcp_limit)
	LuciUci:save("dhcp")
	LuciUci:commit("dhcp")                                                                    
	--LuciOS.execute("/etc/init.d/dnsmasq restart")
	local CommonFunc = require("luci.common.commonFunc")
	CommonFunc.forkReboot()
	--LuciOS.execute("env -i /sbin/reboot & >/dev/null 2>/dev/null")
end 


--/////////////////////////////////////////////////----Devices Info---//////////////////////////////////////////////////--

function dhcp_table()                                                                                         
        local dhcp_info = LuciUtil.exec("cat /var/dhcp.leases")                                               

        local mac_name_map = {}                                                                               
        local dhcp_info_lines = string.split(dhcp_info)                                                       
        local i = 1                                                                                           
        local dhcp_mac,dhcp_name                                                                              
        for _, a_dhcp_line in ipairs(dhcp_info_lines) do                                                      
    	    local dhcp_words = string.split(a_dhcp_line," ")                                              
            i = 1                                                                                         
            dhcp_mac = nil                                                                                
       	    dhcp_name = nil                                                                               
            for index, a_dhcp_word in ipairs(dhcp_words) do                                               
               if i == 2 then                                                                        
               		dhcp_mac = a_dhcp_word                                                        
               elseif i == 4 then                                                                    
                        dhcp_name = a_dhcp_word                                                       
               end                                                                                   
               i = i + 1                                                                             
            end                                                                                           
	    
	    if dhcp_mac ~= nil then
	    	mac_name_map[dhcp_mac] = dhcp_name
	    end
	end
	return mac_name_map
end

function getAllDeviceInfo()
	local commonFunc = require("luci.common.commonFunc")
	local devices, device_count, down_rate, up_rate, binded_devices = commonFunc.getAllDeviceInfo()
	
	local result = {}
	result["devicelist"] = devices
	result["binded_devices"] = binded_devices

	LuciHttp.write_json(result)
end

function getBindDeviceInfo()
	local devices = {}
	
	LuciUci:foreach("dhcp","host",                                            
	        function(s)                                                       
	                if s ~= nil then                                          
                       		 table.insert( devices, { ip = s.ip,
                        			mac = s.mac,
                        			name = s.name,
                        			isbinded = "true",
                        			contype = "none"} )
	                end
	        end
	)
	LuciHttp.write_json(devices)
end

function bindDevices()
    local ip =  LuciHttp.formvalue("ip")
    local mac = LuciHttp.formvalue("mac")
    local name = LuciHttp.formvalue("name")
    local options = {
            ["name"] = name,
            ["mac"] = mac,
            ["ip"] = ip
    }
    mac = string.lower( mac )
    local config_name = string.lower(string.gsub(mac,"[:-]",""))
    LuciUci:section("dhcp", "host", config_name, options)
    LuciUci:commit("dhcp")
    LuciUci:save("dhcp")                                   
end

function unbindDevices()
	local mac = LuciHttp.formvalue("mac")
	mac = string.lower( mac )
	local config_name = string.lower(string.gsub(mac,"[:-]",""))
	LuciUci:delete("dhcp", config_name)
	LuciUci:commit("dhcp")
	LuciUci:save("dhcp")
end

function unbindAll()
	local all = LuciHttp.formvalue("all")
	local mac_table = string.split(all, "|||")
	if table.getn(mac_table) > 0 then
		for _i, mac in ipairs(mac_table) do
			local config_name = string.lower(string.gsub(mac,"[:-]",""))
			LuciUci:delete("dhcp", config_name)
		end
	end
	LuciUci:commit("dhcp")
	LuciUci:save("dhcp")
end

--////////////////////////////////////////////////-----LED Mode-----////////////////////////////////////////////////////--

function getLEDMode()
   local commonFunc = require("luci.common.commonFunc")
   local result = {}
   result["status"], result["lightTime"]= commonFunc.getLEDMode()
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

--////////////////////////////////////////////////-----Domain Filter----//////////////////////////////////////////////////--

function getDomainFilterInfo()
   
end

function addDomainFilter()
   
end

function delDomainFilter()
   
end

--////////////////////////////////////////////////------UPNP Info----//////////////////////////////////////////////////--

function getUPNPInfo()
	local result = {}
	local res = LuciUci:get("upnpd","config","enable_upnp")
	result["status"]= tonumber(res)
	LuciHttp.write_json(result)
end

function setUPNPInfo()
	local enable = LuciHttp.formvalue("status")
	if enable == '1' then
	    LuciUci:set("upnpd","config","enable_upnp","1")
		LuciUci:commit("upnpd")
	    LuciUci:save("upnpd")
		LuciOS.execute("/etc/init.d/miniupnpd enable ; /etc/init.d/miniupnpd start")
	else
	    LuciUci:set("upnpd","config","enable_upnp","0")
		LuciUci:commit("upnpd")
	    LuciUci:save("upnpd")
		LuciOS.execute("/etc/init.d/miniupnpd stop ; /etc/init.d/miniupnpd disable")
	end
end

function setWifiAndAdminforguide()
    local CommonFunc = require("luci.common.commonFunc")
    local init = CommonFunc.getrouterinit()
	if init ~= "" then
	    local result = {}
		result["code"] = "false"
		LuciHttp.write_json(result)
		return 
	end
	setWifiAndAdmin()
end

function setWifiAndAdmin()
    local CommonFunc = require("luci.common.commonFunc")
    local flag =  LuciHttp.formvalue("flag")
    local wifiname = LuciHttp.formvalue("wifiName")
    local wifipassword = LuciHttp.formvalue("wifiPassword")
    local adminpassword = ""
    
    if flag ~= nil and tonumber(flag) == 1 then
        adminpassword = wifipassword
    else
        adminpassword = LuciHttp.formvalue("adminPassword")
        if adminpassword == nil or adminpassword == "" then
            adminpassword = wifipassword
        end
    end
    local result = {}
    local YKsecure = require "luci.common.secure"
    YKsecure.setAdminPwd(adminpassword)
    
    local encryption = "psk2"
    local channal = "0"
    local hiddenflag = "false"
    local enable = "true"
    
    result["code"] = wifisetting.setWifiBasicInfo(1, wifiname, wifipassword, 
                       encryption, channal, nil, hiddenflag, enable)
    CommonFunc.forkRestartWifi()
	CommonFunc.setrouterinit("true")
    LuciHttp.write_json(result)
end

function pppoeStart()
	LuciUtil.exec("lua /usr/sbin/pppoe.lua up")
end

function pppoeStop()
	LuciUtil.exec("lua /usr/sbin/pppoe.lua down")
end

function getPPPoEStatus()
    local CommonFunc = require("luci.common.commonFunc")
	local result = CommonFunc.getPPPoEStatus()
	LuciHttp.write_json(result)
end

function pppoeDebug()
    local protostr = LuciUci:get("network","wan","proto")
    if protostr == "pppoe"then
      local posix = require("posix_c")
      local cmd = "nohup sh /usr/sbin/debug_ppp.sh & > /dev/null"
      os.execute(cmd)
      LuciHttp.redirect("http://wifi.youku.com/cgi-bin/luci/api/network/pppoeDebugFile")
	else
	  local result = {}
	  result["code"] = "-1"
	  result["errormsg"] = "WAN's proto of config network is not pppoe!!!"
	  LuciHttp.write_json(result)
    end
end

function pppoeDebugFile()
    local posix = require("posix_c")
    local cmd = "[ -f /www/pub/pppoe_debug.tar.gz ] && echo file"
    local status = LuciUtil.exec(cmd)
    local i = LuciHttp.formvalue("i")
    if i == "" or i == nil then
        i = 0
    else
        i = tonumber(i)
    end
    if i > 10 then
        LuciHttp.write("please try again!")
        return
    end
    if status == "" then
        posix.sleep(10)
        i = i + 1
        LuciHttp.redirect("http://wifi.youku.com/cgi-bin/luci/api/network/pppoeDebugFile?i=" .. i)
    else
        LuciHttp.redirect("http://wifi.youku.com/pub/pppoe_debug.tar.gz")
    end
end
