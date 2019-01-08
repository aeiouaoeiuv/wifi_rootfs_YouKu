echo "gpio btn reset!"
light backup blink 1
sleep 1s
jffs2reset -y
reboot


