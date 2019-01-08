module ("luci.common.commonFunc", package.seeall)

local Configs = require("luci.common.commonConfig")
local secure = require("luci.common.secure")
local LuciOS = require("os")
local LuciProtocol = require("luci.http.protocol")
local logger = require("luci.logger")
local LuciUci = uci.cursor() 
globlepersent = 0
youkupid = ""                  
youkuuid = ""
youkuusername = ""
youkusn = ""
youkubindstatus = ""            --init: ""   bind:"true"  unbind:"false"
youkuversion = "1.0.0.1"

--[[
@param mac: mac address
@return XX:XX:XX:XX:XX:XX
]]--
function macFormat(mac)
    if mac then
        return string.upper(string.gsub(mac,"-",":"))
    else
        return ""
    end
end

function isStrNil(str)
    return (str == nil or str == "")
end

function parseEnter2br(str)
    if (str ~= nil) then
        str = str:gsub("\r\n", "<br>")
        str = str:gsub("\r", "<br>")
        str = str:gsub("\n", "<br>")
    end
    return str
end

function trimLinebreak(str)
    if (str ~= nil) then
        str = str:gsub("\r\n", "")
        str = str:gsub("\r", "")
        str = str:gsub("\n", "")
    end
    return str
end

function forkExec(command)
    local Nixio = require("nixio")
    local pid = Nixio.fork()
    if pid > 0 then
        return
    elseif pid == 0 then
        Nixio.chdir("/")
        local null = Nixio.open("/dev/null", "w+")
        if null then
            Nixio.dup(null, Nixio.stderr)
            Nixio.dup(null, Nixio.stdout)
            Nixio.dup(null, Nixio.stdin)
            if null:fileno() > 2 then
                null:close()
            end
        end
        Nixio.exec("/bin/sh", "-c", command)
    end
end

function doPrint(content)
    if type(content) == "table" then
        for k,v in pairs(content) do
            if type(v) == "table" then
                print("<"..k..": ")
                doPrint(v)
                print(">")
            else
                print("["..k.." : "..tostring(v).."]")
            end
        end
    else
        print(content)
    end
end

function forkRestartWifi()
    LuciOS.execute(Configs.FORK_RESTART_WIFI)
end

function forkReboot()
    LuciOS.execute(Configs.FORK_RESTART_ROUTER)
end

function forkResetAll()
    LuciOS.execute(Configs.FORK_RESET_ALL)
end

function forkRestartDnsmasq()
    LuciOS.execute(Configs.FORK_RESTART_DNSMASQ)
end

function getpppoelogpath()
    local luciutil = require("luci.util")
    return trimLinebreak(luciutil.exec("grep logfile /etc/ppp/options | cut -d ' ' -f 2"))
end

function getyoukuvertion()
    if youkuversion == "1.0.0.1" then
	    local luciutil = require("luci.util")
		youkuversion = luciutil.exec(Configs.GET_ROUTER_VERSION) or "1.0.0.1"
	end
	return youkuversion
end

function getTime()
    return os.date("%Y-%m-%d--%X",os.time())
end

function hzFormat(hertz)
    local suff = {"Hz", "KHz", "MHz", "GHz", "THz"}
    for i=1, 5 do
        if hertz > 1024 and i < 5 then
            hertz = hertz / 1024
        else
            return string.format("%.2f %s", hertz, suff[i])
        end
    end
end

function byteFormat(byte)
    local suff = {"B", "KB", "MB", "GB", "TB"}
    for i=1, 5 do
        if byte > 1024 and i < 5 then
            byte = byte / 1024
        else
            return string.format("%.2f %s", byte, suff[i])
        end
    end
end

function checkSSID(ssid)
    if isStrNil(ssid) then
        return false
    end
	
	if string.len(ssid) > 30 then
	    return false
	end
    return true
end

function getruntime(type)
  local LuciUtil = require "luci.util"
  local catUptime = "cat /proc/uptime"
  local data = LuciUtil.exec(catUptime)
  local timetmp = 0
  if data == nil then
    timetmp = 0
  else
    local t1,t2 = data:match("^(%S+) (%S+)")
    timetmp = t1
  end
  
  retdata = "0,0,0,0"
  if timetmp ~= 0 then
    local timeas,timems = timetmp:match("^(%S+).(%S+)")
    local mm = 60
    local hh = 60*60
    local dd = 60*60*24

    local day = tostring(math.floor(tonumber(timeas)/dd))
    local hour = tostring(math.floor((tonumber(timeas)-tonumber(day)*dd)/hh))
    local minute = tostring(math.floor((tonumber(timeas)-tonumber(day)*dd-tonumber(hour)*hh)/mm))
    local second = tostring(tonumber(timeas)-tonumber(day)*dd-tonumber(hour)*hh-tonumber(minute)*mm)

    retdata = day..","..hour..","..minute..","..second
  end
  return retdata
end

