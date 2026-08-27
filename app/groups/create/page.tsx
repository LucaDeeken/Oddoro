"use client";

import { useEffect, useState } from "react";
import {
    Button,
    Container,
    Select,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";

type League = {
    id: number;
    name: string;
};

export default function CreateGroupPage() {
    const [name, setName] = useState("");
    const [leagueId, setLeagueId] = useState<string | null>(null);

    const [leagues, setLeagues] = useState<League[]>([]);
    const [loadingLeagues, setLoadingLeagues] = useState(true);
    const [loadingCreate, setLoadingCreate] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        async function loadLeagues() {
            try {
                const res = await fetch("/api/getLeagueId");

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data.error || "Ligen konnten nicht geladen werden",
                    );
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

    async function handleCreate() {
        if (!name.trim()) {
            setError("Bitte gib einen Gruppennamen ein.");
            return;
        }

        if (!leagueId) {
            setError("Bitte wähle eine Liga aus.");
            return;
        }

        setLoadingCreate(true);
        setError("");

        try {
            const res = await fetch("/api/groups", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    leagueId: Number(leagueId),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error || "Gruppe konnte nicht erstellt werden",
                );
            }

            console.log("Gruppe erstellt:", data.group);

            // Später:
            // router.push(`/groups/${data.group.id}`);
        } catch (error) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Unbekannter Fehler",
            );
        } finally {
            setLoadingCreate(false);
        }
    }

    return (
        <Container size="sm" py="xl">
            <Stack>
                <Title>Gruppe erstellen</Title>

                <TextInput
                    label="Gruppenname"
                    placeholder="z. B. Bundesliga Freunde"
                    value={name}
                    onChange={(event) =>
                        setName(event.currentTarget.value)
                    }
                />

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
                    onClick={handleCreate}
                    loading={loadingCreate}
                >
                    Gruppe erstellen
                </Button>

                {error && (
                    <Text c="red">
                        {error}
                    </Text>
                )}
            </Stack>
        </Container>
    );
}