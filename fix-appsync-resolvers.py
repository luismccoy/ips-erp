#!/usr/bin/env python3
"""Fix AppSync resolver auth functions that are missing group-based auth checks.

The Amplify build didn't regenerate the VTL templates for Patient, Nurse, and VitalSigns
when group-based auth rules were added to the schema. This script directly updates the
AppSync functions to include group checks.
"""
import subprocess
import json
import sys

API_ID = "fxeusr7wzfchtkr7kamke3qnwq"
REGION = "us-east-1"

# Models that need fixing and their allowed groups for list operations
FIXES = {
    # Patient: Admin (CRUD), Nurse (read), Family (read)
    "yxwcfs3c55fibejomc36fl54ua": {
        "name": "QuerylistPatientsauth0Function",
        "groups": ["Admin", "Nurse", "Family"]
    },
    # Nurse: Admin (CRUD), Nurse (read)
    "66zbwwprdfairllp5moupz5uue": {
        "name": "QuerylistNursesauth0Function",
        "groups": ["Admin", "Nurse"]
    },
    # VitalSigns: Admin (CRUD), Nurse (create, read)
    "hoqpycce7vcejefjjw6fboqhti": {
        "name": "QuerylistVitalSignsauth0Function",
        "groups": ["Admin", "Nurse"]
    },
}

def build_vtl_template(groups):
    """Build the correct VTL auth template with group checks."""
    group_roles = ','.join([
        f'{{"claim":"cognito:groups","entity":"{g}"}}'
        for g in groups
    ])
    
    return f'''## [Start] Authorization Steps. **
$util.qr($ctx.stash.put("hasAuth", true))
#set( $isAuthorized = false )
#set( $primaryFieldMap = {{}} )
#if( $util.authType() == "IAM Authorization" )
  #if( $util.authType() == "IAM Authorization" && $util.isNull($ctx.identity.cognitoIdentityPoolId) && $util.isNull($ctx.identity.cognitoIdentityId) )
    $util.qr($ctx.stash.put("hasAuth", true))
    #set( $isAuthorized = true )
  #else
    $util.unauthorized()
  #end
#end
#if( $util.authType() == "User Pool Authorization" )
  #if( !$isAuthorized )
    #set( $staticGroupRoles = [{group_roles}] )
    #foreach( $groupRole in $staticGroupRoles )
      #set( $groupsInToken = $util.defaultIfNull($ctx.identity.claims.get($groupRole.claim), []) )
      #if( $groupsInToken.contains($groupRole.entity) )
        #set( $isAuthorized = true )
        #break
      #end
    #end
  #end
#end
#if( !$isAuthorized && $util.isNull($ctx.stash.authFilter) )
  $util.unauthorized()
#end
$util.toJson({{"version":"2018-05-29","payload":{{}}}})
## [End] Authorization Steps. **'''


def update_function(function_id, info):
    """Update an AppSync function with the correct VTL template."""
    groups = info["groups"]
    name = info["name"]
    
    # Get current function config
    result = subprocess.run(
        ["aws", "appsync", "get-function",
         "--api-id", API_ID,
         "--function-id", function_id,
         "--region", REGION,
         "--output", "json"],
        capture_output=True, text=True
    )
    
    if result.returncode != 0:
        print(f"ERROR getting {name}: {result.stderr}")
        return False
    
    data = json.loads(result.stdout)
    fc = data["functionConfiguration"]
    
    # Build new template
    new_template = build_vtl_template(groups)
    
    # Update the function
    result = subprocess.run(
        ["aws", "appsync", "update-function",
         "--api-id", API_ID,
         "--function-id", function_id,
         "--name", name,
         "--data-source-name", fc["dataSourceName"],
         "--function-version", fc["functionVersion"],
         "--request-mapping-template", new_template,
         "--response-mapping-template", fc["responseMappingTemplate"],
         "--region", REGION,
         "--output", "json"],
        capture_output=True, text=True
    )
    
    if result.returncode != 0:
        print(f"ERROR updating {name}: {result.stderr}")
        return False
    
    print(f"OK: Updated {name} with groups {groups}")
    return True


def main():
    print("Fixing AppSync resolver auth functions...")
    print()
    
    success = 0
    for fid, info in FIXES.items():
        if update_function(fid, info):
            success += 1
    
    print()
    print(f"Updated {success}/{len(FIXES)} functions")
    
    if success == len(FIXES):
        # Verify
        print()
        print("Verifying...")
        for fid, info in FIXES.items():
            result = subprocess.run(
                ["aws", "appsync", "get-function",
                 "--api-id", API_ID,
                 "--function-id", fid,
                 "--region", REGION,
                 "--output", "json"],
                capture_output=True, text=True
            )
            data = json.loads(result.stdout)
            tmpl = data["functionConfiguration"]["requestMappingTemplate"]
            has_groups = "staticGroupRoles" in tmpl
            status = "YES" if has_groups else "NO"
            print(f"  {info['name']}: groups={status}")
    
    return 0 if success == len(FIXES) else 1


if __name__ == "__main__":
    sys.exit(main())