function getyoukurouteinfo()
    local result = {}
    result["pid"] = ""
    result["sn"] = ""
    result["uid"] = ""
    result["username"] = ""
    
    if youkubindstatus ~= "" then
	    if youkubindstatus == "true" and youkuuid ~= "" then
	        result["code"] = "0"
	        result["pid"] = youkupid
	        result["sn"] = youkusn
	        result["uid"] = youkuuid
	        result["username"] = youkuusername
	        return result
	    elseif youkubindstatus == "false" then
	        result["code"] = "1"
	        result["pid"] = youkupid
	        result["sn"] = youkusn
	        return result
	    end
    end
    
    local tmpuid = secure.getUConfig("userid", "", "account")
	local tmpusername = secure.getUConfig("username", "", "account")
	
	if tmpuid == "" or tmpusername == "" then
	    youkubindstatus = "false"
		result["code"] = "1"
	else
	    youkubindstatus = "true"
		result["code"] = "0"
		result["uid"] = tmpuid
        result["username"] = tmpusername
		youkuuid = result["uid"]
        youkuusername = result["username"]
	end
	
	result["pid"] = getrouterpid()
	result["sn"] = result["pid"]
	youkupid = result["pid"]
    youkusn = result["sn"]
    return result
end

function getrouterpid()
    if youkupid ~= "" then
        return youkupid
    end
	
	local LuciUtil = require("luci.util")
	local sn = string.sub(LuciUtil.exec(Configs.SN_YOUKU_EXEC),1,20) or nil
	if sn then
	  youkupid = sn
      youkupsn = sn
	end
	return sn
end

function getroutersn()
    if youkusn ~= "" then
        return youkusn
    end
    return getrouterpid()
end

function setyoukurouteinfo(uid,username)
	secure.setUConfig("userid", uid, "account")
	secure.setUConfig("username", username, "account")
	youkuuid = uid
	youkuusername = username
	youkubindstatus = "true"
	return true 
end

function delyoukurouteinfo()
	youkuuid = ""
	youkuusername = ""
	youkubindstatus = "false"
	secure.setUConfig("userid", "", "account")
	secure.setUConfig("username", "", "account")
	return true
end

function checkbind()
    local result = {}
    local http = require("luci.common.http")
	local pid = getrouterpid() or ""
	local code, datainfo = http.req_get(Configs.DESKTOP_CHECKBIND_URL..pid)
	
	if datainfo then
      if tonumber(datainfo["code"]) == 0 then 
          local setyoukuinfo = setyoukurouteinfo(datainfo["data"]["id"],datainfo["data"]["name"])
          if not setyoukuinfo then
              result["code"] = "-3"
              return result  -- 设置绑定信息出错
          end
		  result["code"] = "0"
		  result["uid"] = datainfo["data"]["id"]
		  result["userid"] = datainfo["data"]["id"]
		  result["username"] = datainfo["data"]["name"]
		  return result  --已绑定
      else
		 if tonumber(datainfo["code"]) == 25 then
		    result["code"] = "1"
			local oldinfo = getyoukurouteinfo()
            if tonumber(oldinfo["code"]) ~= 1 then	
			  delyoukurouteinfo()
			end
		    return result  --未绑定
		 else
		    --外网检查失败的时候，询问framework
		    result = getyoukurouteinfo()
			result["userid"] = result["uid"]
		    return result
	     end
      end
    else
	  --外网服务器请求失败的时候，询问framework
	  result = getyoukurouteinfo()
	  result["userid"] = result["uid"]
      return result
    end
end

function bindyoukuuser(username, password)
  local result = {}
  local http = require("luci.common.http")
  local pid = getrouterpid()
  local version = getyoukuvertion()
  if pid == nil or username == nil or password == nil then
      result["code"] = "-1"
	  result["errmsg"] = "登陆用户信息取得不完全，无法进行绑定，请重试。"
      return result
  end

  local param = "?pid="..pid.."&username="..LuciProtocol.urlencode(username).."&password="..LuciProtocol.urlencode(password).."&version="..version
  local code, datainfo = http.req_get(Configs.DESKTOP_BINDUSER_URL..param)
  
  if datainfo then
      if tonumber(datainfo["code"]) == 0 then
          result["code"] = "0" 
		  local userid = datainfo["data"]["userid"]
		  local nickname = datainfo["data"]["username"]
          local setyoukuinfo = setyoukurouteinfo(userid,nickname)
          if not setyoukuinfo then
              result["code"] = "-3"
			  result["errmsg"] = "绑定用户信息保存失败，请重试。"
              return result
          end
      else
         result["code"] = "-2"
		 if tonumber(datainfo["code"]) == 27 then
		     result["errmsg"] = "用户名密码错误，请重试。"
		 elseif tonumber(datainfo["code"]) == 26 then
		     result["errmsg"] = "该路由已经被绑定，如果更换用户，需要先用原用户解绑。"
		 elseif tonumber(datainfo["code"]) > 1000 then
		     if not isStrNil(datainfo["text"]) then
			     result["errmsg"] = datainfo["text"]
			 else
		         result["errmsg"] = "访问登录API出现错误，请重试。"
			 end
		 else
		     result["errmsg"] = "绑定用户操作失败，请重试。"
	     end
      end
  else
     result["code"] = "-2"
	 result["errmsg"] = "绑定用户请求失败，请重试。"
  end
  
  return result
end

