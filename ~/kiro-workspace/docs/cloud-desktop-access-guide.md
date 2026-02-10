# Cloud Desktop Access and Management Guide

**User:** Luis Coy (luiscoy)  
**Desktop:** dev-dsk-luiscoy-1e-de514647.us-east-1.amazon.com  
**Fleet ID:** STP-ES-DevDesktop (historical)  
**OS:** Amazon Linux 2 x86_64 5.10 Kernel  
**Host Type:** c7a.8xlarge  
**Last Updated:** February 3, 2026

---

## Quick Reference

### SSH Access (Off VPN)
```bash
ssh luiscoy@dev-dsk-luiscoy-1e-de514647.us-east-1.amazon.com
```

### Authentication Refresh (CRITICAL - Use ECDSA!)
```bash
mwinit -f -k ~/.ssh/id_ecdsa.pub
```
Run this daily or when you see authentication errors.

**IMPORTANT:** 
- Cloud Desktop requires ECDSA key (OpenSSH > 8.7)
- Default `mwinit -f` signs RSA which Cloud Desktop REJECTS
- You MUST specify `-k ~/.ssh/id_ecdsa.pub` to sign the correct key

---

## Initial Setup (Completed ✓)

### 1. WSSH Installation
- **Tool:** Self Service app on Mac
- **Purpose:** Enables off-VPN SSH access to cloud desktops
- **Status:** ✓ Installed

### 2. SSH Key Generation
```bash
ssh-keygen -t ecdsa -b 521
```
- **Location:** `/Users/luiscoy/.ssh/id_ecdsa` (private key)
- **Public Key:** `/Users/luiscoy/.ssh/id_ecdsa.pub`
- **Certificate:** `/Users/luiscoy/.ssh/id_ecdsa-cert.pub`
- **Status:** ✓ Generated and signed by mwinit

### 3. Midway Authentication
- **Method:** YubiKey (Yubico Yubikey 4 OTP+U2F)
- **Process:** Touch key → Enter Midway PIN
- **Cookie Location:** `/Users/luiscoy/.midway/cookie`
- **Status:** ✓ Configured

---

## Daily Workflow

### Connecting to Your Dev Desktop

1. **Authenticate with Midway and sign ECDSA key**:
```bash
mwinit -f -k ~/.ssh/id_ecdsa
```

2. **SSH into dev desktop**:
```bash
ssh luiscoy@dev-dsk-luiscoy-1e-de514647.us-east-1.amazon.com
```

3. **Verify you're connected**:
```bash
hostname
# Should show: dev-dsk-luiscoy-1e-de514647
```

---

## File Transfer Between Dev Desktop and Mac

### Copying Files FROM Dev Desktop TO Mac

**Single File:**
```bash
scp luiscoy@dev-dsk-luiscoy-1e-de514647.us-east-1.amazon.com:/path/to/file.pptx ~/Downloads/
```

**Entire Directory:**
```bash
scp -r luiscoy@dev-dsk-luiscoy-1e-de514647.us-east-1.amazon.com:/path/to/folder ~/Downloads/
```

### Copying Files FROM Mac TO Dev Desktop
```bash
scp ~/Documents/myfile.txt luiscoy@dev-dsk-luiscoy-1e-de514647.us-east-1.amazon.com:/home/luiscoy/
```

---

## Viewing Web Pages Generated on Dev Desktop

### Method 1: SSH Tunnel (Recommended)

**On Dev Desktop:**
```bash
# Start a simple web server on port 8000
python3 -m http.server --bind 127.0.0.1 8000
```

**On Your Mac (separate terminal):**
```bash
# Create SSH tunnel
ssh -L 8080:127.0.0.1:8000 luiscoy@dev-dsk-luiscoy-1e-de514647.us-east-1.amazon.com
```

**In Your Mac Browser:**
```
http://localhost:8080
```

### Method 2: share-http (Alternative)

**On Dev Desktop:**
```bash
share-http /path/to/html/directory --bind dev-dsk-luiscoy-1e-de514647.us-east-1.amazon.com
```

---

## Troubleshooting

### "Permission denied (publickey)"
**Cause:** SSH certificate expired or wrong key type  
**Solution:** 
```bash
mwinit -f -k ~/.ssh/id_ecdsa
```

### "Skipping ssh-rsa-cert-v01@openssh.com key - algorithm not supported"
**Cause:** Cloud Desktop doesn't accept RSA certificates  
**Solution:** Sign your ECDSA key instead:
```bash
mwinit -f -k ~/.ssh/id_ecdsa
```

### "Connection closed by UNKNOWN port 65535"
**Solution:** WSSH not installed or not working. Reinstall via Self Service.

### "Host key verification failed"
**Solution:** Type `yes` when prompted to accept the host fingerprint (first connection only)

### SSH Certificate Expired
**Solution:** Run `mwinit -f -k ~/.ssh/id_ecdsa` to get a new certificate (typically valid for 12 hours)

### WSSH Config Issues
**Solution:** Run `wssh setup` to reconfigure SSH config

---

## Important Locations

### On Your Mac
- SSH Keys: `/Users/luiscoy/.ssh/`
- ECDSA Key: `/Users/luiscoy/.ssh/id_ecdsa`
- ECDSA Cert: `/Users/luiscoy/.ssh/id_ecdsa-cert.pub`
- Midway Cookie: `/Users/luiscoy/.midway/cookie`
- SSH Config: `/Users/luiscoy/.ssh/config`

### On Dev Desktop
- Home Directory: `/home/luiscoy/`
- Workspace: `/workplace/luiscoy/` (if using Brazil/internal tools)

---

## Quick Commands Cheat Sheet

```bash
# Daily authentication (MUST specify ECDSA key!)
mwinit -f -k ~/.ssh/id_ecdsa.pub

# Connect to dev desktop
ssh luiscoy@dev-dsk-luiscoy-1e-de514647.us-east-1.amazon.com

# Copy file to Mac
scp luiscoy@dev-dsk-luiscoy-1e-de514647.us-east-1.amazon.com:/path/to/file ~/Downloads/

# Create SSH tunnel for web viewing
ssh -L 8080:127.0.0.1:8000 luiscoy@dev-dsk-luiscoy-1e-de514647.us-east-1.amazon.com

# Check SSH certificate status
ssh-keygen -L -f ~/.ssh/id_ecdsa-cert.pub

# Reconfigure WSSH
wssh setup
```

---

## Resources

- **Cloud Desktop Documentation:** https://docs.hub.amazon.dev/dev-setup/clouddesktop/
- **WSSH Information:** Available in Self Service
- **Support:** Contact your team or check internal wikis for additional guidance

---

## Notes

- **glibc Version:** Amazon Linux 2 has glibc 2.26 - widely compatible
- **Architecture:** x86_64 (best software compatibility)
- **Key Type:** ECDSA required (RSA not supported by server)
