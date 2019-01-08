module("luci.common.http", package.seeall)

local LuciHttp = require("luci.http")
local http = require("socket.http")
local ltn12 = require("ltn12")
local json = require("luci.json")
    
function req_get(requrl)
    if not requrl then
        return 601, nil
    end
    local ret = {}
    local client, code, headers, status = http.request{ url=requrl, sink=ltn12.sink.table(ret), method="GET"}
    local result = json.decode(ret[1])
    return code, result
end

function req_post(requrl)
    if not requrl then
        return 601, nil
    end
    local ret = {}
    local client, code, headers, status = http.request{ url=requrl, sink=ltn12.sink.table(ret), method="POST"}
    local result = json.decode(ret[1])
    return code, result
end

function req_delete(requrl)
    if not requrl then
        return 601, nil
    end
    local ret = {}
    local client, code, headers, status = http.request{ url=requrl, sink=ltn12.sink.table(ret), method="DELETE"}
    local result = json.decode(ret[1])
    return code, result
end