function unbindyoukuuser(username, password)
  local result = {}
  local http = require("luci.common.http")
  local pid = getrouterpid()
  local version = getyoukuvertion()
  if pid == nil or username == nil or password == nil  then
      result["code"] = "-1"
	  result["errmsg"] = "登陆用户信息取得不完全，无法进行解绑定，请重试。"
      return result
  end

  local param = "?pid="..pid.."&username="..LuciProtocol.urlencode(username).."&password="..LuciProtocol.urlencode(password).."&version="..version
  local code, datainfo = http.req_get(Configs.DESKTOP_UNBINDUSER_URL..param)
  
  result["code"] = "0"
  if code ~= 200 or datainfo == nil then
      result["code"] = "-1"
	  result["errmsg"] = "解绑定用户失败，请重试。"
      return result
  end
  
  if tonumber(datainfo["code"]) == 27 then
    result["code"] = "-2"
    result["errmsg"] = "用户名密码错误，请重试。"
	return result
  elseif tonumber(datainfo["code"]) == 25 then
    result["code"] = "-2"
	result["errmsg"] = "没有该路由的绑定信息，无需解绑。"
	return result
  elseif tonumber(datainfo["code"]) > 1000 then
	 result["code"] = "-2"
	 if not isStrNil(datainfo["text"]) then
		 result["errmsg"] = datainfo["text"]
	 else
		 result["errmsg"] = "访问登录API出现错误，请重试。"
	 end
	 return result
  elseif tonumber(datainfo["code"]) ~= 0 then
    result["code"] = "-2"
	result["errmsg"] = "解绑定用户操作失败，请重试。"
	return result
  end
  
  local delyoukuinfo = delyoukurouteinfo()
  if not delyoukuinfo then
      result["code"] = "-3"
	  result["errmsg"] = "解绑定用户信息删除失败，请重试。"
      return result
  end
  return result
end

function getaccmode()
    local accmode = tonumber(LuciUci:get("account","common","accmode")) or 3

    if accmode >= 3 then
        return "1"
    elseif accmode >= 2 then
        return "2"
    else
        return "3"
    end
end

function setaccmode(accmode)
    accmode = tonumber(accmode)

    local LuciUtil = require "luci.util"
    if accmode == 1 then
        accmode = "3"
    elseif accmode == 2 then
        accmode = "2"
    else
        accmode = "0"
    end

    LuciUci:set("account","common","accmode", accmode)
    LuciUci:save("account")
    LuciUci:commit("account")

    LuciUtil.exec(Configs.ACC_CHECK_CONF)

    return 0
end

function getWanGatewayenable()
    local devcnt,dspeed,uspeed,online=getDeviceSumInfo()
    return online==1
end

function getcreditsinfo(pid, uid)
    local result = {}
	result["code"] = "-1"	
    result["next_credit_dur"] = "0"
    result["credits_today"] = "0"
    result["credits_lastday"] = "0"
    result["total_credits"] = "0" 
	result["credits_est"] = "0"
    local http = require("luci.common.http")
    local param = ""
	
	if isStrNil(pid) then
	    result["code"] = "-2"
        return result
	end 
	
    if not isStrNil(uid) then
        param = "?pid="..LuciProtocol.urlencode(pid).."&uid="..LuciProtocol.urlencode(uid)
    else
        param = "?pid="..LuciProtocol.urlencode(pid)
    end
	
    local code, datainfo = http.req_get(Configs.DESKTOP_GETCREDIT_SUMMARY_URL..param)
    
    if code ~= 200 or not datainfo then
        result["code"] = "-3"
        return result
    end
    
    if tonumber(datainfo["code"]) == 0 then
        result["code"] = "0"
        result["next_credit_dur"] = tostring(math.floor(tonumber(datainfo["data"]["next_credit_dur"])/60))
        result["credits_today"] = datainfo["data"]["credits_today"]
        result["credits_lastday"] = datainfo["data"]["credits_lastday"]
        result["total_credits"] = datainfo["data"]["total_credits"]
        if tonumber(datainfo["data"]["credits_est"]) > tonumber(datainfo["data"]["credits_today"]) then
            result["credits_est"] = tostring(tonumber(datainfo["data"]["credits_est"])-tonumber(datainfo["data"]["credits_today"]))
        else 
            result["credits_est"] = "0"
        end		
    elseif tonumber(datainfo["code"]) == 11 then
        result["code"] = "0"
        result["next_credit_dur"] = "0"
        result["credits_today"] = "0"
        result["credits_lastday"] = "0"
        result["total_credits"] = "0"
        result["credits_est"] = "0"
    end
    return result 
end

function createPCDNURLparam()
    local http = require("luci.common.http")
	local tokenstring = ""
	local tokenstringwithwifi = ""

	local code, datainfo = http.req_get(Configs.ROUTER_FRAMWORK_TOKEN)
	if code ~= 200 or not datainfo then
        return tokenstring, tokenstringwithwifi
    end
	
	local wifisetting = require("luci.common.wifiSetting")
	if tonumber(datainfo["code"]) == 0 then
	    local wanip,wanmac = wifisetting.getWanIPMac()
		tokenstring = datainfo["token"] or ""
	    if wanip ~= "0.0.0.0" then
	        tokenstring = "&ip="..wanip..tokenstring
	    end 
		tokenstringwithwifi = tokenstring
		local wifiinfo = wifisetting.getWifiSimpleInfo(1)
		if wifiinfo["name"] ~= "" then
			tokenstringwithwifi = "&ssid="..wifiinfo["name"]..tokenstring
		end
	end
    return tokenstring, tokenstringwithwifi
