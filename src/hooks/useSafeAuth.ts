import { useConvexAuth as _useConvexAuth } from "convex/react";

/**
 * Safe wrapper for useConvexAuth that returns a default "not authenticated"
 * state instead of throwing when ConvexAuthProvider is not in the tree.
 */
export function useSafeAuth() {
  try {
    return _useConvexAuth();
  } catch {
    return { isAuthenticated: false, isLoading: false };
  }
}
