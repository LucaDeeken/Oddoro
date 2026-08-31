"use client";

import {
    Button,
    Card,
    Container,
    Group,
    SimpleGrid,
    Stack,
    Text,
    Title,
    Badge,
    Loader,
    Center,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

type GroupData = {
    role: string;
    Groups: {
        id: number;
        name: string;
        active_season_id: number;
        Seasons: {
            id: number;
            year: string;
            Leagues: {
                id: number;
                name: string;
            } | null;
        } | null;
    };
};

export default function GroupsPage() {
    const router = useRouter();

    const [groups, setGroups] = useState<GroupData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadGroups() {
            try {
                const res = await fetch("/api/groups");

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data.error || "Gruppen konnten nicht geladen werden",
                    );
                }

                setGroups(data.groups);
            } catch (error) {
                console.error("Load groups error:", error);

                setError(
                    error instanceof Error
                        ? error.message
                        : "Gruppen konnten nicht geladen werden",
                );
            } finally {
                setLoading(false);
            }
        }

        loadGroups();
    }, []);

    console.log(groups)
    return (
        <main className={styles.main}>
            <Container size="md" py="xl">
                <Group justify="space-between" mb="xl">
                    <Title className={styles.header}>
                        Meine Gruppen
                    </Title>

                    <Button
                        onClick={() => router.push("/groups/create")}
                    >
                        + Neue Gruppe
                    </Button>
                </Group>

                {loading && (
                    <Center py="xl">
                        <Loader />
                    </Center>
                )}

                {error && !loading && (
                    <Text c="red">
                        {error}
                    </Text>
                )}

                {!loading && !error && groups.length === 0 && (
                    <Card
                        withBorder
                        shadow="sm"
                        padding="xl"
                        radius="md"
                    >
                        <Stack align="center" gap="md">
                            <Title order={3}>
                                Noch keine Gruppen
                            </Title>

                            <Text c="dimmed" ta="center">
                                Du bist bisher keiner Gruppe
                                beigetreten.
                            </Text>

                            <Button
                                onClick={() =>
                                    router.push("/groups/create")
                                }
                            >
                                + Erste Gruppe erstellen
                            </Button>
                        </Stack>
                    </Card>
                )}

                {!loading && !error && groups.length > 0 && (
                    <SimpleGrid
                        cols={{ base: 1, sm: 2 }}
                        spacing="lg"
                    >
                        {groups.map((membership) => (
                            <Card
                                key={membership.Groups.id}
                                withBorder
                                shadow="sm"
                                padding="lg"
                                radius="md"
                            >
                                <Stack gap="md">
                                    <Group justify="space-between">
                                        <Title order={3}>
                                            {membership.Groups.name}
                                        </Title>

                                        <Badge>
                                            {membership.role === "admin"
                                                ? "Admin"
                                                : "Mitglied"}
                                        </Badge>
                                    </Group>

                                    <Text c="dimmed">
                                        {membership.Groups.Seasons?.Leagues?.name ?? "Unbekannte Liga"} ·{" "}
                                        {membership.Groups.Seasons?.year ?? "Unbekannte Saison"}
                                    </Text>

                                    <Button
                                        fullWidth
                                        onClick={() =>
                                            router.push(
                                                `/groups/${membership.Groups.id}`,
                                            )
                                        }
                                    >
                                        Gruppe öffnen
                                    </Button>
                                </Stack>
                            </Card>
                        ))}
                    </SimpleGrid>
                )}
            </Container>
        </main>
    );
}