end

local uci = require("luci.model.uci")                                                                            
local LuciUtil = require("luci.util")
--[[
function getWifiInfo()
	local http = require("luci.common.http")
	local code, datainfo = http.req_get(Configs.ROUTER_FRAMWORK_DEVINFO)
	local info = {}	
	if datainfo["code"] ~= nil and datainfo["code"] == 0 and datainfo["info"] ~= nil then
		local devices = datainfo["info"]
		for _, device in ipairs(devices) do
			--print(device.mac)
			if device.mode == "WLAN" or device.mod == "wifi" then
				info[device.mac] = "wifi"
			end
		end
	end
	return info
end
]]

function getWifiInfo()
	local info = {}
	local wifi_mac_info = LuciUtil.exec("youku_wlan_table")
	local str_lines = string.split(wifi_mac_info,"\n") 
	local line_number = 1                                                           
	local colum_index = 1  
	for _i, a_line in ipairs(str_lines) do                                          
	        if line_number > 1 then
	        	local words = string.split(a_line, " ")                         
	        	if table.getn(words) < 6 then                                   
	                      break                                                   
	                end
	                colum_index = 1
	                local index 
	                for index, a_world in ipairs(words) do
	                	if string.len(a_world) > 0 and colum_index == 1 then
	                		--print(a_world)
	                		info[a_world] = "wifi"
	                	end
	                	if colum_index > 1 then
	                		break
	                	end
	                	colum_index = colum_index + 1
	                end
	        end
	        line_number = line_number + 1
	end
	return info
end

function getBindInfo()
	local info = {}
	LuciUci:foreach("dhcp","host",                                            
	        function(s)                                                       
	                if s ~= nil then                                          
	                      local item = {                                    
	                          ["name"] = s.name,                        
	                          ["mac"] = s.mac,                          
	                          ["ip"] = s.ip                             
	                       }                                                 
                               info[s.mac] = item                                
	                 end
	        end 
        )
        return info
end

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
				dhcp_name = strtrim(a_dhcp_word)
			end
			i = i + 1
		end
		--table.insert(mac_name_map,{mac=dhcp_mac,name=dhcp_name})
		if dhcp_mac ~= nil then
			mac_name_map[dhcp_mac] = dhcp_name
			--print(dhcp_mac)
			if dhcp_name == "" or dhcp_name == "*" then
			    mac_name_map[dhcp_mac] = string.upper(dhcp_mac)
			end
		end
	end
	--print(mac_name_map["28:e3:47:5e:9f:ea"])
	--print("return")
	return mac_name_map
end

function get_rate_map()
	local rate_info = LuciUtil.exec("/usr/sbin/youku_speed")
	local str_lines = string.split(rate_info,"\n")
	local colum_index = 1
	local ip = "none"
	local down_rate = "none"
	local up_rate = "none"
	local devices = {}
	for _i, a_line in ipairs(str_lines) do
		local words = string.split(a_line," ")
		colum_index = 1
		ip = "none"
		down_rate = "none"
		up_rate = "none"
		for index, a_word in ipairs(words) do
			if string.len(a_word) > 0 then
				if colum_index == 1 then
					ip = a_word
				elseif colum_index == 2 then
					down_rate = a_word
				elseif colum_index == 3 then
					up_rate = a_word
				end
				colum_index = colum_index + 1
			end
		end

		devices[ip] = { ["ip"] = ip,
				["down_rate"] = down_rate,
				["up_rate"] = up_rate}
	end
	return devices
end

function getMacFilterInfo()                                                     
        local info = {}                                                         
        LuciUci:foreach("macfilter","machine",                                  
                function(s)                                                     
                        if s ~= nil and s.mac ~= nil and s.name ~= nil then
                              local item = {                                    
                                  ["mac"] = s.mac,                              
                                  ["name"] = s.name                             
                               }                                                
                               info[s.mac] = item                               
                         end                                                    
                end                                                             
        )                                                                       
        return info                                                             
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
	return devices
end

function strtrim(s)
	return (s:gsub("^%s*(.-)%s*$", "%1"))
end

function getIgnore(lines)
    local res_devices = {}
    local t_devices = {}
    local t_words
    local t_mac
    local t_ip
    for _i, a_line in ipairs(lines) do
        -- skip title
        --if _i > 1 then
            t_words = string.rsplit(a_line,"%s")
            t_mac = t_words[4] or "none"
            t_ip = t_words[1] or "none"

            if t_devices[t_mac] == nil then
                t_devices[t_mac] = t_ip
            else
                local test_command = LuciUtil.exec("ping "..t_ip.." -w 1")
                local test_index = string.find(test_command,"ttl=")
                if test_index == nil then
                    res_devices[t_ip] = 1
                else
                    res_devices[t_devices[t_mac]] = 1
                    t_devices[t_mac] = t_ip
                end
            end
        --end
    end
    return res_devices
end

