#!/usr/bin/env python3
"""Fix ALL AppSync resolver auth functions missing group-based auth checks.

Covers Patient, Nurse, VitalSigns models - all operations (Query, Mutation, Subscription, field resolvers).
"""
import subprocess
import json
import sys

API_ID = "fxeusr7wzfchtkr7kamke3qnwq"
REGION = "us-east-1"

# Group permissions per model per operation type
# Based on the schema in amplify/data/resource.ts
MODEL_GROUPS = {
    "Patient": {
        "read": ["Admin", "Nurse", "Family"],
        "create": ["Admin"],
        "update": ["Admin"],
        "delete": ["Admin"],
    },
    "Nurse": {
        "read": ["Admin", "Nurse"],
        "create": ["Admin"],
        "update": ["Admin"],
        "delete": ["Admin"],
    },
    "VitalSigns": {
        "read": ["Admin", "Nurse"],
        "create": ["Admin", "Nurse"],
        "update": ["Admin"],
        "delete": ["Admin"],
    },
}

def get_operation_type(func_name):
    """Determine the operation type from the function name."""
    name_lower = func_name.lower()
    if "list" in name_lower or "get" in name_lower or "subscription" in name_lower:
        return "read"
    elif "create" in name_lower:
        return "create"
    elif "update" in name_lower:
        return "update"
    elif "delete" in name_lower:
        return "delete"
    # Field resolvers (e.g., PatientvitalSignsauth0Function) are read operations
    return "read"

def get_model_name(func_name):
    """Extract the model name from the function name."""
    for model in ["VitalSigns", "Patient", "Nurse"]:
        if model.lower() in func_name.lower():
            # Make sure it's not PatientAssessment
            if "assessment" in func_name.lower():
                return None
            return model
    return None

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


def update_function(function_id, name, groups):
    """Update an AppSync function with the correct VTL template."""
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
        print(f"  ERROR getting {name}: {result.stderr}")
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
        print(f"  ERROR updating {name}: {result.stderr}")
        return False
    
    return True


def main():
    print("Scanning all AppSync functions for missing group auth...")
    print()
    
    # Get all functions
    result = subprocess.run(
        ["aws", "appsync", "list-functions",
         "--api-id", API_ID,
         "--region", REGION,
         "--output", "json"],
        capture_output=True, text=True
    )
    data = json.loads(result.stdout)
    
    to_fix = []
    already_ok = []
    
    for f in data.get("functions", []):
        name = f["name"]
        fid = f["functionId"]
        
        if "auth0" not in name:
            continue
        
        model = get_model_name(name)
        if model is None:
            continue
        
        # Get the template to check
        r2 = subprocess.run(
            ["aws", "appsync", "get-function",
             "--api-id", API_ID,
             "--function-id", fid,
             "--region", REGION,
             "--output", "json"],
            capture_output=True, text=True
        )
        d2 = json.loads(r2.stdout)
        tmpl = d2["functionConfiguration"]["requestMappingTemplate"]
        has_groups = "staticGroupRoles" in tmpl
        
        if has_groups:
            already_ok.append(name)
        else:
            op_type = get_operation_type(name)
            groups = MODEL_GROUPS[model][op_type]
            to_fix.append((fid, name, model, op_type, groups))
    
    print(f"Already OK: {len(already_ok)} functions")
    print(f"Need fixing: {len(to_fix)} functions")
    print()
    
    if not to_fix:
        print("Nothing to fix!")
        return 0
    
    success = 0
    for fid, name, model, op_type, groups in to_fix:
        if update_function(fid, name, groups):
            print(f"  OK: {name} ({model}.{op_type}) -> groups={groups}")
            success += 1
        else:
            print(f"  FAIL: {name}")
    
    print()
    print(f"Updated {success}/{len(to_fix)} functions")
    return 0 if success == len(to_fix) else 1


if __name__ == "__main__":
    sys.exit(main())
