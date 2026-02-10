# AWS IAM Policy for GitHub Actions

This document describes the minimum IAM permissions required for GitHub Actions to trigger AWS Amplify deployments.

## Policy Document

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AmplifyDeployment",
      "Effect": "Allow",
      "Action": [
        "amplify:StartJob",
        "amplify:GetJob",
        "amplify:ListJobs",
        "amplify:GetApp",
        "amplify:GetBranch"
      ],
      "Resource": [
        "arn:aws:amplify:*:*:apps/*/branches/*"
      ]
    }
  ]
}
```

## How to Apply

### Option 1: Create IAM User (For GitHub Actions)

1. Open AWS IAM Console
2. Click **Users** → **Add users**
3. Username: `github-actions-ips-erp`
4. Select: **Access key - Programmatic access**
5. Click **Next: Permissions**
6. Click **Attach policies directly**
7. Click **Create policy** → Paste JSON above
8. Name: `AmplifyDeploymentPolicy`
9. Attach to user
10. Download access key credentials
11. Add to GitHub Secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

### Option 2: Use IAM Role (For AWS-native CI/CD)

If using Amplify's native CI/CD, no manual IAM configuration needed. Amplify automatically creates a service role with appropriate permissions.

## Security Best Practices

1. **Principle of Least Privilege:** Only grant necessary permissions
2. **Rotate Credentials:** Update GitHub secrets quarterly
3. **Use Resource-Specific ARNs:** Replace `*` with specific app IDs when possible
4. **Enable MFA:** Require MFA for IAM user access
5. **Monitor Usage:** Set up CloudWatch alarms for unusual API activity

## Troubleshooting

### "Access Denied" Error

**Check:**
- IAM policy attached correctly
- AWS region matches Amplify app region
- GitHub secrets configured correctly

### "Resource Not Found"

**Check:**
- Amplify App ID in GitHub secrets is correct
- Branch exists in Amplify Console