function getDevSampleCount()
    return strtrim(LuciUtil.exec("cat /proc/net/arp | grep br-lan | grep 0x2 | wc -l")) or "0"
end

function getAllDeviceInfo()
    local arp_info = LuciUtil.exec("cat /proc/net/arp | grep br-lan | grep 0x2")
    local str_lines = string.split(arp_info,"\n")

    local ip_addr, hw_type, flags, hw_addr, mask, device
    local name, connect_type, is_binded, down_rate, up_rate, is_accept, devicetype

    local rate_map = get_rate_map()
    local dhcp_map = dhcp_table()
    local wifi_map = getWifiInfo()
    local ignore_map = getIgnore(str_lines)
    local binded_devices = getBindInfo()
    local filter_devices = getMacFilterInfo()

    local devices = {}
    local n_device_count = 0
    local n_down_rate = 0
    local n_up_rate = 0

    for _i, a_line in ipairs(str_lines) do
        --if _i > 1 then
            local words = string.rsplit(a_line,"%s")
            if table.getn(words) < 6 then
                break
            end
            ip_addr = words[1] or nil
            hw_type = words[2] or nil
            flags = words[3] or nil
            hw_addr = words[4] or nil
            device = words[6] or nil

            if device == 'br-lan' and ignore_map[ip_addr] == nil then
                name = "none"
                connect_type = "lan"
                is_binded = "none"
                down_rate = "none"
                up_rate = "none"
                is_accept = "yes"
                down_rate = 0
                up_rate = 0
				devicetype = "unknown"

                if dhcp_map[hw_addr] ~= nil then
                    name = strtrim(dhcp_map[hw_addr])
                end
                if rate_map[ip_addr] ~= nil then
                    down_rate = rate_map[ip_addr]['down_rate']
                    up_rate = rate_map[ip_addr]['up_rate']
                end
                if binded_devices[hw_addr] ~= nil then                  
                    is_binded = "yes"                               
                end
                if filter_devices[hw_addr] ~= nil then                  
                    is_accept = "none"                              
                end
                if wifi_map[hw_addr] ~= nil then
                    connect_type = "wifi"
                end
				
				devicetype = getDeviceTypefromMac(hw_addr,name)

                table.insert( devices, { ip = ip_addr, devicetype = devicetype,
                mac = hw_addr,
                name = name,
                isbinded = is_binded,
                contype = connect_type,
                down_rate = down_rate,
                up_rate = up_rate,
                accept = is_accept} )

                n_device_count = n_device_count + 1
                n_down_rate = n_down_rate + down_rate
                n_up_rate = n_up_rate + up_rate
            end
        --end
    end
    local binded_config_devices = getBindDeviceInfo()
    return devices, n_device_count, n_down_rate, n_up_rate, binded_config_devices
end

function getDeviceTypefromMac(mac,name)
  if not isStrNil(name) and string.len(name) > 7 and string.sub(name,1,7) == "android" then
      return "android"
  end
  
  local ret = "unknown"
  local NixioFs = require("nixio.fs")
  if NixioFs.access(Configs.MACTABLE_FILEPATH) then
    local key = string.upper(string.sub(string.gsub(mac,":","-"),1,8))
    local line = LuciUtil.trim(LuciUtil.exec("sed -n '/"..key.."/p' "..Configs.MACTABLE_FILEPATH))
	if not isStrNil(line) then
	  local apple = line:match("(%S+) Apple")
	  if apple then
	      ret = "iphone"
	  else
	      ret = "PC"
	  end
	end
  end
  if ret == "unknown" or ret == "PC" then
	  local s1,e1 = name:find("PC")
	  if s1 then
	      ret = "PC"
	  end
	  
	  s1,e1 = name:find("notebook")
	  if s1 then
	      ret = "PC"
	  end
      
	  s1,e1 = name:find("iphone")
	  if s1 then
	      ret = "iphone"
	  end
  end
  return ret
end

function _pppoeStatusCheck()
	local LuciJson = require("json")
	local LuciUtil = require("luci.util")
	local cmd = "lua /usr/sbin/pppoe.lua status"
	local status = LuciUtil.exec(cmd)
	if status then
		status = LuciUtil.trim(status)
		if string.len(status) == 0 then
			return false
		end
		status = LuciJson.decode(status)
		return status
	else
		return false
	end
end

function webArrived()
	local to_web = 0
	local proto = LuciUci:get("network","wan","proto")
	
	if proto == "pppoe" then
		local check = _pppoeStatusCheck()
		if check.process == "up" then
				to_web = 1
		end
	else
		local test_command = LuciUtil.exec("ping www.baidu.com -s 1 -w 3")
		local test_index = string.find( test_command, "ttl=" )
		if test_index ~= nil then
		    to_web = 1
		end
	end
	
	return to_web
end

function getDeviceCount()
    local arp_info = LuciUtil.exec("cat /proc/net/arp | grep br-lan | grep 0x2")
    local str_lines = string.split(arp_info,"\n")

    local ignore_map = getIgnore(str_lines)
    local n_device_count = 0
    for _i, a_line in ipairs(str_lines) do
        local words = string.rsplit(a_line,"%s")
        if table.getn(words) < 6 then
            break
        end
        ip_addr = words[1] or nil
        device = words[6] or nil

        if device == 'br-lan' and ignore_map[ip_addr] == nil then
            n_device_count = n_device_count + 1
        end
    end

    return n_device_count
