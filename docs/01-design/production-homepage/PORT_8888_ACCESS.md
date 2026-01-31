# AWS Security Group Port 8888 - Temporary Access

**Opened:** 2026-01-30 14:47 UTC  
**Close After:** 2026-01-30 17:47 UTC (3 hours)

## Current Configuration

**Instance ID:** i-0cf898682a2890f60  
**Security Group:** sg-07f36746fdf6c492c  
**Rule ID:** sgr-06abef782193d7394  
**Port:** 8888 (TCP)  
**Source:** 0.0.0.0/0 (public internet)

## Public Access URL

**Homepage Preview:**  
http://44.213.176.239:8888/preview.html

**IMPORTANT:** This port is open to the public internet. Anyone can access the web server on port 8888.

## To Close Port After 3 Hours

Run this command to remove the security group rule:

```bash
aws ec2 revoke-security-group-ingress \
  --group-id sg-07f36746fdf6c492c \
  --security-group-rule-ids sgr-06abef782193d7394
```

Or delete by specification:

```bash
aws ec2 revoke-security-group-ingress \
  --group-id sg-07f36746fdf6c492c \
  --protocol tcp \
  --port 8888 \
  --cidr 0.0.0.0/0
```

## To Stop the Web Server

```bash
# Find the Python process
ps aux | grep "python3 -m http.server 8888"

# Kill it (replace PID with actual process ID)
kill <PID>
```

## Verification

Test that port is closed:
```bash
curl -m 5 http://44.213.176.239:8888/
# Should timeout or connection refused
```

---

**Reminder:** Set a timer for 3 hours to close this port for security!
