import {
  TabPermission,
  GroupPermission
} from "../redux/tabPermission/tabPermssionSlice";
// import { clientLogger } from '../clientLogger';

// Utility function to check if Tab permission exists
export const checkTabPermissionExists = (
  tabPermissionMap: Record<string, TabPermission>,
  permissionName: string,
  variables?: Record<string, string>
): boolean => {
  let expression: string | undefined;
  if (tabPermissionMap[permissionName]) {
    expression = tabPermissionMap[permissionName]?.tabExpression;
    if (!expression?.length || !variables) {
      return true;
    } else {
      const result = evaluateExpression(expression, variables);
      return result;
    }
  } else {
    console.log("** Check > BFF::Tab::Permissoin");
    return false;
  }
};

// Utility function to check if permission exists
export const checkGroupPermissionExists = (
  groupPermissionMap: Record<string, GroupPermission>,
  permissionName: string,
  variables?: Record<string, string>
): boolean => {
  let expression: string | undefined;
  if (groupPermissionMap[permissionName]) {
    // console.log('1-checkGroupPermissionExists', groupPermissionMap)
    expression = groupPermissionMap[permissionName]?.groupExpression;
    if (!expression?.length || !variables) {
      return true;
    } else {
      const result = evaluateExpression(expression, variables);
      return result;
    }
  } else {
    console.log("** Check > BFF::Group::Permissoin");
    return false;
  }
};

function evaluateExpression(
  expression: string,
  variables?: Record<string, string>
): boolean {
  try {
    const cleanedExpression = expression
      .replace(/\\"/g, '"')
      .replace(/\.contains\(/g, ".includes(");
    // Create a context by mapping each key in variables to the function's local scope
    let scopedVars: string | undefined;
    if (variables) {
      scopedVars = Object.keys(variables)
        .map((key) => `const ${key} = variables.${key};`)
        .join(" ");

      // Evaluate the expression in a secure sandbox
      const func = new Function(
        "variables",
        `
        ${scopedVars}
        return ${cleanedExpression};
      `
      );

      return func(variables);
    }

    // Return the result of evaluating the expression
    return false;
  } catch (error) {
    console.error(`Error evaluating expression "${expression}":`, error);
    return false;
  }
}