end

function getOldOnline()
	local up = 0
	local proto = LuciUci:get("network","wan","proto")
	
    if proto == "pppoe" then
        local check = _pppoeStatusCheck()
        if check.process == "up" then
            up = 1
        end
    elseif proto == "dhcp" then
        up = webArrived()
    end

    return up
end

function getOldDeviceSumInfo()
    local down_up_rate = LuciUtil.exec("dev_speed")
    local rate = string.split(down_up_rate," ")

    local to_web = getOldOnline()
    local n_device_count = getDeviceCount()

    return n_device_count, rate[1], rate[2], to_web
end

--wanstate 0: 未插网线   1: offline  2:dhcp  3:pppoe  4: unknown
function getwanstate()
    local info = LuciUtil.exec("tail -n 5 " .. Configs.NETMON_LOG_FILE)
    local lines = string.split(info,"\n")

    local online, wanstate = 0, 0
    for i, line in ipairs(lines) do
        local words = string.split(line, " ")
		local words_n = table.getn(words)
        if words_n >= 10 then
            online = words[2]
            wanstate = words[10]
		elseif words_n > 2 then
		    online = words[2]
        end
    end
	
	local ret="0"
	if online~="0" then
	    if wanstate=="1" then 
		    ret="1"
		end	
	else
	    local proto = LuciUci:get("network","wan","proto")
		if proto == "pppoe" then
		    ret="3"
		elseif proto=="dhcp" then
		    ret="2"
		else
		    ret="4"
		end
	end
    return ret
end

function getDeviceSumInfo()
    local info = LuciUtil.exec("tail -n 10 " .. Configs.NETMON_LOG_FILE)
    local lines = string.split(info,"\n")

    if table.getn(lines) < 10 then
        return getOldDeviceSumInfo()
    end

    local dev_cnt, online, rate_up, rate_dwn, valid = 0, 0, 0, 0, 0
    for i, line in ipairs(lines) do
        local words = string.split(line, " ")
        if table.getn(words) >= 9 then
            online = words[2]
            dev_cnt = words[3]
            rate_up = rate_up + words[4]
            rate_dwn = rate_dwn + words[5]
            valid = valid + 1
        end
    end

    if valid == 0 then
        return getOldDeviceSumInfo()
    end

    -- compatible to the format
    if online == "0" then online = 1 else online = 0 end
    if online == 0 then online = getOldOnline() end
    dev_cnt = getDeviceCount()
    return dev_cnt, rate_dwn * 1000 / valid, rate_up * 1000 / valid, online
end

function action_status()
	local data = nixio.fs.readfile("/var/run/luci-reload-status")
	if data then
		luci.http.write("/etc/config/")
		luci.http.write(data)
	else
		luci.http.write("finish")
	end
end

function actionstatusforIF()
	local data = nixio.fs.readfile("/var/run/luci-reload-status")
	if data then
		return "notfinish"
	else
		return "finish"
	end
end

