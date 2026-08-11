import { SupabaseClient } from "@supabase/supabase-js";

export async function getProfile(supabase: SupabaseClient) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      user: null,
      profile: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Profile error:", profileError);

    return {
      user,
      profile: null,
    };
  }

  return {
    user,
    profile,
  };
}
