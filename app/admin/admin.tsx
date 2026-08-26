"use client";

import { useEffect, useState } from "react";
import {
    Button,
    Container,
    Paper,
    Select,
    Stack,
    Text,
    Title,
} from "@mantine/core";

type League = {
    id: number;
    name: string;
};

export default function Admin() {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [leagueId, setLeagueId] = useState<string | null>(null);

    const [loadingLeagues, setLoadingLeagues] = useState(true);
    const [updating, setUpdating] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadLeagues() {
            try {
                const res = await fetch("/api/admin/leagues");

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Fehler beim Laden der Ligen");
                }

                setLeagues(data);
            } catch (error) {
                console.error(error);

                setError(
                    error instanceof Error
                        ? error.message
                        : "Unbekannter Fehler",
                );
            } finally {
                setLoadingLeagues(false);
            }
        }

        loadLeagues();
    }, []);

    async function handleUpdateH2H() {
        if (!leagueId) {
            setError("Bitte wähle eine Liga aus");
            return;
        }

        setUpdating(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("/api/admin/update-h2h", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    leagueId: Number(leagueId),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Fehler beim Aktualisieren");
            }

            setMessage(
                `${data.updated} Spiele für ${data.league} aktualisiert`,
            );
        } catch (error) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Unbekannter Fehler",
            );
        } finally {
            setUpdating(false);
        }
    }

    return (
        <Container size="sm" py="xl">
            <Title mb="xl">Admin</Title>

            <Paper withBorder shadow="sm" p="lg" radius="md">
                <Stack>
                    <Title order={3}>Head-to-Head aktualisieren</Title>

                    <Text size="sm" c="dimmed">
                        Wähle eine Liga aus und aktualisiere die Wettquoten.
                    </Text>

                    <Select
                        label="Liga"
                        placeholder="Liga auswählen"
                        data={leagues.map((league) => ({
                            value: String(league.id),
                            label: league.name,
                        }))}
                        value={leagueId}
                        onChange={setLeagueId}
                        disabled={loadingLeagues}
                    />

                    <Button
                        onClick={handleUpdateH2H}
                        loading={updating}
                        disabled={!leagueId}
                    >
                        H2H aktualisieren
                    </Button>

                    {message && (
                        <Text c="green">
                            {message}
                        </Text>
                    )}

                    {error && (
                        <Text c="red">
                            {error}
                        </Text>
                    )}
                </Stack>
            </Paper>
        </Container>
    );
}