function action_restart(proto, args)
	local nixio = require "nixio"
	local uci = require "luci.model.uci".cursor()
	if args then
		local service
		local services = { }

		for service in args:gmatch("[%w_-]+") do
			services[#services+1] = service
		end

		local command = uci:apply(services, true)
		if nixio.fork() == 0 then
			local i = nixio.open("/dev/null", "r")
			local o = nixio.open("/dev/null", "w")

			nixio.dup(i, nixio.stdin)
			nixio.dup(o, nixio.stdout)

			i:close()
			o:close()
			if proto == "pppoe" then
				nixio.exec("/bin/sh", unpack(command))
			else
			    LuciOS.execute("/etc/init.d/network restart")
			end
			LuciOS.execute("/etc/init.d/dnsmasq restart")
		else
			luci.http.write(proto)
			luci.http.write("OK")
			os.exit(0)
		end
	end
end

function ubusWanStatus()
	local ubus = require("ubus").connect()
	local wan = ubus:call("network.interface.wan", "status", {})
	local result = {}
	if wan["ipv4-address"] and #wan["ipv4-address"] > 0 then
		result["ipv4"] = wan["ipv4-address"][1]
	else
		result["ipv4"] = {
			["mask"] = 0,
			["address"] = ""
		}
	end
	result["dns"] = wan["dns-server"] or {}
	result["proto"] = string.lower(wan.proto or "dhcp")
	result["up"] = wan.up
	result["uptime"] = wan.uptime or 0
	result["pending"] = wan.pending
	result["autostart"] = wan.autostart
	return result
end

function _pppoeErrorCodeHelper(code)
	local errorA = {
		["507"] = 1, ["691"] = 1, ["509"] = 1, ["514"] = 1, ["520"] = 1,
		["646"] = 1, ["647"] = 1, ["648"] = 1, ["649"] = 1, ["691"] = 1,
	}
	local errorB = {
		["516"] = 1, ["650"] = 1, ["601"] = 1, ["510"] = 1, ["530"] = 1,
		["531"] = 1
	}
	local errorC = {
		["501"] = 1, ["502"] = 1, ["503"] = 1, ["504"] = 1, ["505"] = 1,
		["506"] = 1, ["507"] = 1, ["508"] = 1, ["511"] = 1, ["512"] = 1,
		["515"] = 1, ["517"] = 1, ["518"] = 1, ["519"] = 1
	}
	local errcode = tostring(code)
	if errcode then
		if errorA[errcode] then
			return "用户名或密码错误!"
		end
		if errorB[errcode] then
			return "连接不到服务器，请检查网络!"
		end
		if errorC[errcode] then
			return "协议未知错误!"
		end
		return 1
	end
end

function getPPPoEStatus()
	local result = {}
	local status = ubusWanStatus()
	if status then
		local LuciNetwork = require("luci.model.network").init()
		local network = LuciNetwork:get_network("wan")
		if status.proto == "pppoe" then
			if status.up then
				result["status"] = 2
			else
				local check = _pppoeStatusCheck()
				if check then
					if check.process == "down" then
						result["status"] = 4
					elseif check.process == "up" then
						result["status"] = 2
					elseif check.process == "connecting" then
						if check.code == nil or check.code == 0 then
							result["status"] = 1
						else
							result["status"] = 3
							result["errcode"] = check.msg or "601"
							result["errmsg"] = _pppoeErrorCodeHelper(tostring(check.code))
						end
					end
				else
					result["status"] = 4
				end
			end
		else
			result["status"] = 0
		end
	end
	return result
end

function setAutoUpgradeMode(mode)
    secure.setUConfig("upgrademode", mode, "upgrademode")
    return "0"
end

function getAutoUpgradeMode()
    return secure.getUConfig("upgrademode", "", "upgrademode")
end

function setrouterinit(status)
    secure.setUConfig("init", status, "account")
    return "0"
end

function getrouterinit()
    return secure.getUConfig("init", "", "account")
end

function setuserAccount(account)
    secure.setUConfig("useraccount", account, "account")
    return "0"
end

function getuserAccount()
    return secure.getUConfig("useraccount", "", "account")
end

function getLEDMode()
   return secure.getUConfig("lightmode", "0", "account"), secure.getUConfig("lighttime", "22:00-08:00", "account")
end

function setLEDMode(mode,modetime)
    local lmode = mode or "0"
    if lmode ~= "0" and lmode ~= "1" and lmode ~= "2"then
        lmode = "0"
    end
    secure.setUConfig("lightmode", lmode, "account")
	
	if modetime ~= nil and modetime ~= "" then
	   if string.len(modetime) ~= 11 then
	       local hourfrom,minfrom,hourto,minto = modetime:match("^(%S+):(%S+)-(%S+):(%S+)")
		   modetime = string.format("%02d:%02d-%02d:%02d",tonumber(hourfrom),tonumber(minfrom),tonumber(hourto),tonumber(minto))
	   end
	   secure.setUConfig("lighttime", modetime, "account")
	end
    return true
end

function upprogressinit()
    globlepersent = 0
end

function checkUpgrade()
    local LuciUtil = require("luci.util")
    local updatedata = LuciUtil.exec(Configs.CHECK_UPGRADE)
    local result = {}
    
    result["hasupdate"] = "0" 
    result["upgrademode"] = getAutoUpgradeMode()
    if updatedata ~= nil then  
        local json = require("luci.json")
        local updateinfo = json.decode(updatedata)     
        if updateinfo ~= nil and updateinfo["list"]["firmware"] ~= nil and updateinfo["list"]["firmware"]["level"] ~= "force" then
            result["hasupdate"] = "1" 
            result["version"] = string.gsub(updateinfo["list"]["firmware"]["online_version"],"\"","")
            result["size"] = byteFormat(tonumber(updateinfo["list"]["firmware"]["size"]))
			local updatereference = string.gsub(updateinfo["list"]["firmware"]["notify_message"],"\"","")
			updatereference = string.gsub(updatereference,"\r\n","</li><li>")
			updatereference = string.gsub(updatereference,"\r","</li><li>")
            result["updateref"] = string.gsub(updatereference,"\n","</li><li>")
        end
    end
	return result
end

function getupgradestatus()
    local LuciUtil = require "luci.util"
    local data = LuciUtil.exec(Configs.GET_DOWNLOADFILE_STATUS)
    local persent = globlepersent
    
    if data == nil or data == "" then
         return "1" 
    else
	  local table = {}
	  
	  if string.match(data, "update status error") ~= nil then
	     globlepersent = 0
		 return "-1" 
	  end
	  
	  if string.match(data, "failed") ~= nil then
	     globlepersent = 0
		 return "-2" 
	  end
	  
	  if globlepersent == 100 then
	      globlepersent = 0
	      return "100"
	  end
	  
	  for k, v in string.gmatch(data, "update status progress : (%S+)-(%S+)") do
         table["persent"] = tonumber(k) / tonumber(v) * 100
	  end
      
      if table["persent"] == nil then
	      if globlepersent >= 90 then
		      globlepersent = 0
	          return "100"
		  elseif globlepersent > 10 then
		      globlepersent = 0
		      return "-1" 
		  else
              return tostring(persent + 1)
		  end
      end
      
      persent = math.floor(table["persent"])
	  globlepersent = persent
	  
	  if persent <= 1 then
	      return "1"
	  end
	  
      if persent >= 100 then
          globlepersent = 100
		  return "100"
      else
          return tostring(persent)
      end
    end
end

function getAvailableDisk(cmd)
    local LuciUtil = require("luci.util")
    local commonConf = require("luci.common.commonConfig")
    local disk = LuciUtil.exec(cmd)
    if disk and tonumber(LuciUtil.trim(disk)) then
        return tonumber(LuciUtil.trim(disk))
    else
        return false
    end
end

function checkTmpDiskSpace(byte)
    local commonConf = require("luci.common.commonConfig")
    local disk = getAvailableDisk(commonConf.CHECK_TMPDISK)
    if disk then
        if disk - byte/1024 > 10240 then
            return true
        end
    end
    return false
end

function checkDiskSpace(byte)
    local commonConf = require("luci.common.commonConfig")
    local disk = getAvailableDisk(commonConf.CHECK_DISK)
    if disk then
        if disk - byte/1024 > 10240 then
            return true
        end
    end
    return false
end

function changeRouterDomain(ip)
    if isStrNil(ip) then
	    return false
	end
    local command = string.gsub(Configs.CHANGE_DOMAIN_IP, "$s", ip)
    LuciOS.execute(command)
	return true
end

function getFooterInfo()
    local wifisetting = require("luci.common.wifiSetting")
    local result = {}
    result["sysversion"] = getyoukuvertion()
    result["wanIP"], result["MacAddr"] = wifisetting.getWanIPMac()
    result["routerQQ"] = Configs.ROUTER_QQ
    result["routerWX"] = Configs.ROUTER_WX
    result["routerHotline"] = Configs.ROUTER_HOTLINE
	
    return result
end

function getUserInfo()
    local result = {}

	local urlparam = ""
	local urlparamwithwifi = ""
	if getWanGatewayenable() then
	    checkbind()
	end
    urlparam,urlparamwithwifi = createPCDNURLparam()
    local userinfo = getyoukurouteinfo()
    if userinfo['code'] == "0" then
        result["bindflag"] = "1"
        result["binduser"] = userinfo['username']
		result["youkuuserurl"] = Configs.YOUKU_ROUTE_CREDITS_URL..urlparam
    else
        result["bindflag"] = "0"
        result["binduser"] = "绑定优酷账号"
		result["youkuuserurl"] = Configs.YOUKU_ROUTE_BIND_URL..urlparamwithwifi
    end
	result["youkurebinduserurl"] = Configs.YOUKU_ROUTE_REBIND_URL..urlparamwithwifi
	result["genurl"] = Configs.YOUKU_ROUTE_OFFICIAL_URL..urlparam
    result["appurl"] = Configs.YOUKU_APP_DOWNLOAD_URL..urlparam
    result["bbsurl"] = Configs.YOUKU_ROUTE_BBS_URL..urlparam

    return result
end

function getcreditsinfomation()
    local routerinfo = getyoukurouteinfo()
    local result = {}
	local pid = youkupid or routerinfo["pid"]
	local uid = youkuuid or routerinfo["uid"]
	
    if routerinfo["code"] == "1" then
        result = getcreditsinfo(pid,nil)
    else
        result = getcreditsinfo(pid,uid)
    end
	return result
end

function isExistNetworkPublic()
    local LuciUci = uci.cursor()
    local public = LuciUci:get("network","public","ifname") or ""
	if isStrNil(public) then
	    return false
	else
	    return true
	end
end

function checkUpdatetime()
    local oldtime = secure.getUConfig("updatetime", "", "account")
	if isStrNil(oldtime) then
	    return "true"
	end
    local LuciUtil = require "luci.util"
    local curtime = LuciUtil.exec("date +%Y%m%d")
	
	if tonumber(curtime) > tonumber(oldtime) then
	    return "true"
	end
    return "false"
end

function setUpdatetime()
    local LuciUtil = require "luci.util"
    local curtime = LuciUtil.exec("date +%Y%m%d")
    secure.setUConfig("updatetime", curtime, "account")
end

function dirlistscheck()
    local cursor = luci.model.uci.cursor()
    local dirlists = cursor:get("uhttpd", "main", "no_dirlists") or ""
	if dirlists ~= "1" then
	    cursor:set("uhttpd", "main", "no_dirlists", "1")
        cursor:save("uhttpd")
		cursor:commit("uhttpd")
		local LuciUtil = require "luci.util"
		LuciUtil.exec("/etc/init.d/uhttpd restart &")
	end
end

function getRemoteMac()
    local LuciHttp = require("luci.http")
	local remote_addr = LuciHttp.getenv("REMOTE_ADDR")
	local remote_mac = "00:00:00:00:00:00"
	if remote_addr ~= nil then
	    remote_mac = string.upper(luci.sys.net.ip4mac(remote_addr)) 
	end
	return remote_mac
end

function getRouterInitMac()
    local initmac = LuciUtil.exec("eth_mac r wan")
	if initmac and string.len(initmac) > 16 then
	    initmac = string.sub(initmac,1,17)
	end
    return  initmac or "00:00:00:00:00:00"
end
