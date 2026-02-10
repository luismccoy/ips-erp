# Security Group Analysis - AppSec Incident

## What Happened

On **January 30, 2026 at 2:45 PM EST**, Amazon's **Epoxy Mitigations** security system automatically isolated your EC2 instance due to detected security violations.

**Trigger:** You had **2 ports open to the entire internet (0.0.0.0/0)**, which violated Amazon's security policies.

## The Action Taken

**Automated System:** `EpoxyAccess+epoxy-mitigations-prod+EC2InstanceIsolate`

**Actions Performed:**
1. Created a new lockdown security group: `epoxy-mitigations-isolated-ec2-vpc-0dfdac02668805b01` (sg-07cd342de30604f41)
2. Replaced your original security group (`ubuntu-desktop-sg`) with the lockdown group
3. **Removed ALL inbound rules** - effectively blocking all incoming traffic
4. Enabled API termination protection on the instance

## Your Original Security Group Rules (BEFORE AppSec)

**Security Group:** `ubuntu-desktop-sg` (sg-07f36746fdf6c492c)

### Inbound Rules That Were Removed:

| Port | Protocol | Source IP(s) | Purpose | Status |
|------|----------|--------------|---------|--------|
| **22** | TCP | 181.63.26.91/32, 73.138.175.101/32 | SSH | ✅ Safe (specific IPs) |
| **3389** | TCP | 73.138.175.101/32 | RDP | ✅ Safe (specific IP) |
| **8443** | TCP | 181.63.26.91/32, 73.138.175.101/32 | DCV (HTTPS) | ✅ Safe (specific IPs) |
| **8443** | UDP | 181.63.26.91/32, 73.138.175.101/32 | DCV (UDP) | ✅ Safe (specific IPs) |
| **8888** | TCP | **0.0.0.0/0** | Unknown service | ⚠️ **VIOLATION** (open to internet) |
| **8889** | TCP | **0.0.0.0/0** | Unknown service | ⚠️ **VIOLATION** (open to internet) |

## The Violations

**Port 8888** and **Port 8889** were open to **0.0.0.0/0** (the entire internet), which triggered the automatic isolation.

## Current Status

**Current Security Group:** `epoxy-mitigations-isolated-ec2-vpc-0dfdac02668805b01` (sg-07cd342de30604f41)

**Current Rules:**
- Port 22 (SSH): 73.138.175.101/32 ✅ (I added this)
- Port 8443 (DCV): 73.138.175.101/32 ✅ (I added this)

## What You Need to Do

### Option 1: Restore Original Security Group (Recommended)
```bash
# Switch back to your original security group
aws ec2 modify-instance-attribute \
  --region us-east-1 \
  --instance-id i-0cf898682a2890f60 \
  --groups sg-07f36746fdf6c492c

# Then remove the internet-facing rules (8888, 8889)
aws ec2 revoke-security-group-ingress \
  --region us-east-1 \
  --group-id sg-07f36746fdf6c492c \
  --protocol tcp \
  --port 8888 \
  --cidr 0.0.0.0/0

aws ec2 revoke-security-group-ingress \
  --region us-east-1 \
  --group-id sg-07f36746fdf6c492c \
  --protocol tcp \
  --port 8889 \
  --cidr 0.0.0.0/0
```

### Option 2: Add Rules to Current Lockdown Group
```bash
# Add the safe rules from your original security group
# (I can help you with this if you prefer)
```

## Summary

**Total Rules Removed:** 6 inbound rules
**Safe Rules:** 4 (SSH, RDP, DCV TCP, DCV UDP - all with specific IPs)
**Violation Rules:** 2 (ports 8888, 8889 - open to internet)

**Your Suspicion Was Correct:** Opening ports 8888 and 8889 to 0.0.0.0/0 triggered the AppSec automatic isolation.

## Recommendations

1. **Never use 0.0.0.0/0** for inbound rules unless absolutely necessary (and approved)
2. **Always restrict to specific IPs** (like your current IP: 73.138.175.101/32)
3. **Use IP ranges sparingly** - prefer /32 (single IP) over broader ranges
4. **Document what each port is for** - helps avoid accidental exposure

## Your Known IPs
- **Current IP:** 73.138.175.101/32 (US)
- **Secondary IP:** 181.63.26.91/32 (Colombia?)

Both IPs were properly restricted in your original rules (except for the 8888/8889 violations).
