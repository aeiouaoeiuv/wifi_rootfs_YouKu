module ("luci.logger", package.seeall)

local posix = require("posix")

TMP_LOG_FILE = "/tmp/log/luci.log"
--[[
    0    mergency: system is unusable
    1    Alert: action must be taken immediately
    2    Critical: critical conditions
    3    Error: error conditions
    4    Warning: warning conditions
    5    Notice: normal but significant condition
    6    Informational: informational messages
    7    Debug: debug-level messages
]]--
function slog(...)
    local priority = arg[1]
    if priority and tonumber(priority) and tonumber(priority) >= 0 and tonumber(priority) <= 7 then
        local util = require("luci.util")
        posix.openlog("luci","np",LOG_USER)
        for i = 2, arg.n do
            posix.syslog(priority, util.serialize_data(arg[i]))
        end
        posix.closelog()
    end
end

function flog(...)
    local priority = arg[1]
    if priority and tonumber(priority) and tonumber(priority) >= 0 and tonumber(priority) <= 7 then
        local util = require("luci.util")
        local nixio = require("nixio")
        local fd = nixio.open(TMP_LOG_FILE, "a")
        for i = 2, arg.n do
            fd:write(util.serialize_data(arg[i]))
        end
        fd:write("\n")
        fd:close()
    end
end
