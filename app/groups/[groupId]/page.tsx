import {
    Button,
    Card,
    Container,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/getProfile";

type GroupPageProps = {
    params: Promise<{
        groupId: string;
    }>;
};

export default async function GroupPage({
    params,
}: GroupPageProps) {
    const { groupId } = await params;

    const groupIdNumber = Number(groupId);

    if (!Number.isInteger(groupIdNumber)) {
        return (
            <Container size="sm" py="xl">
                <Text c="red">
                    Ungültige Gruppen-ID.
                </Text>
            </Container>
        );
    }

    const supabase = await createClient();

    const { user, profile } = await getProfile(supabase);

    if (!user || !profile) {
        return (
            <Container size="sm" py="xl">
                <Text c="red">
                    Nicht angemeldet.
                </Text>
            </Container>
        );
    }

    const { data: membership, error } = await supabase
        .from("GroupMembers")
        .select(`
            role,
            group_id,
            Groups (
                id,
                name,
                active_season_id,
                Seasons!Groups_active_season_id_fkey (
                    id,
                    year,
                    Leagues!Seasons_league_id_fkey (
                        id,
                        name
                    )
                )
            )
        `)
        .eq("user_id", profile.id)
        .eq("group_id", groupIdNumber)
        .single();

    console.log("groupId:", groupIdNumber);
    console.log("profileId:", profile.id);
    console.log("membership:", membership);
    console.log("membership error:", error);

    if (error || !membership || !membership.Groups) {
        return (
            <Container size="sm" py="xl">
                <Text c="red">
                    Gruppe nicht gefunden oder du bist kein Mitglied.
                </Text>
            </Container>
        );
    }

    const group = membership.Groups;
    const season = group.Seasons;
    const league = season?.Leagues;

    return (
        <Container size="sm" py="xl">
            <Stack gap="lg">
                <Title>
                    {group.name}
                </Title>

                <Card
                    withBorder
                    shadow="sm"
                    padding="lg"
                    radius="md"
                >
                    <Stack gap="md">
                        <Text>
                            <strong>Liga:</strong>{" "}
                            {league?.name ?? "Unbekannte Liga"}
                        </Text>

                        <Text>
                            <strong>Saison:</strong>{" "}
                            {season?.year ?? "Unbekannte Saison"}
                        </Text>

                        <Text>
                            <strong>Rolle:</strong>{" "}
                            {membership.role === "admin"
                                ? "Admin"
                                : "Mitglied"}
                        </Text>

                        <Button>
                            Als aktive Gruppe verwenden
                        </Button>
                    </Stack>
                </Card>
            </Stack>
        </Container>
    );
}