import { SupabaseClient } from "@supabase/supabase-js";

export async function getProfile(supabase: SupabaseClient) {

  const start = performance.now();


  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log(
    "auth.getUser:",
    Math.round(performance.now() - start),
    "ms"
  );

  if (userError || !user) {
    return {
      user: null,
      profile: null,
    };
  }


  const { data: profile, error: profileError } = await supabase
    .from("Profiles")
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
